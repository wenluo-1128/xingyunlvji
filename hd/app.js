const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// 请求体解析中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/images', express.static(process.env.IMAGE_DIR));
app.use('/drafts', express.static(process.env.DRAFTS_DIR));
app.use('/article', express.static(process.env.ARTICLE_DIR));
app.use('/users', express.static(path.join(__dirname, 'public/users')));
app.use(cors());

// 路由模块挂载
app.use(require('./routes/orders'));
app.use(require('./routes/users'));
app.use(require('./routes/categories'));
app.use(require('./routes/provinces'));
app.use(require('./routes/travelRequests'));
app.use(require('./routes/drafts'));
app.use(require('./routes/articles'));
app.use(require('./routes/cities'));
app.use(require('./routes/images'));
app.use(require('./routes/upload'));

// 启动服务
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
