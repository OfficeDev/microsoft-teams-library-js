const process = require('process');
const { execSync } = require('child_process');

if (process.platform === 'win32') {
  try {
    execSync('powershell -NoProfile -ExecutionPolicy unrestricted InstallScripts\\dotnet-install.ps1', {
      stdio: 'inherit',
    });
  } catch (err) {
    console.error(err);
    return;
  }
} else {
  try {
    execSync('./InstallScripts/dotnet-install.sh', { stdio: 'inherit' });
  } catch (err) {
    console.error(err);
    return;
  }
}

console.log('Successfully installed dotnet and built the Blazor Test App...');
