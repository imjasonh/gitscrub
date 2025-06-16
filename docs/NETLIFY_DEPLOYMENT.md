# Deploying GitScrub to Netlify

This guide explains how to deploy GitScrub to Netlify with OAuth Device Flow authentication.

## Prerequisites

1. A GitHub account
2. A Netlify account
3. Node.js 18+ installed locally

## Step 1: Create a GitHub OAuth App

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: GitScrub (or your preferred name)
   - **Homepage URL**: Your Netlify URL (e.g., `https://your-app.netlify.app`)
   - **Authorization callback URL**: `https://github.com/login/device/success`
4. Click "Register application"
5. Copy the **Client ID** (you'll need this later)

## Step 2: Deploy to Netlify

### Option A: Deploy with Netlify CLI

1. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/yourusername/gitscrub.git
   cd gitscrub
   npm install
   ```

3. Create a `.env` file with your GitHub Client ID:
   ```bash
   cp .env.example .env
   # Edit .env and add your GITHUB_CLIENT_ID
   ```

4. Deploy to Netlify:
   ```bash
   netlify deploy
   netlify deploy --prod
   ```

### Option B: Deploy with Git

1. Fork this repository
2. Sign in to [Netlify](https://app.netlify.com)
3. Click "New site from Git"
4. Connect your GitHub account and select the forked repository
5. Configure build settings (should auto-detect):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variable:
   - Go to Site settings > Environment variables
   - Add `GITHUB_CLIENT_ID` with your GitHub OAuth App's Client ID
7. Deploy the site

## Step 3: Test the Deployment

1. Visit your Netlify URL
2. Click "Sign in with GitHub"
3. You should see a device code
4. Follow the prompts to authenticate on GitHub
5. Once authenticated, you'll be redirected back to GitScrub

## Environment Variables

- `GITHUB_CLIENT_ID`: Your GitHub OAuth App's Client ID (required)

## Local Development with Netlify Functions

To test the OAuth flow locally:

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Start the dev server with Netlify Functions
netlify dev
```

This will start:
- Vite dev server on port 5173
- Netlify Functions on port 8888
- Proxy server that routes everything properly

## Troubleshooting

### CORS Errors
The Netlify Functions handle the OAuth flow server-side, so there should be no CORS issues. If you see CORS errors, ensure:
- You're accessing the app through the Netlify URL (not localhost)
- The `/api/*` redirects are properly configured in `netlify.toml`

### Authentication Fails
- Verify your GitHub OAuth App's Client ID is correctly set in Netlify's environment variables
- Check that the Authorization callback URL is exactly `https://github.com/login/device/success`
- Look at the Function logs in Netlify's dashboard for error details

### Build Fails
- Ensure Node.js version 18+ is specified in `netlify.toml`
- Check build logs for any missing dependencies

## Security Notes

- The GitHub Client ID is safe to expose (it's meant to be public)
- Never commit the Client Secret (device flow doesn't use it)
- Tokens are stored in browser localStorage and never sent to any server
- Netlify Functions act as a secure proxy for GitHub OAuth endpoints