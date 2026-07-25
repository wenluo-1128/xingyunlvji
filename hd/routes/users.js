const express = require('express');
const router = express.Router();
const path = require('path');
const pool = require('../config/db');

// 用户注册接口
router.post('/api/register', async (req, res) => {
  const { username, password, name, avatarUrl } = req.body;

  // 处理默认头像路径
  const finalAvatar = avatarUrl.includes('/users/')
    ? avatarUrl
    : '/images/110.jpg';

  try {
    const result = await pool.query(
      'INSERT INTO users (username, password, name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, password, name, finalAvatar]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取用户头像
router.get('/user/image', async (req, res) => {
  const userId = req.query.userId;
  try {
    const { rows } = await pool.query(
      'SELECT avatar_url FROM users WHERE id = $1',
      [userId]
    );
    if (!rows.length) return res.status(404).send('User not found');

    // 拼接文件物理路径
    const filePath = path.resolve(`./public${rows[0].avatar_url}`);
    res.sendFile(filePath); // 直接返回图片文件
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// 用户登录接口
router.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    res.json(result.rows[0]); // 返回用户数据包含 id, name, avatar_url
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取用户名字
router.post('/api/articles/name/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT name FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]); // 返回用户 name
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
