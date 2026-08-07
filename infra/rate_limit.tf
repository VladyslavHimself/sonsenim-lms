// Rate limiting on the credential endpoints.
//
// /v1/api/auth/login and /register currently accept unlimited attempts from a single IP, which
// makes password guessing and account-spam free. This caps both.
//
// Scoped deliberately to login and register only. /auth/refresh is excluded: clients call it
// whenever a 15-minute access token expires, and users behind a shared NAT — a school or an
// office, entirely plausible for an LMS — would trip a per-IP limit through ordinary use.

resource "cloudflare_ruleset" "auth_rate_limit" {
  zone_id     = local.zone_id
  name        = "Auth endpoint rate limiting"
  description = "Throttle credential-guessing against the API"
  kind        = "zone"
  phase       = "http_ratelimit"

  rules = [{
    ref         = "auth_login_register"
    description = "Limit login and registration attempts per IP"
    action      = "block"
    enabled     = true

    expression = <<-EOT
      (http.host in {"api.sonsennim.com" "staging-api.sonsennim.com"}
       and (http.request.uri.path eq "/v1/api/auth/login"
            or http.request.uri.path eq "/v1/api/auth/register"))
    EOT

    ratelimit = {
      // ip.src + cf.colo.id is the characteristic pair available below Enterprise. Counting per
      // colo means the effective global limit is higher than the number below, since a
      // distributed attacker hits several data centres — it still stops single-source guessing.
      characteristics     = ["ip.src", "cf.colo.id"]
      period              = 60
      requests_per_period = 10
      mitigation_timeout  = 60
    }
  }]
}
