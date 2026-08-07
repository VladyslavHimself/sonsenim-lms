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

    // One line rather than a heredoc purely for readability of the stored value; a multi-line
    // heredoc works too, and its newlines are preserved verbatim in the API.
    expression = "(http.host in {\"api.sonsennim.com\" \"staging-api.sonsennim.com\"}) and (http.request.uri.path eq \"/v1/api/auth/login\" or http.request.uri.path eq \"/v1/api/auth/register\")"

    ratelimit = {
      // cf.colo.id is mandatory, not a choice: dropping it fails with "characteristics field is
      // missing 'cf.colo.id', this is required as ratelimiting counting is processed at
      // colocation level only".
      //
      // The practical consequence is that the counter is per data centre, so the effective
      // global limit is the number below multiplied by however many colos an attacker reaches.
      characteristics = ["ip.src", "cf.colo.id"]

      // period is capped at 10 seconds on this plan. Cloudflare rejects anything else with
      // "not entitled to use the period 60, can only use a period among [10]".
      //
      // These numbers are a ceiling, not a promise. Measured against the live rule: a burst of
      // 60 requests got its first 429 at request 44, nowhere near the nominal 5 per 10 seconds.
      // Counters are maintained per colo and converge lazily, so short bursts overshoot badly.
      // Do not conclude the rule is broken because a dozen requests sail through — send enough
      // traffic to clear the leeway before judging it.
      //
      // So: a speed bump against naive scripted guessing, not brute-force protection. Real
      // protection is application-side — backoff or lockout keyed on the username rather than
      // the IP, which an attacker cannot sidestep by rotating addresses. That does not exist yet.
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
