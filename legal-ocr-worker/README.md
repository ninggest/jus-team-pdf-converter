# Jus Team PDF Converter - Worker (Backend)

基于 Cloudflare Workers 的法律文档 OCR 处理引擎。

## 功能特性

- **高效 OCR**: 对接 Mistral （mistral-ocr） 的 OCR 模型，专门针对文本密度高的法律文件进行了调优。
- **无状态设计**: 后端不存储任何用户信息或文件数据，确保合规与安全。
- **流式处理**: 针对大型 PDF 优化，快速响应转换结果。
- **CORS 支持**: 预置跨域支持，无缝对接 Vite 开发环境。

## API 规范

### 转换接口

- **URL**: `POST /`
- **认证**: `Authorization: Bearer <MISTRAL_API_KEY>`
- **请求体**: `multipart/form-data` 包含 `file` 字段。

### 错误码说明

- `401`: 未提供有效密钥
- `413`: 文件超过 50MB 限制
- `500`: OCR 解析引擎错误

## 部署说明

1.  **安装 Wrangler**:
    ```bash
    npm install -g wrangler
    ```

2.  **本地调试**:
    ```bash
    npm run dev
    ```

3.  **正式部署**:
    ```bash
    npm run deploy
    ```

## 开发者

Powered by Jus Team & Cloudflare Workers.
