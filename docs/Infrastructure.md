# Infrastructure

How the Cloudflare side of Sonsenim is set up, and how to change it without breaking things.

Operational reference, not a tutorial. The step-by-step runbook — installing Terraform, creating
tokens, importing resources — lives in [infra/README.md](../infra/README.md).

---

## 1. Who owns what

Three tools touch production. They do **not** overlap, and that is deliberate: two tools managing
the same resource produces 409s on deploy and a `terraform plan` that never comes back clean.

| Tool | Owns | Never touches |
|---|---|---|
| **Terraform** (`infra/`) | Zone settings, DNS, Worker routes, Hyperdrive configs, Pages project + custom domain, rate limiting | Worker code, Pages deployments, database contents |
| **wrangler** | Worker code deploys, Worker secrets, `wrangler dev`, `wrangler tail` | Routes, bindings' underlying resources, DNS |
| **dbmate** | Postgres schema (`db/migrations/`) | Anything in Cloudflare |

Terraform creates the Hyperdrive *config* that points at Supabase; it does not create or manage
the database. Terraform creates the *route* that binds a hostname to a Worker; it does not upload
the Worker.

If you find yourself about to configure the same thing in two places, stop — that is the failure
mode this split exists to prevent.

---

## 2. The map

### Hostnames

| Hostname | Serves | How |
|---|---|---|
| `sonsennim.com` | Landing page | Apex CNAME → Pages project `sonsennim-lms-landing` |
| `learn.sonsennim.com` | The LMS app | CNAME → Pages project `sonsenim-lms`, plus a Pages custom domain |
| `api.sonsennim.com` | API, production | Proxied CNAME + Worker route → `sonsenim-api-production` |
| `staging-api.sonsennim.com` | API, staging | Proxied CNAME + Worker route → `sonsenim-api-staging` |

There is no `dev-api` hostname. Development runs locally through `wrangler dev`; the
`[env.development]` block in `wrangler.toml` exists for that and nothing else.

A hostname needs **both** a proxied DNS record and a Worker route. The route decides which Worker
serves it. The DNS record's *content* is inert — `api.sonsennim.com` points at
`sonsenim-api.…workers.dev` while its route sends traffic to `sonsenim-api-production`. Never read
a binding from the DNS record; read it from the routes API.

### Environments

| | Worker | Hyperdrive config | Database |
|---|---|---|---|
| production | `sonsenim-api-production` | `sonsenim-db` (`7db77ce3…`) | Supabase `upvczhfa…` |
| staging | `sonsenim-api-staging` | `sonsenim-db-staging` (`35c32e96…`) | Supabase `wssxcxgz…` |
| development | local only | `sonsenim-db-staging` (shared) | **same as staging** |

Development and staging share a database. If that is not what you want, splitting them is now a
small change — create a second Hyperdrive config and repoint `[env.development]`.

### Resources under Terraform

15 resources: 2 Hyperdrive configs, 1 Pages project, 1 Pages custom domain, 2 Worker routes,
5 DNS records, 3 zone settings, 1 rate limiting ruleset. `terraform -chdir=infra state list` is
the authority.

The zone itself is a **data source, not a managed resource** — a `cloudflare_zone` resource means a
botched config can destroy the zone and every record in it. Read-only lookup cannot.

---

## 3. Credentials

Three separate credentials. Confusing them is the single most common source of lost time here.

| Credential | Used by | Where it lives |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Terraform provider | Env var; scoped token, see `infra/README.md` |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Terraform state backend (R2) | Env vars; an R2 API token's S3 key pair |
| wrangler's own OAuth session | `wrangler deploy`, `wrangler secret` | `wrangler login`, cached locally |

**`CLOUDFLARE_API_TOKEN` breaks wrangler.** Wrangler prefers that variable over its own session,
and the token grants Workers Scripts *Read* by design — so every wrangler write fails with
`Authentication error [code: 10000]`. Do not widen the token; unset it for the command:

```bash
env -u CLOUDFLARE_API_TOKEN pnpm api:staging:deploy
```

Better: export `CLOUDFLARE_API_TOKEN` only in the shell where you run Terraform, not in `~/.zshrc`.

State lives in the R2 bucket `sonsenim-tfstate`. Note R2 required a payment method to enable, even
for free-tier use; actual usage is a rounding error against the free allowance.

---

## 4. Everyday operations

### Change infrastructure

```bash
terraform -chdir=infra plan
```

Read it. Then either apply locally, or commit and open a PR — CI posts the plan as a comment and
applies on merge to `main`.

**`plan` is also your drift detector.** If it reports changes you did not make, someone clicked
something in the dashboard. That is the main ongoing value of this setup; run it occasionally even
when you are not changing anything.

### Deploy the API

Not automated. Terraform manages the routes; you deploy the code:

```bash
env -u CLOUDFLARE_API_TOKEN pnpm api:staging:deploy
```

```bash
env -u CLOUDFLARE_API_TOKEN pnpm api:prod:deploy
```

Staging first, always — a startup failure (a missing `JWT_SECRET`, say) takes the Worker down
entirely rather than degrading.

### Deploy the UI

Also not automated, but nothing to run: the Pages project is **git-connected** and Cloudflare
builds it.

| | Trigger |
|---|---|
| Production | merge `main` → `production` |
| Preview | push to `main` |

Build is `pnpm run ui:build` → `apps/ui/dist`, path-filtered to `apps/ui/*`. Because Cloudflare
runs the build, `VITE_*` variables must be set as **Pages environment variables** — which Terraform
manages in [infra/pages.tf](../infra/pages.tf). Setting them in CI would do nothing.

### Add or rotate a Worker secret

```bash
env -u CLOUDFLARE_API_TOKEN pnpm --filter api exec wrangler secret put NAME --env staging
```

Rotating `JWT_SECRET` logs every user out — tokens signed with the old secret stop validating.

### Check wrangler and Terraform agree

```bash
pnpm infra:check
```

`wrangler.toml` hardcodes the Hyperdrive IDs that Terraform manages — the same value in two places.
This fails loudly if they diverge. Needs the R2 credentials, since it reads Terraform outputs
through the state backend.

### Bring an existing Cloudflare resource under management

Never write the config by hand and apply — Terraform would try to *create* something that already
exists. Add an `import` block, then:

```bash
terraform -chdir=infra plan -generate-config-out=generated.tf
```

Move the generated HCL into a real file, trim it, delete `generated.tf` and the import block. The
bar is a plan reporting **0 to change** before you apply. Full procedure in `infra/README.md`.

---

## 5. CI

[.github/workflows/terraform.yml](../.github/workflows/terraform.yml) runs on changes to `infra/**`,
`apps/api/wrangler.toml`, or itself.

| Event | What happens |
|---|---|
| Pull request | secrets preflight → `fmt` → `init` → `validate` → `infra:check` → `plan`, posted as a PR comment |
| Merge to `main` | the same, then `apply -auto-approve` |

**Merging to `main` does not deploy anything.** It converges infrastructure only. The API Worker
still needs a manual `wrangler deploy`; the UI needs a merge into `production`. This is the easiest
thing to get wrong — merging an API change and assuming it shipped.

Five repository secrets are required. Each has a reason:

| Secret | Why |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Provider auth |
| `R2_ACCESS_KEY_ID` | State backend — a *different* credential from the token above |
| `R2_SECRET_ACCESS_KEY` | State backend |
| `HYPERDRIVE_NONPROD_PASSWORD` | `origin.password` is required by the provider but never returned by the API, so it cannot be recovered from the live config |
| `HYPERDRIVE_PRODUCTION_PASSWORD` | as above |

`account_id` is deliberately not a secret — it identifies, it does not authenticate.

A missing secret resolves to an empty string rather than failing, so the workflow checks all five
up front and names what is absent. Without that, an unset R2 key surfaces as Terraform hunting for
an EC2 instance role.

Two accepted limitations: `apply` re-plans rather than applying the plan reviewed on the PR (fine
for one person, fix with `plan -out` + artifact if that changes), and there is no approval gate
before apply.

---

## 6. Gotchas that cost time

### Provider v5 is not v4

Verified against the [provider's generated docs](https://github.com/cloudflare/terraform-provider-cloudflare/tree/main/docs/resources)
at v5.23.0. Most examples online are wrong in at least one of these ways:

- **Attribute syntax, not blocks**: `origin = { … }`, never `origin { … }`. v4 examples will not parse.
- `cloudflare_workers_route` takes `script`, not `script_name`.
- `cloudflare_zone_settings_override` is gone — v5 has one `cloudflare_zone_setting` per setting.
- `cloudflare_record` → `cloudflare_dns_record`; `cloudflare_worker_*` → `cloudflare_workers_*`.
- `ttl` is required on DNS records; `1` means automatic.

Import ID formats differ by resource: `<account_id>/<name>` for Hyperdrive and Pages,
`<zone_id>/<id>` for DNS records and Worker routes.

### Write-only attributes

`hyperdrive_config.origin.password` is never returned by the API. It is required by the provider,
cannot be read back, and cannot be generated by `-generate-config-out`. Hence
`ignore_changes = [origin.password]`.

**This is a live hazard.** `ignore_changes` suppresses *diffs*, but the API takes `origin` as a
whole object — so any update to another attribute sends the whole block, password included. If
`terraform.tfvars` holds an empty password, that update would overwrite the real database
credential. Keep the real values in `terraform.tfvars`.

### Plan entitlements are narrower than the docs

Rate limiting on this plan: `period` must be `10`, `mitigation_timeout` must be exactly `10` and
cannot be omitted (`0` means throttling, not permitted), and `cf.colo.id` is mandatory in
`characteristics`. The documented value lists are Enterprise's.

Errors are inconsistent — a rejected `period` gives a clear message, a rejected
`mitigation_timeout` can surface as a generic `403 Authentication error` that reads like an auth
failure.

### "Applied successfully" is not "working"

Rate limit counters are per-colo and converge lazily. Against the live rule, a burst of 60 requests
got its first 429 at **request 44**, against a nominal threshold of 5 per 10 seconds. A dozen
unblocked requests is not evidence the rule is broken.

Generally: verify infrastructure by sending traffic through it, not by reading the apply output.

### Pages projects

The provider cannot import a Pages project that has *secret* environment variables — remove them
first. And `deployment_configs` can drift, because the API injects defaults; scope any
`ignore_changes` narrowly rather than blanket-ignoring the block, which would also stop Terraform
managing your `VITE_*` variables.

---

## 7. Current security posture

| | State |
|---|---|
| TLS | `ssl = strict`, `always_use_https = on`, `min_tls_version = 1.2` |
| Auth rate limiting | 5 requests / 10s per IP per colo on `/v1/api/auth/login` and `/register`, 10s block — see caveat above |
| JWT signing secret | Worker secret binding, fatal at startup if absent |
| Staging API | Public. Cloudflare Access is written but disabled — see below |

Rate limiting here is a speed bump against naive scripted guessing, not brute-force protection: the
counter is per data centre and the practical threshold is far above the nominal one. Real
protection would be **username-keyed backoff in the API**, which no plan entitlement can weaken and
IP rotation cannot sidestep. That does not exist yet.

---

## 8. Open items

**Deliberately not done:**

- **Cloudflare Access on staging** ([infra/access.tf](../infra/access.tf), `enable_staging_access`
  defaults to `false`). Access redirects unauthenticated browser requests to an IdP, which breaks
  cross-origin XHR from the staging UI — it would fail as an opaque CORS error. Enabling it needs
  the staging client to carry an Access service token first.
- **The landing project** stays outside Terraform. Its DNS record is managed here, since the zone
  is; the project is maintained separately. Consequence: if it were deleted elsewhere, the apex
  would point at nothing and Terraform would not know.

**Worth fixing:**

- **`AuthError` → 500.** [AuthException.ts](../apps/api/src/exceptions/AuthException.ts) carries a
  `status` nothing reads, and `app.ts` registers no `onError`, so a wrong username returns 500
  instead of 404. Affects decks, cards and groups too — they share the shape.
- **Username-keyed login throttling**, per section 7.
- **`apps/ui/wrangler.jsonc`** names `sonsenim-lms-ui`, a project that does not exist, and
  `cf:stage:deploy` is a second deploy path into a git-built project — ambiguous about what is
  actually deployed.
- **`apps/api` has never typechecked**: `tsconfig.json` names `bun-types` while `@types/bun` is
  installed, so `tsc` aborts before checking. Fixing it reveals 32 accumulated errors.

**Worth considering:**

- **Same-origin API.** The app on `learn.` and the API on `api.` makes every authenticated request
  cross-origin — which is why auth cookies are `sameSite: 'none'` and `cors()` has no origin
  allowlist. A Worker route on `learn.sonsennim.com/v1/api/*` would allow `sameSite: 'lax'` and a
  closed CORS policy. A routing change, so Terraform's job — but it changes auth behaviour.
- **A separate CI token.** CI currently uses the same token as your laptop. Scoping a second one
  identically would let you revoke either independently.
