const path = require('path');

// 订单状态计算函数（根据业务需求修改）
function calculateOrderStatus(order) {
  const now = new Date();
  if (now < order.departure_date) {
    return '待出行';
  } else if (now > order.return_date) {
    return '已完成';
  }
  return '进行中';
}

// 根据文件扩展名获取 Content-Type
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

module.exports = {
  calculateOrderStatus,
  getContentType,
};
