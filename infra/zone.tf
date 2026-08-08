// The zone is looked up, not managed.
//
// A `cloudflare_zone` *resource* would put the zone itself under Terraform's control,
// which means a botched import or a removed config block can destroy the zone and every
// record in it. A data source is read-only and carries no such risk. Promoting this to a
// managed resource is a deliberate later step, not a starting point.

data "cloudflare_zone" "main" {
  filter = {
    name = var.zone_name
  }
}

locals {
  // The literal zone ID, not data.cloudflare_zone.main.id.
  //
  // Import blocks require an `id` known at plan time, and a data source read is a needless way
  // to find out whether that holds. Resources could use the data source, but then half the
  // config would reference the zone one way and half the other — one spelling is clearer.
  zone_id = "8a2764347ee678e7e861298b10a66685" // sonsennim.com
}
