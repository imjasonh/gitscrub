import { Outlet, Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { owner, repo } = useParams();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const isRepoPage = owner && repo;
  
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-left">
          <Link to="/" className="app-title">
            <h1>GitScrub</h1>
          </Link>
          
          {isRepoPage && (
            <>
              <span className="header-separator">/</span>
              <a 
                href={`https://github.com/${owner}/${repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="repo-link"
              >
                {owner}/{repo}
              </a>
            </>
          )}
        </div>
        
        {user && (
          <div className="user-menu">
            <img 
              src={user.avatar_url} 
              alt={user.login} 
              className="user-avatar"
            />
            <span className="user-name">{user.login}</span>
            <button onClick={handleLogout} className="logout-btn">
              Sign out
            </button>
          </div>
        )}
      </header>
      
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}