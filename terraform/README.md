# Terraform Configuration for Google Cloud Service Account

This Terraform configuration creates a Google Cloud service account with the necessary permissions to access Google Docs API.

## Prerequisites

1. **Google Cloud CLI installed**: [Install gcloud CLI](https://cloud.google.com/sdk/docs/install)
2. **Terraform installed**: [Install Terraform](https://developer.hashicorp.com/terraform/downloads)
3. **Google Cloud Project**: You need an existing GCP project

## Setup Instructions

### 1. Authenticate with Google Cloud

```bash
# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable Application Default Credentials
gcloud auth application-default login
```

### 2. Configure Terraform Variables

```bash
# Copy the example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your project ID
# terraform.tfvars should look like:
# project_id = "your-actual-project-id"
# region     = "us-central1"
```

### 3. Initialize and Apply Terraform

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the configuration
terraform apply
```

### 4. Get Your Service Account Credentials

After running `terraform apply`, you'll see outputs including:

- **service_account_email**: The email to share your Google Doc with
- **service_account_key**: The JSON key to add to your `.env` file

### 5. Share Your Google Doc

1. Open your Google Doc
2. Click "Share" button
3. Add the service account email (from terraform output)
4. Give it "Viewer" or "Commenter" access

### 6. Update Your Environment Variables

Add the service account key to your `.env` file:

```bash
# In your project root .env file
VITE_GOOGLE_DOCS_ID=your_google_docs_id_here
VITE_GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project",...}
```

## Terraform Commands Reference

```bash
# Initialize Terraform
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply

# Show current state
terraform show

# Show outputs
terraform output

# Destroy resources (when you're done)
terraform destroy
```

## What This Creates

- **Service Account**: `docs-reader-sa` with Google Docs API access
- **Service Account Key**: JSON credentials for authentication
- **IAM Binding**: Viewer role for the service account
- **API Enablement**: Enables Google Docs API for your project

## Security Notes

- The service account key is sensitive data - keep it secure
- Don't commit the `terraform.tfvars` file to version control
- The service account has minimal permissions (viewer role only)
- You can destroy the resources with `terraform destroy` when done

## Troubleshooting

### Authentication Issues

```bash
# Re-authenticate if needed
gcloud auth application-default login
```

### Permission Issues

```bash
# Check if you have the necessary permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID
```

### API Not Enabled

The Terraform configuration automatically enables the Google Docs API, but you can also do it manually:

```bash
gcloud services enable docs.googleapis.com
```
