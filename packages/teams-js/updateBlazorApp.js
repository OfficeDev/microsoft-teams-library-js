const fs = require('fs');

const blazorAppPath = '../../apps/blazor-test-app/wwwroot/js/MicrosoftTeams.min.js';
const minPath = './dist/MicrosoftTeams.min.js';

fs.copyFile(minPath, blazorAppPath, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Successfully migrated teams-js .min to blazor test app');
  }
});
