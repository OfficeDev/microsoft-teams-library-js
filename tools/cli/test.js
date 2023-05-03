const util = require('util');
// const exec = util.promisify(require('child_process').exec);
const execFile = util.promisify(require('child_process').execFile);

async function lsExample() {
  // const yo = await exec('git log --pretty=format:"%H" -1 1dbc5ef1d16175cc730d0bf2cfd848aa2bed424a~1');

  const yo = await execFile('git', ['log', '--pretty=format:"%H"', '-1', '1dbc5ef1d16175cc730d0bf2cfd848aa2bed424a~1']);
  console.log(yo.stdout);
  console.error('stderr:', yo.stderr);
}
lsExample();
