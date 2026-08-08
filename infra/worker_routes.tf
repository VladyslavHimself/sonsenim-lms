// Worker routes for the API hostnames.
//
// A route binds a URL pattern to a Worker script. It is what actually decides which Worker
// serves a hostname — not the DNS record, whose content is inert for proxied requests.
//
// Terraform owns these routes; wrangler owns the scripts they point at. The `script` values
// below must match the Worker names in apps/api/wrangler.toml, which are derived from the
// top-level `name` plus the environment suffix. Renaming an environment there without updating
// here silently breaks the binding — the route keeps pointing at a Worker that no longer
// receives deploys.
//
// These routes were created in the dashboard and are still commented out in wrangler.toml.
// Leave them commented: two tools defining the same route is the 409/drift scenario.

resource "cloudflare_workers_route" "api" {
  zone_id = local.zone_id
  pattern = "api.sonsennim.com/*"
  script  = "sonsenim-api-production"
}

resource "cloudflare_workers_route" "staging_api" {
  zone_id = local.zone_id
  pattern = "staging-api.sonsennim.com/*"
  script  = "sonsenim-api-staging"
}

// There is deliberately no route for dev-api.sonsennim.com. Development runs locally
// (`wrangler dev --env development`), so it needs no public hostname — the commented-out
// dev-api block in apps/api/wrangler.toml describes an environment that was never wanted
// remotely, and should stay commented or be deleted.
