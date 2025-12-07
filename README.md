# 行云旅迹 - 旅游平台项目

## 项目概述

行云旅迹是一个完整的旅游平台解决方案，包含微信小程序用户端、Vue 3管理后台和Node.js后端服务。平台提供城市发现、旅游攻略分享、行程定制、订单管理等全方位的旅游服务。

## 项目结构

```
play_xiaochengxu/
├── qd/                     # 微信小程序前端
├── hd_qd/                  # Vue 3管理后台前端  
├── hd/                     # Node.js后端服务
├── 行云旅迹数据库代码.txt    # 数据库结构文档
└── README.md              # 项目说明文档
```

## 功能模块

### 🏃‍♂️ 微信小程序端 (qd/)

- **发现页**: 热门城市推荐、旅游攻略展示
- **发表页**: 用户发布旅游内容、攻略分享
- **行程定制**: 个性化旅游路线定制服务
- **定制师**: 专业旅游顾问服务
- **我的**: 用户中心、个人信息管理

**技术栈**:
- 微信小程序原生框架
- 自定义组件和页面
- 微信小程序API

### 💻 Vue 3管理后台 (hd_qd/)

- **登录认证**: 管理员身份验证
- **数据仪表盘**: 订单统计、数据可视化
- **订单管理**: 旅游订单处理和跟踪
- **用户管理**: 用户信息和权限管理
- **内容管理**: 文章、攻略内容管理

**技术栈**:
- Vue 3 + Composition API
- Vue Router 4 路由管理
- Vite 构建工具
- Axios HTTP客户端
- Chart.js 图表库
- Day.js 日期处理

### ⚙️ Node.js后端服务 (hd/)

- **用户认证**: 注册、登录、JWT令牌管理
- **订单系统**: 旅游订单创建、查询、状态管理
- **内容管理**: 文章、攻略的CRUD操作
- **文件上传**: 图片、文档上传处理
- **数据库操作**: PostgreSQL数据库连接和查询

**技术栈**:
- Express.js Web框架
- PostgreSQL数据库
- Multer文件上传
- CORS跨域处理
- UUID生成器

## 快速开始

### 环境要求

- Node.js >= 14.x
- PostgreSQL >= 12.x
- 微信开发者工具（用于小程序开发）

### 1. 数据库设置

```bash
# 创建数据库
createdb mydb

# 执行数据库脚本
psql mydb -f 行云旅迹数据库代码.txt
```

### 2. 后端服务启动

```bash
cd hd/

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置数据库连接等信息

# 启动服务
npm start
```

### 3. 管理后台启动

```bash
cd hd_qd/

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 4. 微信小程序启动

1. 使用微信开发者工具打开 `qd/` 目录
2. 配置小程序AppID
3. 在详情中勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"
4. 点击编译运行

## 环境变量配置

### 后端环境变量 (.env)

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=mydb

# 服务器配置
PORT=3002

# 文件存储路径
IMAGE_DIR=./public/images
DRAFTS_DIR=./public/drafts
ARTICLE_DIR=./public/article
```

## API接口文档

### 用户相关
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录
- `GET /user/image` - 获取用户头像

### 订单相关
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:orderId` - 获取订单详情

### 内容管理
- `GET /api/categories` - 获取分类列表
- `GET /api/categories/:id/cities` - 获取分类下的城市

### 文件上传
- `POST /api/upload` - 文件上传

## 数据库设计

### 主要数据表

- **categories**: 旅游分类管理
- **cities**: 城市信息表
- **articles**: 旅游文章和攻略
- **users**: 用户信息
- **travel_requests**: 旅游订单请求
- **drafts**: 用户草稿内容
- **provinces/province_cities**: 省市区数据

详细数据库结构请参考 `行云旅迹数据库代码.txt` 文件。

## 项目特色

### 🌟 完整的旅游生态
- 从用户发现到定制服务的完整闭环
- 多端同步的用户体验

### 🚀 现代化技术栈
- Vue 3 Composition API
- 微信小程序原生开发
- Express + PostgreSQL 后端

### 📱 用户友好设计
- 响应式设计适配多种屏幕
- 直观的管理后台界面
- 流畅的用户交互体验

### 🔧 可扩展架构
- 模块化设计便于功能扩展
- 标准化的API接口
- 清晰的数据模型设计

## 部署说明

### 开发环境
按照快速开始部分的步骤配置各服务即可。

### 生产环境
1. 配置生产环境数据库
2. 设置环境变量
3. 使用PM2管理Node.js服务
4. 配置Nginx反向代理
5. 配置HTTPS证书

## 注意事项

1. 微信小程序需要在微信公众平台配置服务器域名白名单
2. 文件上传功能需要配置合适的文件存储路径
3. 建议在生产环境中使用环境变量管理敏感信息
4. 定期备份数据库数据

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交变更
4. 推送到分支
5. 创建Pull Request
