/**
 * Данный скрипт для системы сборки на GitHub
 */
const fs = require('node:fs'),
	path = require('node:path'),
	archiver = require('archiver'),
	delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async function(){
	console.log(" ");
	let jsn = fs.readFileSync(path.normalize(path.join(__dirname, "package.json")));

	let json = JSON.parse(jsn);

	let oldPackage = {
		"name": json.name,
		"description": json.description,
		"version": json.version,
		"main": json.main,
		"scripts": json.scripts,
		"author": json.author,
		"license": json.license,
		"dependencies": {
			"ansi-colors": "4.1.3",
			"cli-progress": "3.12.0",
			"m3u8-parser": "7.1.0",
			"node-fetch": "2.6.1",
			"sanitize-filename": "1.6.3",
			"split-file": "2.3.0"
		}
	};
	
	let str = JSON.stringify(oldPackage, null, "\t");

	fs.writeFileSync(path.normalize(path.join(__dirname, "package.json")), str);
	console.log("SAVE:", "package.json");
	await delay(500);
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
