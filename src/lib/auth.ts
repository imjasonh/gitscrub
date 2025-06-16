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