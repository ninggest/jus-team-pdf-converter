---
trigger: always_on
---

# Legal OCR Project Standards & Mandatory Requirements

## 1. Core Architecture (Mandatory)
- **Direct Upload Pattern**: Always maintain the direct file upload from the frontend to the Mistral AI API. PDF files MUST NOT be proxied through the Cloudflare Worker to avoid Worker memory limits (OOM) and large file handling failures.
- **Stateless Backend**: The Cloudflare Worker must remain stateless. It acts as an orchestrator, state manager (via KV), and API router. No persistent storage of user PDF source files on the backend is allowed.

## 2. Technology Stack & Environment
- **Infrastructure**: Backend on **Cloudflare Workers**, storage via **Cloudflare KV**, frontend React (Vite) deployed to **Cloudflare Pages**.
- **OCR Engine**: Exclusively use **Mistral AI Document Intelligence/OCR API**.
- **Type Safety**: Maintain strict TypeScript interface synchronization between frontend and backend. Shared data structures (Jobs, API Responses) must be centrally defined or mirrored in `types.ts`.

## 3. UI/UX & Functional Requirements
- **Real-time Progress**: All long-running tasks, specifically file uploads, must provide real-time visual progress feedback (currently implemented via `XMLHttpRequest`).
- **Async Persistence**: Support the "Access Code" system for job retrieval. Task status and metadata must persist in Cloudflare KV with appropriate TTL.
- **Local History**: Persist user job history in `localStorage` keyed by Access Code to ensure tasks are visible across page refreshes and sessions.

## 4. Communication & Documentation
- **Technical Language**: All technical discussions, code explanations, and assistant interactions MUST be in **Chinese**.
- **Version Synchronization**: Version numbers must be kept in sync across:
    - Frontend `package.json`
    - Frontend Footer display
    - Backend `package.json`
    - Backend Health Check API version string
- **Bilingual Documentation**: Update both `README.md` (English) and `README_zh.md` (Chinese) for every significant update. DO NOT delete historical version logs.

## 5. Security & Privacy
- **Mistral API Key**: Must only be stored in browser `LocalStorage`. It is passed via encrypted headers to the Worker. Never log or permanently store API Keys on the backend/server side.
