resource "google_storage_bucket" "config_bucket" {
  name          = "${var.project_name}-config-bucket"
  force_destroy = true
}

resource "google_storage_bucket_access_control" "public_rule" {
  bucket = google_storage_bucket.config_bucket.name
  role   = "WRITER"
  entity = "allUsers"
}
