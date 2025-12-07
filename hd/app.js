const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const { v4: uuidv4 } = require('uuid'); 
const cors = require('cors');
const { log } = require('console');
const PORT = process.env.PORT || 3002;

// 请求体解析中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库连接
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// 静态文件服务
app.use('/images', express.static(process.env.IMAGE_DIR));
app.use('/drafts', express.static(process.env.DRAFTS_DIR));
app.use('/article', express.static(process.env.ARTICLE_DIR));
app.use('/users', express.static(path.join(__dirname, 'public/users')));
app.use(cors());


// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const pathPrefix = req.body.path || '/drafts';
    let fullPath;

    if (pathPrefix.startsWith('/user/')) {
      fullPath = './public/users';
    } else if (pathPrefix.startsWith('/article/')) {
      fullPath = './public/article';
    } else {
      fullPath = './public/drafts';
    }

    // 自动创建目录（避免路径不存在报错）
    fs.mkdirSync(fullPath, { recursive: true });
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    if (req.body.path?.startsWith('/user/')) {
      const ext = path.extname(file.originalname);
      const fileName = `${uuidv4()}${ext}`; // 现在可以正常调用
      cb(null, fileName);
    } else {
      // 其他文件保持原有逻辑
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const ext = path.extname(file.originalname);
      cb(null, `${timestamp}-${randomStr}${ext}`);
    }
  }
});

const upload = multer({ storage });

app.get('/api/orders', async (req, res) => {
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
                completedOrders
            }
        };
        
        console.log(data);
        
        res.json(data);
    } catch (error) {
        console.error('数据库查询错误:', error);
        res.status(500).json({ error: '服务器错误，请稍后重试' });
    }
});

// 获取单个订单详情
app.get('/api/orders/:orderId', async (req, res) => {
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
      order.status = calculateOrderStatus(order); // 实现状态计算逻辑
      
      res.json({ order });
  } catch (error) {
      console.error('数据库查询错误:', error);
      res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
});

// 订单状态计算示例函数（根据业务需求修改）
function calculateOrderStatus(order) {
  const now = new Date();
  if (now < order.departure_date) {
      return '待出行';
  } else if (now > order.return_date) {
      return '已完成';
  }
  return '进行中';
}

// 用户注册接口
app.post('/api/register', async (req, res) => {
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
app.get('/user/image', async (req, res) => {
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
app.post('/api/login', async (req, res) => {
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

// 获取分类列表（GET /api/categories）
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取分类下的城市列表（GET /api/categories/:id/cities）
app.get('/api/categories/:id/cities', async (req, res) => {
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
app.post('/api/search', async (req, res) => {
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
app.get('/api/guess-cities', async (req, res) => {
  try {
    const result = await pool.query('SELECT city_name FROM guess_cities');
    res.json(result.rows.map(row => row.city_name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取文章列表（GET /api/articles）
app.get('/api/articles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articles');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取省份列表（GET /api/provinces）
app.get('/api/provinces', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM provinces');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取省份下的城市列表（GET /api/provinces/:id/cities）
app.get('/api/provinces/:id/cities', async (req, res) => {
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

// 创建旅行需求（POST /api/travel-requests）
app.post('/api/travel-requests', async (req, res) => {
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
    amount        
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
        amount || 0
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('数据库插入错误:', err.detail || err.message); 
    res.status(500).json({ error: err.message });
  }
});

// 获取草稿数据（GET /api/drafts）
app.get('/api/drafts/0/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id);
  
  try {
    const result = await pool.query('SELECT * FROM drafts WHERE user_id = $1',
      [id]
    ); // 临时使用固定 user_id
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 保存草稿数据（POST /api/drafts）
app.post('/api/drafts', async (req, res) => {
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
app.delete('/api/drafts/:id', async (req, res) => {
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

// 修改发表文章接口
app.post('/api/articles', async (req, res) => {
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

// 图片上传接口
app.post('/upload', upload.single('file'), (req, res) => {
  let filePath = req.file ? req.file.path.replace('public', '') : null;
  filePath = filePath.replace(/\\/g, '/'); 
  if (filePath) {
    res.json({ path: filePath });
  } else {
    res.status(400).json({ error: 'File upload failed' });
  }
});

//根据草稿ID和索引获取单张图片
app.get('/api/drafts/:id/image', async (req, res) => {
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

// 根据城市ID获取单张图片
app.get('/api/categories/:city_id/cities/image', async (req, res) => {
  const { city_id } = req.params;
  try {
    // 查询城市对应的图片路径
    const { rows } = await pool.query(
      'SELECT image_url FROM cities WHERE city_id = $1',
      [city_id]
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

// 根据发表文章ID获取单张图片
app.get('/api/articles/:articleId/image', async (req, res) => {
  const { articleId } = req.params;
  try {
    // 查询城市对应的图片路径
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

// 根据草稿文章ID获取单张图片
app.get('/api/drafts/cities/:draftId/image', async (req, res) => {
  const { draftId } = req.params;
  try {
    // 查询城市对应的图片路径
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

// 获取用户名字
app.post('/api/articles/name/:id', async (req, res) => {
  const { id } = req.params; // 修正参数名，使用小写 id
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

//根据文章ID和索引获取单张图片
app.get('/api/articles/:id/images', async (req, res) => {
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

// 获取城市数据及关联内容（GET /api/index_cit）
app.get('/api/index_cit', async (req, res) => {
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
app.get('/api/index_cit/:id/backgroundImage', async (req, res) => {
  try {
    const { id } = req.params;

    // 查询 content 表获取背景图片路径
    const result = await pool.query(
      'SELECT background_image FROM content WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const imagePath = result.rows[0].background_image;
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

// 获取主图片（GET /api/index_cit/:id/imageSrc）
app.get('/api/index_cit/:id/imageSrc', async (req, res) => {
  try {
    const { id } = req.params;

    // 查询 content 表获取主图片路径
    const result = await pool.query(
      'SELECT image_src FROM content WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const imagePath = result.rows[0].image_src;
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

app.get('/api/index/ai/image', async (req,res) => {
  const imagePath = '/images/ai.png';
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
});

app.get('/api/customize/image', async (req,res) => {
  const imagePath = '/images/beijing.png';
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
});

app.get('/api/inquire/image', async (req,res) => {
  const imagePath = '/images/beijing1.png';
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
});

// 原有路由保持不变
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories/:id/cities', async (req, res) => {
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

// 获取景点图片路由
app.get('/api/index_cit/:id/image_url', async (req, res) => {
  try {
    const { id } = req.params;

    // 查询 scenic_list 表获取图片路径
    const result = await pool.query(
      'SELECT image_url FROM scenic_list WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scenic not found' });
    }

    const imagePath = result.rows[0].image_url;
    const filePath = path.resolve(`./public${imagePath}`);

    // 安全检查
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
        'Cache-Control': 'max-age=31536000' // 缓存一年
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
};

// 启动服务
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
