const express = require('express');
const router = express.Router();
const upload = require('../config/upload');

// 图片上传接口
router.post('/upload', upload.single('file'), (req, res) => {
  let filePath = req.file ? req.file.path.replace('public', '') : null;
  filePath = filePath.replace(/\\/g, '/');
  if (filePath) {
    res.json({ path: filePath });
  } else {
    res.status(400).json({ error: 'File upload failed' });
  }
});

module.exports = router;
