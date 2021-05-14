output "tf_saved_models_bucket" {
  value = google_storage_bucket.tf_saved_models_bucket.url
}

output "converter_function_name" {
  value = google_cloudfunctions_function.converter_function.id
}

output "converter_function_region" {
value = google_cloudfunctions_function.converter_function.region
}
