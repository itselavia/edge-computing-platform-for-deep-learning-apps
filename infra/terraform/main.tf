provider "google" {
  credentials = file(var.credentials_file_location)
  project     = var.project_name
  region      = var.region
  zone        = var.zone
}

module "config_bucket" {
  source       = "./modules/config_bucket"
  project_name = var.project_name
}

module "vpc" {
  source   = "./modules/vpc"
  vpc_name = var.vpc_name
  region   = var.region
}

module "kubernetes" {
  source                = "./modules/kubernetes"
  vpc_name              = var.vpc_name
  subnetwork_name       = module.vpc.subnetwork_1_name
  zone                  = var.zone
  k8s_worker_node_count = var.k8s_worker_node_count
  config_bucket         = module.config_bucket.config_bucket_url
  ssh_user              = var.ssh_user
}

module "kubeedge" {
  source          = "./modules/kubeedge"
  config_bucket   = module.config_bucket.config_bucket_url
  vpc_name        = var.vpc_name
  zone            = var.zone
  subnetwork_name = module.vpc.subnetwork_2_name
  edge_node_count = var.edge_node_count
  ssh_user        = var.ssh_user
}

module "tflite_converter" {
  source        = "./modules/tflite_converter_function"
  project_name  = var.project_name
  config_bucket = module.config_bucket.config_bucket_name
}

module "tflite_helm_repo" {
  source       = "./modules/tflite_helm_repo"
  project_name = var.project_name
}