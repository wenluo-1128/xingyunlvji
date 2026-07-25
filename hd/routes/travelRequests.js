const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 创建旅行需求（POST /api/travel-requests）
router.post('/api/travel-requests', async (req, res) => {
  const {
    destination,
    departure_date,
    return_date,
    min_budget,
    max_budget,
    adults,
    children,
    designer_num,
    contact_name,
    contact_phone,
    contact_date,
    contact_time,
    remark,
    amount,
  } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO travel_requests (
        destination,
        departure_date,
        return_date,
        min_budget,
        max_budget,
        adults,
        children,
        designer_num,
        contact_name,
        contact_phone,
        contact_date,
        contact_time,
        remark,
        amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
      `,
      [
        destination,
        departure_date,
        return_date,
        min_budget || null,
        max_budget || null,
        adults,
        children,
        designer_num || 0,
        contact_name || '',
        contact_phone || '',
        contact_date || null,
        contact_time || null,
        remark || '',
        amount || 0,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('数据库插入错误:', err.detail || err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
