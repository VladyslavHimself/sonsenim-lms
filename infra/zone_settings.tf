// Zone-level settings for sonsennim.com.
//
// In provider v5 each setting is its own resource keyed by `setting_id` — the v4-era
// `cloudflare_zone_settings_override` block no longer exists.
//
// Unlike everything else in this configuration, two of these are real changes rather than
// imports. Current values read from the API on 2026-08-07:
//
//   ssl                      = strict   ← already correct, declared here to pin it
//   always_use_https         = off      ← CHANGED to "on"
//   min_tls_version          = 1.0      ← CHANGED to "1.2"
//   automatic_https_rewrites = on       } already correct, left unmanaged for now
//   http3                    = on       }
//   tls_1_3                  = on       }

// Requires a valid certificate on the origin. Everything behind this zone is Pages and Workers,
// which terminate TLS properly. Pinned rather than left implicit: silently dropping to
// "flexible" would mean unencrypted origin traffic while the padlock still shows.
resource "cloudflare_zone_setting" "ssl" {
  zone_id    = local.zone_id
  setting_id = "ssl"
  value      = "strict"
}

// Redirects http:// requests to https:// with a 301 instead of serving them over plaintext.
//
// Note this applies to the API hostnames too. A plaintext POST would be redirected and lose its
// body — but nothing should be issuing one: the UI's VITE_API_BASE_URL values are https, and the
// auth cookies are already Secure, so they were never being sent over http anyway.
resource "cloudflare_zone_setting" "always_use_https" {
  zone_id    = local.zone_id
  setting_id = "always_use_https"
  value      = "on"
}

// TLS 1.0 and 1.1 are deprecated and no longer accepted by current browsers. 1.2 is the floor
// every supported client already negotiates; this closes off the obsolete ones.
resource "cloudflare_zone_setting" "min_tls_version" {
  zone_id    = local.zone_id
  setting_id = "min_tls_version"
  value      = "1.2"
}
