const fs = require('fs-extra');
const path = require('path');

const srcDir = path.join(__dirname, '../server_connect');
const destDir = path.join(__dirname, '../../../extensions/server_connect');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const subDirs = fs.readdirSync(srcDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

for (const subDir of subDirs) {
    const srcSubDir = path.join(srcDir, subDir);
    const destSubDir = path.join(destDir, subDir);

    if (!fs.existsSync(destSubDir)) {
        fs.mkdirSync(destSubDir);
    }

    fs.copySync(srcSubDir, destSubDir, { overwrite: true });
}