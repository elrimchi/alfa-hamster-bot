#!/bin/bash

# Функция для проверки наличия команды
check_command() {
  command -v "$1" >/dev/null 2>&1
}

# Проверка наличия Node.js
if ! check_command node; then
  echo "Node.js не установлен. Пожалуйста, установите Node.js и попробуйте снова."
  exit 1
fi

# Проверка наличия npm
if ! check_command npm; then
  echo "npm не установлен. Пожалуйста, установите npm и попробуйте снова."
  exit 1
fi

# Проверка наличия файла package.json
if [ ! -f package.json ]; then
  echo "Файл package.json не найден. Пожалуйста, убедитесь, что вы находитесь в корневой директории проекта."
  exit 1
fi

# Проверка наличия директории node_modules
if [ ! -d node_modules ]; then
  echo "Модули не установлены. Устанавливаем модули..."
  npm install
  echo "Запуск скрипта..."
  node alfa-hamster.js
  exit 0
fi

# Запуск основного скрипта
echo "Запуск скрипта..."
node alfa-hamster.js

# Завершение
exit 0