# GitScrub Project Context

## Overview
GitScrub is a web application for exploring GitHub repository history with an intuitive timeline interface. It uses Netlify Functions for OAuth authentication and communicates directly with GitHub's REST API.

## Key Features
- Browse any GitHub repository (public and private)
- Navigate repository file structure with a tree view
- View file history with an interactive timeline slider
- Click anywhere on the timeline to jump to specific commits
- Use arrow keys (←→) for precise commit navigation
- Load more commits for extensive history (>100 commits)
- Syntax highlighting and diff visualization
- Secure authentication with GitHub OAuth

## Technical Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6 with basename support for GitHub Pages
- **API**: GitHub REST API v3
- **Testing**: Playwright
- **Deployment**: Netlify with serverless functions
- **Authentication**: OAuth web flow via Netlify Functions

## Important Implementation Details

### Timeline Slider
- **Click-only interaction** (no dragging) - this was a specific design decision after multiple iterations
- Time-based positioning of tick marks (not evenly spaced)
- Visual feedback with active tick highlighting
- Keyboard navigation with arrow keys when focused

### Authentication
- Uses GitHub OAuth web flow for seamless authentication
- No manual token creation or management required
- Access tokens stored securely in localStorage
- Authentication is required for all usage
- OAuth state parameter for CSRF protection

### Netlify Deployment
- Serverless functions handle OAuth flow
- Automatic deployment via Git integration
- Environment variable for GitHub Client ID
- Build command: `npm run build`

## Project Structure
```
src/
├── components/
│   ├── FileTree.tsx          # Repository file browser
│   ├── FileViewerWithHistory.tsx  # Main file viewer with timeline
│   ├── HistorySlider.tsx     # Timeline slider component
│   └── ErrorBoundary.tsx     # Global error handling
├── lib/
│   ├── github.ts            # GitHub API client
│   └── auth.ts              # Authentication utilities
├── pages/
│   ├── Home.tsx             # Landing page
│   ├── Login.tsx            # Authentication page
│   └── Repository.tsx       # Repository view page
└── contexts/
    └── AuthContext.tsx      # Auth state management
```

## Testing
- Playwright tests in `tests/`
- Requires GitHub token in `.env.test` for authenticated tests
- Tests cover authentication, navigation, slider interaction, and commit loading

## Known Quirks and Decisions
1. **No dragging on slider** - Only clicking is supported due to issues with time-based positioning
2. **No commit messages in slider** - Removed to save space as requested
3. **Version numbers removed** - Shows dates instead of "Version X of Y"
4. **Commit headers link to GitHub** - Each commit SHA links to its GitHub page
5. **Load more commits** - Appears when there are >100 commits in history

## Common Commands
```bash
# Development (with Netlify Functions)
netlify dev

# Build for production
npm run build

# Run tests (needs .env.test with GITHUB_CLIENT_ID)
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Debugging Deployment
The app includes console logging for debugging:
- Logs app initialization with base URL and environment info
- Global error handlers for uncaught errors
- Try-catch around React rendering with fallback error display

## Future Considerations
- The app uses Netlify Functions to handle OAuth authentication
- Rate limiting is managed through authenticated requests
- OAuth web flow provides secure authentication via serverless functions
- File history is limited to 100 commits per API call (pagination implemented)

## License
Apache 2.0 (not MIT) - this was specifically requested