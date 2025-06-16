#!/usr/bin/env node

import { execSync } from 'child_process';
import { spawn } from 'child_process';

console.log('Checking for Netlify CLI...');

try {
  execSync('netlify --version', { stdio: 'ignore' });
  console.log('✓ Netlify CLI is installed');
} catch (error) {
  console.error('✗ Netlify CLI is not installed');
  console.error('Please install it with: npm install -g netlify-cli');
  process.exit(1);
}

// Check for .env file
import { existsSync } from 'fs';
if (!existsSync('.env')) {
  console.error('✗ .env file not found');
  console.error('Please create one with: cp .env.example .env');
  console.error('Then add your GITHUB_CLIENT_ID');
  process.exit(1);
}

console.log('✓ Environment configured');
console.log('Starting Playwright tests with Netlify dev server...\n');

// Run playwright test
const playwright = spawn('npx', ['playwright', 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true
});

playwright.on('exit', (code) => {
  process.exit(code);
});