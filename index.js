/**
 * 
 * Первый параметр при запуске скрипта должен быть url видео
 * Пример:
 * node index.js https://rutube.ru/video/bb2a7557a09fbe3d63f74dd98aef3551/
 * 
 */
if(!process.argv[2]){
	console.error('NOT URL ARGUMENT');
	process.exit();
}

const urls = process.argv.slice(2);

// NodeJS
const fs = require('node:fs');
const path = require('node:path');
const URL = require('node:url');
const stream = require('node:stream');
const util = require('node:util');

// Установленные
const fetch = require('node-fetch');
const m3u8Parser = require('m3u8-parser');
const splitFile = require('split-file');
const cliProgress = require('cli-progress');
const _colors = require('ansi-colors');
const sanitize = require('sanitize-filename');
const ffmpeg = require('ffmpeg');

const processTitle = process.title;

const regex_rutube = /^https?:\/\/rutube\.ru\/video\/(\w+)/;

const streamPipeline = util.promisify(stream.pipeline);

let m, pls, url;

const escapeRegExp = function(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
	},

	createDir = function(dir) {
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
	},

	deleteFiles = async function(reg, dir){
		return new Promise((resolve, reject) => {
			dir = path.normalize(dir) + "/";
			fs.readdirSync(dir).filter(f => reg.exec(f)).forEach(f => {
				fs.unlinkSync(dir + f)
			});
			resolve(true);
		})
	},

	deleteFile = async function(file) {
		return new Promise((resolve, reject) => {
			fs.stat(file, function(err, stat) {
				if (err == null) {
					fs.unlinkSync(file);
					resolve(true);
				} else if (err.code === 'ENOENT') {
					resolve(true);
				} else {
					reject(false);
				}
			});
		})
	},

	formatTime = function(value){
		function autopadding(v){
			return ("0" + v).slice(-2);
		}
		let s = autopadding(Math.floor((value / 1000) % 60));
		let m = autopadding(Math.floor((value / 1000 / 60) % 60));
		let h = autopadding(Math.floor((value / (1000 * 60 * 60)) % 24));
		return h + ":" + m + ":" + s
	},

	formatBar = function(optionsBar, paramsBar, payloadBar){
		function autopadding(value, length){
			return (optionsBar.autopaddingChar + value).slice(-length);
		}
		const completeSize = Math.round(paramsBar.progress * optionsBar.barsize);
		const incompleteSize = optionsBar.barsize - completeSize;
		const bar = optionsBar.barCompleteString.substr(0, completeSize) +
				optionsBar.barGlue +
				optionsBar.barIncompleteString.substr(0, incompleteSize);
		const percentage =  Math.floor(paramsBar.progress * 100) + '';
		const stopTime = parseInt(Date.now());
		const elapsedTime = formatTime(Math.round((stopTime - paramsBar.startTime)));
		var barStr = _colors.white('|')
						+ _colors.cyan(bar + ' ' + autopadding(percentage, 3) + '%')
						+ " " + _colors.white('|') + " "
						+ elapsedTime
						+ " " + _colors.white('|') + " "
						+ autopadding(paramsBar.value, `${paramsBar.total}`.length) + `/${paramsBar.total}`
						+ " " + _colors.white('|') + " "
						+ `${payloadBar.filename}`;
		return barStr;
	},

	rightpad = function(str, len, ch = false) {
		str = String(str);
		if (!ch && ch !== 0)
			ch = ' ';
		return str.padEnd(len, ch);
	},

	delay = ms => new Promise(resolve => setTimeout(resolve, ms)),

	execFFmpeg = async function (input, output) {
		return new Promise((resolve, reject) => {
			const child = require('node:child_process')
				.exec(`ffmpeg -i "${input}" -vcodec copy -acodec copy "${output}"`);
			child.stdout.pipe(process.stdout);
			child.on('exit', () => {
				resolve(true);
			});
		})
	},

	runDownLoadAndConverting = async function(_url) {
		return new Promise((resolve, reject) => {
			if ((m = regex_rutube.exec(_url)) !== null) {
				// Получаем информацию о видео
				pls = `https://rutube.ru/api/play/options/${m[1]}/?no_404=true&referer=https%3A%2F%2Frutube.ru`;
				fetch(pls)
					.then(res => res.json())
					.then((json) => {
						// Получаем название ролика
						const outputTitle = json.title;
						// Получаем информацию о плейлистах
						let video_m3u8 = json['video_balancer']['m3u8'];
						fetch(video_m3u8)
							.then(res => res.text())
							.then(text => {
								process.title = "DOWNLOAD: " + outputTitle;
								let parser = new m3u8Parser.Parser();
								parser.push(text);
								parser.end();
								let parsedManifest = parser.manifest;
								// Получаем ссылку на плейлист самого большого разрешения видео
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
										console.log(" ");
										console.log("       DOWNLOAD:", _colors.yellowBright(outputTitle), "\n");
										const progress = new cliProgress.SingleBar({
											stopOnComplete: true,
											hideCursor: false,
											autopadding: true,
											fps: 5,
											barsize: 37
										},{
											format: formatBar,
											barCompleteChar: '\u2588',
											barIncompleteChar: '\u2592'
										});
										let m3u8Video = new m3u8Parser.Parser();
										m3u8Video.push(text);
										m3u8Video.end();
										// Сегменты
										let segments = m3u8Video.manifest.segments;
										let key, data = "", int;
										// Получаем ссылки сегментов
										let arrFiles = [];
										// Забрать расширение сегмента
										let ext;
										progress.start(segments.length, 0, {filename: " "});

										for (key in segments) {
											// Забираем расширение
											ext = path.extname(segments[key]['uri']);
											// По сути здесь можно качать и сохранять
											int = parseInt(key) + 1;
											let fname = 'segment-' + `${int}`.padStart(10, '0') + ext;
											try {
												let rs = await fetch(urlPrefix + segments[key]['uri']);
												if(rs.ok){
													const f = __dirname + "/video/" + fname;
													arrFiles.push(f);
													progress.update(int, {filename: "   SAVE: " + _colors.yellowBright(fname)});
													await streamPipeline(rs.body, fs.createWriteStream(f));
												}else{
													progress.update(int, {filename: "NO SAVE: " + _colors.redBright(fname)});
													progress.stop();
													console.error(_colors.redBright("ПРОВЕРЬТЕ ПОДКЛЮЧЕНИЕ К ИНТЕРНЕТУ"));
													process.exit(1);
												}
											}catch(e){
												progress.update(int, {filename: "NO SAVE: " + _colors.redBright(fname)});
												progress.stop();
												console.error(_colors.redBright("ПРОВЕРЬТЕ ПОДКЛЮЧЕНИЕ К ИНТЕРНЕТУ"));
												process.exit(1);
											}
											await delay(50);
										}
										progress.update(int, {filename: " "});
										await delay(1000);
										progress.stop();
										const saveTitle = sanitize(outputTitle);
										console.log("\u00A0");
										console.log("COMBINING FILES:", _colors.yellowBright(`${arrFiles.length}`), "FILES INTO A", _colors.yellowBright(`"${saveTitle}${ext}"`), "PLEASE WAIT...", "\n");
										await splitFile.mergeFiles(arrFiles, `${__dirname}/video/${saveTitle}${ext}`);
										//console.log("\u00A0");
										console.log("   DELETE FILES:", _colors.yellowBright(`${arrFiles.length}`), "\n");
										await deleteFiles(/^segment-.*\.ts/, __dirname + '/video');
										await deleteFile(`${__dirname}/video/${saveTitle}.mp4`);
										//console.log("\u00A0");
										console.log("     CONVERTING:", _colors.yellowBright(`"${saveTitle}${ext}"`));
										console.log("             TO:", _colors.yellowBright(`"${saveTitle}.mp4"`))
										console.log("PLEASE WAIT...");
										console.log("\u00A0");
										await execFFmpeg(`${__dirname}/video/${saveTitle}${ext}`, `${__dirname}/video/${saveTitle}.mp4`);
										await deleteFile(`${__dirname}/video/${saveTitle}${ext}`);
										console.clear();
										console.log(_colors.yellowBright("DONE!"));
										console.log("_".padEnd(20, "_"));
										//console.log("\u00A0");
										resolve(true);
									})
							});
					});
			}else {
				reject(true);
			}
		});
	};

(async function(){
	if (urls.length) {
		for(let i = 0; i < urls.length; ++i){
			url = urls[i];
			await runDownLoadAndConverting(url);
		}
	}
	console.clear();
	process.title = __dirname;
	console.log("\u00A0");
	console.log("\u00A0\u00A0\u00A0" + _colors.bgWhite(_colors.white("█████████████████")) + "\u00A0");
	console.log("\u00A0\u00A0\u00A0" + _colors.bgRed(_colors.white(" #СвоихНеБросаем ")) + "\u00A0");
	console.log("\u00A0\u00A0\u00A0" + _colors.bgBlue(_colors.blue("█████████████████")) + "\u00A0");
	console.log("\u00A0");
}());