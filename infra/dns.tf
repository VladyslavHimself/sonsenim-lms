// DNS records for sonsennim.com.
//
// Generated from the live zone via `plan -generate-config-out`, with null-valued optional
// attributes stripped. `settings` and `tags` are kept even where they look empty: the API
// returns them as empty values rather than null, and omitting them reads as a change.
//
// ttl = 1 means "automatic", which is what Cloudflare forces on proxied records.

// --- Application hostnames --------------------------------------------------

// The app. Points at the Pages project; learn.sonsennim.com is also registered as a Pages
// custom domain (see pages.tf) — both halves are needed.
resource "cloudflare_dns_record" "learn" {
  zone_id = local.zone_id
  name    = "learn.sonsennim.com"
  type    = "CNAME"
  content = "sonsenim-lms.pages.dev"
  proxied = true
  ttl     = 1

  settings = {
    flatten_cname = false
    ipv4_only     = false
    ipv6_only     = false
  }

  tags = []
}

// The apex, served by the sonsennim-lms-landing Pages project. That project is not deployed
// from this repo and is not managed here — but the record is, because the zone is.
resource "cloudflare_dns_record" "apex" {
  zone_id = local.zone_id
  name    = "sonsennim.com"
  type    = "CNAME"
  content = "sonsennim-lms-landing.pages.dev"
  proxied = true
  ttl     = 1

  settings = {
    flatten_cname = false
    ipv4_only     = false
    ipv6_only     = false
  }

  tags = []
}

// --- API hostnames ----------------------------------------------------------
//
// These records exist so the Worker routes in worker_routes.tf have a hostname to attach to.
// A proxied record is required for a route to fire; the content is otherwise inert. It does
// NOT determine which Worker serves the hostname — the route does. Note api.sonsennim.com
// points at "sonsenim-api" here while its route targets "sonsenim-api-production".

resource "cloudflare_dns_record" "api" {
  zone_id = local.zone_id
  name    = "api.sonsennim.com"
  type    = "CNAME"
  content = "sonsenim-api.vladyslav-lutchyn.workers.dev"
  proxied = true
  ttl     = 1

  settings = {
    flatten_cname = false
    ipv4_only     = false
    ipv6_only     = false
  }

  tags = []
}

resource "cloudflare_dns_record" "staging_api" {
  zone_id = local.zone_id
  name    = "staging-api.sonsennim.com"
  type    = "CNAME"
  content = "sonsenim-api-staging.vladyslav-lutchyn.workers.dev"
  proxied = true
  ttl     = 1

  settings = {
    flatten_cname = false
    ipv4_only     = false
    ipv6_only     = false
  }

  tags = []
}

// --- Verification -----------------------------------------------------------

// Google Search Console ownership proof. Deleting this record un-verifies the domain.
resource "cloudflare_dns_record" "google_site_verification" {
  zone_id = local.zone_id
  name    = "sonsennim.com"
  type    = "TXT"
  content = "\"google-site-verification=oyJZH4itCrGb6Y6vu16DSWTI24MUn81Br-KBxxh7Omw\""
  proxied = false
  ttl     = 3600

  settings = {}

  tags = []
}
