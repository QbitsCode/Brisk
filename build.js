// Custom build script for Vercel
const { execSync } = require('child_process');

// Run prisma generate explicitly
console.log('Running prisma generate...');
execSync('npx prisma generate', { stdio: 'inherit' });

// Continue with the normal build
console.log('Running next build...');
execSync('next build', { stdio: 'inherit' });

console.log('Build completed');
