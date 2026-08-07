# infra/

Terraform configuration for the Cloudflare infrastructure behind Sonsenim.

Read [../docs/Infrastructure.md](../docs/Infrastructure.md) first — it covers what Terraform owns
(and, importantly, what it must not touch) and why. This file is the runbook.

Provider: `cloudflare/cloudflare ~> 5.23`. Note that v5 is generated from Cloudflare's OpenAPI
spec and uses **attribute syntax** (`origin = { … }`), not the nested blocks (`origin { … }`) that
most v4-era examples and blog posts show.

## One-time setup

### 1. Install Terraform

```bash
brew install hashicorp/tap/terraform
```

OpenTofu (`brew install opentofu`, then `tofu` in place of `terraform`) works identically here —
nothing in this config uses anything specific to either.

### 2. Create a scoped API token

Dashboard → My Profile → API Tokens → Create Token → Custom token. **Not** the Global API Key,
which is account-wide and cannot be scoped.

Six permission rows — the three dropdowns per row are (type, permission group, access level):

| Type | Permission group | Level |
|---|---|---|
| Account | Hyperdrive | Edit |
| Account | Cloudflare Pages | Edit |
| Zone | Zone | Read |
| Zone | DNS | Edit |
| Zone | Zone Settings | Edit |
| Zone | Workers Routes | Edit |

Deliberately **not** granted: `Workers Scripts: Edit`. Terraform manages the routes that point at
Workers; wrangler deploys the scripts themselves. Granting script-edit here would hand Terraform
write access to resources the ownership split says it must not touch. Tokens are editable after
creation, so this can be added later if something genuinely needs it.

Scope the resources too, rather than accepting the defaults:

- **Account Resources:** Include → the specific account, not "All accounts".
- **Zone Resources:** Include → Specific zone → `sonsennim.com`.
- **Client IP Filtering:** leave empty — pinning to your current IP breaks the token when your
  network changes.
- **TTL:** leave empty — a token that expires mid-work is a confusing failure to debug.

The token must never be written to a file in this repo. Store it in the macOS Keychain once —
the bare `-w` prompts for the value, so it never lands in shell history:

```bash
security add-generic-password -a "$USER" -s cloudflare-terraform -w
```

Then load it in whichever shell runs Terraform. **Check which shell that actually is** — the login
shell here is fish, but IntelliJ's embedded terminal runs `/bin/zsh`, and the syntax is not
interchangeable. Using the wrong one fails silently-ish and leaves the variable empty.

zsh / bash (including IntelliJ's terminal) — safe to add to `~/.zshrc`:

```bash
export CLOUDFLARE_API_TOKEN="$(security find-generic-password -a "$USER" -s cloudflare-terraform -w)"
```

fish — safe to add to `~/.config/fish/config.fish`:

```bash
set -gx CLOUDFLARE_API_TOKEN (security find-generic-password -a "$USER" -s cloudflare-terraform -w)
```

Cross-shell traps:

- `export FOO=…` is **not valid in fish** (`Unsupported use of '='`).
- `set -gx FOO …` is **fish syntax**; in zsh `set` manipulates shell options and positional
  parameters, so it does not set the variable and you end up with an empty value.
- Either form is session-scoped unless it is in your shell rc file. A new tab, a new window, or an
  IntelliJ Run configuration does not inherit it.

Avoid fish universal variables (`set -U`) for this: they persist to `~/.config/fish/fish_variables`
in plaintext.

Verify the token is reaching the shell you are about to run Terraform in. This prints the response
body, which contains no secret:

```bash
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" https://api.cloudflare.com/client/v4/user/tokens/verify
```

`"success":true` means the token is valid and visible. Otherwise read the error code — the HTTP
status alone does not distinguish the cases, since 400 covers several:

| Error code | Meaning |
|---|---|
| `9106` — missing auth headers | The variable is empty. Wrong shell, or wrong syntax for the shell (see above). |
| `6003` — invalid request headers | The variable is set to something that is not a token. A common mix-up is the **account ID**: 32 hex characters, belongs in `terraform.tfvars`, cannot authenticate anything. |
| `1000` — invalid API token | A real token that Cloudflare rejected: revoked, expired, or mistyped. |

A token that is valid but under-scoped fails differently again — the plan gets through
authentication and then returns 403 on specific resources.

### 3. Fill in the account ID

```bash
cp infra/terraform.tfvars.example infra/terraform.tfvars
```

Then set `account_id`. Find it in the dashboard sidebar of any domain, or:

```bash
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" https://api.cloudflare.com/client/v4/accounts
```

### 4. Initialize

```bash
terraform -chdir=infra init
```

This downloads the provider and writes `.terraform.lock.hcl`. **Commit that lock file** — it pins
provider hashes so everyone resolves the same version.

## Importing existing infrastructure

Everything in [imports.tf](imports.tf) already exists on Cloudflare. Terraform must be taught
about it before it can manage it — otherwise Terraform assumes those resources need creating, and
a later `apply` could destroy and recreate live infrastructure.

Rather than hand-writing HCL and hoping it matches reality, let Terraform generate it:

```bash
terraform -chdir=infra plan -generate-config-out=generated.tf
```

This reads the live resources and writes matching HCL to `infra/generated.tf` (gitignored — it is
a scratch artifact). Then:

1. Read `generated.tf`. It is verbose and includes every optional attribute, most set to
   defaults.
2. Move the resources into real files — `hyperdrive.tf`, `pages.tf` — keeping only attributes you
   actually want to control. Anything you leave in becomes something Terraform will enforce.
3. Delete `generated.tf` and the corresponding blocks in `imports.tf`.
4. Re-run `terraform -chdir=infra plan`.

**The bar is a plan reporting no changes.** Not "only small changes" — none. A non-empty plan
after import means the config and reality disagree, and applying it would modify live
infrastructure. Nothing proceeds until the plan is empty.

### Two known snags during import

**Hyperdrive passwords.** `origin.password` is write-only — the Cloudflare API never returns it.
After import, state holds `null` while your config holds a value, so the plan will never come up
clean on its own. Add to each Hyperdrive resource:

```hcl
lifecycle {
  ignore_changes = [origin.password]
}
```

The tradeoff is real: password rotation then has to happen outside Terraform, or by temporarily
removing the ignore. Worth knowing rather than discovering later.

**Pages projects with secret environment variables.** The provider cannot import a project that
has secret env vars set — the secret has to be removed before importing and re-added afterwards.
`sonsenim-lms-ui` builds via direct upload, so it likely has none, but check before assuming.

## Listing Pages projects for import

The `name` field in `apps/ui/wrangler.jsonc` is not necessarily the Pages project name
Cloudflare knows the project by — for direct-upload deploys the project name is whatever was
passed to (or chosen during) the first `wrangler pages deploy`. To list the real ones:

```bash
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" "https://api.cloudflare.com/client/v4/accounts/e4048fea381881a01fd409e6613d6ac5/pages/projects" | python3 -c "import sys,json; r=json.load(sys.stdin)['result']; print('\n'.join(f\"{p['name']}  →  {p.get('subdomain')}\" for p in r)) if r else print('no Pages projects in this account')"
```

An empty list means the UI has never been deployed to Pages in this account. In that case
Terraform should *create* the project rather than import it — drop the import block and declare
`cloudflare_pages_project.ui` directly.

## Listing DNS records for import

Record IDs are not in the repo. To list them:

```bash
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" "https://api.cloudflare.com/client/v4/zones?name=sonsennim.com" | jq -r '.result[0].id'
```

Then, with that zone ID:

```bash
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" "https://api.cloudflare.com/client/v4/zones/<zone_id>/dns_records" | jq -r '.result[] | "\(.id)  \(.type)  \(.name)  \(.content)"'
```

## Everyday commands

```bash
terraform -chdir=infra fmt -recursive
terraform -chdir=infra validate
terraform -chdir=infra plan
terraform -chdir=infra apply
```

`terraform -chdir=infra state list` shows what is currently under management.

## Do not

- Run `terraform apply` and `wrangler deploy` against the same Worker. Terraform owns routes and
  bindings; wrangler owns the script. Overlap produces 409s and permanent drift.
- Commit `terraform.tfstate` or `terraform.tfvars`. Both are gitignored; keep it that way.
- Put the API token in a `.tf` or `.tfvars` file. Environment variable only.
