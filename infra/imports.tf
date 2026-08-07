// Import blocks for infrastructure that already exists on Cloudflare.
//
// These are declarative (Terraform 1.5+) rather than `terraform import` commands, so an import
// is reviewable in a diff and reproducible. Workflow is in README.md.
//
// Milestone 2, imported and applied 2026-08-07, blocks removed:
//   - cloudflare_hyperdrive_config.nonprod     (35c32e96…, sonsenim-db-staging)
//   - cloudflare_hyperdrive_config.production  (7db77ce3…, sonsenim-db)
//   - cloudflare_pages_project.ui              (sonsenim-lms)

// local.zone_id is defined in zone.tf.

// --- Worker routes ----------------------------------------------------------
// These exist despite being commented out in apps/api/wrangler.toml — they were created in the
// dashboard. Verified 2026-08-07: both patterns are bound to the correct Worker.

import {
  to = cloudflare_workers_route.api
  id = "${local.zone_id}/3f803956f2f647768550bff123e5c12c"
}

import {
  to = cloudflare_workers_route.staging_api
  id = "${local.zone_id}/19512160d75e4e5e9d1de8f428ac5e7f"
}

// --- DNS --------------------------------------------------------------------
// All four CNAMEs are proxied. The API hostnames are plain proxied records that exist so the
// Worker routes have something to attach to — their workers.dev-looking content is cosmetic and
// does not determine which Worker serves the hostname.

import {
  to = cloudflare_dns_record.api
  id = "${local.zone_id}/381498c2dd86857e60c450dd38582efa"
}

import {
  to = cloudflare_dns_record.staging_api
  id = "${local.zone_id}/34db2f81e1785daac605fb3ddad20c28"
}

import {
  to = cloudflare_dns_record.learn
  id = "${local.zone_id}/521aa1c65874a31a13b7a6a8ca9147e3"
}

import {
  to = cloudflare_dns_record.apex
  id = "${local.zone_id}/92f88426740a0d6c919221ae838b71de"
}

import {
  to = cloudflare_dns_record.google_site_verification
  id = "${local.zone_id}/56eb5123295246dc3d8ea0000bb259af"
}

// --- Pages custom domain ----------------------------------------------------
// learn.sonsennim.com is already attached to the sonsenim-lms project and serving production
// traffic. This is an import, not a create.

import {
  to = cloudflare_pages_domain.learn
  id = "${var.account_id}/sonsenim-lms/learn.sonsennim.com"
}

// --- Zone settings ----------------------------------------------------------
// Imported rather than declared fresh, so the plan shows which values actually change instead
// of proposing three creates. Two of the three are genuine changes — see zone_settings.tf.

import {
  to = cloudflare_zone_setting.ssl
  id = "${local.zone_id}/ssl"
}

import {
  to = cloudflare_zone_setting.always_use_https
  id = "${local.zone_id}/always_use_https"
}

import {
  to = cloudflare_zone_setting.min_tls_version
  id = "${local.zone_id}/min_tls_version"
}

// --- Deliberately not managed -----------------------------------------------
//
// "sonsennim-lms-landing", the Pages project behind the apex, stays outside this configuration.
// It is not deployed from this repo and is treated as a separate concern. Its DNS record *is*
// managed (see dns.tf), because the zone belongs here — so Terraform controls where the apex
// points, while the project it points at is maintained elsewhere. That split is intentional.
//
// If it is ever brought in:
//
// import {
//   to = cloudflare_pages_project.landing
//   id = "${var.account_id}/sonsennim-lms-landing"
// }
//
// dev-api.sonsennim.com is not created: development runs locally, so it needs no public
// hostname. See worker_routes.tf.
