/* eslint-disable */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, '../../apps/ssr-test-app/', 'certs');

try {
  // Check if mkcert is installed
  execSync('mkcert -version', { stdio: 'ignore' });
} catch {
  console.error('❌ mkcert is not installed!');
  console.log('\nInstall it first:');
  console.log('  macOS:   brew install mkcert');
  console.log('  Linux:   https://github.com/FiloSottile/mkcert#linux');
  console.log('  Windows: choco install mkcert');
  process.exit(1);
}

// Create certificates directory
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// Install local CA
console.log('📝 Installing local CA...');
execSync('mkcert -install', { stdio: 'inherit' });

// Generate certificates
console.log('🔐 Generating certificates...');
execSync(
  `mkcert -key-file ${path.join(certDir, 'localhost-key.pem')} -cert-file ${path.join(certDir, 'localhost.pem')} localhost 127.0.0.1`,
  { stdio: 'inherit' },
);

console.log('✅ Certificates generated successfully!');
console.log(`📁 Location: ${certDir}`);
console.log('\nRun: pnpm start-ssr-app:https');
