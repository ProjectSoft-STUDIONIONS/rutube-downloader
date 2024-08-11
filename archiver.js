/**
 * Данный скрипт для системы сборки на GitHub
 */
const fs = require('node:fs'),
	path = require('node:path'),
	archiver = require('archiver'),
	delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async function(){
	console.log(" ");
	const output = fs.createWriteStream(__dirname + '/rutube-downloader.zip'),
		archive = archiver('zip', {
			zlib: { level: 9 }
		}),
		files = [
			"README.md",
			"index.js",
			"package.json",
			"LICENSE"
		];
	let key;

	archive.pipe(output);

	for(key in files){
		let streamFile = fs.createReadStream(path.normalize(path.join(__dirname, files[key])));
		archive.append(streamFile, { name: files[key] });
		console.log("ADD FILE:", files[key]);
	}
	console.log("FINALIZED...");
	archive.finalize();

	await delay(500);
	console.log("DONE!!!", "rutube-downloader.zip");
	console.log(" ");
})();
