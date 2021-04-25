variable "vpc_name" {
  type = string
}

variable "subnetwork_name" {
  type = list(string)
}

variable "zone" {
  type = list(string)
}

variable "k8s_worker_node_count" {
  type = number
}

variable "config_bucket" {
  type = string
}

variable "ssh_user" {
  type = string
}