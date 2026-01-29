import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Use environment variable or default to parent directory of the project
// In production/deployment, this should be configured via env var
// We check multiple locations for robustness (Dev vs Standalone)
let defaultRoot = path.resolve(process.cwd(), '../../IDD'); // Dev / Normal Build
if (!fs.existsSync(defaultRoot)) {
    // Try Standalone path (cwd is dist/doc-viewer, IDD is dist/IDD)
    const standalonePath = path.resolve(process.cwd(), '../IDD');
    if (fs.existsSync(standalonePath)) {
        defaultRoot = standalonePath;
    }
}

const DOCS_ROOT = process.env.DOCS_ROOT || defaultRoot;

console.log('DOCS_ROOT:', DOCS_ROOT);

export type FileNode = {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
};

export const getDocsTree = (dir: string = DOCS_ROOT, relativePath: string = ''): FileNode[] => {
  // Prevent traversing outside of DOCS_ROOT
  if (!dir.startsWith(DOCS_ROOT)) {
    return [];
  }

  try {
    const files = fs.readdirSync(dir);
    console.log(`Scanning dir: ${dir}, found ${files.length} files`);
    
    const nodes: FileNode[] = files
      .filter(file => {
        // Ignore hidden files, node_modules, .git, and the viewer project itself
        if (file.startsWith('.')) return false;
        if (file === 'node_modules') return false;
        if (file === 'doc-viewer') return false; // Don't list the viewer project itself
        if (file === 'Tool') return false; // Don't list the tool folder
        
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        // Only include directories and markdown files
        if (stat.isDirectory()) return true;
        if (file.endsWith('.md')) return true;
        
        return false;
      })
      .map(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        const currentRelativePath = path.join(relativePath, file).replace(/\\/g, '/');
        
        if (stat.isDirectory()) {
          return {
            name: file,
            path: currentRelativePath,
            type: 'directory' as const,
            children: getDocsTree(fullPath, currentRelativePath),
          };
        } else {
          return {
            name: file,
            path: currentRelativePath,
            type: 'file' as const,
          };
        }
      })
      // Filter out empty directories (directories with no visible children)
      .filter(node => {
        if (node.type === 'directory') {
          return node.children && node.children.length > 0;
        }
        return true;
      })
      .sort((a, b) => {
        // Directories first, then files
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
      });
      
    return nodes;
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return [];
  }
};

export const getDocContent = (slugPath: string[]) => {
  try {
    const filePath = path.join(DOCS_ROOT, ...slugPath);
    
    // Security check: prevent path traversal
    if (!filePath.startsWith(DOCS_ROOT)) {
      throw new Error('Invalid path');
    }
    
    // Add .md extension if missing (though slug usually comes from file tree which includes extension)
    // However, the slug in URL might not have .md if we choose to hide it. 
    // For now, let's assume the slug matches the file name exactly as in the tree.
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        // Try decoding URI component in case of spaces/special chars
        const decodedPath = path.join(DOCS_ROOT, ...slugPath.map(s => decodeURIComponent(s)));
        if(fs.existsSync(decodedPath)) {
            const fileContent = fs.readFileSync(decodedPath, 'utf8');
            const { content, data } = matter(fileContent);
            return { content, frontmatter: data, path: decodedPath };
        }
        return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { content, data } = matter(fileContent);
    return { content, frontmatter: data, path: filePath };
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
};

export const getDocsRoot = () => DOCS_ROOT;
