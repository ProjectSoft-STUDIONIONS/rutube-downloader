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

const regex_rutube = /^https?:\/\/rutube\.ru\/video\/(\w+)/;

const urls = process.argv.slice(2);

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

	formatTime = function(value){
		function autopadding(v){
			return ("0" + v).slice(-2);
		}
		var s = autopadding(Math.round(value % 60));
		var m = autopadding(Math.round((value / 60) % 60));
		var h  = autopadding(Math.round((value / 360) % 24));
		return h + ":" + m + ":" + s
	},

	autopaddingVal = function (value, length, opt){
		return (opt.autopaddingChar + value).slice(-length);
	},

	formatBytes = function(bytes, decimals = 2) {
		if (bytes === 0) return '0 Bt';
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bt', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat(bytes / Math.pow(k, i)).toFixed(dm) + ' ' + sizes[i];
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
		const formatValue = formatBytes(paramsBar.value);
		const formatTotal = formatBytes(paramsBar.total);
		const total = formatTotal.length;// params
		const stopTime = paramsBar.stopTime || Date.now();
		const elapsedTime = formatTime(Math.round((stopTime - paramsBar.startTime)/1000));
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
	delay = ms => new Promise(resolve => setTimeout(resolve, ms));

	
if (urls.length) {
	url = urls[0];
	// Если нашли id ролика
	if ((m = regex_rutube.exec(url)) !== null) {
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
								console.log("DOWNLOAD:", outputTitle, "\n");

								const progress = new cliProgress.SingleBar({
									stopOnComplete: true,
									hideCursor: false,
									autopadding: true,
									fps: 5,
									barsize: 50
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
								let key, data = "";
								// Получаем ссылки сегментов
								let arrFiles = [];
								// Забрать расширение сегмента
								let ext;
								progress.start(segments.length, 0, {filename: " "});

								for (key in segments) {
									// Забираем расширение
									ext = path.extname(segments[key]['uri']);
									// По сути здесь можно качать и сохранять
									let fname = 'segment-' + String(key).padStart(10, '0') + ext;
									let rs = await fetch(urlPrefix + segments[key]['uri']);
									if(rs.ok){
										const f = __dirname + "/video/" + fname;
										arrFiles.push(f);
										progress.increment();
										progress.update(key + 1, {filename: _colors.yellowBright(fname)});
										await streamPipeline(rs.body, fs.createWriteStream(f));
									}else{
										progress.increment();
										progress.update(key + 1, {filename: _colors.redBright(fname)});
									}
									await delay(50);
								}
								await delay(1000);
								progress.stop();
								const saveTitle = sanitize(outputTitle);
								console.log(" ");
								console.log("COMBINING FILES:", _colors.yellowBright(`${arrFiles.length}`), "FILES INTO A", _colors.yellowBright(`"${saveTitle}${ext}"`), "PLEASE WAIT...", "\n");
								await splitFile.mergeFiles(arrFiles, `${__dirname}/video/${saveTitle}${ext}`);

								console.log(" ");
								console.log("DELETE FILES:", _colors.yellowBright(`${arrFiles.length}`), "\n");
								await deleteFiles(/^segment-.*\.ts/, __dirname + '/video');

								console.log("DONE!", "\n");
								console.log(_colors.cyanBright("Дальше надо делать обработку скаченного файла...))). Будем стараться. Пока всё."));
								console.log(" ");
								console.log(_colors.bgWhite(_colors.white("█████████████████")));
								console.log(_colors.bgRed(_colors.white(" #СвоихНеБросаем ")));
								console.log(_colors.bgBlue(_colors.blue("█████████████████")));
								console.log(" ");
							})
					});
			});
	}
}