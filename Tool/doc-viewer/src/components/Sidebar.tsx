'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, ChevronDown, FileText, Folder } from 'lucide-react';
import { clsx } from 'clsx';
import type { FileNode } from '@/lib/docs';

interface SidebarProps {
  nodes: FileNode[];
}

const findFirstFile = (nodes: FileNode[]): FileNode | null => {
  for (const node of nodes) {
    if (node.type === 'file') {
      return node;
    }
    if (node.children) {
      const found = findFirstFile(node.children);
      if (found) return found;
    }
  }
  return null;
};

const TreeNode = ({ node, level = 0 }: { node: FileNode; level?: number }) => {
  const [isOpen, setIsOpen] = useState(true); // Default open for better visibility
  const pathname = usePathname();
  
  // Clean up paths for comparison
  // Node path is relative from DOCS_ROOT, e.g., "folder/file.md"
  // Pathname is "/folder/file.md" (or encoded)
  // We need to match them.
  const isActive = pathname === '/' + node.path || pathname === '/' + encodeURI(node.path);

  if (node.type === 'directory') {
    return (
      <div className="select-none">
        <div
          className={clsx(
            "flex items-center gap-1.5 py-1.5 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-sm transition-colors",
            "text-gray-700 dark:text-gray-300"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4 opacity-50" />
          ) : (
            <ChevronRight className="w-4 h-4 opacity-50" />
          )}
          <Folder className="w-4 h-4 text-blue-500" />
          <span className="font-medium truncate">{node.name}</span>
        </div>
        {isOpen && node.children && (
          <div className="mt-0.5">
            {node.children.map((child) => (
              <TreeNode key={child.path} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={`/${node.path}`}
      className={clsx(
        "flex items-center gap-2 py-1.5 px-2 rounded-md text-sm transition-colors block",
        isActive
          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
      )}
      style={{ paddingLeft: `${level * 12 + 24}px` }}
    >
      <FileText className="w-3.5 h-3.5 opacity-70" />
      <span className="truncate">{node.name.replace(/\.md$/, '')}</span>
    </Link>
  );
};

export const Sidebar = ({ nodes }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') {
      const firstFile = findFirstFile(nodes);
      if (firstFile) {
        router.replace(`/${firstFile.path}`);
      }
    }
  }, [pathname, nodes, router]);

  return (
    <nav className="h-full overflow-y-auto py-4 px-2 space-y-1">
      {nodes.map((node) => (
        <TreeNode key={node.path} node={node} />
      ))}
    </nav>
  );
};
