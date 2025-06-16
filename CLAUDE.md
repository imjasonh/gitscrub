# GitScrub Project Context

## Overview
GitScrub is a web application for exploring GitHub repository history with an intuitive timeline interface. It's a pure client-side React app that uses GitHub's REST API.

## Key Features
- Browse any public GitHub repository (private repos with auth)
- Navigate repository file structure with a tree view
- View file history with an interactive timeline slider
- Click anywhere on the timeline to jump to specific commits
- Use arrow keys (←→) for precise commit navigation
- Load more commits for extensive history (>100 commits)
- Syntax highlighting and diff visualization
- Secure authentication with GitHub Personal Access Tokens (Fine-grained recommended)

## Technical Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6 with basename support for GitHub Pages
- **API**: GitHub REST API v3
- **Testing**: Playwright
- **Deployment**: GitHub Pages via GitHub Actions
- **Authentication**: Personal Access Tokens (stored in localStorage)

## Important Implementation Details

### Timeline Slider
- **Click-only interaction** (no dragging) - this was a specific design decision after multiple iterations
- Time-based positioning of tick marks (not evenly spaced)
- Visual feedback with active tick highlighting
- Keyboard navigation with arrow keys when focused

### Authentication
- Supports both classic (ghp_) and fine-grained (github_pat_, ghs_) tokens
- Recommends fine-grained tokens with minimal permissions (Contents: Read only)
- Token stored in localStorage
- Can work without auth for public repos (60 requests/hour limit)

### GitHub Pages Deployment
- Uses base path `/gitscrub/` in production
- 404.html trick for client-side routing
- Automatic deployment on push to main branch
- Build command: `npm run build -- --base=/gitscrub/`

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
# Development
npm run dev

# Build for production
npm run build -- --base=/gitscrub/

# Run tests (needs .env.test with GITHUB_TOKEN)
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
- The app is designed to work purely client-side with no backend
- Rate limiting can be an issue without authentication (60/hour for unauthenticated)
- CORS prevents OAuth/Device Flow, hence the PAT approach
- File history is limited to 100 commits per API call (pagination implemented)

## License
Apache 2.0 (not MIT) - this was specifically requested