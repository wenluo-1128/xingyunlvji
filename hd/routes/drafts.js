const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { getContentType } = require('../utils/helpers');

// 获取草稿数据（GET /api/drafts/0/:id）
router.get('/api/drafts/0/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const result = await pool.query('SELECT * FROM drafts WHERE user_id = $1', [
      id,
    ]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 保存草稿数据（POST /api/drafts）
router.post('/api/drafts', async (req, res) => {
  try {
    const { user_id, image_url, title, city, content, new_image_path } = req.body;
    console.log('Saving draft with paths:', new_image_path);
    const result = await pool.query(
      `INSERT INTO drafts
       (user_id, image_url, new_image_path, title, city, content)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, image_url, new_image_path, title, city, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Draft save error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 删除草稿数据（DELETE /api/drafts/:id）
router.delete('/api/drafts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const draftId = parseInt(id, 10);
    if (isNaN(draftId)) {
      return res.status(400).json({ error: 'Invalid draft ID' });
    }
    const result = await pool.query('DELETE FROM drafts WHERE draft_id = $1', [
      draftId,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 根据草稿ID和索引获取单张图片
router.get('/api/drafts/:id/image', async (req, res) => {
  const { id } = req.params;
  const imageIndex = parseInt(req.query.index, 10) || 0;
  try {
    // 从数据库获取图片路径列表
    const { rows } = await pool.query(
      'SELECT new_image_path FROM drafts WHERE draft_id = $1',
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

// 根据草稿文章ID获取单张图片
router.get('/api/drafts/cities/:draftId/image', async (req, res) => {
  const { draftId } = req.params;
  try {
    // 查询对应的图片路径
    const { rows } = await pool.query(
      'SELECT image_url FROM drafts WHERE draft_id = $1',
      [draftId]
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

module.exports = router;
