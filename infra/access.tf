// Cloudflare Access in front of the staging API.
//
// ⚠ DISABLED BY DEFAULT, and not because it is unfinished — because turning it on will very
// likely break staging.
//
// Access protects a hostname by redirecting unauthenticated browser requests to an identity
// provider. That works well for a site you navigate to. It works badly for an API called by
// JavaScript from a *different* origin: the staging UI runs on a Pages preview domain and calls
// staging-api.sonsennim.com via XHR, and those requests will meet a redirect to a login page
// rather than a JSON response. The browser reports it as a CORS failure and the app appears
// broken with no obvious cause.
//
// So this is written, reviewed and ready — but gated. Flip `enable_staging_access` when you have
// decided how the staging UI should authenticate (a service token in the CF-Access-Client-Id /
// CF-Access-Client-Secret headers is the usual answer), not before.
//
// The alternative worth weighing: staging is already rate-limited and shares its database with
// development. If that data is synthetic, the exposure Access would close may not be worth the
// friction it adds.

resource "cloudflare_zero_trust_access_application" "staging_api" {
  count = var.enable_staging_access ? 1 : 0

  account_id       = var.account_id
  name             = "Staging API"
  domain           = "staging-api.sonsennim.com"
  type             = "self_hosted"
  session_duration = "24h"

  policies = [{
    id = cloudflare_zero_trust_access_policy.staging_api[0].id
  }]
}

resource "cloudflare_zero_trust_access_policy" "staging_api" {
  count = var.enable_staging_access ? 1 : 0

  account_id = var.account_id
  name       = "Allow owner"
  decision   = "allow"

  include = [{
    email = {
      email = var.access_allowed_email
    }
  }]
}
