terraform {
  required_version = ">= 1.9"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.23"
    }
  }

  # State is local for now. It is gitignored — it contains secrets in plaintext.
  # Milestone 5 (CI) migrates this to a remote backend via `terraform init -migrate-state`.
}

provider "cloudflare" {
  # The API token is read from the CLOUDFLARE_API_TOKEN environment variable.
  # Deliberately not set here: an api_token argument would end up committed.
}
