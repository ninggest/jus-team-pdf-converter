# Jus Team PDF Converter

[English](./README.md) | 中文版

这是一个专为法律文档设计的 PDF 转 Markdown 工具，旨在将复杂的法律文本转换为清晰、易读且结构化的 Markdown 格式。

## 🌟 核心功能

- **法律文档优化**: 针对法律协议、判决书等文档深度优化，自动识别并清理页眉、页脚和页码，保持正文连贯性。
- **批量处理能力**: 支持一次性上传多个 PDF 文件，并行处理并实时追踪转换进度。
- **隐私优先 design**: 
  - **API 密钥本地化**: 用户的 Mistral AI API 密钥存储在浏览器本地（localStorage），永不上传到中间服务器。
  - **直接通信**: 密钥仅随请求发送至 Cloudflare Worker，并直接提交给 Mistral AI。
- **极简 UI/UX**: 基于 React + Tailwind CSS v4 构建的高端、现代设计，支持拖拽上传。
- **高质量 OCR**: 采用 Mistral AI 提供的专业级 OCR 技术，自动提取表格、分级标题等复杂结构。

## 📍 版本记录

### v1.2.0 (当前版本)
- **高性能上传模式**: 彻底重构了文件处理引擎，从 Base64 编码转向 **Signed URL 模式**。
- **支持更大文件**: 显著提升了处理大文件时的稳定性和速度，完美匹配 Mistral 50MB 的 API 上限。
- **内存优化**: 将 Cloudflare Worker 的内存占用降低了 90% 以上。

### v1.1.0
- **隐私合规升级**: 新增详细的数据安全与流转公告，明确告知用户 PDF 文件将上传至 Mistral AI（欧盟服务器）进行处理。
- **UI 体验优化**: 修复了空状态下的布局对齐问题，优化了提示文案的视觉层级。

### v1.0.0
- **初始发布**: 建立完整的前后端通信链路。
- **自动对齐布局**: 针对不同尺寸浏览器优化的居中布局系统。
- **批量任务引擎**: 稳定支持多文件上传与状态同步。
- **Mistral OCR 集成**: 深度适配 Mistral AI 最新 OCR 能力。
- **Jus Team 品牌化**: 完成 Jus Team 全套视觉系统集成。

## 🛠 技术架构

该系统由两个主要部分组成：

1.  **Frontend (legal-ocr-frontend)**: 
    - 框架: React + Vite
    - 样式: Tailwind CSS v4
    - 关键特性: 响应式设计、批量任务管理、本地密钥加密管理。

2.  **Worker (legal-ocr-worker)**:
    - 平台: Cloudflare Workers
    - API: Cloudflare Document Intelligence / Mistral OCR
    - 关键特性: 无状态处理、CORS 支持、自动分块处理法律文本。

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd OCR
```

### 2. 部署 Backend (Worker)
```bash
cd legal-ocr-worker
npm install
npm run deploy  # 部署到 Cloudflare
```
部署完成后，记下 Worker URL。

### 3. 运行 Frontend
```bash
cd ../legal-ocr-frontend
npm install
# 在 .env 文件或环境变量中配置 VITE_WORKER_URL
echo "VITE_WORKER_URL=https://your-worker.your-name.workers.dev" > .env
npm run dev
```

## 🔒 数据隐私与安全性 (Data Privacy & Transparency)

本项目采用透明且合规的数据流转方案，确保您的专业文档在转换过程中的高度安全性：

### 1. 数据流转说明
- **API 密钥流转**: 您的 Mistral API 密钥仅存储在浏览器本地（LocalStorage），转换时通过加密通道传递给 Cloudflare Worker 调用，**Jus Team 的任何后端服务器都不会接触或存储您的密钥**。
- **文档流转路径**: PDF 文件自您拖拽上传起，通过 Cloudflare Worker 进行高性能内存中转（不缓存、不落盘），直接流转至 Mistral AI 官方 OCR 并进行处理。

### 2. 服务器位置与合规
- **后端引擎**: 核心 OCR 逻辑由法国人工智能公司 **Mistral AI** 提供。请注意，您的文档将上传至 Mistral AI 的服务器进行识别处理。
- **数据驻留**: Mistral AI 的服务器主要位于 **欧盟（EU）** 境内。如果您的机构有严格的数据出境限制（例如法律文档不得离开中国大陆或特定国家），请在评估后谨慎使用。

### 3. 透明度承诺
- 本项目不设任何持久化存储数据库。
- 后端代码及流转逻辑完全透明。
- 转换完成后，Worker 将立即清除所有内存中的残留数据。

## 📄 许可证 (License)

本项目采用 **MIT License**。

版权所有 (c) 2026 **Zane**。有关详细信息，请参阅 [LICENSE.md](./LICENSE.md) 文件。
