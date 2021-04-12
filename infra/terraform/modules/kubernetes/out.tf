output "control_plane_address" {
    value = google_compute_instance.k8s_controlplane.network_interface.0.access_config.0.nat_ip
}