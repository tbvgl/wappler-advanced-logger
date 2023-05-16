const fs = require('fs-extra');
const path = require('path');

const srcDir = path.join(__dirname, '../server_connect');
const destDir = path.join(__dirname, '../../../extensions/server_connect');

fs.copySync(srcDir, destDir, { overwrite: true });