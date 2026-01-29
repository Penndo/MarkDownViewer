import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  filePath: string; // The relative path of the markdown file, e.g. "folder/doc.md"
}

export const MarkdownRenderer = ({ content, filePath }: MarkdownRendererProps) => {
  // Calculate the directory of the current file to resolve relative images
  // e.g. if filePath is "foo/bar/baz.md", dir is "foo/bar"
  const dir = filePath.split('/').slice(0, -1).join('/');

  const transformImageUri = (src: string) => {
    if (src.startsWith('http') || src.startsWith('https') || src.startsWith('data:')) {
      return src;
    }
    
    // Handle absolute paths (from root of docs)
    if (src.startsWith('/')) {
        return `/api/images?path=${encodeURIComponent(src)}`;
    }

    // Handle relative paths
    let resolved = src;
    if (src.startsWith('./')) resolved = src.substring(2);
    
    const combined = dir ? `${dir}/${resolved}` : resolved;
    
    return `/api/images?path=${encodeURIComponent(combined)}`;
  };

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none 
      /* 基础排版优化 */
      leading-relaxed
      
      /* 标题层级强化 */
      prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-slate-100
      prose-h1:text-4xl prose-h1:mb-8
      prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
      prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
      prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-3 prose-h4:font-semibold
      
      /* 段落与列表 */
      prose-p:my-4 prose-p:leading-7
      prose-li:my-1
      
      /* 引用块优化 */
      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
      
      /* 代码块 */
      prose-code:before:content-none prose-code:after:content-none
      prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:font-medium
      prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl prose-pre:shadow-lg
      
      /* 表格优化 */
      prose-table:border-collapse prose-table:w-full prose-table:my-8 prose-table:shadow-sm prose-table:rounded-lg prose-table:overflow-hidden
      prose-thead:bg-slate-50 dark:prose-thead:bg-slate-900/50
      prose-th:border prose-th:border-slate-200 dark:prose-th:border-slate-800 prose-th:p-4 prose-th:text-left prose-th:font-semibold
      prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-800 prose-td:p-4
      prose-tr:hover:bg-slate-50/50 dark:prose-tr:hover:bg-slate-800/50 transition-colors
      
      /* 图片 */
      prose-img:rounded-xl prose-img:shadow-md prose-img:border prose-img:border-slate-200 dark:prose-img:border-slate-800 prose-img:my-8
      
      /* 链接 */
      prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline hover:prose-a:text-blue-700
      
      /* 分割线 */
      prose-hr:my-12 prose-hr:border-slate-200 dark:prose-hr:border-slate-800
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
        urlTransform={transformImageUri}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
