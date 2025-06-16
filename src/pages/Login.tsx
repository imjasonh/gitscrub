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
      
      // Basic validation for token format
      const validTokenPrefixes = ['ghp_', 'github_pat_', 'ghs_'];
      const hasValidPrefix = validTokenPrefixes.some(prefix => token.startsWith(prefix));
      
      if (!hasValidPrefix) {
        throw new Error('Invalid token format. GitHub tokens start with ghp_, github_pat_, or ghs_');
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
            <summary>How to get a Personal Access Token (Recommended: Fine-grained)</summary>
            <ol>
              <li>Go to <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">GitHub Settings → Fine-grained tokens</a></li>
              <li>Give it a name (e.g., "GitScrub") and set expiration</li>
              <li>Under <strong>Repository access</strong>:
                <ul>
                  <li>Choose "Public Repositories" for public repos only</li>
                  <li>Or "Selected repositories" to include specific private repos</li>
                </ul>
              </li>
              <li>Under <strong>Permissions</strong> → <strong>Repository permissions</strong>:
                <ul>
                  <li>Set <code>Contents</code> to <code>Read</code></li>
                  <li>This is the only permission needed!</li>
                </ul>
              </li>
              <li>Click "Generate token"</li>
              <li>Copy the token and paste it above</li>
            </ol>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#586069' }}>
              <strong>Note:</strong> Fine-grained tokens are more secure as they limit access to only what's needed.
              Classic tokens work too but require broader permissions.
            </p>
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