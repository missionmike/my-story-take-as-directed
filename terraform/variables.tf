variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "service_account_name" {
  description = "Name for the service account"
  type        = string
  default     = "docs-reader-sa"
}
