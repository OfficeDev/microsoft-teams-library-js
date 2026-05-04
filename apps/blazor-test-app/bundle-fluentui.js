const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, 'node_modules/@fluentui/web-components/dist/web-components.min.js');
const dest = path.resolve(__dirname, 'wwwroot/js/fluentui-web-components.js');

fs.copyFileSync(src, dest);
console.log('Copied @fluentui/web-components to wwwroot/js/fluentui-web-components.js');
