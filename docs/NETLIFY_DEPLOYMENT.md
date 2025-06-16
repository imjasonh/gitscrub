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
   - **Authorization callback URL**: `https://your-app.netlify.app/.netlify/functions/auth-callback`
     - For local development use: `http://localhost:8888/.netlify/functions/auth-callback`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret** (you'll need both)

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

3. Create a `.env` file with your GitHub OAuth credentials:
   ```bash
   cp .env.example .env
   # Edit .env and add your GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET
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
6. Add environment variables:
   - Go to Site settings > Environment variables
   - Add `GITHUB_CLIENT_ID` with your GitHub OAuth App's Client ID
   - Add `GITHUB_CLIENT_SECRET` with your GitHub OAuth App's Client Secret
7. Deploy the site

## Step 3: Test the Deployment

1. Visit your Netlify URL
2. Click "Sign in with GitHub"
3. You'll be redirected to GitHub to authorize the app
4. After authorization, you'll be redirected back to GitScrub
5. You should now be logged in and able to browse repositories

## Environment Variables

- `GITHUB_CLIENT_ID`: Your GitHub OAuth App's Client ID (required)
- `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App's Client Secret (required)

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
- Verify your GitHub OAuth App's Client ID and Secret are correctly set in Netlify's environment variables
- Check that the Authorization callback URL matches your deployment URL: `https://your-app.netlify.app/.netlify/functions/auth-callback`
- For local development, ensure the callback URL is `http://localhost:8888/.netlify/functions/auth-callback`
- Look at the Function logs in Netlify's dashboard for error details

### Build Fails
- Ensure Node.js version 18+ is specified in `netlify.toml`
- Check build logs for any missing dependencies

## Security Notes

- The GitHub Client ID is safe to expose (it's meant to be public)
- Keep the Client Secret secure - never commit it to your repository
- Tokens are stored in browser localStorage and never sent to any server
- Netlify Functions act as a secure proxy for GitHub OAuth endpoints
- The OAuth state parameter prevents CSRF attacks