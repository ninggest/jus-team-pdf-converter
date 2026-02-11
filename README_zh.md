# Jus Team PDF Converter

[English](./README.md) | 中文版

这是一个专为法律文档设计的 PDF 转 Markdown 工具，旨在将复杂的法律文本转换为清晰、易读且结构化的 Markdown 格式。

## 🌟 核心功能

- **法律文档优化**: 针对法律协议、判决书等文档深度优化，自动识别并清理页眉、页脚和页码，保持正文连贯性。
- **异步处理能力 (v2.0)**: 后台异步 OCR 处理，支持任务持久化。引入**取件码系统**，可在不同设备或会话中找回任务进度。
- **高质量 OCR**: 采用 Mistral AI 提供的专业级 OCR 技术，自动提取表格、分级标题等复杂结构。
- **用户体验深度优化**: 全界面中文化支持，新增模式详细说明，优化隐私提示布局。

## 📍 版本记录

### v2.3.0 (当前版本)
- **稳健性增强**: 实现了支持 `Retry-After` 的智能重试逻辑（涵盖前端直传与后端调用），有效应对 Mistral API 的频率限制（429）。
- **类型安全升级**: 前后端 TypeScript 类型定义完全同步，大幅减少运行时潜在错误。
- **错误反馈优化**: 细化了错误提示，区分网络问题、频率限制及 API 验证错误，提供更友好的用户指引。

### v2.2.0

### v2.1.0
- **Mistral 直传模式**: 实现了前端直接上传文件至 Mistral API，绕过 Cloudflare Worker 的内存限制，解决了大文件导致的 OOM 错误。
- **架构升级**: Worker 现在直接接收 `mistral_file_id` 进行处理，提升了系统的稳定性和传输速度。
- **错误处理增强**: 优化了上传和处理阶段的错误捕获逻辑，提升了异常情况下的用户体验。

### v2.0.0
- **异步处理与取件码**: 引入持久化任务系统。用户获得 6 位“取件码”，可随时在其他设备或刷新页面后取回后台任务结果。
- **UI 全面中文化**: 针对中文语境完成全界面语言优化。
- **模式优化**: 将处理模式重命名为“常规模式”与“异步模式”，并增加了详细的功能与定价说明。
- **布局重构**: 将数据安全提示移至页脚，并优化了整体视觉宽度对齐，使界面更加整洁。
- **Bug 修复**: 解决了 Mistral 422 上传错误，并优化了任务状态追踪逻辑。

### v1.2.0
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
