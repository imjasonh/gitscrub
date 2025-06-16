import { useEffect, useState } from 'react';
import { github } from '../lib/github';

interface FileViewerProps {
  owner: string;
  repo: string;
  path: string;
  ref: string;
}

export default function FileViewer({ owner, repo, path, ref }: FileViewerProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadFile() {
      try {
        setLoading(true);
        setError(null);
        
        const fileContent = await github.getRawFileContent(owner, repo, path, ref);
        setContent(fileContent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file');
      } finally {
        setLoading(false);
      }
    }
    
    loadFile();
  }, [owner, repo, path, ref]);
  
  const getLanguage = (filePath: string): string => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      rb: 'ruby',
      go: 'go',
      rs: 'rust',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      h: 'c',
      hpp: 'cpp',
      cs: 'csharp',
      php: 'php',
      swift: 'swift',
      kt: 'kotlin',
      md: 'markdown',
      json: 'json',
      xml: 'xml',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
      less: 'less',
      yml: 'yaml',
      yaml: 'yaml',
      toml: 'toml',
      ini: 'ini',
      sh: 'bash',
      bash: 'bash',
      zsh: 'bash',
      ps1: 'powershell',
      dockerfile: 'dockerfile',
      makefile: 'makefile',
    };
    
    return languageMap[ext || ''] || 'text';
  };
  
  if (loading) {
    return <div className="file-viewer loading">Loading file...</div>;
  }
  
  if (error) {
    return <div className="file-viewer error">Error: {error}</div>;
  }
  
  const language = getLanguage(path);
  const lines = content.split('\n');
  
  return (
    <div className="file-viewer">
      <div className="file-header">
        <h3>{path}</h3>
        <span className="file-language">{language}</span>
      </div>
      <div className="file-content">
        <pre>
          <code className={`language-${language}`}>
            {lines.map((line, index) => (
              <div key={index} className="code-line">
                <span className="line-number">{index + 1}</span>
                <span className="line-content">{line}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}