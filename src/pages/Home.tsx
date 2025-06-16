import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const input = repoUrl.trim();
    
    // Check if it's already in owner/repo format
    if (input.includes('/') && !input.includes('github.com')) {
      const [owner, repo] = input.split('/');
      if (owner && repo) {
        navigate(`/${owner}/${repo.replace('.git', '')}`);
        return;
      }
    }
    
    // Parse GitHub URL to extract owner and repo
    const match = input.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      const [, owner, repo] = match;
      navigate(`/${owner}/${repo.replace('.git', '')}`);
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="home-page">
      <div className="welcome-section">
        <h2>Welcome back, {user.name || user.login}!</h2>
        <p>Enter a public GitHub repository to explore its history</p>
      </div>
      
      <form onSubmit={handleSubmit} className="repo-form">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="owner/repository or https://github.com/owner/repository"
          className="repo-input"
          required
        />
        <button type="submit" className="explore-btn">
          Explore Repository
        </button>
      </form>
      
      <p className="note">
        <strong>Note:</strong> GitScrub currently supports only public repositories.
      </p>
      
      <div className="examples">
        <h3>Try these examples:</h3>
        <ul>
          <li>
            <button onClick={() => navigate('/facebook/react')}>
              facebook/react
            </button>
          </li>
          <li>
            <button onClick={() => navigate('/microsoft/vscode')}>
              microsoft/vscode
            </button>
          </li>
          <li>
            <button onClick={() => navigate('/torvalds/linux')}>
              torvalds/linux
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}