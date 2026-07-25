const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

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
      const fileName = `${uuidv4()}${ext}`;
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

module.exports = upload;
