terraform {
  required_version = ">= 1.9"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.23"
    }
  }

  # State lives in R2, via the S3-compatible API.
  #
  # Credentials are deliberately NOT set here. Cloudflare's documented example puts access_key
  # and secret_key inline, but this file is committed — the S3 backend reads AWS_ACCESS_KEY_ID
  # and AWS_SECRET_ACCESS_KEY from the environment instead. See README.md.
  #
  # The skip_* flags disable AWS-specific behaviour that R2 does not implement; without them the
  # backend fails trying to validate credentials against AWS endpoints. use_path_style is
  # required by R2.
  backend "s3" {
    bucket = "sonsenim-tfstate"
    key    = "cloudflare.tfstate"
    region = "auto"

    endpoints = {
      s3 = "https://e4048fea381881a01fd409e6613d6ac5.r2.cloudflarestorage.com"
    }

    use_path_style = true

    # State locking via a .tflock object, which relies on S3 conditional writes. R2 supports
    # these, but Cloudflare does not document the combination — if init fails complaining about
    # locking, drop this line. Locking matters little for a single operator and a great deal
    # once CI can apply.
    use_lockfile = true

    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
  }
}

provider "cloudflare" {
  # The API token is read from the CLOUDFLARE_API_TOKEN environment variable.
  # Deliberately not set here: an api_token argument would end up committed.
}
