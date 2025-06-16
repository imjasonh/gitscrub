import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      const authDataString = searchParams.get('data');
      
      if (!authDataString) {
        navigate('/login?error=no_auth_data');
        return;
      }

      try {
        const authData = JSON.parse(decodeURIComponent(authDataString));
        
        if (authData.token && authData.user) {
          // Store the complete auth data first
          localStorage.setItem('github_auth', JSON.stringify(authData));
          // Then notify the auth context
          await setToken(authData.token);
          navigate('/');
        } else {
          navigate('/login?error=invalid_auth_data');
        }
      } catch (error) {
        console.error('Failed to process auth data:', error);
        navigate('/login?error=auth_failed');
      }
    };

    handleAuth();
  }, [searchParams, setToken, navigate]);

  return (
    <div className="auth-success-page">
      <div className="loading-container">
        <h2>Completing authentication...</h2>
        <div className="spinner"></div>
      </div>
      
      <style>{`
        .auth-success-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        
        .loading-container {
          text-align: center;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          margin: 20px auto;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0366d6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}