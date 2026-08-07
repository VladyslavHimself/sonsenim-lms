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
      characteristics = ["ip.src", "cf.colo.id"]

      // period is capped at 10 seconds on this plan. Cloudflare rejects anything else with
      // "not entitled to use the period 60, can only use a period among [10]".
      //
      // A 10-second window is a blunt instrument for credential stuffing: it caps burst rate but
      // barely constrains a patient attacker, who can sustain 5 attempts every 10 seconds
      // indefinitely — 30 a minute, per data centre. Treat this as a speed bump that raises the
      // cost of naive scripted guessing, not as brute-force protection.
      //
      // Real protection is application-side: account lockout after N failures, or exponential
      // backoff keyed on the username rather than the IP. Neither exists yet.
      period              = 10
      requests_per_period = 5

      // How long a client stays blocked once it trips the limit.
      //
      // 10 is the only value this plan accepts, and it is not optional. Omitting it defaults to
      // 0, which Cloudflare reads as *throttling* rather than blocking ("not entitled to use
      // throttle behaviour"); anything else gives "not entitled to use a mitigation timeout
      // different from 10". The wider list in the docs — 0, 60, 120, 300, 600, 3600, 86400 —
      // is Enterprise territory.
      mitigation_timeout = 10
    }
  }]
}
