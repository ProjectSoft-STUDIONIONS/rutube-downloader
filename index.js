#!/usr/bin/env node

/**
 *
 * Первый параметр при запуске скрипта должен быть url видео
 * Пример:
 * node index.js https://rutube.ru/video/bb2a7557a09fbe3d63f74dd98aef3551/
 * node index.js https://rutube.ru/video/29085a3569472fab6ee8d8af0262758a/
 * node index.js https://rutube.ru/video/ba1f267bcff6a3529889a6dd08bfb764/ https://aser.pro/content/stream/podnyatie_urovnya_v_odinochku/001_29006/hls/index.m3u8 -t 'Поднятие уровня в одиночку серия 01' https://rutube.ru/video/342af3c3cbba19c9a95252fc27bc60a4/ -p 10
 */

const _colors = require("ansi-colors");
const { configure } = require("./src/configure");
const { rl } = require("./src/dialogue");
const { parseArgs } = require("./src/parseArgs");
const downFiles = [];
const errorFiles = [];
/**
 * Получаем title процесса
 */
const globalTitle = process.title;

/**
 * Очищаем консоль
 */
process.stdout.write('\033c');

/**
 * Перехват ошибок
 */
process.on('uncaughtException', (err) => {
	//console.log("\u00A0");
	//console.log(err);
});

process.on('unhandledRejection', (reason, promise) => {
	console.log("\u00A0");
	console.log(_colors.redBright(reason.message));
});
async function run() {
	const state = parseArgs(process.argv);
	while (state.currentFileIndex < state.files.length) {
		const file = state.files[state.currentFileIndex];
		const cfg = {
			root: state.root,
			video: state.video,
			title: file.title,
			parallelNum: state.parallelSegments,
			url: file.url,
			manualVideoQuality: state.manualVideoQuality,
			quality: state.quality,
		};
		let name, quality;
		console.log(`\u00A0`);
		try {
			process.title = `LOAD VIDEO INFO: ${file.url}`;
			console.log(`LOAD VIDEO INFO:`.padStart(configure.padText, " "), _colors.yellowBright(file.url));
			[name, quality] = await file.videoProvider.loadVideo(cfg);
			file.name = name;
			state.quality = quality;
			downFiles.push(name);
		} catch (e) {
			process.title = `Error: ${file.url}`;
			//console.log(e);
			console.log("\u00A0");
			console.log(_colors.redBright(e.message));
			errorFiles.push(file.url);
		}
		state.currentFileIndex++;
	}
	return state;
}
/**
 * Запускаем
 */
run()
	.then(state => {
		console.log("\u00A0");
		if(downFiles.length){
			console.log(`Загружено файлов:`.padStart(configure.padEndText, " "), _colors.yellowBright(`${downFiles.length}`));
			for (let file of downFiles) console.log(_colors.cyan("+ ".padStart(configure.padEndText, " ")), _colors.yellowBright(file));
		}
		if(errorFiles.length){
			console.log(`Незагруженные файлы:`.padStart(configure.padEndText, " "), _colors.redBright(`${errorFiles.length}`));
			for (let file of errorFiles) console.log(_colors.cyan("+ ".padStart(configure.padEndText, " ")), _colors.redBright(file));
		}
	})
	.finally(() => {
		rl.close();
		process.title = globalTitle;
		console.log("\u00A0");
	});
