const fs = require("node:fs"),
	path = require("node:path");
let pack;

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