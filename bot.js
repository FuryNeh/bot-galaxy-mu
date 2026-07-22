const express = require('express');
const mineflayer = require('mineflayer');

// ==========================================
// 1. TẠO WEB SERVER (Cần thiết cho Render)
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot Minecraft đang hoạt động!');
});

app.listen(PORT, () => {
  console.log(`[WEB] Server Web đang chạy tại cổng ${PORT}`);
});

// ==========================================
// 2. CẤU HÌNH BOT MINECRAFT
// ==========================================
const CONFIG = {
  host: '185.107.193.125', // Tên miền server
  port: 49753,              // Port riêng của server
  username: 'Bot_Onl247',  // Tên nhân vật
  version: false            // Tự động nhận diện phiên bản game
};

// Hàm điều khiển bot đi hình tròn chống AFK
function startWalkingInCircles(bot) {
  let yaw = 0;
  bot.setControlState('forward', true); // Đi thẳng

  const circleInterval = setInterval(() => {
    if (!bot || !bot.entity) return;
    
    yaw += 0.15; // Xoay góc nhìn liên tục
    if (yaw > Math.PI * 2) yaw = 0;
    
    bot.look(yaw, 0, true);
  }, 100);

  // Xóa bộ đếm khi bot rời server
  bot.once('end', () => {
    clearInterval(circleInterval);
  });
}

// Hàm khởi tạo bot
function startBot() {
  console.log(`[${new Date().toLocaleTimeString()}] Đang kết nối tới ${CONFIG.host}:${CONFIG.port}...`);

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
  });

  // Khi vào server thành công
  bot.on('spawn', () => {
    console.log(`[+] Bot ${CONFIG.username} đã vào server!`);
    
    // Đợi 2 giây rồi bắt đầu đi lòng vòng
    setTimeout(() => {
      startWalkingInCircles(bot);
    }, 2000);
  });

  // Tự động kết nối lại khi bị rớt mạng / kick
  bot.on('end', (reason) => {
    console.log(`[-] Bot ngắt kết nối: ${reason}. Thử lại sau 10 giây...`);
    setTimeout(startBot, 10000);
  });

  bot.on('error', (err) => {
    console.error('[ERROR] Lỗi:', err.message);
  });
}

// Chạy bot
startBot();
