# Скачивание видео с RuTube

<p><a href="https://github.com/ProjectSoft-STUDIONIONS/rutube-downloader/releases/latest" target="_blank"><img src="https://img.shields.io/github/v/release/ProjectSoft-STUDIONIONS/rutube-downloader?style=for-the-badge&color=%230098FF" alt="Github Latest rutube-downloader"></a> &nbsp;<a href="https://github.com/ProjectSoft-STUDIONIONS/rutube-downloader/blob/main/LICENSE" target="_blank"><img src="https://img.shields.io/github/license/ProjectSoft-STUDIONIONS/rutube-downloader?style=for-the-badge&color=%230098FF" alt="Github LICENSE rutube-downloader"></a> &nbsp;<a href="https://github.com/ProjectSoft-STUDIONIONS/rutube-downloader/" target="_blank"><img src="https://img.shields.io/github/repo-size/ProjectSoft-STUDIONIONS/rutube-downloader?style=for-the-badge&color=%230098FF" alt="Github Repo"></a> &nbsp;<a href="https://github.com/ProjectSoft-STUDIONIONS/rutube-downloader/releases/latest/download/rutube-downloader.zip" target="_blank"><img src="https://img.shields.io/github/downloads/ProjectSoft-STUDIONIONS/rutube-downloader/total?style=for-the-badge&color=%230098FF" alt="Github Download rutube-downloader"></a></p>
<p>&nbsp;</p>


Скачивание видео с RuTube на Node.js

![Скачивание видео с RuTube на NodeJS](screen.png?raw=true)

## Установка

Требуется установленный **[Node.js](https://nodejs.org/en/download/prebuilt-installer)** и **[FFmpeg](https://github.com/ProjectSoft-STUDIONIONS/ffmpegInstaller/releases/latest/download/ffmpeg_install.exe)**

Скачиваем архив репозитория [rutube-downloader.zip](https://github.com/ProjectSoft-STUDIONIONS/rutube-downloader/releases/latest/download/rutube-downloader.zip), разархивируем. Проходим в каталог с файлами репозитория, выполняем:

````bash
npm run test
````

Будет выполнена установка необходимых пакетов для работы скрипта.

Далее выполняем скачивание видео с RuTube.

## Скачивание видео

Для скачивания видео, к примеру `https://rutube.ru/video/ba1f267bcff6a3529889a6dd08bfb764/`, нужно выполнить следующую команду:

````bash
node index.js https://rutube.ru/video/ba1f267bcff6a3529889a6dd08bfb764/
````

Так же можно выполнить множнственное скачивание видео:

````bash
node index.js https://rutube.ru/video/ba1f267bcff6a3529889a6dd08bfb764/ https://rutube.ru/video/1c62a5d0f5a87bd2028a5e81eb1d70ba/ https://rutube.ru/video/3219fef0568d88d9bcd4567aef9fc1ea/
````

Результат выполнения виден на скриншоте. Видео сохраняется в папке `video` расположенной в директории рядом с исполняемым скриптом.
