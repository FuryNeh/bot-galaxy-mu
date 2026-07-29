const express = require('express');
const mineflayer = require('mineflayer');

// --- 1. MỞ CỔNG WEB ĐỂ RENDER BẢO TRÌ KẾT NỐI ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot Minecraft đang chạy 24/7!');
});

app.listen(PORT, () => {
  console.log(`[WEB] Server web đang lắng nghe tại port ${PORT}`);
});

// --- 2. CẤU HÌNH BOT MINECRAFT ---
const CONFIG = {
  host: 'GALAXY-MU.aternos.me',
  port: 49753,
  username: 'HaLand3001',
  version: false
};

function startWalkingInCircles(bot) {
  let yaw = 0;
  bot.setControlState('forward', true);

  const circleInterval = setInterval(() => {
    if (!bot || !bot.entity) return;
    yaw += 0.15;
    if (yaw > Math.PI * 2) yaw = 0;
    bot.look(yaw, 0, true);
  }, 100);

  bot.once('end', () => {
    clearInterval(circleInterval);
  });
}

function startBot() {
  console.log(`[${new Date().toLocaleTimeString()}] Đang kết nối tới ${CONFIG.host}:${CONFIG.port}...`);

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
  });

  bot.on('spawn', () => {
    console.log(`[+] Bot ${CONFIG.username} đã vào server thành công!`);
    setTimeout(() => {
      startWalkingInCircles(bot);
    }, 2000);
  });

  bot.on('end', (reason) => {
    console.log(`[-] Bot bị ngắt kết nối: ${reason}. Thử lại sau 10s...`);
    setTimeout(startBot, 10000);
  });

  bot.on('error', (err) => {
    console.error('[ERROR] Lỗi kết nối:', err.message);
  });
}

// Bắt đầu chạy Bot
startBot();
