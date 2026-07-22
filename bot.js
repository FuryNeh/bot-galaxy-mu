const express = require('express');
const mineflayer = require('mineflayer');

// 1. Web server giữ Render không ngủ
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot AFK Minecraft đang hoạt động!'));
app.listen(PORT, () => console.log(`[WEB] Server lắng nghe tại port ${PORT}`));

// 2. Cấu hình Server
const CONFIG = {
  host: 'GALAXY-MU.aternos.me',
  port: 49753, // Nhớ cập nhật Port dynamic của Aternos mỗi khi mở lại server!
  username: 'Newbie-b0T',
  version: '1.21.11' // Chỉ định rõ phiên bản thay vì để 'false'
};

function setupAFKActions(bot) {
  // Hành động 1: Xoay góc nhìn liên tục
  let yaw = 0;
  const rotateInterval = setInterval(() => {
    if (!bot || !bot.entity) return;
    yaw += 0.15;
    if (yaw > Math.PI * 2) yaw = 0;
    bot.look(yaw, 0, true);
  }, 300);

  // Hành động 2: Nhảy nhẹ ngẫu nhiên (mỗi 30 - 50 giây)
  let jumpTimer;
  const triggerJump = () => {
    if (bot && bot.entity) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 400);
      // Vẫy tay nhẹ
      bot.swingArm('mainhand');
    }
    // Lên lịch nhảy tiếp theo ngẫu nhiên
    const nextInterval = Math.floor(Math.random() * 20000) + 30000; // 30s đến 50s
    jumpTimer = setTimeout(triggerJump, nextInterval);
  };

  triggerJump();

  // Dọn dẹp bộ đếm khi bot bị ngắt kết nối
  bot.once('end', () => {
    clearInterval(rotateInterval);
    clearTimeout(jumpTimer);
  });
}

function startBot() {
  console.log(`[${new Date().toLocaleTimeString()}] Đang kết nối tới ${CONFIG.host}:${CONFIG.port}...`);

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    checkTimeoutInterval: 30 * 1000 // Tăng thời gian chờ tránh bị drop gói tin
  });

  bot.on('spawn', () => {
    console.log(`[+] Bot AFK ${CONFIG.username} đã vào server thành công!`);
    setupAFKActions(bot);
  });

  bot.on('end', (reason) => {
    console.log(`[-] Bot bị ngắt kết nối: ${reason}. Sẽ thử kết nối lại sau 60s...`);
    setTimeout(startBot, 60000); 
  });

  bot.on('error', (err) => {
    console.error('[ERROR] Lỗi kết nối:', err.message);
  });
}

startBot();
