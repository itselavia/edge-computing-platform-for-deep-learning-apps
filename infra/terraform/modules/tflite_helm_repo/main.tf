resource "google_storage_bucket" "helm_repo" {
  name          = "${var.project_name}-helm-repository"
  force_destroy = true
}

resource "null_resource" "helm_repo_package" {
  provisioner "local-exec" {
    command = "mkdir ${path.module}/chart_artifact_dir; helm package ${path.module}/tflite-inference --destination ${path.module}/chart_artifact_dir; helm repo index ${path.module}/chart_artifact_dir --url https://${var.project_name}-helm-repository.storage.googleapis.com; gsutil rsync -d ${path.module}/chart_artifact_dir gs://${var.project_name}-helm-repository"
  }
  provisioner "local-exec" {
    when    = destroy
    command = "rm -drf ${path.module}/chart_artifact_dir/*"
  }
}