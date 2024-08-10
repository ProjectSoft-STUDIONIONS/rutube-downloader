/**
 * 
 * Первый параметр при запуске скрипта должен быть url видео
 * Пример:
 * node index.js https://rutube.ru/video/f07ab06594523b8b520962123bd5f906/
 * 
 */
if(!process.argv[2]){
	console.error('NOT URL ARGUMENT');
	process.exit();
}

//(async function () {
	const fs = require('node:fs');
	const path = require('node:path');
	const URL = require('node:url');
	const stream = require('node:stream');
	const util = require('node:util');
	const fetch = require('node-fetch');
	const m3u8Parser = require('m3u8-parser');
	const splitFile = require('split-file');

	const regex_rutube = /^https?:\/\/rutube\.ru\/video\/(\w+)/;
	const urls = process.argv.slice(2);

	const streamPipeline = util.promisify(stream.pipeline);

	let m, pls, url;

	const escapeRegExp = function(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
	}

	const createDir = function(dir) {
		return new Promise((resolve, reject) => {
			fs.access(dir, function(err) {
				if (err && err.code === 'ENOENT') {
					fs.mkdirSync(dir, {recursive: true});
					resolve(true);
				}else{
					resolve(true);
				}
			});
		})
	}

	const deleteFiles = async function(reg, dir){
		return new Promise((resolve, reject) => {
			dir = path.normalize(dir) + "/";
			fs.readdirSync(dir).filter(f => reg.exec(f)).forEach(f => {
				fs.unlinkSync(dir + f)
			});
			resolve(true);
		})
	}

	//deleteFiles(/^.*\.ts/, __dirname + '/video').then(() => {


	if (urls.length) {
		url = urls[0];
		if ((m = regex_rutube.exec(url)) !== null) {
			// Получаем информацию о видео
			pls = `https://rutube.ru/api/play/options/${m[1]}/?no_404=true&referer=https%3A%2F%2Frutube.ru`;
			fetch(pls)
				.then(res => res.json())
				.then((json) => {
					// Получаем информацию о плейлистах
					const outputTitle = json.title;
					let video_m3u8 = json['video_balancer']['m3u8'];
					fetch(video_m3u8)
						.then(res => res.text())
						.then(text => {
							let parser = new m3u8Parser.Parser();
							parser.push(text);
							parser.end();
							let parsedManifest = parser.manifest;
							let m3u8 = parsedManifest['playlists'][parsedManifest['playlists'].length -1]['uri'];
							// Получаем ссылку для составления в будующем ссылки на сегмент
							const myURL = URL.parse(m3u8);
							let pathname = myURL.pathname.split("/");
							pathname.pop();
							const urlPrefix = myURL.protocol + "//" + myURL.host + "/" + pathname.join("/") + "/";
							// Получаем плейлист с сегментами
							fetch(m3u8)
								.then(res => res.text())
								.then(async text => {
									await createDir(__dirname + "/video");
									await deleteFiles(/^segment-.*\.ts/, __dirname + '/video');
									let m3u8Video = new m3u8Parser.Parser();
									m3u8Video.push(text);
									m3u8Video.end();
									// Сегменты
									let segments = m3u8Video.manifest.segments;
									let key, data = "";
									// Получаем ссылки сегментов
									let arrFiles = [];
									for (key in segments) {
										// По сути здесь можно качать и сохранять
										console.log("LOAD   ======> " + segments[key]['uri']);
										let fname = 'segment-' + String(key).padStart(10, '0') + '.ts';
										let rs = await fetch(urlPrefix + segments[key]['uri']);
										if(rs.ok){
											const f = __dirname + "/video/" + fname;
											console.log("SUCCES ======> " + fname);
											arrFiles.push(f);
											await streamPipeline(rs.body, fs.createWriteStream(f));
										}else{
											console.error("ERROR  ======> " + segments[key]['uri'])
										}
									}
									console.log("MERGE FILES: ", arrFiles.length);
									await splitFile.mergeFiles(arrFiles, __dirname + "/video/" + outputTitle + ".ts");
									await deleteFiles(/^segment-.*\.ts/, __dirname + '/video');
									console.log("DONE");
								})
						});
				});
		}
	}
		
//	});
//}());