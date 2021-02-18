output "tf_saved_models_bucket" {
  value = google_storage_bucket.tf_saved_models_bucket.url
}