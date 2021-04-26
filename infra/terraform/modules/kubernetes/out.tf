output "control_plane_address" {
    value = google_compute_instance.k8s_controlplane.network_interface.0.access_config.0.nat_ip
}

output "controlplane_ip" {
  value = google_compute_instance.k8s_controlplane.network_interface.0.access_config.0.nat_ip
}

output "kubeadm_token" {
  value = "${random_string.token_part_1.result}.${random_string.token_part_2.result}"
}