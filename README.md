# Скачивание видео с RuTube

![GitHub Release](https://img.shields.io/github/v/release/ProjectSoft-STUDIONIONS/rutube-downloader?display_name=release&style=for-the-badge&link=https%3A%2F%2Fgithub.com%2FProjectSoft-STUDIONIONS%2Frutube-downloader%2Freleases) ![GitHub License](https://img.shields.io/github/license/ProjectSoft-STUDIONIONS/rutube-downloader?style=for-the-badge&color=rgb(151%2C%20202%2C%200)&link=https%3A%2F%2Fgithub.com%2FProjectSoft-STUDIONIONS%2Frutube-downloader%3Ftab%3DMIT-1-ov-file%23readme) ![GitHub repo size](https://img.shields.io/github/repo-size/ProjectSoft-STUDIONIONS/rutube-downloader?style=for-the-badge&link=https%3A%2F%2Fgithub.com%2FProjectSoft-STUDIONIONS%2Frutube-downloader) ![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/ProjectSoft-STUDIONIONS/rutube-downloader/total?style=for-the-badge&color=rgb(151%2C%20202%2C%200)&link=https%3A%2F%2Fgithub.com%2FProjectSoft-STUDIONIONS%2Frutube-downloader%2Freleases%2Flatest%2Fdownload%2Frutube-downloader.zip)

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