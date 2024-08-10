const fs = require('node:fs');
const path = require('node:path');

const archiver = require('archiver');

const output = fs.createWriteStream(__dirname + '/rutube-downloader.zip');
const archive = archiver('zip', {
	zlib: { level: 9 }
});

archive.pipe(output);

// README.md
let README = fs.createReadStream(path.normalize(path.join(__dirname, "README.md")));
archive.append(README, { name: 'README.md' });
// index.js
let index = fs.createReadStream(path.normalize(path.join(__dirname, "index.js")));
archive.append(index, { name: 'index.js' });
// package.json
let package = fs.createReadStream(path.normalize(path.join(__dirname, "package.json")));
archive.append(package, { name: 'package.json' });
// LICENSE
let LICENSE = fs.createReadStream(path.normalize(path.join(__dirname, "LICENSE")));
archive.append(LICENSE, { name: 'LICENSE' });

archive.finalize();

console.log("DONE!!!", "rutube-downloader.zip");