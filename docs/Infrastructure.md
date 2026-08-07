# Infrastructure as Code (Terraform + Cloudflare)

Plan for putting the Cloudflare infrastructure of Sonsenim under Terraform. Written before
implementation — treat unimplemented sections as intent, not description.

## Scope: what Terraform owns, and what it does not

The main failure mode when adding Terraform to a wrangler-based project is having both tools
manage the same Worker: deploys start returning 409s and `terraform plan` never comes back
clean. So ownership is split strictly, by resource, with no overlap:

| Tool | Owns |
|---|---|
| **Terraform** | Zone settings, DNS records, Hyperdrive configs, Worker routes, Pages project + custom domains, WAF / rate-limit rulesets |
| **wrangler** | Worker and Pages *code* deploys, `wrangler dev`, `wrangler tail` |
| **dbmate** | Postgres schema (`db/migrations/`) |

Terraform never creates the database — it only creates the Hyperdrive config that points at it.
Terraform never uploads a Worker script — `wrangler deploy` keeps doing that.

## Domain map

| Hostname | Serves | Cloudflare resource |
|---|---|---|
| `sonsennim.com` | Landing page | Pages project `sonsennim-lms-landing` (not deployed from this repo) |
| `learn.sonsennim.com` | The LMS app | Pages project `sonsenim-lms` |
| `api.sonsennim.com` | API, production | Worker route → `sonsenim-api-production` |
| `staging-api.sonsennim.com` | API, staging | Worker route → `sonsenim-api-staging` |
| `dev-api.sonsennim.com` | API, development | Worker route → `sonsenim-api-development` |

The three API routes exist today only as commented-out blocks in
[apps/api/wrangler.toml](../apps/api/wrangler.toml); they move into Terraform rather than being
uncommented.

### How the UI actually deploys

The Pages project `sonsenim-lms` is **git-connected to GitHub** (`VladyslavHimself/sonsenim-lms`)
and builds on Cloudflare:

| Setting | Value |
|---|---|
| Build command | `pnpm run ui:build` |
| Output directory | `apps/ui/dist` |
| Production branch | `production` |
| Preview branches | `main` |
| Path filter | `apps/ui/*` |

So pushing to `production` deploys the UI; pushing to `main` produces a preview.

This makes the `cf:stage:deploy` script in [apps/ui/package.json](../apps/ui/package.json) —
`wrangler pages deploy ./dist --branch main` — a second, parallel deploy path that uploads a
locally built bundle into the same project. It also names a project that does not exist: the
script passes no `--project-name`, so wrangler falls back to `"name": "sonsenim-lms-ui"` in
[apps/ui/wrangler.jsonc](../apps/ui/wrangler.jsonc), and no such project is in the account.

Two things worth reconciling, independently of the Terraform work:

- Point the script at `sonsenim-lms` (or drop it, if git deploys are the intended path) — as it
  stands it either prompts every time or is one confirmation away from creating a stray third
  Pages project that no DNS points at.
- Decide whether local `wrangler pages deploy` should exist at all next to a git-connected
  project. Mixing direct uploads into a git-built project makes "what is deployed" ambiguous.

### Same-origin alternative worth considering

With the app on `learn.` and the API on `api.`, every authenticated request is cross-origin.
That is why the auth cookies are set `sameSite: 'none'` in
[apps/api/src/routes/auth.route.ts](../apps/api/src/routes/auth.route.ts), and why
`cors()` is currently configured with no origin allowlist (it reflects any origin, with
credentials enabled).

A Worker route on `learn.sonsennim.com/v1/api/*` would make the API same-origin, which allows
`sameSite: 'lax'` and a closed CORS policy. This is a routing decision, so Terraform is the
natural place to make it — but it is a behavioural change to auth, out of scope for the initial
import. Flagged here so it is a deliberate choice later, not an accident.

## State backend

Terraform keeps a state file mapping config to real resources. It contains secrets in plaintext
and must never be committed.

**Plan: start local, migrate to remote when CI needs it.**

- Milestones 1–3 run with local state (`infra/terraform.tfstate`, gitignored). Solo, no
  concurrency, nothing to coordinate.
- Milestone 5 (GitHub Actions) is the point where remote state becomes mandatory — CI has no
  local file. Migrate then with `terraform init -migrate-state`, a one-command move.
- Recommended remote backend: **HCP Terraform free tier** (remote state, locking, run history,
  free for small teams). An R2 bucket via the S3-compatible backend also works, but adds a
  Cloudflare resource this project otherwise has no use for.

## Layout

```
infra/
├── README.md            # runbook: install, token scopes, import workflow  [exists]
├── versions.tf          # provider pin ~> 5.23, required_version >= 1.9    [exists]
├── variables.tf         # account_id, zone_name                            [exists]
├── zone.tf              # sonsennim.com lookup (data source)               [exists]
├── imports.tf           # import blocks for existing infrastructure        [exists]
├── outputs.tf           # zone_id; hyperdrive ids once imported            [exists]
├── terraform.tfvars.example                                                [exists]
├── hyperdrive.tf        # generated during import (milestone 2)
├── pages.tf             # generated during import (milestone 2)
├── dns.tf               # landing, learn, api hostnames    (milestone 3)
├── worker_routes.tf     # api hostnames → workers          (milestone 3)
└── zone_settings.tf     # ssl, always_use_https, min_tls   (milestone 3)
```

The zone is a **data source, not a managed resource**. A `cloudflare_zone` resource puts the zone
itself under Terraform's control, so a botched import or a deleted config block can take out the
zone and every record in it. Read-only lookup carries no such risk; promoting it to managed is a
deliberate later decision.

Single state with environment as a variable, rather than separate root modules per environment —
at this size, separate directories add ceremony without buying isolation.

No `modules/` directory: Cloudflare explicitly recommends against wrapping provider v5 resources
in modules, since the provider is generated from OpenAPI and modules fight its schema.

## Milestones

### 1 — Bootstrap

- Install `terraform` (or OpenTofu) and `cf-terraforming`.
- Create a scoped API token — **not** the global API key:
  - Account: Workers Scripts:Edit, Hyperdrive:Edit, Pages:Edit
  - Zone (`sonsennim.com`): DNS:Edit, Zone Settings:Edit, Workers Routes:Edit
- Export as `CLOUDFLARE_API_TOKEN`. Never written to a file, never a Terraform variable default.
- Add `infra/*.tfstate*`, `infra/.terraform/`, `*.tfvars` holding secrets to `.gitignore`.

**Done when:** `terraform init && terraform plan` runs clean against an empty config.

### 2 — Import what already exists

The critical step. Terraform assumes anything in config but not in state must be *created*, and
anything in state but not in config must be *destroyed* — so importing wrong can delete live
infrastructure.

- Use Terraform 1.5+ `import` blocks (declarative, reviewable in a diff) rather than the
  imperative `terraform import` command.
- Draft HCL with `terraform plan -generate-config-out=generated.tf`, then hand-clean it —
  generated config is verbose and often has wrong-but-valid defaults.
- Import: the zone, existing DNS records (including whatever serves the landing page), both
  Hyperdrive configs, the Pages project.

**Done when:** `terraform plan` reports **zero changes**. Nothing proceeds until that holds.

Two things will get in the way of that, both documented with fixes in
[infra/README.md](../infra/README.md): Hyperdrive's `origin.password` is write-only so the API
never returns it (needs `ignore_changes`), and the provider refuses to import a Pages project that
has secret environment variables set.

**Status: done (2026-08-07).** Applied as `3 imported, 0 added, 0 changed, 0 destroyed` — the
Hyperdrive configs and the Pages project are under management with nothing altered at Cloudflare.

### 3 — Add what is missing

Almost nothing here needs creating — the hostnames already exist and work. Verified 2026-08-07:
both `api.sonsennim.com` and `staging-api.sonsennim.com` serve the Elysia app (checked via
`/v1/api/openapi`). This milestone is about bringing them under management, not building them.

- Import the two Worker routes. They already exist — created in the dashboard, despite being
  commented out in [apps/api/wrangler.toml](../apps/api/wrangler.toml) — and are correctly bound:
  `api.sonsennim.com/*` → `sonsenim-api-production`, `staging-api.sonsennim.com/*` →
  `sonsenim-api-staging`.
  - These are routes, **not** Workers Custom Domains. The only custom domain in the account
    belongs to an unrelated project. The distinction matters: a route is a separate resource from
    the DNS record it rides on, so both get imported.
  - The CNAME *content* does not name the Worker serving the hostname. `api.sonsennim.com`
    displays `sonsenim-api.…workers.dev` while the route sends it to `sonsenim-api-production`.
    Read bindings from the routes API, never from the DNS record.
- Import `learn.sonsennim.com` as a `cloudflare_pages_domain` — it is **already attached** to the
  Pages project and serving production traffic, so this is an import, not a create.
- Import the existing DNS records, including the apex CNAME to the landing project and the Google
  site-verification TXT record.
**Two scope decisions, settled 2026-08-07:**

- **No `dev-api.sonsennim.com`.** Development runs locally via `wrangler dev`, so it needs no
  public hostname. The commented-out `dev-api` route in `wrangler.toml` describes an environment
  that was never wanted remotely. The `[env.development]` block itself stays — it is what local
  `wrangler dev --env development` uses.
- **The landing project stays outside Terraform.** `sonsennim-lms-landing` is not deployed from
  this repo and is maintained separately. Its *DNS record* is managed here, since the zone is —
  so Terraform controls where the apex points, while the project it points at is someone else's
  concern. Adopting the project later is a one-block change (see `infra/imports.tf`).
- Zone settings: `ssl = "strict"`, `always_use_https = "on"`, `min_tls_version = "1.2"`.

**Open question:** staging and development share Hyperdrive config
`35c32e963c7a43fc807e4fabad65947b` (`sonsenim-db-staging`, Supabase project `wssxcxgz…`), so they
share one database. Production is properly separate (`sonsenim-db`, Supabase project
`upvczhfa…`) — it is only dev and staging that are entangled. If that is not deliberate, it is a
small change now that the configs are in Terraform.

**Status: done (2026-08-07).** Applied in two passes: `8 imported, 0 changed` for the routes, DNS
records and Pages domain, then `3 imported, 2 changed` for zone settings.

The zone-settings pass was the first and so far only change this configuration has made to live
infrastructure: `always_use_https` off→on and `min_tls_version` 1.0→1.2. Both verified afterwards
— the API had been answering plaintext http with a 200 and now redirects, and TLS 1.0/1.1
handshakes are refused.

### 4 — Close the Terraform → wrangler loop

**Status: done (2026-08-07).**

Hyperdrive IDs are hardcoded in [apps/api/wrangler.toml](../apps/api/wrangler.toml), while
Terraform owns the configs themselves — the same ID written in two places, with nothing keeping
them honest. Recreating a Hyperdrive config assigns a new ID, and the next deploy would bind to
one that no longer exists: the Worker starts fine and fails on its first query.

Two ways to fix that, and the obvious one was not chosen:

- **Generate** `wrangler.toml` from a tracked template via `envsubst`, gitignoring the result.
  One source of truth, but every `wrangler dev` and every deploy depends on the generate step
  having run, and CI needs a Cloudflare token merely to read outputs. That is real, permanent
  friction traded against a rare failure.
- **Verify** — what is implemented. `pnpm infra:check` reads `terraform output` and the toml and
  fails if they disagree. The ID still lives in two places, but divergence becomes loud instead
  of silent, and nothing about local development changes.

```bash
pnpm infra:check
```

Reads local Terraform state only — no Cloudflare credentials needed, so it is safe to run
anywhere, including in CI without secrets.

The script ([infra/check-wrangler-sync.mjs](../infra/check-wrangler-sync.mjs)) treats "found no
Hyperdrive bindings at all" as a failure rather than a pass. A check that silently succeeds when
it cannot find what it is checking is worse than no check.

### 5 — CI

`.github/workflows/` is currently empty, so there is no existing pipeline to retrofit.

- On PR: `terraform fmt -check`, `terraform validate`, `terraform plan`, plan posted as a comment.
- On merge to `main`: `terraform apply`, then `wrangler deploy` as a separate downstream job.
- Separate repo secrets for the Terraform token and the wrangler token — different blast radius.
- Migrate state to the remote backend as part of this milestone.

**Note:** The UI does not need a deploy step in CI. The Pages project is **git-connected**, and
Cloudflare builds it itself (`pnpm run ui:build` → `apps/ui/dist`) — `production` branch for
production, `main` for previews, scoped to `apps/ui/*`. Pushing is the deploy.

`VITE_*` variables are baked into the bundle at build time, and since Cloudflare runs that build,
they must be set as **Pages environment variables**, which Terraform manages via
`deployment_configs`. CI only needs to deploy the API Worker.

### 6 — Follow-ons, once the loop works

- Rate-limit ruleset on `/v1/api/auth/*`.
- Cloudflare Access in front of the staging hostnames.
- Move the JWT signing secret out of source — it is hardcoded as `'supersecret'` in
  [apps/api/src/plugins/jwt.ts](../apps/api/src/plugins/jwt.ts). This is a live vulnerability
  independent of any IaC work and should not wait on it.

## Known gotchas

Verified against the provider's own generated docs at v5.23.0
([source](https://github.com/cloudflare/terraform-provider-cloudflare/tree/main/docs/resources)).
Most v5 examples found online are wrong in at least one of these ways:

- **Attribute syntax, not blocks.** v5 is generated from Cloudflare's OpenAPI spec, so nested
  structures are attributes: `origin = { … }`, not `origin { … }`. v4-era examples use blocks
  throughout and will not parse.
- **`cloudflare_workers_route` takes `script`**, not `script_name`.
- **`cloudflare_zone_settings_override` no longer exists.** v5 replaced it with
  `cloudflare_zone_setting` — one resource per setting, keyed by `setting_id`.
- **Resource renames from v4:** `cloudflare_record` → `cloudflare_dns_record`,
  `cloudflare_worker_*` → `cloudflare_workers_*` (plural).
- **`ttl` is required** on `cloudflare_dns_record`; `1` means automatic.

Import ID formats differ per resource and are easy to get wrong:
`cloudflare_hyperdrive_config` and `cloudflare_pages_project` take `<account_id>/<name-or-id>`,
while `cloudflare_dns_record` and `cloudflare_workers_route` take `<zone_id>/<record-or-route_id>`.

Other things to expect:

- **Pages project drift.** `cloudflare_pages_project.deployment_configs` diffs perpetually because
  the Cloudflare API injects defaults Terraform did not set. The usual fix is
  `lifecycle { ignore_changes = [deployment_configs] }` — but that blanket-ignores env vars too.
  Scope the ignore to the specific attributes that actually drift; check the real plan output
  before reaching for it.
- **Pin the provider** with `~>` — v5 is generated from Cloudflare's OpenAPI spec and minor
  releases move faster than hand-maintained providers.
- **Never run Terraform and wrangler against the same Worker.** See the ownership table above.
