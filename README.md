# RAG Chat Example Frontend

这是一个简单的 React 前端应用，用于与 RAG Chat 后端 API 交互。

## 功能特性

- 简洁的聊天界面
- 实时消息发送和接收
- Markdown 格式支持（代码高亮、表格、列表等）
- 自动滚动到最新消息
- 响应式设计
- TypeScript 支持

## 技术栈

- React 18
- TypeScript
- Vite
- CSS3

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 配置环境变量（可选）

如果需要修改 API 地址，可以创建 `.env` 文件：

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

然后在 `.env` 文件中修改：

```env
VITE_API_BASE_URL=http://localhost:8000
```

默认情况下，API 地址为 `http://localhost:8000`。

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

应用将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

构建产物将输出到 `dist` 目录。

### 预览生产构建

```bash
npm run preview
# 或
yarn preview
# 或
pnpm preview
```

## 项目结构

```
example-frontend/
├── src/
│   ├── components/          # React 组件
│   │   ├── ChatInterface.tsx
│   │   └── ChatInterface.css
│   ├── services/            # API 服务
│   │   └── api.ts
│   ├── App.tsx              # 主应用组件
│   ├── App.css
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── index.html               # HTML 模板
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## API 说明

前端通过 POST 请求发送消息到后端的 `/chat` 端点：

- **URL**: `/chat`
- **Method**: `POST`
- **Body**: `{ "q": "用户的问题" }`
- **Response**: `{ "answer": "AI 的回答" }`

## 注意事项

1. 确保后端 API 服务正在运行（默认端口 8000）
2. 后端已配置 CORS，允许来自 `http://localhost:3000` 的请求
3. 如果后端运行在不同的端口或地址，请修改 `.env` 文件中的 `VITE_API_BASE_URL`
