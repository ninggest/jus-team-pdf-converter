# Jus Team PDF Converter

English | [中文版](./README_zh.md)

A specialized PDF-to-Markdown converter tailored for legal documents, designed to transform complex legal texts into clean, readable, and structured Markdown format.

## 🌟 Core Features

- **Legal Document Optimization**: Deeply optimized for legal agreements, judgments, and other documents. Automatically identifies and cleans headers, footers, and page numbers to maintain body text continuity.
- **Async Processing (v2.0)**: Background OCR processing with task persistence. Features an **Access Code** system to retrieve jobs across sessions/devices.
- **High-Quality OCR**: Utilizes professional-grade OCR technology from Mistral AI to accurately extract complex structures such as tables and hierarchical headings.
- **User-Centric Design**: Full localization, detailed mode explanations, and optimized data flow visibility.

## 📍 Version History

### v3.0.0 (Current)
- **Real-time Upload Progress**: Integrated a visual progress bar using `XMLHttpRequest` to show live feedback during direct uploads to Mistral AI.
- **Queue Management**: Added the ability for users to remove individual files from the queue or clear tasks before processing begins.
- **Job History Persistence**: Implemented local history storage keyed by **Access Code**, allowing users to retrieve recent tasks even after page refreshes or device switching.
- **UI/UX Polish**: Enhanced the file list interface with status badges and optimized action bars for better visibility.

### v2.3.0
- **Enhanced Robustness**: Implemented intelligent retry logic with `Retry-After` support for both frontend and backend, ensuring stability under Mistral API rate limits (429).
- **Type Safety Upgrade**: Synchronized TypeScript definitions across frontend and backend for stricter type checking and reduced runtime errors.
- **Improved Error Feedback**: Added user-friendly error messages distinguishing between network issues, rate limits, and API validation errors.

### v2.2.0
- **Modular Backend Architecture**: Refactored Cloudflare Worker into a maintainable modular structure (`routes`, `services`, `utils`) for better extensibility.
- **Unified API Client**: Centralized Mistral AI interactions into a single frontend logic hub, reducing code duplication and ensuring consistency.
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
- **Privacy Compliance Update**: Added detailed data privacy and flow notice, explicitly informing users that PDF files are uploaded to Mistral AI (EU servers) for processing.
- **UI UX Optimization**: Fixed alignment issues in the empty state and optimized the visual hierarchy of notice text.

### v1.0.0
- **Initial Release**: Established full frontend-to-backend communication.
- **Automatic Alignment**: Centered layout optimized for various browser sizes.
- **Batch Task Engine**: Stable support for multiple file uploads and state synchronization.
- **Mistral OCR Integration**: Deeply adapted to Mistral AI's latest OCR capabilities.
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
- **Document Routing**: PDF files are transmitted from your browser through the Cloudflare Worker via high-performance memory transit (no caching, no disk storage) directly to Mistral AI's official OCR API.

### 2. Server Location & Compliance
- **Backend Processor**: The core OCR logic is provided by **Mistral AI**, a French AI company. Please be aware that your documents are uploaded to Mistral AI servers for recognition.
- **Data Residency**: Mistral AI servers are primarily located in the **European Union (EU)**. If your organization has strict data residency requirements (e.g., data cannot leave your country), please evaluate carefully before use.

### 3. Transparency Commitment
- No persistent storage or databases are used in this project.
- Backend code and data flow logic are fully transparent.
- The Worker immediately clears all application data from memory upon task completion.

## 📄 License

This project is licensed under the **MIT License**.

Copyright (c) 2026 **Zane**. For more details, see the [LICENSE.md](./LICENSE.md) file.
