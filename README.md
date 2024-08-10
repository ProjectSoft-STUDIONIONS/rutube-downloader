# Скачивание видео с RuTube

<div class="github-icons">
	<a href="https://github.com/ProjectSoft-STUDIONIONS/rutube-downloader/releases/latest" target="_blank">
		<img src="https://img.shields.io/github/v/release/ProjectSoft-STUDIONIONS/rutube-downloader?style=for-the-badge&color=%23007ec6&label=РЕАЛИЗ" alt="Github Latest rutube-downloader">
	</a>
	<a href="https://github.com/ProjectSoft-STUDIONIONS/rutube-downloader/blob/master/LICENSE" target="_blank">
		<img src="https://img.shields.io/github/license/ProjectSoft-STUDIONIONS/rutube-downloader?style=for-the-badge&color=%2397ca00&label=ЛИЦЕНЗИЯ" alt="Github LICENSE rutube-downloader">
	</a>
	<a href="https://github.com/ProjectSoft-STUDIONIONS/rutube-downloader/" target="_blank">
		<img src="https://img.shields.io/github/repo-size/ProjectSoft-STUDIONIONS/rutube-downloader?style=for-the-badge&color=%23007ec6&label=РАЗМЕР РЕПОЗИТОРИЯ" alt="Github Repo">
	</a>
</div>

Скачивание видео с RuTube на Node.js

![Скачивание видео с RuTube на NodeJS](screen.png?raw=true)

## Установка

Требуется установленный **[Node.js](https://nodejs.org/en/download/prebuilt-installer)** и **[FFmpeg](https://github.com/ProjectSoft-STUDIONIONS/ffmpegInstaller/releases/latest/download/ffmpeg_install.exe)**

Скачиваем архив репозитория [rutube-downloader-main.zip](archive/refs/heads/main.zip), разархивируем. Проходим в каталог с файлами репозитория, выполняем:

````
npm run test
````

Будет выполнена установка необходимых пакетов для работы скрипта.

Далее выполняем скачивание видео с RuTube.

## Скачивание видео

Для скачивания видео, к примеру `https://rutube.ru/video/ba1f267bcff6a3529889a6dd08bfb764/`, нужно выполнить следующую команду:

````
node index.js https://rutube.ru/video/ba1f267bcff6a3529889a6dd08bfb764/
````

Результат выполнения виден на скриншоте. Видео сохраняется в папке `video` расположенной в директории рядом с исполняемым скриптом.