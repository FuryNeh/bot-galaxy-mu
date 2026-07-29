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

let isReconnecting = false; // Cờ chặn chống spam kết nối lại nhiều lần

function startWalkingInCircles(bot) {
  let yaw = 0;
  bot.setControlState('forward', true);

  const circleInterval = setInterval(() => {
    // Kiểm tra xem bot còn sống và có trong game không
    if (!bot || !bot.entity) return;
    
    yaw += 0.15;
    if (yaw > Math.PI * 2) yaw = 0;
    
    // Giữ bot nhìn quanh để di chuyển tròn
    bot.look(yaw, 0, true);
  }, 100);

  // Xóa interval dọn dẹp bộ nhớ khi bot ngắt kết nối
  const cleanup = () => clearInterval(circleInterval);
  bot.once('end', cleanup);
  bot.once('error', cleanup);
}

function startBot() {
  isReconnecting = false;
  console.log(`[${new Date().toLocaleTimeString()}] Đang kết nối tới ${CONFIG.host}:${CONFIG.port}...`);

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
  });

  bot.on('spawn', () => {
    console.log(`[+] Bot ${CONFIG.username} đã vào server thành công!`);
    
    // Bắt đầu đi lòng vòng sau 2 giây
    setTimeout(() => {
      startWalkingInCircles(bot);
    }, 2000);
  });

  // Hàm xử lý việc kết nối lại an toàn
  const safeReconnect = (reason) => {
    if (isReconnecting) return; // Nếu đang chờ reconnect thì bỏ qua các event trùng
    isReconnecting = true;

    console.log(`[-] Bot ngắt kết nối (${reason}). Thử lại sau 15 giây...`);
    setTimeout(() => {
      startBot();
    }, 15000); // Tăng lên 15 giây để tránh bị Aternos rate-limit (chặn spam)
  };

  bot.on('end', (reason) => safeReconnect(`Event End: ${reason}`));
  bot.on('error', (err) => safeReconnect(`Event Error: ${err.message}`));
}

// Bắt đầu chạy Bot
startBot();
