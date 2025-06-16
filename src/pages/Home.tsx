import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse GitHub URL to extract owner and repo
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      const [, owner, repo] = match;
      navigate(`/${owner}/${repo.replace('.git', '')}`);
    }
  };
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="home-page">
      <div className="welcome-section">
        <h2>Welcome back, {user.name || user.login}!</h2>
        <p>Enter a GitHub repository URL to explore its history</p>
      </div>
      
      <form onSubmit={handleSubmit} className="repo-form">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/owner/repository"
          className="repo-input"
          required
        />
        <button type="submit" className="explore-btn">
          Explore Repository
        </button>
      </form>
      
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