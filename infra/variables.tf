variable "account_id" {
  type        = string
  description = "Cloudflare account ID. Dashboard → any domain → Overview, right-hand sidebar."

  // Defaulted rather than required: an account ID identifies, it does not authenticate, and it
  // is already committed in terraform.tfvars.example and referenced throughout the docs.
  // Defaulting it keeps CI from needing a secret for a value that is not secret.
  default = "e4048fea381881a01fd409e6613d6ac5"
}

variable "zone_name" {
  type        = string
  description = "The apex domain managed in this configuration."
  default     = "sonsennim.com"
}

// Hyperdrive requires origin.password, but the Cloudflare API never returns it, so it cannot
// be recovered from the live config. Take these from the Supabase dashboard, or from the
// DATABASE_URL you already use for dbmate.
//
// These are inert in practice — hyperdrive.tf ignores changes to the password, so Terraform
// will not push them. They must still be correct: if a config is ever recreated, a wrong
// value is what Cloudflare would use to reach the database.

variable "hyperdrive_nonprod_password" {
  type        = string
  sensitive   = true
  description = "Postgres password for the staging/development Supabase instance."
}

variable "hyperdrive_production_password" {
  type        = string
  sensitive   = true
  description = "Postgres password for the production Supabase instance."
}

// --- Cloudflare Access ------------------------------------------------------

variable "enable_staging_access" {
  type        = bool
  description = <<-EOT
    Put Cloudflare Access in front of staging-api.sonsennim.com.

    Off by default: enabling it will break the staging UI's cross-origin API calls until that
    client authenticates with an Access service token. See access.tf before turning this on.
  EOT
  default     = false
}

variable "access_allowed_email" {
  type        = string
  description = "Email address allowed through the staging Access policy. Only read when enable_staging_access is true."
  default     = ""

  validation {
    condition     = var.access_allowed_email == "" || can(regex("@", var.access_allowed_email))
    error_message = "access_allowed_email must be an email address."
  }
}
