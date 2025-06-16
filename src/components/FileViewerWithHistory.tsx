import { useEffect, useState, useRef } from 'react';
import { github, type Commit } from '../lib/github';
import * as Diff from 'diff';

interface FileViewerWithHistoryProps {
  owner: string;
  repo: string;
  path: string;
  initialRef: string;
}

interface FileVersion {
  sha: string;
  content: string;
  commit: Commit;
}

export default function FileViewerWithHistory({ owner, repo, path, initialRef }: FileViewerWithHistoryProps) {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const contentCache = useRef<Map<string, string>>(new Map());
  const currentPage = useRef(1);
  const sliderRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    loadFileHistory();
  }, [owner, repo, path]);
  
  // Focus the slider when component mounts for keyboard navigation
  useEffect(() => {
    if (sliderRef.current && !loading) {
      sliderRef.current.focus();
    }
  }, [loading]);
  
  async function loadFileHistory(append = false) {
    try {
      if (!append) {
        setLoading(true);
        setError(null);
        currentPage.current = 1;
      } else {
        setLoadingMore(true);
      }
      
      // Get commit history for this file
      const commits = await github.getFileHistory(owner, repo, path, {
        per_page: 100,
        page: currentPage.current
      });
      
      if (commits.length === 0 && !append) {
        throw new Error('No history found for this file');
      }
      
      // Check if there might be more commits
      setHasMore(commits.length === 100);
      
      // Load content for each version (in parallel for performance)
      const versionPromises = commits.map(async (commit) => {
        try {
          let content = contentCache.current.get(commit.sha);
          if (!content) {
            content = await github.getRawFileContent(owner, repo, path, commit.sha);
            contentCache.current.set(commit.sha, content);
          }
          return {
            sha: commit.sha,
            content,
            commit
          };
        } catch (err) {
          // File might not exist in this commit
          return null;
        }
      });
      
      const allVersions = await Promise.all(versionPromises);
      const validVersions = allVersions.filter((v): v is FileVersion => v !== null);
      
      if (append) {
        // When appending, we need to preserve the current position
        const currentCommitSha = versions[currentIndex]?.sha;
        
        // Add new older commits to the beginning
        const combined = [...validVersions.reverse(), ...versions];
        setVersions(combined);
        
        // Find and update the index of the previously selected commit
        if (currentCommitSha) {
          const newIndex = combined.findIndex(v => v.sha === currentCommitSha);
          if (newIndex >= 0) {
            setCurrentIndex(newIndex);
          }
        }
      } else {
        // Reverse so index 0 is oldest, highest index is newest
        validVersions.reverse();
        setVersions(validVersions);
        
        // Start at the newest (highest index)
        const initialIndex = validVersions.findIndex(v => v.sha.startsWith(initialRef));
        setCurrentIndex(initialIndex >= 0 ? initialIndex : validVersions.length - 1);
      }
      
      currentPage.current += 1;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file history');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }
  
  const loadMoreHistory = () => {
    loadFileHistory(true);
  };
  
  const renderContent = () => {
    if (versions.length === 0) return null;
    
    const currentVersion = versions[currentIndex];
    const previousVersion = currentIndex > 0 ? versions[currentIndex - 1] : null;
    
    if (!showDiff || !previousVersion) {
      // Show plain content
      const lines = currentVersion.content.split('\n');
      return (
        <pre>
          <code>
            {lines.map((line, index) => (
              <div key={index} className="code-line">
                <span className="line-number">{index + 1}</span>
                <span className="line-content">{line}</span>
              </div>
            ))}
          </code>
        </pre>
      );
    }
    
    // Show diff
    const changes = Diff.diffLines(previousVersion.content, currentVersion.content);
    let lineNumber = 1;
    
    return (
      <pre>
        <code>
          {changes.map((part, index) => {
            const lines = part.value.split('\n').filter((_, i, arr) => i < arr.length - 1 || part.value[part.value.length - 1] !== '\n');
            
            return lines.map((line, lineIndex) => {
              const currentLineNumber = !part.removed ? lineNumber++ : null;
              
              return (
                <div
                  key={`${index}-${lineIndex}`}
                  className={`code-line ${part.added ? 'added' : part.removed ? 'removed' : ''}`}
                >
                  <span className="line-number">
                    {part.removed ? '-' : currentLineNumber}
                  </span>
                  <span className="line-content">{line}</span>
                </div>
              );
            });
          })}
        </code>
      </pre>
    );
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return <div className="file-viewer loading">Loading file history...</div>;
  }
  
  if (error) {
    return <div className="file-viewer error">Error: {error}</div>;
  }
  
  if (versions.length === 0) {
    return <div className="file-viewer error">No versions found</div>;
  }
  
  const currentVersion = versions[currentIndex];
  
  return (
    <div className="file-viewer-with-history">
      <div className="file-header">
        <h3>{path}</h3>
        <div className="file-actions">
          <label className="diff-toggle">
            <input
              type="checkbox"
              checked={showDiff}
              onChange={(e) => setShowDiff(e.target.checked)}
              disabled={currentIndex === 0}
            />
            Show changes
          </label>
        </div>
      </div>
      
      <div className="commit-info">
        <img 
          src={currentVersion.commit.author?.avatar_url || `https://github.com/identicons/${currentVersion.commit.commit.author.name}.png`} 
          alt={currentVersion.commit.commit.author.name}
          className="commit-avatar"
        />
        <div className="commit-details">
          <a 
            href={`https://github.com/${owner}/${repo}/commit/${currentVersion.sha}`}
            target="_blank"
            rel="noopener noreferrer"
            className="commit-link"
          >
            <div className="commit-message">{currentVersion.commit.commit.message.split('\n')[0]}</div>
            <div className="commit-meta">
              <span>{currentVersion.commit.commit.author.name}</span>
              <span>•</span>
              <span>{formatDate(currentVersion.commit.commit.author.date)}</span>
              <span>•</span>
              <span className="commit-sha">{currentVersion.sha.substring(0, 7)}</span>
            </div>
          </a>
        </div>
      </div>
      
      <div className="file-content">
        {renderContent()}
      </div>
      
      <div className="history-slider-container">
        <div className="slider-labels">
          <span className="slider-date">
            {formatShortDate(versions[0].commit.commit.author.date)}
            {hasMore && !loadingMore && (
              <button 
                onClick={loadMoreHistory}
                className="load-more-btn"
                title="Load older commits"
              >
                ← Load more
              </button>
            )}
            {loadingMore && (
              <span className="loading-more">Loading...</span>
            )}
          </span>
          <span className="slider-current-date">
            {formatShortDate(currentVersion.commit.commit.author.date)}
          </span>
          <span className="slider-date">
            {formatShortDate(versions[versions.length - 1].commit.commit.author.date)}
          </span>
        </div>
        <div className="slider-hint">
          Click to jump to a commit • Use ← → arrow keys to navigate
        </div>
        <div className="slider-wrapper">
          {(() => {
            // Calculate time positions for all commits
            const oldestTime = new Date(versions[0].commit.commit.author.date).getTime();
            const newestTime = new Date(versions[versions.length - 1].commit.commit.author.date).getTime();
            const timeRange = newestTime - oldestTime || 1;
            
            const timePositions = versions.map((version) => {
              const currentTime = new Date(version.commit.commit.author.date).getTime();
              const timeOffset = currentTime - oldestTime;
              return (timeOffset / timeRange) * 100;
            });
            
            const currentTimePosition = timePositions[currentIndex];
            
            // Find closest commit to a position
            const findClosestCommit = (percent: number) => {
              let closestIndex = 0;
              let minDiff = Math.abs(timePositions[0] - percent);
              
              for (let i = 1; i < timePositions.length; i++) {
                const diff = Math.abs(timePositions[i] - percent);
                if (diff < minDiff) {
                  minDiff = diff;
                  closestIndex = i;
                }
              }
              
              return closestIndex;
            };
            
            // Handle clicks on the track
            const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
              const container = e.currentTarget;
              const rect = container.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
              
              // Find the closest commit to where the user clicked
              const newIndex = findClosestCommit(percent);
              setCurrentIndex(newIndex);
              
              // Focus the slider for keyboard navigation
              sliderRef.current?.focus();
            };
            
            return (
              <>
                {/* Hidden slider for keyboard navigation */}
                <input
                  ref={sliderRef}
                  type="range"
                  min="0"
                  max={versions.length - 1}
                  value={currentIndex}
                  onChange={(e) => setCurrentIndex(Number(e.target.value))}
                  onKeyDown={(e) => {
                    // Ensure arrow keys work properly
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                      e.stopPropagation();
                    }
                  }}
                  className="history-slider"
                  step="1"
                  tabIndex={0}
                />
                
                {/* Clickable track */}
                <div className="time-track-container" onClick={handleClick}>
                  <div className="time-track" />
                  
                  {/* Time-based tick marks */}
                  {versions.map((version, index) => (
                    <div
                      key={version.sha}
                      className={`time-tick ${index === currentIndex ? 'active' : ''}`}
                      style={{ left: `${timePositions[index]}%` }}
                      title={`${formatShortDate(version.commit.commit.author.date)}: ${version.commit.commit.message.split('\n')[0]}`}
                    />
                  ))}
                  
                  {/* Visual thumb at current position */}
                  <div 
                    className="time-thumb"
                    style={{ left: `${currentTimePosition}%` }}
                  />
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}