import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

console.log('GitScrub app starting...', {
  baseURL: import.meta.env.BASE_URL,
  mode: import.meta.env.MODE,
  prod: import.meta.env.PROD
});

const root = document.getElementById('root');
if (!root) {
  console.error('Root element not found!');
} else {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
