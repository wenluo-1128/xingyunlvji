const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { getContentType } = require('../utils/helpers');

// 获取城市数据及关联内容（GET /api/index_cit）
router.get('/api/index_cit', async (req, res) => {
  try {
    const { cityId } = req.query;

    // 查询 cities 表获取城市名称
    const cityResult = await pool.query(
      'SELECT name FROM cities WHERE city_id = $1',
      [cityId]
    );

    if (cityResult.rows.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }
    const cityName = cityResult.rows[0].name;

    // 查询 scenic_list 表
    const scenicResult = await pool.query(
      'SELECT * FROM scenic_list WHERE cities_name = $1',
      [cityName]
    );

    // 查询 content 表
    const contentResult = await pool.query(
      'SELECT * FROM content WHERE title = $1',
      [cityName]
    );

    res.json({
      scenicList: scenicResult.rows,
      content: contentResult.rows[0] || {},
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取背景图片（GET /api/index_cit/:id/backgroundImage）
router.get('/api/index_cit/:id/backgroundImage', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT background_image FROM content WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const imagePath = result.rows[0].background_image;
    const filePath = path.resolve(`./public${imagePath}`);

    if (!filePath.startsWith(path.resolve('./public'))) {
      return res.status(403).json({ error: 'Forbidden path' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.sendFile(filePath, {
      headers: {
        'Content-Type': getContentType(imagePath),
        'Cache-Control': 'max-age=31536000',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 获取主图片（GET /api/index_cit/:id/imageSrc）
router.get('/api/index_cit/:id/imageSrc', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT image_src FROM content WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const imagePath = result.rows[0].image_src;
    const filePath = path.resolve(`./public${imagePath}`);

    if (!filePath.startsWith(path.resolve('./public'))) {
      return res.status(403).json({ error: 'Forbidden path' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.sendFile(filePath, {
      headers: {
        'Content-Type': getContentType(imagePath),
        'Cache-Control': 'max-age=31536000',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 获取景点图片路由
router.get('/api/index_cit/:id/image_url', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT image_url FROM scenic_list WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scenic not found' });
    }

    const imagePath = result.rows[0].image_url;
    const filePath = path.resolve(`./public${imagePath}`);

    if (!filePath.startsWith(path.resolve('./public'))) {
      return res.status(403).json({ error: 'Forbidden path' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.sendFile(filePath, {
      headers: {
        'Content-Type': getContentType(imagePath),
        'Cache-Control': 'max-age=31536000',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
