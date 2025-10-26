# Configure the Google Cloud Provider
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Configure the Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
}

# Create a service account for Google Docs API access
resource "google_service_account" "docs_reader" {
  account_id   = "docs-reader-sa"
  display_name = "Google Docs Reader Service Account"
  description  = "Service account for reading Google Docs content"
}

# Create a service account key
resource "google_service_account_key" "docs_reader_key" {
  service_account_id = google_service_account.docs_reader.name
  public_key_type    = "TYPE_X509_PEM_FILE"
}

# Grant the service account access to Google Docs API
resource "google_project_service" "docs_api" {
  service = "docs.googleapis.com"

  disable_on_destroy = false
}

# Optional: Grant the service account viewer role on the project
resource "google_project_iam_member" "docs_reader_viewer" {
  project = var.project_id
  role    = "roles/viewer"
  member  = "serviceAccount:${google_service_account.docs_reader.email}"
}

# Output the service account email
output "service_account_email" {
  value       = google_service_account.docs_reader.email
  description = "Email of the service account to share your Google Doc with"
}

# Output the service account key (base64 encoded)
output "service_account_key" {
  value       = base64decode(google_service_account_key.docs_reader_key.private_key)
  sensitive   = true
  description = "Service account key JSON (keep this secure!)"
}

# Output instructions
output "instructions" {
  value = <<-EOT
    Setup Instructions:
    1. Copy the service_account_key output above
    2. Share your Google Doc with: ${google_service_account.docs_reader.email}
    3. Add the key to your .env file as GOOGLE_SERVICE_ACCOUNT_JSON
    4. Get your Google Docs ID from the document URL
    5. Add VITE_GOOGLE_DOCS_ID to your .env file
  EOT
}
