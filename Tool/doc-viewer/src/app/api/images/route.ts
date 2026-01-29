import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDocsRoot } from '@/lib/docs';

// Simple mime type mapping if we don't want to add another dependency
const getMimeType = (filePath: string) => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg': return 'image/jpg';
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.svg': return 'image/svg+xml';
    case '.webp': return 'image/webp';
    default: return 'application/octet-stream';
  }
};

export async function GET(
  request: NextRequest
) {
  // params.path will capture the segments after /api/images/
  // e.g. /api/images/project-a/images/screenshot.png -> ['project-a', 'images', 'screenshot.png']
  // However, the referer might give us a clue, or we just treat the path as relative to DOCS_ROOT
  
  // The issue is: Markdown `![alt](./images/pic.png)` in file `/docs/A/B/readme.md`
  // Browser requests: `http://localhost:3000/docs/A/B/images/pic.png`
  // Wait, Next.js page route is `[...slug]`. 
  // If we serve the page at `/docs/A/B/readme.md`, the browser sees that as the base.
  // The request for `./images/pic.png` becomes `http://localhost:3000/docs/A/B/images/pic.png`.
  
  // So we need to handle this in the `[...slug]` page logic OR make the markdown renderer rewrite URLs.
  // Rewriting URLs in markdown renderer is cleaner. We can rewrite `./images/pic.png` to `/api/images?path=/A/B/images/pic.png`.
  
  // Let's implement this API route to take a query param `path` which is the absolute path relative to DOCS_ROOT.
  
  const searchParams = request.nextUrl.searchParams;
  const relativePath = searchParams.get('path');

  if (!relativePath) {
    return new NextResponse('Missing path parameter', { status: 400 });
  }

  const DOCS_ROOT = getDocsRoot();
  // Decode the path to handle spaces
  // Double decode to handle encoded chars in query param
  let decodedPath = decodeURIComponent(relativePath);
  
  // Try to handle potential double encoding or specific URL encoding issues
  try {
      decodedPath = decodeURIComponent(decodedPath);
  } catch (e) {
      // ignore if already decoded
  }

  // Construct full path
  // We need to be careful. The `relativePath` passed from frontend will be built based on the current doc's directory.
  const fullPath = path.join(DOCS_ROOT, decodedPath);

  console.log(`[API Images] Request: ${relativePath}`);
  console.log(`[API Images] Decoded: ${decodedPath}`);
  console.log(`[API Images] Full Path: ${fullPath}`);
  console.log(`[API Images] Exists: ${fs.existsSync(fullPath)}`);

  // Security check
  if (!fullPath.startsWith(DOCS_ROOT)) {
    return new NextResponse('Access denied', { status: 403 });
  }

  if (!fs.existsSync(fullPath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  try {
    const fileBuffer = fs.readFileSync(fullPath);
    const mimeType = getMimeType(fullPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
