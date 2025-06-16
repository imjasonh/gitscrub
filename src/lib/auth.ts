const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;

export interface AuthState {
  token: string | null;
  user: GitHubUser | null;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  public_repos: number;
}

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export interface DeviceTokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

export const AUTH_STORAGE_KEY = 'github_auth';

export function getStoredAuth(): AuthState {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return { token: null, user: null };
  
  try {
    return JSON.parse(stored);
  } catch {
    return { token: null, user: null };
  }
}

export function storeAuth(auth: AuthState) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function fetchUser(token: string): Promise<GitHubUser> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  
  return response.json();
}

export async function initiateDeviceFlow(): Promise<DeviceCodeResponse> {
  // Using a CORS proxy for development
  // In production, you'd need your own proxy or a different auth method
  const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
  const response = await fetch(`${CORS_PROXY}https://github.com/login/device/code`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      scope: 'repo read:user',
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to initiate device flow');
  }
  
  return response.json();
}

export async function pollForToken(deviceCode: string): Promise<DeviceTokenResponse> {
  const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
  const response = await fetch(`${CORS_PROXY}https://github.com/login/oauth/access_token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      device_code: deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to poll for token');
  }
  
  return response.json();
}