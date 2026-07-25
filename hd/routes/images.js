const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { getContentType } = require('../utils/helpers');

// 通用静态图片返回函数
function serveStaticImage(imagePath, res) {
  const filePath = path.resolve(`./public${imagePath}`);

  // 安全性检查：确保路径在允许范围内
  if (!filePath.startsWith(path.resolve('./public'))) {
    return res.status(403).json({ error: 'Forbidden path' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Image not found' });
  }

  // 返回图片流
  res.sendFile(filePath, {
    headers: {
      'Content-Type': getContentType(imagePath),
      'Cache-Control': 'max-age=31536000', // 缓存一年
    },
  });
}

// AI 页面图片
router.get('/api/index/ai/image', async (req, res) => {
  serveStaticImage('/images/ai.png', res);
});

// 定制页图片
router.get('/api/customize/image', async (req, res) => {
  serveStaticImage('/images/beijing.png', res);
});

// 询问页图片
router.get('/api/inquire/image', async (req, res) => {
  serveStaticImage('/images/beijing1.png', res);
});

module.exports = router;
