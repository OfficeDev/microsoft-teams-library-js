const { createServer } = require('https');
const { execFileSync } = require('child_process');
const next = require('next');
const fs = require('fs');
const path = require('path');

// The Next.js dev server fetches registry.npmjs.org for a version check (see
// getVersionInfo() in next/dist/server/dev/hot-reloader-webpack.js — an
// unconditional fetch with no env flag to disable it), which violates CFSClean
// network isolation. Production mode (`next({ dev: false })`) never instantiates
// the hot reloader, so it makes no such request — CI E2E MUST run in production.
//
// Production is therefore the DEFAULT: the E2E runner spawns this server with a
// stripped environment (only PATH plus a couple of NEXT_* flags), so it cannot
// be relied on to opt into production, and depending on that has repeatedly let
// the server fall back to dev and reach the registry. Opt into dev/HMR
// explicitly with NEXT_FORCE_DEV=1 (local development over HTTPS).
const buildIdPath = path.join(__dirname, '.next', 'BUILD_ID');
const dev = process.env.NEXT_FORCE_DEV === '1';

// A production start requires an on-disk build. The E2E setup builds this app in
// a separate step, but if that build is missing when we reach here (skipped,
// cleaned, or run from a different working directory) `next({ dev: false })`
// would crash the server. Building on demand here guarantees production mode
// deterministically and never reaches the registry (only the dev hot reloader
// does). `next build` output is idempotent, so a redundant build is cheap.
if (!dev && !fs.existsSync(buildIdPath)) {
  console.log('No production build found; running `next build` before starting in production mode...');
  execFileSync(process.execPath, [require.resolve('next/dist/bin/next'), 'build'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  });
}

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
