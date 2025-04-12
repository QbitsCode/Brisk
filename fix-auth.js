// Simple script to fix the auth page compatibility issue with Next.js 15
const fs = require('fs');
const path = require('path');

console.log('Applying auth page fix for Next.js 15 compatibility...');

// Path to the deployment-safe auth page
const fixedAuthPath = path.join(process.cwd(), 'src', 'app', 'auth', 'page-deploy.tsx');
// Path to the actual auth page
const authPath = path.join(process.cwd(), 'src', 'app', 'auth', 'page.tsx');

// Make sure the fixed file exists
if (!fs.existsSync(fixedAuthPath)) {
  console.error('Error: Fixed auth page not found at', fixedAuthPath);
  process.exit(1);
}

// Read the fixed content
const fixedContent = fs.readFileSync(fixedAuthPath, 'utf8');

// Backup the original file
if (fs.existsSync(authPath)) {
  const backupPath = `${authPath}.backup`;
  fs.writeFileSync(backupPath, fs.readFileSync(authPath, 'utf8'));
  console.log(`Backed up original auth page to ${backupPath}`);
}

// Write the fixed content to the auth page
fs.writeFileSync(authPath, fixedContent);
console.log('Fixed auth page for Next.js 15 compatibility!');
