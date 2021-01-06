resource "google_storage_bucket" "config_bucket" {
  name          = "${var.project_name}-config-bucket"
  force_destroy = true
}