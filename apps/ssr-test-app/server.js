const { createServer } = require('https');
const next = require('next');
const fs = require('fs');
const path = require('path');

// The Next.js dev server fetches registry.npmjs.org for a version check, which
// violates CFSClean network isolation — so CI E2E must run in production mode.
// The E2E runner builds this app first and spawns the server with a stripped
// environment (only PATH), so we detect the build on disk rather than via an
// env var. Local dev keeps HMR by default; override with NEXT_FORCE_DEV=1 or
// NEXT_USE_PROD_BUILD=1.
const hasProductionBuild = fs.existsSync(path.join(__dirname, '.next', 'BUILD_ID'));
const forceDev = process.env.NEXT_FORCE_DEV === '1';
const forceProd = process.env.NODE_ENV === 'production' || process.env.NEXT_USE_PROD_BUILD === '1';
const dev = forceDev || (!forceProd && !hasProductionBuild);

const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./certs/localhost-key.pem'),
  cert: fs.readFileSync('./certs/localhost.pem'),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    handle(req, res);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on https://localhost:3000');
  });
});
