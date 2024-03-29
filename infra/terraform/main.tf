provider "google" {
  credentials = file(var.credentials_file_location)
  project     = var.project_name
  region       = var.region[2]
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

module "database" {
  source       = "./modules/database"
  db_password  = var.db_password
  db_user_name = var.db_user_name
  region       = var.region[2]
}

module "kubernetes" {
  source                = "./modules/kubernetes"
  vpc_name              = var.vpc_name
  subnetwork_name       = [module.vpc.subnetwork_1_name, module.vpc.subnetwork_2_name]
  zone                  = var.zone
  k8s_worker_node_count = var.k8s_worker_node_count
  config_bucket         = module.config_bucket.config_bucket_url
  ssh_user              = var.ssh_user
}

module "kubeedge" {
  source          = "./modules/kubeedge"
  config_bucket   = module.config_bucket.config_bucket_url
  vpc_name        = var.vpc_name
  zone            = var.zone[2]
  subnetwork_name = module.vpc.subnetwork_3_name
  edge_node_count = var.edge_node_count
  ssh_user        = var.ssh_user
}

module "tflite_converter" {
  source        = "./modules/tflite_converter_function"
  project_name  = var.project_name
  config_bucket = module.config_bucket.config_bucket_name
}
/*
module "gpu_node" {
  source        = "./modules/gpu_node"
  controlplane_ip = module.kubernetes.controlplane_ip
  kubeadm_token = module.kubernetes.kubeadm_token
}
*/