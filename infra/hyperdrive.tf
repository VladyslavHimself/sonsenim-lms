// Hyperdrive connection pools in front of the Supabase Postgres instances.
//
// Terraform manages the Hyperdrive *config* — the pointer Cloudflare uses to reach the
// database. It does not manage the database itself; schema stays with dbmate.
//
// Values here were generated from the live configs via `plan -generate-config-out`.
//
// Do not apply a plan that reports "to change" on these resources. An in-place update sends
// the origin block back to Cloudflare, and origin.password is ignored here (it cannot be read
// back from the API) — so an update risks rewriting a live database connection with an
// incomplete origin. The staging and production APIs both depend on these. Get the plan to
// "0 to change" first; then apply only writes state.

// Used by both the staging and development Workers — they share one config, and therefore
// one database. See docs/Infrastructure.md; splitting them is a small change from here.
resource "cloudflare_hyperdrive_config" "nonprod" {
  account_id = var.account_id
  name       = "sonsenim-db-staging"

  origin = {
    database = "postgres"
    host     = "db.wssxcxgzbzkyhtmbzjry.supabase.co"
    port     = 5432
    scheme   = "postgres"
    user     = "postgres"
    password = var.hyperdrive_nonprod_password
  }

  caching = {
    disabled = false
  }

  // The live configs carry an empty mtls object. Omitting this makes Terraform want to set it
  // to null, which is a change, not a no-op — see the note on why that matters below.
  mtls = {}

  origin_connection_limit = 20

  lifecycle {
    // origin.password is write-only: the Cloudflare API never returns it, so state always
    // holds null while config holds a value. Without this, every plan reports a change that
    // can never be resolved.
    //
    // Consequence: password rotation does not flow through Terraform. Rotate in Supabase and
    // Cloudflare, then update the tfvars value to keep them consistent.
    ignore_changes = [origin.password]
  }
}

resource "cloudflare_hyperdrive_config" "production" {
  account_id = var.account_id
  name       = "sonsenim-db"

  origin = {
    database = "postgres"
    host     = "db.upvczhfafbuvzryuvdlw.supabase.co"
    port     = 5432
    scheme   = "postgres"
    user     = "postgres"
    password = var.hyperdrive_production_password
  }

  caching = {
    disabled = false
  }

  // The live configs carry an empty mtls object. Omitting this makes Terraform want to set it
  // to null, which is a change, not a no-op — see the note on why that matters below.
  mtls = {}

  origin_connection_limit = 20

  lifecycle {
    ignore_changes = [origin.password]
  }
}
