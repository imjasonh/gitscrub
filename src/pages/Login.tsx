import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { initiateDeviceFlow, pollForToken, type DeviceCodeResponse } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceFlow, setDeviceFlow] = useState<DeviceCodeResponse | null>(null);
  const [polling, setPolling] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);
  
  const startDeviceFlow = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await initiateDeviceFlow();
      setDeviceFlow(response);
      
      // Copy user code to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(response.user_code);
      }
      
      // Start polling for token
      startPolling(response.device_code, response.interval || 5);
      
      // Open GitHub in new tab
      window.open(response.verification_uri, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start authentication');
      setLoading(false);
    }
  };
  
  const startPolling = (deviceCode: string, interval: number) => {
    setPolling(true);
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const result = await pollForToken(deviceCode);
        
        if (result.access_token) {
          // Success!
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setPolling(false);
          await setToken(result.access_token);
          navigate('/');
        } else if (result.error === 'slow_down') {
          // Increase interval if GitHub tells us to slow down
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          startPolling(deviceCode, interval + 5);
        } else if (result.error && result.error !== 'authorization_pending') {
          // Handle errors (expired_token, access_denied, etc.)
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setPolling(false);
          setLoading(false);
          setError(result.error_description || result.error);
          setDeviceFlow(null);
        }
        // If authorization_pending, just continue polling
      } catch (err) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        setPolling(false);
        setLoading(false);
        setError(err instanceof Error ? err.message : 'Failed to complete authentication');
        setDeviceFlow(null);
      }
    }, interval * 1000);
  };
  
  const cancelFlow = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    setDeviceFlow(null);
    setPolling(false);
    setLoading(false);
    setError(null);
  };
  
  return (
    <div className="login-page">
      <div className="login-container">
        <h1>GitScrub</h1>
        <p>Explore GitHub repository history with ease</p>
        
        {!deviceFlow ? (
          <>
            <button
              onClick={startDeviceFlow}
              className="github-login-btn"
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {loading ? 'Starting...' : 'Sign in with GitHub'}
            </button>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </>
        ) : (
          <div className="device-flow-container">
            <h2>Complete authentication on GitHub</h2>
            
            <div className="user-code-display">
              <p>Enter this code on GitHub:</p>
              <div className="user-code">{deviceFlow.user_code}</div>
              <p className="code-copied">Code copied to clipboard!</p>
            </div>
            
            <div className="flow-status">
              {polling && (
                <div className="polling-indicator">
                  <div className="spinner"></div>
                  <p>Waiting for authentication...</p>
                </div>
              )}
            </div>
            
            <button
              onClick={cancelFlow}
              className="cancel-btn"
              style={{ marginTop: '1rem' }}
            >
              Cancel
            </button>
            
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#586069' }}>
              If the page didn't open automatically,{' '}
              <a href={deviceFlow.verification_uri} target="_blank" rel="noopener noreferrer">
                click here
              </a>
            </p>
          </div>
        )}
        
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
      
      <style>{`
        .device-flow-container {
          text-align: center;
          padding: 2rem 0;
        }
        
        .user-code-display {
          margin: 2rem 0;
        }
        
        .user-code {
          font-size: 2rem;
          font-weight: bold;
          font-family: monospace;
          background: #f6f8fa;
          padding: 1rem 2rem;
          border-radius: 6px;
          margin: 1rem 0;
          letter-spacing: 0.2em;
        }
        
        .code-copied {
          color: #28a745;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
        
        .polling-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #0366d6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .cancel-btn {
          background: #6a737d;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .cancel-btn:hover {
          background: #586069;
        }
      `}</style>
    </div>
  );
}