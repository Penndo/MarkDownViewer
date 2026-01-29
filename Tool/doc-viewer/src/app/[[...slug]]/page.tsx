import { getDocContent } from '@/lib/docs';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { TOC } from '@/components/TOC';
import { notFound } from 'next/navigation';

export default async function DocPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  
  if (slug.length === 0) {
    // Try to find a README.md or index.md at root
    // For now, let's just render a welcome message
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Welcome to Trae Docs</h1>
          <p className="text-gray-500">Select a document from the sidebar to start reading.</p>
        </div>
      </div>
    );
  }

  const doc = getDocContent(slug);

  if (!doc) {
    notFound();
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="max-w-4xl mx-auto px-8 py-10">
          <div className="mb-6">
            {/* Breadcrumbs could go here */}
            {/* Frontmatter display if needed */}
            {doc.frontmatter.title && (
              <h1 className="text-3xl font-bold mb-4">{doc.frontmatter.title}</h1>
            )}
          </div>
          
          <MarkdownRenderer content={doc.content} filePath={slug.join('/')} />
          
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Right Sidebar - TOC */}
      <TOC content={doc.content} />
    </div>
  );
}
