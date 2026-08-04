const { createServer } = require('https');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Serve the production build when one exists (CI E2E runs `next build` first).
// Running the Next.js dev server instead would trigger its dev-mode version
// check, which fetches https://registry.npmjs.org/-/package/next/dist-tags and
// violates CFSClean network isolation. Fall back to dev mode for local,
// build-free usage.
const hasProductionBuild = fs.existsSync(path.join(__dirname, '.next', 'BUILD_ID'));
const dev = process.env.NODE_ENV !== 'production' && !hasProductionBuild;
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
