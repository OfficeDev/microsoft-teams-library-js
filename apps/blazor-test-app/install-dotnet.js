const process = require('process');
const { execSync } = require('child_process');

if (process.platform === 'win32') {
  try {
    execSync(
      'powershell -NoProfile -ExecutionPolicy unrestricted -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; &([scriptblock]::Create((Invoke-WebRequest -UseBasicParsing \'https://dot.net/v1/dotnet-install.ps1\'))) -Channel 6.0.4xx"',
    );
  } catch (err) {
    console.error(err);
  }
} else {
  try {
    execSync('curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --channel 6.0.4xx');
  } catch (err) {
    console.error(err);
  }
}

console.log('Successfully installed dotnet...');
