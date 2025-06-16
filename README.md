# GitScrub

A web application for exploring GitHub repository history with an intuitive timeline interface.

## Features

- 🔍 Browse any public GitHub repository
- 📁 Navigate repository file structure
- 📜 View file history with timeline slider
- 🎯 Click anywhere on the timeline to jump to specific commits
- ⌨️ Use arrow keys for precise commit navigation
- 🔄 Load more commits for extensive history
- 🎨 Syntax highlighting and diff visualization
- 🔐 Secure authentication with GitHub Personal Access Tokens

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- GitHub Personal Access Token (for authenticated access)

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

### Configuration

1. Create a GitHub Personal Access Token:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a new token with `repo` scope for private repos or `public_repo` for public only
   
2. Use the token in the app:
   - Enter it on the login page when prompted
   - Or continue without authentication (limited to 60 requests/hour)

### Running Tests

```bash
# Create .env.test with your GitHub token
echo "GITHUB_TOKEN=your_token_here" > .env.test

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

The app is a pure client-side application with no backend server required. It communicates directly with GitHub's API using Personal Access Tokens for authentication.

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