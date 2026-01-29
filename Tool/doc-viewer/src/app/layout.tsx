import { getDocsTree } from '@/lib/docs';
import { Sidebar } from '@/components/Sidebar';
import './globals.css';

export const metadata = {
  title: 'Trae Docs Viewer',
  description: 'Markdown documentation viewer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fileTree = getDocsTree();

  return (
    <html lang="en">
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-72 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hidden md:block shrink-0">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                SH
              </div>
              <span className="font-semibold text-sm">SHLT_IDD_Docs</span>
            </div>
            <Sidebar nodes={fileTree} />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
