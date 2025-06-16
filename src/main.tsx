import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

console.log('GitScrub app starting...', {
  baseURL: import.meta.env.BASE_URL,
  mode: import.meta.env.MODE,
  prod: import.meta.env.PROD,
  href: window.location.href,
  pathname: window.location.pathname
});

// Add error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const root = document.getElementById('root');
if (!root) {
  console.error('Root element not found!');
  document.body.innerHTML = '<h1>Error: Root element not found</h1>';
} else {
  console.log('Root element found, rendering app...');
  try {
    createRoot(root).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
    root.innerHTML = `<h1>Error rendering app</h1><pre>${error}</pre>`;
  }
}
