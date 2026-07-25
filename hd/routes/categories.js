const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 获取分类列表（GET /api/categories）
router.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取分类下的城市列表（GET /api/categories/:id/cities）
router.get('/api/categories/:id/cities', async (req, res) => {
  const categoryId = req.params.id;
  try {
    const result = await pool.query(
      `
      SELECT c.*
      FROM cities c
      JOIN category_city cc ON c.city_id = cc.city_id
      WHERE cc.category_id = $1
    `,
      [categoryId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 搜索城市（POST /api/search）
router.post('/api/search', async (req, res) => {
  const keyword = req.body.keyword || '';
  const pattern = `%${keyword}%`;
  try {
    const result = await pool.query(
      `
      SELECT city_id, name, image_url
      FROM cities
      WHERE
        name ILIKE $1
        OR EXISTS (
          SELECT 1
          FROM unnest(tags) AS tag
          WHERE tag ILIKE $1
        )
    `,
      [pattern]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取猜你喜欢的城市列表（GET /api/guess-cities）
router.get('/api/guess-cities', async (req, res) => {
  try {
    const result = await pool.query('SELECT city_name FROM guess_cities');
    res.json(result.rows.map(row => row.city_name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
