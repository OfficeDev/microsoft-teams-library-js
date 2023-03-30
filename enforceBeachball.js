const cp = require('child_process');

cp.exec('pnpm changefile', { timeout: 30000 }, (err, stdout, stderr) => {
  if (!err && stdout.includes('No change files are needed')) {
    console.log('Beachball guidelines were correctly followed. Continuing...');
    return;
  } else {
    throw new Error("Change files are required before merging. Please run 'pnpm changefile' from the monorepo root.");
  }
});
