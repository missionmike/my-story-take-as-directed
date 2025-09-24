#!/bin/bash

# Setup script for Google Cloud Service Account
echo "🚀 Setting up Google Cloud Service Account for Take As Directed"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI is not installed."
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed."
    echo "Please install it from: https://developer.hashicorp.com/terraform/downloads"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Get project ID
echo "Please enter your Google Cloud Project ID:"
read -p "Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Project ID cannot be empty"
    exit 1
fi

echo ""
echo "🔐 Authenticating with Google Cloud..."

# Authenticate
gcloud auth login
gcloud config set project $PROJECT_ID
gcloud auth application-default login

echo ""
echo "📝 Setting up Terraform configuration..."

# Create terraform.tfvars
cat > terraform/terraform.tfvars << EOF
project_id = "$PROJECT_ID"
region     = "us-central1"
EOF

echo "✅ Created terraform/terraform.tfvars"
echo ""

# Initialize and apply Terraform
cd terraform
echo "🏗️  Initializing Terraform..."
terraform init

echo ""
echo "📋 Planning Terraform deployment..."
terraform plan

echo ""
echo "🚀 Applying Terraform configuration..."
terraform apply -auto-approve

echo ""
echo "✅ Service account created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the service_account_key from the output above"
echo "2. Share your Google Doc with the service_account_email"
echo "3. Add both values to your .env file"
echo ""
echo "🔍 To see the outputs again, run: terraform output"
