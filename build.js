// Custom build script for Vercel
const { execSync } = require('child_process');

// Run prisma generate explicitly
console.log('Running prisma generate...');
execSync('npx prisma generate', { stdio: 'inherit' });

// Continue with the normal build but disable linting
console.log('Running next build with linting disabled...');
execSync('ESLINT_SKIP_CHECKING=true NEXT_DISABLE_ESLINT=1 ESLINT_NO_DEV_ERRORS=true next build --no-lint', { stdio: 'inherit' });

console.log('Build completed');
