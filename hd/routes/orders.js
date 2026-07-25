const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { calculateOrderStatus } = require('../utils/helpers');

// 获取订单列表（含统计）
router.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM travel_requests');

    // 统计订单数量
    const totalOrders = result.rows.length;
    const paidOrders = result.rows.filter(order => order.status === '已支付').length;
    const unpaidOrders = totalOrders - paidOrders;
    const completedOrders = result.rows.filter(order => order.status === '已完成').length;

    const data = {
      orders: result.rows,
      statistics: {
        totalOrders,
        paidOrders,
        unpaidOrders,
        completedOrders,
      },
    };

    console.log(data);

    res.json(data);
  } catch (error) {
    console.error('数据库查询错误:', error);
    res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
});

// 获取单个订单详情
router.get('/api/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM travel_requests WHERE request_id = $1',
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '订单未找到' });
    }

    // 添加订单状态逻辑（假设状态存储在其他地方）
    const order = result.rows[0];
    order.status = calculateOrderStatus(order);

    res.json({ order });
  } catch (error) {
    console.error('数据库查询错误:', error);
    res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
});

module.exports = router;
