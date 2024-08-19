@echo off
chcp 65001 >nul

:: Проверка наличия Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js не установлен. Пожалуйста, установите Node.js и попробуйте снова.
    pause
    exit /b 1
)

:: Проверка наличия npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo npm не установлен. Пожалуйста, установите npm и попробуйте снова.
    pause
    exit /b 1
)

:: Проверка наличия файла package.json
if not exist package.json (
    echo Файл package.json не найден. Пожалуйста, убедитесь, что вы находитесь в корневой директории проекта.
    pause
    exit /b 1
)

:: Проверка наличия директории node_modules
if not exist node_modules (
    echo Модули не установлены. Устанавливаем модули...
    npm install
    echo Модули установлены. 
    echo Запуск скрипта...
    node alfa-hamster.js
    pause
    exit /b 0
)

:: Запуск основного скрипта
echo Запуск скрипта...
node alfa-hamster.js

:: Завершение
pause
exit /b 0