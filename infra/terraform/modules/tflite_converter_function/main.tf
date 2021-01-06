
resource "google_storage_bucket" "tf_saved_models_bucket" {
  name          = "${var.project_name}-tf-saved-models"
  force_destroy = true
}

resource "google_storage_bucket" "tflite_models_bucket" {
  name          = "${var.project_name}-tflite-models"
  force_destroy = true
}

data "archive_file" "converter_function_zip" {
  type        = "zip"
  source_dir  = "${path.module}/function_code"
  output_path = "${path.module}/converter.zip"
}

resource "null_resource" "delete_converter_zip" {
  provisioner "local-exec" {
    when    = destroy
    command = "rm -rf ${path.module}/converter.zip"
  }
}

resource "google_storage_bucket_object" "converter_function_object" {
  name   = "converter.zip"
  bucket = var.config_bucket
  source = data.archive_file.converter_function_zip.output_path
}

resource "google_cloudfunctions_function" "converter_function" {
  name        = "tf-to-tflite-converter-function"
  description = "Function to convert TensorFlow's SavedModels to TfLite"
  runtime     = "python37"

  available_memory_mb   = 4096
  source_archive_bucket = var.config_bucket
  source_archive_object = google_storage_bucket_object.converter_function_object.name
  trigger_http          = true
  entry_point           = "model_converter"

  environment_variables = {
    SOURCE_BUCKET      = google_storage_bucket.tf_saved_models_bucket.name
    DESTINATION_BUCKET = google_storage_bucket.tflite_models_bucket.name
  }

  timeouts {
    create = "15m"
  }
}

# IAM entry for all users to invoke the function
resource "google_cloudfunctions_function_iam_member" "invoker" {
  project        = google_cloudfunctions_function.converter_function.project
  region         = google_cloudfunctions_function.converter_function.region
  cloud_function = google_cloudfunctions_function.converter_function.name

  role   = "roles/cloudfunctions.invoker"
  member = "allUsers"
}