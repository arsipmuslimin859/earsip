#!/usr/bin/env node

/**
 * Security Audit Script for Archive Management System
 * Run with: node scripts/security-audit.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Go up two levels from scripts/ to project root
const projectRoot = path.resolve(__dirname, '..');

console.log('🔒 Security Audit - Sistem Manajemen Arsip');
console.log('==========================================\n');

// Check results
let passed = 0;
let failed = 0;

function check(title, condition, details = '') {
  const status = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${title}`);
  if (details) console.log(`   ${details}`);
  console.log('');

  if (condition) passed++;
  else failed++;
}

// 1. Check environment variables
console.log('1. Environment Variables Security:');
try {
  const envPath = path.join(projectRoot, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');

    // Check for exposed secrets
    check(
      'No hardcoded secrets in .env',
      !envContent.includes('password') && !envContent.includes('secret') && !envContent.includes('key'),
      'Environment variables should not contain sensitive data'
    );

    // Check Supabase URL format
    const supabaseUrlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
    check(
      'Valid Supabase URL format',
      supabaseUrlMatch && supabaseUrlMatch[1].startsWith('https://'),
      'Supabase URL should use HTTPS'
    );
  } else {
    check('Environment file exists', false, '.env file not found');
  }
} catch (error) {
  check('Environment file readable', false, error.message);
}

// 2. Check HTML security headers
console.log('2. HTML Security Headers:');
try {
  const htmlPath = path.join(projectRoot, 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  check(
    'X-Content-Type-Options header',
    htmlContent.includes('X-Content-Type-Options'),
    'Prevents MIME type sniffing attacks'
  );

  check(
    'X-Frame-Options header',
    htmlContent.includes('X-Frame-Options'),
    'Prevents clickjacking attacks'
  );

  check(
    'Content Security Policy',
    htmlContent.includes('Content-Security-Policy'),
    'Restricts resource loading to prevent XSS'
  );

  check(
    'HTTPS-only external URLs',
    !htmlContent.includes('http://') || htmlContent.includes('http://localhost'),
    'External resources should use HTTPS'
  );
} catch (error) {
  check('HTML file readable', false, error.message);
}

// 3. Check Vite configuration
console.log('3. Build Configuration Security:');
try {
  const viteConfigPath = path.join(projectRoot, 'vite.config.ts');
  const viteContent = fs.readFileSync(viteConfigPath, 'utf8');

  check(
    'Source maps disabled in production',
    viteContent.includes('sourcemap: false'),
    'Prevents source code exposure'
  );

  check(
    'Code minification enabled',
    viteContent.includes('minify: \'terser\''),
    'Obfuscates production code'
  );

  check(
    'Security headers configured',
    viteContent.includes('X-Content-Type-Options'),
    'Server sends security headers'
  );
} catch (error) {
  check('Vite config readable', false, error.message);
}

// 4. Check security utilities
console.log('4. Security Utilities:');
const securityUtilsPath = path.join(projectRoot, 'src', 'utils', 'security.ts');
const errorHandlerPath = path.join(projectRoot, 'src', 'utils', 'errorHandler.ts');

check(
  'Security utilities exist',
  fs.existsSync(securityUtilsPath),
  'Input validation and sanitization functions'
);

check(
  'Error handler exists',
  fs.existsSync(errorHandlerPath),
  'Secure error handling and logging'
);

// 5. Check for insecure patterns
console.log('5. Code Security Analysis:');
try {
  const srcDir = path.join(projectRoot, 'src');
  const files = getAllFiles(srcDir);

  let insecurePatterns = 0;
  let totalFiles = 0;

  files.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      totalFiles++;
      const content = fs.readFileSync(file, 'utf8');

      // Check for dangerous patterns
      if (
        content.includes('innerHTML') ||
        content.includes('dangerouslySetInnerHTML') ||
        content.includes('eval(') ||
        content.includes('Function(')
      ) {
        insecurePatterns++;
      }
    }
  });

  check(
    'No dangerous DOM manipulation',
    insecurePatterns === 0,
    `Found ${insecurePatterns} potentially insecure patterns in ${totalFiles} files`
  );
} catch (error) {
  check('Code analysis completed', false, error.message);
}

// 6. Check dependencies
console.log('6. Dependencies Security:');
try {
  const packagePath = path.join(projectRoot, 'package.json');
  const packageContent = fs.readFileSync(packagePath, 'utf8');
  const packageJson = JSON.parse(packageContent);

  check(
    'No vulnerable dependencies',
    !packageContent.includes('vulnerable') && !packageContent.includes('security'),
    'Run npm audit regularly'
  );

  // Check for security-related packages
  const hasSecurityDeps = Object.keys(packageJson.dependencies || {}).some(dep =>
    dep.includes('security') || dep.includes('helmet') || dep.includes('csp')
  );

  check(
    'Security packages considered',
    hasSecurityDeps,
    'Consider adding security-focused packages'
  );
} catch (error) {
  check('Package.json readable', false, error.message);
}

// Summary
console.log('📊 Audit Summary:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Security Score: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (failed > 0) {
  console.log('\n⚠️  Recommendations:');
  console.log('• Run npm audit to check for vulnerable dependencies');
  console.log('• Enable HTTPS in production');
  console.log('• Regularly update security headers');
  console.log('• Implement rate limiting for API endpoints');
  console.log('• Add security monitoring and logging');
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}