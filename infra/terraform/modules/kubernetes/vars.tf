variable "vpc_name" {
  type = string
}

variable "subnetwork_name" {
  type = string
}

variable "zone" {
  type = string
}

variable "k8s_worker_node_count" {
  type = number
}

variable "config_bucket" {
  type = string
}