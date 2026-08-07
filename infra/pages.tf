// The UI's Pages project.
//
// This project is git-connected: Cloudflare clones the repo and runs the build itself. Pushing
// to `production` deploys; pushing to `main` produces a preview. There is no upload step here —
// Terraform manages the project's configuration, not its contents.
//
// VITE_* variables are baked into the bundle at build time, and since Cloudflare runs that
// build, these env_vars are what the deployed app actually gets. Changing one takes effect on
// the next deployment, not immediately.
//
// Generated from the live project via `plan -generate-config-out`, with null-valued optional
// attributes stripped and the env var values filled in (the provider will not generate them).

// Custom domain binding for the app. This is the Pages half; the DNS record is in dns.tf.
// Both are required — the CNAME alone serves nothing until the hostname is registered on the
// project, which is what this resource does.
resource "cloudflare_pages_domain" "learn" {
  account_id   = var.account_id
  project_name = cloudflare_pages_project.ui.name
  name         = "learn.sonsennim.com"
}

resource "cloudflare_pages_project" "ui" {
  account_id        = var.account_id
  name              = "sonsenim-lms"
  production_branch = "production"

  build_config = {
    build_command   = "pnpm run ui:build"
    destination_dir = "apps/ui/dist"
  }

  source = {
    type = "github"
    config = {
      owner                          = "VladyslavHimself"
      owner_id                       = "51461002"
      repo_name                      = "sonsenim-lms"
      repo_id                        = "1150930919"
      production_branch              = "production"
      production_deployments_enabled = true
      preview_deployment_setting     = "custom"
      preview_branch_includes        = ["main"]
      path_includes                  = ["apps/ui/*"]
      pr_comments_enabled            = true
    }
  }

  deployment_configs = {
    preview = {
      compatibility_date                   = "2026-02-14"
      always_use_latest_compatibility_date = false
      build_image_major_version            = 3
      fail_open                            = true

      env_vars = {
        VITE_API_BASE_URL = {
          type  = "plain_text"
          value = "https://staging-api.sonsennim.com/v1"
        }
      }
    }

    production = {
      compatibility_date                   = "2026-02-14"
      always_use_latest_compatibility_date = false
      build_image_major_version            = 3
      fail_open                            = true

      env_vars = {
        VITE_API_BASE_URL = {
          type  = "plain_text"
          value = "https://api.sonsennim.com/v1"
        }
      }
    }
  }
}
