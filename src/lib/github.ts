import { getStoredAuth } from './auth';

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string;
  private: boolean;
  html_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  default_branch: string;
}

export interface Commit {
  sha: string;
  node_id: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
    comment_count: number;
  };
  url: string;
  html_url: string;
  author: {
    login: string;
    avatar_url: string;
  };
  committer: {
    login: string;
    avatar_url: string;
  };
  parents: Array<{
    sha: string;
    url: string;
    html_url: string;
  }>;
}

export interface TreeNode {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface FileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

class GitHubAPI {
  private getHeaders(): HeadersInit {
    const auth = getStoredAuth();
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    };
    
    if (auth.token) {
      headers.Authorization = `Bearer ${auth.token}`;
    }
    
    return headers;
  }
  
  private async fetch(url: string, options?: RequestInit) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    return response;
  }
  
  async getRepository(owner: string, repo: string): Promise<Repository> {
    const response = await this.fetch(
      `https://api.github.com/repos/${owner}/${repo}`
    );
    return response.json();
  }
  
  async getCommits(
    owner: string,
    repo: string,
    options: {
      sha?: string;
      path?: string;
      author?: string;
      since?: string;
      until?: string;
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<Commit[]> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    
    const query = params.toString();
    const url = `https://api.github.com/repos/${owner}/${repo}/commits${
      query ? `?${query}` : ''
    }`;
    
    const response = await this.fetch(url);
    return response.json();
  }
  
  async getCommit(owner: string, repo: string, ref: string): Promise<Commit> {
    const response = await this.fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${ref}`
    );
    return response.json();
  }
  
  async getTree(
    owner: string,
    repo: string,
    tree_sha: string,
    recursive = false
  ): Promise<{ sha: string; url: string; tree: TreeNode[]; truncated: boolean }> {
    const params = recursive ? '?recursive=1' : '';
    const response = await this.fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${tree_sha}${params}`
    );
    return response.json();
  }
  
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<FileContent> {
    const params = ref ? `?ref=${ref}` : '';
    const response = await this.fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}${params}`
    );
    return response.json();
  }
  
  async getRawFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<string> {
    const params = ref ? `?ref=${ref}` : '';
    const response = await this.fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}${params}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3.raw',
        },
      }
    );
    return response.text();
  }
  
  async getDiff(
    owner: string,
    repo: string,
    base: string,
    head: string
  ): Promise<string> {
    const response = await this.fetch(
      `https://api.github.com/repos/${owner}/${repo}/compare/${base}...${head}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3.diff',
        },
      }
    );
    return response.text();
  }
  
  async getFileHistory(
    owner: string,
    repo: string,
    path: string,
    options: {
      sha?: string;
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<Commit[]> {
    const params = new URLSearchParams();
    params.append('path', path);
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && key !== 'path') {
        params.append(key, String(value));
      }
    });
    
    const query = params.toString();
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?${query}`;
    
    const response = await this.fetch(url);
    return response.json();
  }
}

export const github = new GitHubAPI();