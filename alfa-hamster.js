require('dotenv').config();
const request = require('request-promise');
const fs = require('fs');
const zlib = require('zlib');

// User-Agent для Android
const androidUserAgents = [
  'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 11; Pixel 5 Build/RQ3A.210605.005) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 9; Mi 9T Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.93 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 7.0; Nexus 6P Build/N4F26O) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Mobile Safari/537.36',
];

const reset = '\x1b[0m';
const colors = {
  info: '\x1b[38;5;240m', // Серый
  success: '\x1b[38;5;107m', // Тёмно-зелёный
  warn: '\x1b[38;5;227m', // Тёмно-жёлтый
  error: '\x1b[38;5;202m', // Тёмно-красный
  debug: '\x1b[38;5;73m'   // Тёмно-синий
};

const levels = {
  INFO: 'info',
  SUCCESS: 'success',
  WARN: 'warn',
  ERROR: 'error',
  DEBUG: 'debug'
};

const logLevel = process.env.LOG_LEVEL || levels.INFO;

function getRandomAndroidUserAgent() {
  const randomIndex = Math.floor(Math.random() * androidUserAgents.length);
  return androidUserAgents[randomIndex];
}


function logWithTime(sessionIndex, message, level = levels.INFO) {
  const now = new Date();
  const timeString = now.toTimeString().split(' ')[0];
  const sessionStr = `Session ${sessionIndex}`.padEnd(20);

  if (Object.values(levels).indexOf(level) >= Object.values(levels).indexOf(logLevel)) {
    console.log(`${colors[level]}${sessionStr} [${timeString}] ${message}${reset}`);
  }
}



function readProxiesFromFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent.split('\n').filter(line => line.trim() !== '');
  } catch (error) {
    logWithTime('ALL', `Ошибка чтения прокси из файла ${filePath}: ${error.message}`, levels.ERROR);
    return [];
  }
}


async function checkProxy(proxy) {
  try {
    const response = await request({
      url: 'https://httpbin.org/ip',
      proxy: proxy,
      timeout: 10000,
      simple: false,
      resolveWithFullResponse: true,
      json: true 
    });

    const ip = response.body.origin;
    console.log(`Прокси ${proxy} работает. IP: ${ip}`);
    return response.statusCode === 200;
  } catch (error) {
    console.error(`Ошибка при проверке прокси ${proxy}: ${error.message}`);
    return false;
  }
}


async function getSessionConfig(index) {
  const token = process.env[`API_KEY${index}`];
  const userID = process.env[`USER_ID${index}`];
  const proxyFilePath = process.env[`PROXY_FILE${index}`];
  const proxyEnabled = process.env[`PROXY_ENABLED${index}`] === 'true';
  const requestInterval = process.env[`REQUEST_INTERVAL${index}`];
  const clicks = process.env[`CLICKS${index}`];
  const nightMode = process.env[`NIGHT_MODE${index}`] === 'true';

  if (token && userID && requestInterval && clicks) {
    const [requestIntervalMin, requestIntervalMax] = requestInterval.split(',').map(Number);
    const [clicksMin, clicksMax] = clicks.split(',').map(Number);

    if (!isNaN(requestIntervalMin) && !isNaN(requestIntervalMax) && !isNaN(clicksMin) && !isNaN(clicksMax)) {
      let proxies = [];
      let selectedProxy = null;
      if (proxyEnabled && proxyFilePath) {
        proxies = readProxiesFromFile(proxyFilePath);
        if (proxies.length === 0) {
          logWithTime(index, `Список прокси из файла ${proxyFilePath} пуст или не найден. Сессия пропущена.`, levels.WARN);
          return null;
        }

        const validProxies = [];
        for (const proxy of proxies) {
          const proxyWorks = await checkProxy(proxy);
          if (proxyWorks) {
            validProxies.push(proxy);
          } else {
            logWithTime(index, `Прокси не работает: ${proxy}`, levels.WARN);
          }
        }

        if (validProxies.length === 0) {
          logWithTime(index, `Все прокси из файла ${proxyFilePath} не работают. Сессия пропущена.`, levels.ERROR);
          return null;
        }

        proxies = validProxies;
        selectedProxy = proxies[Math.floor(Math.random() * proxies.length)];
      }

      return {
        token,
        userID,
        proxies,
        selectedProxy, 
        proxyEnabled,
        requestIntervalMin,
        requestIntervalMax,
        clicksMin,
        clicksMax,
        nightMode,
        isWaiting: false
      };
    }
  }

  return null;
}


function getNightMode(session) {
  return session.nightMode;
}

function isNightTime() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 23 || hour < 6; // Ночь: с 23:00 до 06:00
}


async function getSessions() {
  const sessions = [];
  let index = 1;

  while (true) {
    const sessionConfig = await getSessionConfig(index);
    if (sessionConfig === null) {
      break;
    }

    sessions.push(sessionConfig);
    index++;
  }

  return sessions;
}


async function main() {
  const sessions = await getSessions();

  if (sessions.length === 0) {
    logWithTime('ALL', 'Не найдено ни одной корректной сессии. Проверьте файл .env.', levels.ERROR);
    process.exit(1);
  }
  
  console.log(
    `${colors.debug}
    ██████╗░██╗░░░██╗  ███████╗██╗░░██╗██████╗░██╗███╗░░░██╗
    ██╔══██╗╚██╗░██╔╝  ██╔════╝██║░██╔╝██╔══██╗██║████╗░████║
    ██████╦╝░╚████╔╝░  █████╗░░█████═╝░██████╔╝██║██╔████╔██║
    ██╔══██╗░░╚██╔╝░░  ██╔══╝░░██╔═██╗░██╔══██╗██║██║╚██╔╝██║
    ██████╦╝░░░██║░░░  ███████╗██║░╚██╗██║░░██║██║██║░╚═╝░██║
    ╚═════╝░░░░╚═╝░░░  ╚══════╝╚═╝░░╚═╝╚═╝░░╚═╝╚═╝╚═╝░░░░╚═╝
    ${reset}`
  );
  
  logWithTime('ALL', `Запущено ${sessions.length} сессий.`, levels.SUCCESS);


  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  async function fetchData(session, sessionIndex, retryCount = 0) {
    const maxRetries = 3;
    try {
        const clicks = getRandomInt(session.clicksMin, session.clicksMax);
        const url = `https://back.palindrome.media/api/hampter/sync/${session.userID}/${clicks}`;
        
        const proxy = session.proxyEnabled ? session.selectedProxy : null;
        const randomUserAgent = getRandomAndroidUserAgent();

        const token = session.token.includes("Api-Key ") ? session.token.replace("Api-Key ", "") : session.token;

        const response = await request({
            url: url,
            headers: {
              'Authorization': `Api-Key ${token}`,
              'Accept': '*/*',
              'Accept-Encoding': 'gzip, deflate, br',
              'Accept-Language': 'ru;q=0.6',
              'Connection': 'keep-alive',
              'DNT': '1',
              'Sec-Ch-Ua-Mobile': '?1',
              'Sec-Ch-Ua-Platform': 'Android',
              'Origin': 'https://savemoney.alfabank.ru',
              'Referer': 'https://savemoney.alfabank.ru/',
              'Sec-Fetch-Dest': 'empty',
              'Sec-Fetch-Mode': 'cors',
              'Sec-Fetch-Site': 'cross-site',
              'User-Agent': randomUserAgent
            },
            proxy: proxy,
            timeout: 15000,
            encoding: null, 
            json: false,
            resolveWithFullResponse: true
        });

        if (response.statusCode !== 200) {
            throw new Error(`Unexpected status code: ${response.statusCode}`);
        }


        const encoding = response.headers['content-encoding'];
        let decompressedBody;

        if (encoding === 'gzip') {
            decompressedBody = zlib.gunzipSync(response.body);
        } else if (encoding === 'deflate') {
            decompressedBody = zlib.inflateSync(response.body);
        } else if (encoding === 'br') {
            decompressedBody = zlib.brotliDecompressSync(response.body);
        } else {
            decompressedBody = response.body;
        }

        const data = JSON.parse(decompressedBody.toString());


       
        if (!data || typeof data.coins === 'undefined') {
            throw new Error('Отсутствует свойство "coins" в ответе.');
        }

        const formattedCoins = data.coins.toLocaleString('en-US');
        logWithTime(sessionIndex, `${data.name}: +${clicks} кликов | Энергии: ${data.energy}/${data.energyAll} | Монет: ${formattedCoins}`, levels.SUCCESS);
    
        handleData(data, session, sessionIndex);
    
    } catch (error) {
        if (retryCount < maxRetries) {
            logWithTime(sessionIndex, `Ошибка запроса. Повторная попытка ${retryCount + 1}/${maxRetries}. Ошибка: ${error.message}`, levels.ERROR);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return fetchData(session, sessionIndex, retryCount + 1);
        } else {
            logWithTime(sessionIndex, `Ошибка: ${error.message}. Все попытки исчерпаны.`, levels.ERROR);
        }
    }
}

  async function handleData(data, session, sessionIndex) {
    const nightMode = getNightMode(session);
    const minEnergy = parseInt(process.env[`MIN_ENERGY${sessionIndex}`] || '120', 10);

    if (data.energy > minEnergy) {
        const waitTime = getRandomInt(session.requestIntervalMin, session.requestIntervalMax) * 1000;
        logWithTime(sessionIndex, `Ожидание ${Math.round(waitTime / 1000)} секунд до следующего запроса...`, levels.WARN);
        setTimeout(() => fetchData(session, sessionIndex), waitTime);
    } else {
        if (!session.isWaiting) {
            logWithTime(sessionIndex, `Энергия опустилась ниже установленного минимума. Переход в состояние ожидания.`, levels.WARN);
            session.isWaiting = true;
        }

        const energyToWait = data.energyAll - data.energy;
        const randomFactor = getRandomInt(5, 15);
        const waitTime = (energyToWait + randomFactor) * 1000;

        let adjustedWaitTime = waitTime;
        if (nightMode && isNightTime()) {
            adjustedWaitTime = waitTime * 2;
            logWithTime(sessionIndex, `Включен ночной режим, время ожидания после пополнения энергии увеличено в 2 раза`, levels.WARN);
        }

        logWithTime(sessionIndex, `Недостаточно энергии. Ожидание ${Math.round(adjustedWaitTime / 1000)} секунд...`, levels.WARN);

        setTimeout(() => {
            session.isWaiting = false;
            fetchData(session, sessionIndex);
        }, adjustedWaitTime);
    }
  }

  // Запуск всех сессий параллельно с ограничением на количество одновременных запросов
  const maxConcurrentRequests = parseInt(process.env.MAX_CONCURRENT_REQUESTS || '5', 10);
  let activeRequests = 0;
  const queue = [];

  function enqueueFetch(session, index) {
    queue.push(() => fetchData(session, index));
    processQueue();
  }

  function processQueue() {
    if (activeRequests >= maxConcurrentRequests || queue.length === 0) return;
    
    activeRequests++;
    const task = queue.shift();
    
    task().finally(() => {
      activeRequests--;
      processQueue();
    });
  }

  sessions.forEach((session, index) => {
    logWithTime(index + 1, 'Запуск сессии.', levels.DEBUG);
    if (session.proxyEnabled) {
      logWithTime(index + 1, `Сессия будет использовать прокси: ${session.selectedProxy}`, levels.DEBUG);
    }
    enqueueFetch(session, index + 1);
  });
}

main().catch(error => {
  console.error(`${colors.error}Ошибка выполнения: ${error.message}${reset}`);
});
