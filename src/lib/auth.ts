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
  const response = await fetch('/api/device-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to initiate device flow');
  }
  
  return response.json();
}

export async function pollForToken(deviceCode: string): Promise<DeviceTokenResponse> {
  const response = await fetch('/api/device-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      device_code: deviceCode,
    }),
  });
  
  // Handle different response statuses
  if (response.status === 202) {
    // Authorization pending or slow down
    const data = await response.json();
    return data;
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to poll for token');
  }
  
  return response.json();
}