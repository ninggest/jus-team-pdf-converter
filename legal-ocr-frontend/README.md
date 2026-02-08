# Jus Team PDF Converter - Frontend

这是 Jus Team PDF Converter 的前端应用，一个基于 React 构建的高性能 Web 应用。

## 功能特性

- **拖拽上传**: 智能识别 PDF 文件，支持多文件同时拖入。
- **任务队列**: 实时显示每个文件的转换状态（排队中、处理中、已完成、失败）。
- **密钥管理**: 安全的 API 密钥输入框，支持显示/隐藏，并将密钥加密存储在本地。
- **预览与下载**: 转换完成后直接在应用内查看结果或下载 Markdown 文件。
- **响应式布局**: 优化了在不同屏幕尺寸下的视觉体验，确保在大屏上自动居中。

## 开发环境

- **框架**: [Vite](https://vitejs.dev/) + [React](https://react.dev/)
- **语言**: TypeScript
- **样式**: [Tailwind CSS v4](https://tailwindcss.com/)
- **状态管理**: 原生 React Hooks + 派生状态处理

## 开始使用

1.  **安装依赖**:
    ```bash
    npm install
    ```

2.  **配置环境变量**:
    在 `.env` 文件中设置：
    ```text
    VITE_WORKER_URL=http://localhost:8787 # 本地测试地址或生产地址
    ```

3.  **启动开发服务器**:
    ```bash
    npm run dev
    ```

## 项目结构

```text
src/
  ├── components/ # 可复用 UI 组件 (Header, Card, etc.)
  ├── App.tsx     # 主应用逻辑与页面布局
  ├── index.css   # 全局样式与 Tailwind 配置
  └── ...
```
