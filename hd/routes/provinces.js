const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 获取省份列表（GET /api/provinces）
router.get('/api/provinces', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM provinces');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取省份下的城市列表（GET /api/provinces/:id/cities）
router.get('/api/provinces/:id/cities', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM province_cities WHERE province_id = $1',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
