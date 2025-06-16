import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [token, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Basic validation
      if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
        throw new Error('Invalid token format. GitHub tokens start with ghp_ or github_pat_');
      }
      
      await setToken(token);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate');
      setLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <div className="login-container">
        <h1>GitScrub</h1>
        <p>Explore GitHub repository history with ease</p>
        
        <form onSubmit={handleSubmit} className="token-form">
          <div className="form-group">
            <label htmlFor="token">Personal Access Token</label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ghp_... or github_pat_..."
              className="token-input"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit"
            className="github-login-btn"
            disabled={loading || !token}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {loading ? 'Authenticating...' : 'Sign in with Token'}
          </button>
        </form>
        
        <div className="help-section">
          <details>
            <summary>How to get a Personal Access Token</summary>
            <ol>
              <li>Go to <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer">GitHub Settings → Personal Access Tokens</a></li>
              <li>Click "Generate new token (classic)"</li>
              <li>Give it a name (e.g., "GitScrub")</li>
              <li>Select scopes: <code>repo</code> (for private repos) or <code>public_repo</code> (for public repos only)</li>
              <li>Click "Generate token"</li>
              <li>Copy the token and paste it above</li>
            </ol>
          </details>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <p className="disclaimer">
          Your token is stored locally in your browser and never sent to any server.
        </p>
        
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e1e4e8' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="github-login-btn"
            style={{ background: '#586069' }}
          >
            Continue without authentication
          </button>
          <p style={{ fontSize: '0.875rem', color: '#6a737d', marginTop: '0.5rem' }}>
            Limited to public repositories only
          </p>
        </div>
      </div>
    </div>
  );
}