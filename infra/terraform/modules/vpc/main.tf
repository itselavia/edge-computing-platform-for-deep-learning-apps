resource "google_compute_network" "vpc_network" {
  name                    = var.vpc_name
  routing_mode            = "GLOBAL"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnetwork_1" {
  name          = "subnetwork-1"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region[0]
  network       = google_compute_network.vpc_network.id
}

resource "google_compute_subnetwork" "subnetwork_2" {
  name          = "subnetwork-2"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region[1]
  network       = google_compute_network.vpc_network.id
}

resource "google_compute_subnetwork" "subnetwork_3" {
  name          = "subnetwork-3"
  ip_cidr_range = "10.0.2.0/24"
  region        = var.region[2]
  network       = google_compute_network.vpc_network.id
}

resource "google_compute_firewall" "allow_all_ingress" {
  name      = "${var.vpc_name}-allow-all-ingress"
  network   = google_compute_network.vpc_network.name
  direction = "INGRESS"

  allow {
    protocol = "icmp"
  }

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  source_ranges = ["0.0.0.0/0"]

}

resource "google_compute_firewall" "allow_all_egress" {
  name      = "${var.vpc_name}-allow-all-egress"
  network   = google_compute_network.vpc_network.name
  direction = "EGRESS"

  allow {
    protocol = "icmp"
  }

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

}