variable "region" {
  type = string
}

variable "vpc_name" {
  type = string
}

variable "zone" {
  type = string
}

variable "project_name" {
  type = string
}

variable "k8s_worker_node_count" {
  type = number
}

variable "edge_node_count" {

}

variable "credentials_file_location" {

}

variable "ssh_user" {
  type = string
}