# GitScrub

A web application for exploring GitHub repository history with an intuitive timeline interface.

## Features

- 🔍 Browse public GitHub repositories
- 📁 Navigate repository file structure
- 📜 View file history with timeline slider
- 🎯 Click anywhere on the timeline to jump to specific commits
- ⌨️ Use arrow keys for precise commit navigation
- 🔄 Load more commits for extensive history
- 🎨 Syntax highlighting and diff visualization
- 🔐 Secure authentication with GitHub OAuth

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/imjasonh/gitscrub.git
cd gitscrub

# Install dependencies
npm install

# Start development server
npm run dev
```

### Deployment

GitScrub is designed to be deployed on Netlify for the best user experience:

- See [Netlify Deployment Guide](docs/NETLIFY_DEPLOYMENT.md) for detailed instructions
- OAuth web flow authentication - no tokens to manage
- Users authenticate directly with GitHub

### Local Development

For local development with OAuth support:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Create .env file with your GitHub OAuth App credentials
cp .env.example .env
# Edit .env and add your GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET

# Start development server with Netlify Functions
netlify dev
```

### Running Tests

```bash
# Create .env.test with test configuration
echo "GITHUB_CLIENT_ID=your_test_client_id" > .env.test

# Run all tests
npm test

# Run tests with UI
npm run test:ui
```

## Usage

1. **Navigate to a Repository**: Enter a GitHub URL or use the example buttons
2. **Browse Files**: Click on any file in the tree view
3. **Explore History**: 
   - Use the timeline slider at the bottom
   - Click anywhere on the timeline to jump to that point in time
   - Use ← → arrow keys for precise navigation
   - Toggle diff view to see changes between commits

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Routing**: React Router
- **API**: GitHub REST API v3
- **Testing**: Playwright
- **Styling**: CSS

## Architecture

The app uses Netlify Functions for OAuth authentication and communicates directly with GitHub's API. Authentication is handled via GitHub's OAuth web flow for a seamless user experience.

Key components:
- `FileTree`: Repository file browser
- `FileViewerWithHistory`: File content viewer with timeline
- `HistorySlider`: Interactive timeline for commit navigation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the Apache License 2.0.