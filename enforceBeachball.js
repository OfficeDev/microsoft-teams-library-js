const cp = require('child_process');

cp.exec('yarn beachball < killProcessCommand.txt', (err, stdout, stderr) => {
  if (!err && stdout.includes('No change files are needed')) {
    console.log('Beachball guidelines were correctly followed. Continuing...');
    return;
  } else {
    throw new Error(
      "Change files should be created before merging. Please run 'yarn beachball' or yarn 'generate-change-files' from the monorepo root.",
    );
  }
});
