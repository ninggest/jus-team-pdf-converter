# Jus Team PDF Converter

English | [中文版](./README_zh.md)

A specialized PDF-to-Markdown converter tailored for legal documents, designed to transform complex legal texts into clean, readable, and structured Markdown format.

## 🌟 Core Features

- **Legal Document Optimization**: Deeply optimized for legal agreements, judgments, and other documents. Automatically identifies and cleans headers, footers, and page numbers to maintain body text continuity.
- **Smart Refinement (Dual Engine)**: Utilizes Mistral LLMs to polish OCR results, merge incorrectly split paragraphs, and automatically identify legal elements (signatures, seals) to add meaningful image descriptions.
- **Batch Sort & Merge**: Combine multiple results into a single document with custom ordering and automatic **code block stripping**, processed entirely client-side.
- **Async Processing**: Background OCR processing with task persistence. Features an **Access Code** system to retrieve jobs across sessions/devices.
- **Large File Automatic Splitting**: Automatically splits PDF files exceeding 20MB into smaller parts in the frontend to ensure stability during synchronized processing, especially with LLM refinement enabled.
- **Privacy-First Design**: Full client-side API key management and direct-to-Mistral uploads for large files to ensure data security and performance.

## 📍 Version History

### v3.8.0 (Current)
- **Pure OCR Mode**: Removed the "Dual Engine Polish" feature to prioritize stability and speed. The system now focuses exclusively on high-fidelity OCR conversion.
- **Backend Optimization**: Removed LLM-related services from the Cloudflare Worker, reducing bundle size and eliminating timeout risks associated with synchronous LLM processing.
- **Threshold Restoration**: Restored the automatic PDF splitting threshold to **50MB**, allowing larger files to be processed in a single pass without fragmentation.

### v3.7.2
- **Split Threshold Optimization**: Lowered the automatic PDF splitting threshold from 50MB to **20MB**. This addresses Cloudflare Worker timeout (30s) issues during "Dual Engine Polish" on large documents, significantly improving reliability in Normal mode.

### v3.7.0
- **Model Upgrade**: Upgraded the polish engine from `ministral-3b` to the more powerful `ministral-14b-2512`, improving legal document understanding and formatting precision.
- **Faithfulness Optimization (Chunking)**: Implemented smart text chunking logic to process long documents in manageable segments, resolving the issue of "lazy" summarization or content omission by the LLM.
- **Safety & Transparency**: The "Dual Engine Polish" feature is now disabled by default with an added risk warning, advising caution when processing documents requiring absolute textual integrity.
- **Strict Loyalty Instructions**: Completely redesigned the LLM system prompt with strict English instructions to ensure output is 100% faithful to the OCR source text.

### v3.6.0
- **PDF Auto-Splitting**: Frontend now automatically splits PDFs exceeding 50MB into multiple parts. This bypasses Mistral API size limits while maintaining the "direct-upload" architecture.

### v3.5.1
- **Clean Markdown Export**: Automatically detect and strip ` ```markdown ` or ` ``` ` code block wrappers from OCR results. This applies to individual file downloads, copy-to-clipboard actions, and merged documents, ensuring raw, ready-to-use Markdown.

### v3.5.0
- **Batch Sort & Merge Download**: Introduced a sophisticated client-side merging system. Users can select multiple completed tasks, manually reorder them in a floating queue, and merge them into a single file with `---` separators.
- **Improved UI Architecture**: Modularized selection logic across Normal and Async modes, allowing cross-job file selection for merging.
- **Stability Polish**: Enhanced state management for the persistent merge queue.

### v3.2.0
- **Dual Engine Architecture**: Integrated Mistral's LLM (`ministral-3b-2512`) alongside the core OCR engine for high-fidelity post-processing.
- **Smart Refinement Toggle**: Added a user-facing "Dual Engine Polish" switch to optimize formatting and generate image descriptions.
- **Contextual Image Recognition**: The LLM automatically identifies legal elements like signatures, seals, and ID cards based on surrounding text, replacing generic placeholders with meaningful tags like `![Signature/Seal]`.
- **Advanced Formatting**: Automatically merges broken paragraphs, removes repetitive headers/footers, and standardizes document spacing.

### v3.0.0
- **Real-time Upload Progress**: Integrated a visual progress bar using `XMLHttpRequest` to show live feedback during direct uploads to Mistral (mistral-ocr).
- **Queue Management**: Added the ability for users to remove individual files from the queue or clear tasks before processing begins.
- **Job History Persistence**: Implemented local history storage keyed by **Access Code**, allowing users to retrieve recent tasks even after page refreshes or device switching.
- **UI/UX Polish**: Enhanced the file list interface with status badges and optimized action bars for better visibility.

### v2.3.0
- **Enhanced Robustness**: Implemented intelligent retry logic with `Retry-After` support for both frontend and backend, ensuring stability under Mistral API rate limits (429).
- **Type Safety Upgrade**: Synchronized TypeScript definitions across frontend and backend for stricter type checking and reduced runtime errors.
- **Improved Error Feedback**: Added user-friendly error messages distinguishing between network issues, rate limits, and API validation errors.

### v2.2.0
- **Modular Backend Architecture**: Refactored Cloudflare Worker into a maintainable modular structure (`routes`, `services`, `utils`) for better extensibility.
- **Unified API Client**: Centralized Mistral (mistral-ocr) interactions into a single frontend logic hub, reducing code duplication and ensuring consistency.
- **Enhanced Reliability**: Added automatic retry mechanisms on both frontend (uploads) and backend (OCR calls) to handle transient API errors.
- **Performance Optimization**: Improved large file upload stability by optimizing `FormData` construction and network handling.

### v2.1.0
- **Direct Upload to Mistral**: Implemented direct file upload from frontend to Mistral API, bypassing Cloudflare Worker memory limits and resolving OOM errors for large files.
- **Architecture Upgrade**: Worker now receives `mistral_file_id` directly, improving stability and speed.
- **Enhanced Error Handling**: Improved robust error catching for both upload and processing phases.

### v2.0.0
- **Async Processing & Access Code**: Introduced a persistent job system. Users get a 6-character "Access Code" to retrieve their background tasks later or from different devices.
- **UI Localization**: Full Chinese localization for the entire interface.
- **Mode Optimization**: Renamed modes to "Normal Mode" and "Async Mode" with detailed functional explanations.
- **Data Policy Visibility**: Moved data privacy notice to the footer and aligned UI elements for a cleaner look.
- **Bug Fixes**: Resolved Mistral 422 upload error and improved task status tracking.

### v1.2.0
- **High-Performance Upload**: Completely refactored the file processing engine from Base64 encoding to **Signed URL Mode**.
- **Large File Support**: Significantly improved stability and speed when processing large files, matching the Mistral 50MB API limit.
- **Memory Optimization**: Reduced Cloudflare Worker memory usage by over 90%.

### v1.1.0
- **Privacy Compliance Update**: Added detailed data privacy and flow notice, explicitly informing users that PDF files are uploaded to Mistral (mistral-ocr) (EU servers) for processing.
- **UI UX Optimization**: Fixed alignment issues in the empty state and optimized the visual hierarchy of notice text.

### v1.0.0
- **Initial Release**: Established full frontend-to-backend communication.
- **Automatic Alignment**: Centered layout optimized for various browser sizes.
- **Batch Task Engine**: Stable support for multiple file uploads and state synchronization.
- **Mistral OCR Integration**: Deeply adapted to Mistral (mistral-ocr)'s latest OCR capabilities.
- **Jus Team Branding**: Integrated full Jus Team visual identity system.

## 🛠 Technical Architecture

The system consists of two main parts:

1.  **Frontend (legal-ocr-frontend)**: 
    - Framework: React + Vite
    - Styling: Tailwind CSS v4
    - Key Features: Responsive design, batch task management, secure local key management.

2.  **Worker (legal-ocr-worker)**:
    - Platform: Cloudflare Workers
    - API: Cloudflare Document Intelligence / Mistral OCR
    - Key Features: Stateless processing, CORS support, automatic legal text segmentation.

## 🚀 Quick Start

### 1. Clone the Project
```bash
git clone <repository-url>
cd OCR
```

### 2. Deploy Backend (Worker)
```bash
cd legal-ocr-worker
npm install
npm run deploy  # Deploy to Cloudflare
```
After deployment, note down your Worker URL.

### 3. Run Frontend
```bash
cd ../legal-ocr-frontend
npm install
# Configure VITE_WORKER_URL in your .env file
echo "VITE_WORKER_URL=https://your-worker.your-name.workers.dev" > .env
npm run dev
```

## 🔒 Data Privacy & Transparency

This project adopts a transparent and compliant data flow to ensure the highest level of security for your professional documents:

### 1. Data Flow Disclosure
- **API Key Handling**: Your Mistral API Key resides **only** in your browser's LocalStorage. It is passed via encrypted channels to the Cloudflare Worker for invocation. **Jus Team servers never touch or store your keys.**
- **Document Routing**: PDF files are transmitted from your browser through the Cloudflare Worker via high-performance memory transit (no caching, no disk storage) directly to Mistral (mistral-ocr)'s official OCR API.

### 2. Server Location & Compliance
- **Backend Processor**: The core OCR logic is provided by **Mistral (mistral-ocr)**, a French AI company. Please be aware that your documents are uploaded to Mistral (mistral-ocr) servers for recognition.
- **Data Residency**: Mistral (mistral-ocr) servers are primarily located in the **European Union (EU)**. If your organization has strict data residency requirements (e.g., data cannot leave your country), please evaluate carefully before use.

### 3. Transparency Commitment
- No persistent storage or databases are used in this project.
- Backend code and data flow logic are fully transparent.
- The Worker immediately clears all application data from memory upon task completion.

## 📄 License

This project is licensed under the **MIT License**.

Copyright (c) 2026 **Zane**. For more details, see the [LICENSE.md](./LICENSE.md) file.
