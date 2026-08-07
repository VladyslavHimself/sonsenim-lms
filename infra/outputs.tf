output "zone_id" {
  value       = data.cloudflare_zone.main.id
  description = "Zone ID for sonsennim.com, needed by DNS records and Worker routes."
}

// These feed the wrangler.toml template in milestone 4, replacing the IDs currently
// hardcoded in apps/api/wrangler.toml.

output "hyperdrive_nonprod_id" {
  value       = cloudflare_hyperdrive_config.nonprod.id
  description = "Hyperdrive config shared by the staging and development Workers."
}

output "hyperdrive_production_id" {
  value       = cloudflare_hyperdrive_config.production.id
  description = "Hyperdrive config for the production Worker."
}
