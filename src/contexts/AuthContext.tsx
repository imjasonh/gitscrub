import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getStoredAuth, 
  storeAuth, 
  clearAuth, 
  fetchUser,
  type AuthState
} from '../lib/auth';

interface AuthContextValue extends AuthState {
  login: () => void;
  logout: () => void;
  setToken: (token: string) => Promise<void>;
  setAuthData: (auth: AuthState) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => getStoredAuth());
  
  useEffect(() => {
    storeAuth(auth);
  }, [auth]);
  
  const login = () => {
    // For PAT-based auth, we'll handle this differently
    // The login page will handle token input
  };
  
  const logout = () => {
    setAuth({ token: null, user: null });
    clearAuth();
  };
  
  const setToken = async (token: string) => {
    try {
      // If we already have user data from OAuth callback, use it
      const currentAuth = getStoredAuth();
      if (currentAuth.token === token && currentAuth.user) {
        setAuth(currentAuth);
        return;
      }
      
      // Otherwise fetch user data
      const user = await fetchUser(token);
      setAuth({ token, user });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setAuth({ token: null, user: null });
      throw error;
    }
  };
  
  const setAuthData = (authData: AuthState) => {
    setAuth(authData);
    storeAuth(authData);
  };
  
  return (
    <AuthContext.Provider value={{ ...auth, login, logout, setToken, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
}