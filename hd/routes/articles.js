const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { getContentType } = require('../utils/helpers');

// 获取文章列表（GET /api/articles）
router.get('/api/articles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articles');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 修改发表文章接口
router.post('/api/articles', async (req, res) => {
  try {
    const { user_id, image_url, title, city, content, new_image_path } = req.body;
    const newImagePaths = new_image_path.split(',');
    const movedPaths = [];

    for (const filePath of newImagePaths) {
      if (filePath.startsWith('/drafts/')) {
        const oldPath = `./public${filePath}`;
        const fileName = filePath.split('/').pop();
        const newPath = `/article/${Date.now()}-${fileName}`;
        const newFullPath = `./public${newPath}`;

        // 确保目录存在
        const dir = path.dirname(newFullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        try {
          await fs.promises.rename(oldPath, newFullPath);
          movedPaths.push(newPath);
        } catch (err) {
          console.error('文件移动失败:', err);
          movedPaths.push(filePath);
        }
      } else {
        movedPaths.push(filePath);
      }
    }

    const newImagePathValue = movedPaths.join(',');

    // 插入数据库
    const result = await pool.query(
      `INSERT INTO articles
       (user_id, image_url, new_image_path, title, location, content)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, image_url, newImagePathValue, title, city, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('发表失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 根据发表文章ID获取单张图片
router.get('/api/articles/:articleId/image', async (req, res) => {
  const { articleId } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT image_url FROM articles WHERE article_id = $1',
      [articleId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }
    const imagePath = rows[0].image_url;
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 根据文章ID和索引获取单张图片
router.get('/api/articles/:id/images', async (req, res) => {
  const { id } = req.params;
  const imageIndex = parseInt(req.query.index, 10) || 0;
  try {
    // 从数据库获取图片路径列表
    const { rows } = await pool.query(
      'SELECT new_image_path FROM articles WHERE article_id = $1',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    const imagePaths = rows[0].new_image_path.split(',');
    if (imageIndex >= imagePaths.length) {
      return res.status(404).json({ error: 'Image index out of range' });
    }
    const imagePath = imagePaths[imageIndex];
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
