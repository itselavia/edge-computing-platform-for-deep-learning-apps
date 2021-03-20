resource "random_id" "db_name_suffix" {
  byte_length = 4
}

resource "google_sql_user" "users" {
  name     = var.db_user_name
  instance = google_sql_database_instance.instance.name
  password = var.db_password
}

resource "google_sql_database" "database" {
  name     = "edge-platform"
  instance = google_sql_database_instance.instance.name
}

resource "google_sql_database_instance" "instance" {
  name                = "master-instance-${random_id.db_name_suffix.hex}"
  region              = var.region
  database_version    = "MYSQL_8_0"
  deletion_protection = false

  


  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
          name = "Internet"
          value = "0.0.0.0/0"
        }
    }
    disk_type           = "PD_HDD"
      activation_policy   = "ALWAYS"
  availability_type   = "ZONAL"
  
  }
}