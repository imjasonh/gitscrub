import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { github, type Repository as RepoType } from '../lib/github';
import FileTree from '../components/FileTree';
import FileViewerWithHistory from '../components/FileViewerWithHistory';

export default function Repository() {
  const { owner, repo, '*': path } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [repository, setRepository] = useState<RepoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);
  
  useEffect(() => {
    if (!owner || !repo || !user) return;
    
    async function loadRepository(ownerParam: string, repoParam: string) {
      try {
        setLoading(true);
        const repoData = await github.getRepository(ownerParam, repoParam);
        setRepository(repoData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load repository');
      } finally {
        setLoading(false);
      }
    }
    
    loadRepository(owner, repo);
  }, [owner, repo, user]);
  
  // Early return if params are missing
  if (!owner || !repo) {
    return (
      <div className="error">
        <h2>Invalid repository URL</h2>
        <button onClick={() => navigate('/')}>Go back</button>
      </div>
    );
  }
  
  if (loading) {
    return <div className="loading">Loading repository...</div>;
  }
  
  if (error) {
    return (
      <div className="error">
        <h2>Error loading repository</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Go back</button>
      </div>
    );
  }
  
  if (!repository) {
    return null;
  }
  
  return (
    <div className="repository-page">
      <FileTree
        owner={owner}
        repo={repo}
        commitSha={repository.default_branch}
        onSelectFile={(filePath) => {
          navigate(`/${owner}/${repo}/blob/${repository.default_branch}/${filePath}`);
        }}
      />
      
      {path && (
        <FileViewerWithHistory
          owner={owner}
          repo={repo}
          path={path}
          initialRef={repository.default_branch}
        />
      )}
    </div>
  );
}