const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const NEXT_DIR = path.join(PROJECT_ROOT, '.next');
const STANDALONE_DIR = path.join(NEXT_DIR, 'standalone');
// IDD is located at SHLT/IDD, which is ../../IDD relative to Tool/doc-viewer
const IDD_SOURCE = path.resolve(PROJECT_ROOT, '../../IDD');

console.log('Starting package process...');
console.log('Project Root:', PROJECT_ROOT);
console.log('IDD Source:', IDD_SOURCE);

try {
    // 1. Clean dist
    if (fs.existsSync(DIST_DIR)) {
        console.log('Cleaning dist directory...');
        fs.rmSync(DIST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(DIST_DIR);

    // 2. Build
    console.log('Running build...');
    execSync('npm run build', { stdio: 'inherit', cwd: PROJECT_ROOT });

    // 3. Copy standalone
    console.log('Copying standalone build...');
    if (!fs.existsSync(STANDALONE_DIR)) {
        throw new Error('Standalone build not found! Did "npm run build" fail or is "output: standalone" missing in next.config.ts?');
    }
    const destDocViewer = path.join(DIST_DIR, 'doc-viewer');
    // standalone/Tool/doc-viewer or standalone directly?
    // Next.js standalone folder structure mirrors the project structure if monorepo, or just flattened.
    // Usually it is .next/standalone/package.json etc.
    // Let's copy the content of .next/standalone to dist/doc-viewer
    
    // However, sometimes it nests it like .next/standalone/Tool/doc-viewer if it detects monorepo structure.
    // We will inspect what's inside standalone after build if we were manual, but here let's assume standard behavior.
    // We'll copy the whole standalone folder content to dist/doc-viewer first.
    fs.cpSync(STANDALONE_DIR, destDocViewer, { recursive: true });

    // 4. Copy static assets
    // .next/static needs to be at dist/doc-viewer/.next/static
    console.log('Copying static assets...');
    const destStatic = path.join(destDocViewer, '.next', 'static');
    
    // Ensure .next directory exists in destination
    if (!fs.existsSync(path.dirname(destStatic))) {
        fs.mkdirSync(path.dirname(destStatic), { recursive: true });
    }
    
    fs.cpSync(path.join(NEXT_DIR, 'static'), destStatic, { recursive: true });

    // 5. Copy public assets
    // public needs to be at dist/doc-viewer/public
    console.log('Copying public assets...');
    const destPublic = path.join(destDocViewer, 'public');
    fs.cpSync(path.join(PROJECT_ROOT, 'public'), destPublic, { recursive: true });

    // 6. Copy IDD
    console.log('Copying IDD folder...');
    if (fs.existsSync(IDD_SOURCE)) {
        const destIDD = path.join(DIST_DIR, 'IDD');
        fs.cpSync(IDD_SOURCE, destIDD, { recursive: true });
    } else {
        console.warn('Warning: IDD folder not found at', IDD_SOURCE);
    }

    // 7. Create start scripts
    console.log('Creating start scripts...');
    const startSh = `#!/bin/bash
export PORT=\${PORT:-3000}
export HOSTNAME=\${HOSTNAME:-0.0.0.0}
echo "Starting doc-viewer on http://$HOSTNAME:$PORT"
node server.js
`;
    fs.writeFileSync(path.join(destDocViewer, 'start.sh'), startSh, { mode: 0o755 });

    const startBat = `@echo off
if "%PORT%"=="" set PORT=3000
if "%HOSTNAME%"=="" set HOSTNAME=0.0.0.0
echo Starting doc-viewer on http://%HOSTNAME%:%PORT%
node server.js
pause
`;
    fs.writeFileSync(path.join(destDocViewer, 'start.bat'), startBat);

    // 8. Copy Dockerfile
    console.log('Copying Dockerfile...');
    const dockerfileSource = path.join(PROJECT_ROOT, 'Dockerfile');
    if (fs.existsSync(dockerfileSource)) {
        fs.copyFileSync(dockerfileSource, path.join(DIST_DIR, 'Dockerfile'));
    } else {
        console.warn('Warning: Dockerfile not found at', dockerfileSource);
    }

    console.log('\n---------------------------------------------------');
    console.log('Package created successfully at:', DIST_DIR);
    console.log('To deploy: Upload "dist" folder to your server.');
    console.log('To run (Linux/Mac):');
    console.log('  cd dist/doc-viewer');
    console.log('  ./start.sh');
    console.log('  (Or: PORT=80 node server.js)');
    console.log('To run (Windows):');
    console.log('  cd dist/doc-viewer');
    console.log('  start.bat');
    console.log('\nTo build Docker image:');
    console.log('  cd dist');
    console.log('  docker build -t doc-viewer .');
    console.log('  docker run -p 3000:3000 doc-viewer');
    console.log('\nNote: Ensure the server firewall allows access to the port (default 3000).');
    console.log('---------------------------------------------------');

} catch (error) {
    console.error('Packaging failed:', error);
    process.exit(1);
}
