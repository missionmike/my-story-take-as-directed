# Google Docs in Next.js

A modern Next.js app that fetches content from Google Docs API and renders each
tab as its own continuous page. Perfect for deployment on Vercel!

## Features

- 📄 Fetches content from Google Docs API via secure API routes
- 🗂️ Automatically parses document tabs/sections
- 🎨 Modern, responsive UI
- 🚀 Built with Next.js 15, React, and TypeScript
- 📱 Mobile-friendly design
- 🔄 Real-time content refresh
- ☁️ Ready for Vercel deployment
- 🔒 Secure server-side Google Docs API integration

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Google Docs API Setup (Service Account)

#### Option A: Automated Setup with Terraform (Recommended)

1. **Run the setup script**:

   ```bash
   ./setup-service-account.sh
   ```

   This script will:
   - Authenticate with Google Cloud
   - Create a service account with proper permissions
   - Generate the service account key
   - Provide you with the credentials

#### Option B: Manual Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Docs API
4. Create a Service Account:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Give it a name and description
   - Grant it "Viewer" role for Google Docs
5. Create a key for the service account:
   - Click on your service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key" → "JSON"
   - Download the JSON file
6. **Important**: Share your Google Doc with the service account email (found in
   the JSON file)
7. Copy the entire JSON content from the downloaded file

### 3. Environment Configuration

1. Copy the example environment file:

   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your configuration:

   ```
   GOOGLE_DOCS_ID=your_google_docs_id_here
   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project",...}
   ```

   > Note: The service account JSON content should be on one continuous line.
   > Remove any newlines!

### 4. Google Docs Formatting

This repository will parse each Tab as its own "page."

The pages are continuous, and all loaded at once. However, upon scrolling
through each page, the URL will be updated with a local hash to point to the
current section.

### 5. Get Your Google Docs ID

The Google Docs ID is found in the URL of your document:

```
https://docs.google.com/document/d/YOUR_DOCS_ID_HERE/edit
```

### 6. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
npm start
```

## Deploying to Vercel

This app is optimized for Vercel deployment:

1. **Push to GitHub**: Make sure your code is in a GitHub repository
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js app
3. **Add Environment Variables**:
   - In your Vercel dashboard, go to Settings → Environment Variables
   - Add `GOOGLE_DOCS_ID` with your Google Docs ID
   - Add `GOOGLE_SERVICE_ACCOUNT_JSON` with your service account JSON
4. **Deploy**: Vercel will automatically deploy your app!

Your app will be available at `https://your-app-name.vercel.app`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── document/
│   │       └── route.ts      # Google Docs API endpoint
│   ├── tab/
│   │   └── [tabIndex]/
│   │       └── page.tsx     # Individual tab page
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
└── types/
    └── googleDocs.ts        # TypeScript types

terraform/
├── main.tf                  # Terraform configuration
├── variables.tf             # Terraform variables
├── terraform.tfvars.example # Example variables file
└── README.md                # Terraform setup instructions

setup-service-account.sh     # Automated setup script
```

### Styling

The app uses CSS modules and custom properties. Main style files:

- `src/App.css` - Global styles and navigation
- `src/pages/HomePage.css` - Home page styles
- `src/pages/TabPage.css` - Individual tab page styles

## Troubleshooting

### Authentication Issues

- Verify the service account JSON is valid JSON format
- Check that the Google Docs document is shared with the service account email
- Ensure the service account has the correct permissions
- Make sure the Google Docs API is enabled for your project
- Verify the Google Docs ID is correct

### Tab Parsing Issues

- Check that your Google Doc has clear section headers
- Modify the `isTabHeader` method if your formatting is different
- Ensure sections are properly formatted with line breaks

### Build Issues

- Make sure all environment variables are set
- Verify the Google Docs document exists and is accessible
- Ensure the service account has proper permissions

## License

MIT License - feel free to use this project for your own needs!
