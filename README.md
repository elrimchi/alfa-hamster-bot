# Alfa Hamster

**Alfa Hamster** — автоматический скрипт для кликов в игре от Альфа Банка, написанный на JavaScript.

## 📋 Основные возможности
- **Мультисессии:** Поддержка создания нескольких сессий.
- **Прокси:** Возможность использования прокси для каждой сессии.
- **Антидетект:** Небольшая рандомизация запросов для усложнения обнаружения бота.
- **Ночной режим:** Можно включить опцию ночного ожидания. Ночью увеличено время восполненииэнергии в 2 раза.
- **Кастомизация:** Возможность настройки каждого запроса.

## 🖼️ Превью

Пример работы программы на Windows:

![Превью программы](https://i.imgur.com/xQB0cIr.png)

## 🚀 Установка и использование

### ⚡ Автоматическая установка

#### Windows
1. Скачайте репозиторий.
2. Скопируйте и переименуйте файл `.env-example` на `.env`.
3. Укажите ваш `API Token` и `UserID` в файле `.env`.
4. Запустите файл `start.bat`.

#### Linux
1. Клонируйте репозиторий:
    ```bash
    git clone https://github.com/elrimchi/alpha-hamster.git
    ```
2. Перейдите в каталог с проектом:
    ```bash
    cd alpha-hamster
    ```
3. Скопируйте конфигурационный файл:
    ```bash
    cp .env-example .env
    ```
4. Укажите ваш `API Token` и `UserID` в файле `.env`:
    ```bash
    nano .env
    ```
5. Сделайте скрипт исполняемым:
    ```bash
    chmod +x start.sh
    ```
6. Запустите скрипт:
    ```bash
    ./start.sh
    ```

### 🛠️ Ручная установка

#### Windows
1. Скачайте репозиторий.
2. Скопируйте и переименуйте файл `.env-example` на `.env`.
3. Укажите ваш `API Token` и `UserID` в файле `.env`.
4. Установите необходимые модули:
    ```bash
    npm install
    ```
5. Запустите скрипт:
    ```bash
    node alfa-hamster.js
    ```

#### Linux
1. Клонируйте репозиторий:
    ```bash
    git clone https://github.com/elrimchi/alpha-hamster.git
    ```
2. Перейдите в каталог с проектом:
    ```bash
    cd alpha-hamster
    ```
3. Скопируйте конфигурационный файл:
    ```bash
    cp .env-example .env
    ```
4. Укажите ваш `API Token` и `UserID` в файле `.env`:
    ```bash
    nano .env
    ```
5. Установите необходимые модули:
    ```bash
    npm install
    ```
6. Запустите скрипт:
    ```bash
    node alfa-hamster.js
    ```

## 🔑 Как получить API Token и UserID

### 🌍 Через браузер
1. Авторизуйтесь на официальном сайте Альфа-Банка.
2. Перейдите в игру.
3. Нажмите правой кнопкой мыши и выберите «Исследовать элемент».
4. Откройте вкладку `Сеть`.
5. Выполните несколько кликов в игре, чтобы появились запросы.
6. Найдите запрос с заголовком Authorization: Api-Key, содержащий ваш `API Token`.
7. Перейдите в раздел `Ответ`, чтобы найти ваш `UserID`.

### 📱 Через мобильное устройство
Используйте приложение [PCAP droid](https://play.google.com/store/apps/details?id=com.emanuelef.remote_capture) и аддон с [GitHub](https://github.com/emanuele-f/PCAPdroid-mitm/releases/tag/v1.1).

## 🛠️ Конфигурация

Файл `.env` содержит следующие параметры:

### Общие настройки
- `MAX_CONCURRENT_REQUESTS=5` — Максимальное количество одновременных запросов. | Лучше не меняйте значение

### Настройки сессии 1
- `API_KEY1=` — Ваш API токен.
- `USER_ID1=` — Ваш ID пользователя.
- `NIGHT_MODE1=false` # Ночной режим, ночью ожидание при пополнении энергии увеличено в 2 раза. `true` / `false`
- `REQUEST_INTERVAL1=5,10` — Интервал между запросами в секундах (5-10 сек.)
- `CLICKS1=120,250` — Интервал количество кликов в одном запросе.
- `PROXY_ENABLED1=false` — Включение прокси для сессии. `true` / `false`
- `PROXY_FILE1=./proxies/proxies1.txt` — Путь к файлу с прокси.

### Настройки дополнительных сессий
Чтобы активировать дополнительные сессии, удалите `#` перед переменными и измените число в названии переменной.

- `# API_KEY2=` — Ваш API токен для второй сессии.
- `# USER_ID2=` — Ваш ID пользователя для второй сессии.
- `# NIGHT_MODE1=false`
- `# REQUEST_INTERVAL2=5,10`
- `# CLICKS2=120,250`
- `# PROXY_ENABLED2=false`
- `# PROXY_FILE2=./proxies/proxies2.txt`

## 📄 Лицензия

Этот проект лицензирован под Unlicensed. Подробности см. в файле [LICENSE](./LICENSE).
