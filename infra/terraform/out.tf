output "tf_saved_models_bucket" {
  value = module.tflite_converter.tf_saved_models_bucket
}

output "function_region" {
  value = var.region
}

output "project_id" {
  value = var.project_name
}

output "function_name" {
  value = module.tflite_converter.converter_function_name
}

output "tflite_bucket" {
  value = module.tflite_converter.tflite_models_bucket
}

output "database_ip" {
  value = module.database.database_ip
}