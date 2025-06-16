import { useEffect, useState } from 'react';
import { github, type TreeNode } from '../lib/github';

interface FileTreeProps {
  owner: string;
  repo: string;
  commitSha: string;
  onSelectFile: (path: string) => void;
}

interface TreeNodeWithChildren extends TreeNode {
  children?: TreeNodeWithChildren[];
  isExpanded?: boolean;
}

export default function FileTree({ owner, repo, commitSha, onSelectFile }: FileTreeProps) {
  const [tree, setTree] = useState<TreeNodeWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadTree() {
      try {
        setLoading(true);
        setError(null);
        
        // First get the commit to find the tree SHA
        const commit = await github.getCommit(owner, repo, commitSha);
        
        // Then get the tree
        const treeData = await github.getTree(owner, repo, commit.commit.tree.sha, true);
        
        // Build hierarchical structure
        const root: TreeNodeWithChildren[] = [];
        const nodeMap = new Map<string, TreeNodeWithChildren>();
        
        // First pass: create all nodes
        treeData.tree.forEach((node) => {
          const newNode: TreeNodeWithChildren = { ...node, children: [] };
          nodeMap.set(node.path, newNode);
        });
        
        // Second pass: build hierarchy
        treeData.tree.forEach((node) => {
          const parts = node.path.split('/');
          if (parts.length === 1) {
            // Root level
            root.push(nodeMap.get(node.path)!);
          } else {
            // Find parent
            const parentPath = parts.slice(0, -1).join('/');
            const parent = nodeMap.get(parentPath);
            if (parent && parent.children) {
              parent.children.push(nodeMap.get(node.path)!);
            }
          }
        });
        
        // Sort directories first, then by name
        const sortNodes = (nodes: TreeNodeWithChildren[]) => {
          nodes.sort((a, b) => {
            if (a.type === 'tree' && b.type === 'blob') return -1;
            if (a.type === 'blob' && b.type === 'tree') return 1;
            return a.path.localeCompare(b.path);
          });
          nodes.forEach((node) => {
            if (node.children) {
              sortNodes(node.children);
            }
          });
        };
        
        sortNodes(root);
        setTree(root);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file tree');
      } finally {
        setLoading(false);
      }
    }
    
    loadTree();
  }, [owner, repo, commitSha]);
  
  const toggleNode = (node: TreeNodeWithChildren) => {
    node.isExpanded = !node.isExpanded;
    setTree([...tree]);
  };
  
  const renderNode = (node: TreeNodeWithChildren, level = 0) => {
    const name = node.path.split('/').pop() || node.path;
    const isDirectory = node.type === 'tree';
    
    return (
      <div key={node.path} className="tree-node" style={{ paddingLeft: `${level * 20}px` }}>
        <div
          className={`tree-node-content ${isDirectory ? 'directory' : 'file'}`}
          onClick={() => {
            if (isDirectory) {
              toggleNode(node);
            } else {
              onSelectFile(node.path);
            }
          }}
        >
          <span className="tree-node-icon">
            {isDirectory ? (node.isExpanded ? '📂' : '📁') : '📄'}
          </span>
          <span className="tree-node-name">{name}</span>
        </div>
        
        {isDirectory && node.isExpanded && node.children && (
          <div className="tree-children">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  if (loading) {
    return <div className="file-tree loading">Loading file tree...</div>;
  }
  
  if (error) {
    return <div className="file-tree error">Error: {error}</div>;
  }
  
  return (
    <div className="file-tree">
      <h3>Files</h3>
      <div className="tree-content">
        {tree.map((node) => renderNode(node))}
      </div>
    </div>
  );
}