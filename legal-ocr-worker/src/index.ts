import { Buffer } from "node:buffer";

/**
 * Legal Document PDF to Markdown Converter - Cloudflare Worker
 *
 * This worker receives a PDF file and uses the Mistral OCR API to convert it
 * to clean Markdown text optimized for legal documents.
 *
 * Key Features:
 * - Privacy First: No API keys stored on server - client provides via Authorization header
 * - Legal Document Focused: Extracts headers/footers separately to keep main content clean
 * - Clean Output: Returns pure Markdown text (not JSON)
 * - Dual Mode: Standard (synchronous) and Batch (asynchronous, 50% cheaper)
 */

// ============================================================================
// Type Definitions
// ============================================================================

interface Env {
    BATCH_JOBS: KVNamespace;
}

interface MistralOCRPage {
    index: number;
    markdown: string;
    images: unknown[];
    tables: unknown[];
    hyperlinks: string[];
    header: string | null;
    footer: string | null;
    dimensions: {
        dpi: number;
        height: number;
        width: number;
    };
}

interface MistralOCRResponse {
    pages: MistralOCRPage[];
    model: string;
    document_annotation: unknown | null;
    usage_info: {
        pages_processed: number;
        doc_size_bytes: number;
    };
}

interface MistralErrorResponse {
    message?: string;
    detail?: string | { message: string }[];
}

interface MistralFileUploadResponse {
    id: string;
    object: string;
    bytes: number;
    created_at: number;
    filename: string;
    purpose: string;
}

interface MistralSignedUrlResponse {
    url: string;
}

interface MistralBatchJob {
    id: string;
    object: string;
    input_files: string[];
    endpoint: string;
    model: string;
    status: "QUEUED" | "RUNNING" | "SUCCESS" | "FAILED" | "TIMEOUT_EXCEEDED" | "CANCELLATION_REQUESTED" | "CANCELLED";
    output_file?: string;
    error_file?: string;
    created_at: number;
    started_at?: number;
    completed_at?: number;
    total_requests?: number;
    completed_requests?: number;
    succeeded_requests?: number;
    failed_requests?: number;
}

interface BatchJobRecord {
    id: string;
    user_id: string;
    mistral_batch_id: string;
    status: "queued" | "uploading" | "processing" | "completed" | "failed";
    files: { name: string; mistral_file_id: string }[];
    results?: { file_name: string; markdown: string; error?: string }[];
    created_at: string;
    updated_at: string;
    error?: string;
}

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
    "https://ocr.jus.team",
    "https://jus-team-pdf-converter.pages.dev",
    "http://localhost:5173",
    "http://localhost:3000",
];

function getCORSHeaders(request: Request): Record<string, string> {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id, X-Access-Code",
        "Access-Control-Max-Age": "86400",
        "Access-Control-Allow-Credentials": "true",
    };
}

const MISTRAL_FILES_ENDPOINT = "https://api.mistral.ai/v1/files";
const MISTRAL_OCR_ENDPOINT = "https://api.mistral.ai/v1/ocr";
const MISTRAL_BATCH_ENDPOINT = "https://api.mistral.ai/v1/batch/jobs";
const MISTRAL_OCR_MODEL = "mistral-ocr-latest";
const BATCH_JOB_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

// ============================================================================
// CORS Helpers
// ============================================================================

function handleCORSPreflight(request: Request): Response {
    return new Response(null, {
        status: 204,
        headers: getCORSHeaders(request),
    });
}

function addCORSHeaders(response: Response, request: Request, setCookie?: string): Response {
    const newHeaders = new Headers(response.headers);
    const corsHeaders = getCORSHeaders(request);
    Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
    });
    if (setCookie) {
        newHeaders.set("Set-Cookie", setCookie);
    }
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
    });
}

// ============================================================================
// Response Helpers
// ============================================================================

// Global request reference for CORS (set in fetch handler)
let currentRequest: Request;

function jsonError(message: string, status: number, setCookie?: string): Response {
    return addCORSHeaders(
        new Response(JSON.stringify({ error: message }), {
            status,
            headers: { "Content-Type": "application/json" },
        }),
        currentRequest,
        setCookie
    );
}

function jsonResponse(data: unknown, status = 200, setCookie?: string): Response {
    return addCORSHeaders(
        new Response(JSON.stringify(data), {
            status,
            headers: { "Content-Type": "application/json" },
        }),
        currentRequest,
        setCookie
    );
}

function markdownResponse(content: string): Response {
    return addCORSHeaders(
        new Response(content, {
            status: 200,
            headers: {
                "Content-Type": "text/markdown; charset=utf-8",
            },
        }),
        currentRequest
    );
}

// ============================================================================
// User Identification (Cookie-based)
// ============================================================================

function getUserId(request: Request): { userId: string; isNew: boolean } {
    // 1. Check for X-Access-Code (New "Pickup Code" system)
    const accessCode = request.headers.get("X-Access-Code");
    if (accessCode && accessCode.length >= 4) {
        return { userId: accessCode, isNew: false };
    }

    // 2. Check for X-User-Id header (Backward compatibility)
    const headerId = request.headers.get("X-User-Id");
    if (headerId && headerId.length > 5) {
        return { userId: headerId, isNew: false };
    }

    // 3. Fallback to Cookie (Legacy support)
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(
        cookieHeader.split(";").map(c => {
            const [key, ...vals] = c.trim().split("=");
            return [key, vals.join("=")];
        })
    );

    if (cookies["jus_user_id"]) {
        return { userId: cookies["jus_user_id"], isNew: false };
    }

    // 4. New user - return ERROR or random? 
    // In Access Code mode, frontend should always provide one. 
    // But for safety, generate a UUID.
    return { userId: crypto.randomUUID(), isNew: true };
}

function createUserCookie(userId: string): string {
    // Cookie valid for 1 year
    return `jus_user_id=${userId}; Path=/; Max-Age=31536000; SameSite=None; Secure`;
}

// ============================================================================
// API Key Extraction
// ============================================================================

function extractApiKey(request: Request): string | null {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return null;

    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!bearerMatch) return null;

    return bearerMatch[1].trim();
}

// ============================================================================
// PDF Extraction from Request
// ============================================================================

async function extractPdfFromRequest(
    request: Request
): Promise<{ data: ArrayBuffer; filename: string } | null> {
    const contentType = request.headers.get("Content-Type") || "";

    if (contentType.includes("multipart/form-data")) {
        try {
            const formData = await request.formData();
            const file = formData.get("file");

            if (!file || typeof file === "string") {
                return null;
            }

            const fileBlob = file as unknown as {
                arrayBuffer: () => Promise<ArrayBuffer>;
                name?: string;
                type?: string;
            };

            const fileName = (fileBlob.name || "").toLowerCase();
            const fileType = fileBlob.type || "";

            if (fileType !== "application/pdf" && !fileName.endsWith(".pdf")) {
                return null;
            }

            const arrayBuffer = await fileBlob.arrayBuffer();
            return {
                data: arrayBuffer,
                filename: fileBlob.name || "document.pdf",
            };
        } catch {
            return null;
        }
    }

    if (
        contentType.includes("application/pdf") ||
        contentType.includes("application/octet-stream")
    ) {
        try {
            const arrayBuffer = await request.arrayBuffer();
            if (arrayBuffer.byteLength === 0) {
                return null;
            }
            return {
                data: arrayBuffer,
                filename: "document.pdf",
            };
        } catch {
            return null;
        }
    }

    return null;
}

async function extractMultiplePdfsFromRequest(
    request: Request
): Promise<{ data: ArrayBuffer; filename: string }[]> {
    const contentType = request.headers.get("Content-Type") || "";
    const files: { data: ArrayBuffer; filename: string }[] = [];

    if (!contentType.includes("multipart/form-data")) {
        return files;
    }

    try {
        const formData = await request.formData();
        const allFiles = formData.getAll("files[]");

        for (const file of allFiles) {
            if (typeof file === "string") continue;

            const fileBlob = file as unknown as {
                arrayBuffer: () => Promise<ArrayBuffer>;
                name?: string;
                type?: string;
            };

            const fileName = (fileBlob.name || "").toLowerCase();
            const fileType = fileBlob.type || "";

            if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
                const arrayBuffer = await fileBlob.arrayBuffer();
                files.push({
                    data: arrayBuffer,
                    filename: fileBlob.name || `document_${files.length}.pdf`,
                });
            }
        }
    } catch {
        // Return whatever we have
    }

    return files;
}

// ============================================================================
// Mistral OCR API Integration (Synchronous)
// ============================================================================

async function uploadFileToMistral(
    pdfData: ArrayBuffer,
    filename: string,
    apiKey: string,
    purpose: "ocr" = "ocr"
): Promise<string> {
    const formData = new FormData();
    const blob = new Blob([pdfData], { type: "application/pdf" });
    formData.append("file", blob, filename);
    formData.append("purpose", purpose);

    const response = await fetch(MISTRAL_FILES_ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Failed to upload file to Mistral: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as MistralFileUploadResponse;
    return data.id;
}

async function getSignedUrl(fileId: string, apiKey: string): Promise<string> {
    const response = await fetch(`${MISTRAL_FILES_ENDPOINT}/${fileId}/url`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as MistralSignedUrlResponse;
    return data.url;
}

async function callMistralOCR(
    pdfData: ArrayBuffer,
    filename: string,
    apiKey: string
): Promise<MistralOCRResponse> {
    const fileId = await uploadFileToMistral(pdfData, filename, apiKey);
    const signedUrl = await getSignedUrl(fileId, apiKey);

    const requestBody = {
        model: MISTRAL_OCR_MODEL,
        document: {
            type: "document_url",
            document_url: signedUrl,
        },
        extract_header: true,
        extract_footer: true,
        include_image_base64: false,
    };

    const response = await fetch(MISTRAL_OCR_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        let errorMessage = `Mistral API error: ${response.status} ${response.statusText}`;

        try {
            const errorData = (await response.json()) as MistralErrorResponse;
            if (errorData.message) {
                errorMessage = errorData.message;
            } else if (typeof errorData.detail === "string") {
                errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
                errorMessage = errorData.detail.map((d) => d.message).join("; ");
            }
        } catch {
            // Keep the default error message
        }

        throw new Error(errorMessage);
    }

    return (await response.json()) as MistralOCRResponse;
}

// ============================================================================
// Mistral Batch API Integration
// ============================================================================

async function createMistralBatchJob(
    fileIds: string[],
    apiKey: string
): Promise<MistralBatchJob> {
    // Create JSONL content for batch OCR requests
    const requests = fileIds.map((fileId, index) => ({
        custom_id: index.toString(),
        body: {
            model: MISTRAL_OCR_MODEL,
            document: {
                type: "file",
                file_id: fileId,
            },
            extract_header: true,
            extract_footer: true,
            include_image_base64: false,
        },
    }));

    // Use inline batching for small batches
    const response = await fetch(MISTRAL_BATCH_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: MISTRAL_OCR_MODEL,
            endpoint: "/v1/ocr",
            requests: requests,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create batch job: ${response.status} ${errorText}`);
    }

    return (await response.json()) as MistralBatchJob;
}

async function getMistralBatchJobStatus(
    batchId: string,
    apiKey: string
): Promise<MistralBatchJob> {
    const response = await fetch(`${MISTRAL_BATCH_ENDPOINT}/${batchId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to get batch status: ${response.status}`);
    }

    return (await response.json()) as MistralBatchJob;
}

async function downloadBatchResults(
    outputFileId: string,
    apiKey: string
): Promise<string> {
    const response = await fetch(`${MISTRAL_FILES_ENDPOINT}/${outputFileId}/content`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to download batch results: ${response.status}`);
    }

    return await response.text();
}

// ============================================================================
// Markdown Processing
// ============================================================================

function processOCRToMarkdown(ocrResponse: MistralOCRResponse): string {
    if (!ocrResponse.pages || ocrResponse.pages.length === 0) {
        return "";
    }

    const sortedPages = [...ocrResponse.pages].sort((a, b) => a.index - b.index);

    const markdownParts = sortedPages
        .map((page) => page.markdown)
        .filter((md) => md && md.trim().length > 0);

    let combinedMarkdown = markdownParts.join("\n\n");
    combinedMarkdown = cleanLegalDocumentMarkdown(combinedMarkdown);

    return combinedMarkdown;
}

function cleanLegalDocumentMarkdown(markdown: string): string {
    let cleaned = markdown;
    cleaned = cleaned.replace(/\n{4,}/g, "\n\n\n");
    cleaned = cleaned.trim();
    return cleaned;
}

// ============================================================================
// Request Handlers
// ============================================================================

async function handleOCRRequest(request: Request): Promise<Response> {
    const apiKey = extractApiKey(request);
    if (!apiKey) {
        return jsonError(
            "Missing or invalid Authorization header. Expected: Bearer <MISTRAL_API_KEY>",
            401
        );
    }

    const contentType = request.headers.get("Content-Type") || "";
    let ocrResponse: MistralOCRResponse;

    // Mode 1: Process by Mistral File ID (Direct Upload from Client)
    if (contentType.includes("application/json")) {
        try {
            const body = await request.json() as { mistral_file_id?: string };
            if (!body.mistral_file_id) {
                return jsonError("Missing mistral_file_id in JSON body", 400);
            }

            const signedUrl = await getSignedUrl(body.mistral_file_id, apiKey);

            const requestBody = {
                model: MISTRAL_OCR_MODEL,
                document: {
                    type: "document_url",
                    document_url: signedUrl,
                },
                extract_header: true,
                extract_footer: true,
                include_image_base64: false,
            };

            const response = await fetch(MISTRAL_OCR_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Mistral OCR API error: ${response.status} ${errorText}`);
            }

            ocrResponse = (await response.json()) as MistralOCRResponse;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return jsonError(`OCR processing failed: ${errorMessage}`, 500);
        }
    }
    // Mode 2: Upload and Process (Legacy / Fallback)
    else {
        const pdfData = await extractPdfFromRequest(request);
        if (!pdfData) {
            return jsonError(
                "No valid PDF file found in request. Send JSON with { mistral_file_id } OR multipart/form-data with 'file'",
                400
            );
        }

        // Pre-check Content-Length to avoid OOM
        const contentLength = request.headers.get("Content-Length");
        const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

        if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
            const sizeMb = (parseInt(contentLength) / 1024 / 1024).toFixed(2);
            return jsonError(
                `File too large. Maximum size is 50MB. Your upload: ${sizeMb}MB`,
                413
            );
        }

        try {
            ocrResponse = await callMistralOCR(pdfData.data, pdfData.filename, apiKey);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error occurred";

            if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
                return jsonError(`Invalid API Key: ${errorMessage}`, 401);
            }
            if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
                return jsonError(`Rate limit exceeded: ${errorMessage}`, 429);
            }

            return jsonError(`OCR processing failed: ${errorMessage}`, 500);
        }
    }

    const markdown = processOCRToMarkdown(ocrResponse);

    if (!markdown) {
        return jsonError(
            "No text content could be extracted from the PDF. The document may be empty or contain only images without text.",
            422
        );
    }

    return markdownResponse(markdown);
}

async function handleBatchCreate(
    request: Request,
    env: Env,
    userId: string,
    setCookie?: string
): Promise<Response> {
    const apiKey = extractApiKey(request);
    if (!apiKey) {
        return jsonError("Missing Authorization header", 401, setCookie);
    }

    let uploadedFiles: { name: string; mistral_file_id: string }[] = [];
    const contentType = request.headers.get("Content-Type") || "";

    // Mode 1: Direct File IDs (JSON)
    if (contentType.includes("application/json")) {
        try {
            const body = await request.json() as { files: { name: string; mistral_file_id: string }[] };
            if (body.files && Array.isArray(body.files)) {
                uploadedFiles = body.files;
            }
        } catch {
            // Ignore JSON parse errors, fall back to multipart
        }
    }

    // Mode 2: Legacy Multipart Upload (if Mode 1 didn't provide files)
    if (uploadedFiles.length === 0) {
        // Pre-check Content-Length
        const contentLength = request.headers.get("Content-Length");
        const MAX_BATCH_SIZE = 50 * 1024 * 1024; // 50MB total limit

        if (contentLength && parseInt(contentLength) > MAX_BATCH_SIZE) {
            const sizeMb = (parseInt(contentLength) / 1024 / 1024).toFixed(2);
            return jsonError(
                `Total batch size too large. Maximum is 50MB. Your upload: ${sizeMb}MB`,
                413,
                setCookie
            );
        }

        const rawFiles = await extractMultiplePdfsFromRequest(request);
        if (rawFiles.length === 0) {
            return jsonError("No PDF files found in request", 400, setCookie);
        }

        // Upload files to Mistral now
        for (const file of rawFiles) {
            try {
                const fileId = await uploadFileToMistral(file.data, file.filename, apiKey, "ocr");
                uploadedFiles.push({ name: file.filename, mistral_file_id: fileId });
            } catch (error) {
                return jsonError(`Failed to upload file ${file.filename} to Mistral`, 500, setCookie);
            }
        }
    }

    // Create batch job record
    const jobId = `batch_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const jobRecord: BatchJobRecord = {
        id: jobId,
        user_id: userId,
        mistral_batch_id: "",
        status: "processing", // Files are already on Mistral
        files: uploadedFiles,
        created_at: now,
        updated_at: now,
    };

    // Save initial record
    await env.BATCH_JOBS.put(
        `batch:${userId}:${jobId}`,
        JSON.stringify(jobRecord),
        { expirationTtl: BATCH_JOB_TTL }
    );

    try {
        // Create Mistral batch job
        const mistralJob = await createMistralBatchJob(
            uploadedFiles.map(f => f.mistral_file_id),
            apiKey
        );

        jobRecord.mistral_batch_id = mistralJob.id;
        await env.BATCH_JOBS.put(
            `batch:${userId}:${jobId}`,
            JSON.stringify(jobRecord),
            { expirationTtl: BATCH_JOB_TTL }
        );

        return jsonResponse({
            job_id: jobId,
            status: "processing",
            file_count: uploadedFiles.length,
            created_at: now,
        }, 201, setCookie);

    } catch (error) {
        jobRecord.status = "failed";
        jobRecord.error = error instanceof Error ? error.message : "Unknown error";
        jobRecord.updated_at = new Date().toISOString();

        await env.BATCH_JOBS.put(
            `batch:${userId}:${jobId}`,
            JSON.stringify(jobRecord),
            { expirationTtl: BATCH_JOB_TTL }
        );

        return jsonError(`Failed to create batch job: ${jobRecord.error}`, 500, setCookie);
    }
}



async function handleBatchStatus(
    request: Request,
    env: Env,
    userId: string,
    setCookie?: string
): Promise<Response> {
    const url = new URL(request.url);
    const jobId = url.searchParams.get("id");

    if (!jobId) {
        return jsonError("Missing job id parameter", 400, setCookie);
    }

    const apiKey = extractApiKey(request);
    if (!apiKey) {
        return jsonError("Missing Authorization header", 401, setCookie);
    }

    const recordStr = await env.BATCH_JOBS.get(`batch:${userId}:${jobId}`);
    if (!recordStr) {
        return jsonError("Job not found", 404, setCookie);
    }

    const record: BatchJobRecord = JSON.parse(recordStr);

    // If job is still processing, check Mistral status
    if (record.status === "processing" && record.mistral_batch_id) {
        try {
            const mistralStatus = await getMistralBatchJobStatus(record.mistral_batch_id, apiKey);

            if (mistralStatus.status === "SUCCESS") {
                record.status = "completed";
                record.updated_at = new Date().toISOString();

                // Download and parse results
                if (mistralStatus.output_file) {
                    const resultsContent = await downloadBatchResults(mistralStatus.output_file, apiKey);
                    const results: { file_name: string; markdown: string; error?: string }[] = [];

                    // Parse JSONL results
                    const lines = resultsContent.trim().split("\n");
                    for (let i = 0; i < lines.length; i++) {
                        try {
                            const line = JSON.parse(lines[i]);
                            const markdown = processOCRToMarkdown(line.response?.body || {});
                            results.push({
                                file_name: record.files[i]?.name || `file_${i}.pdf`,
                                markdown: markdown,
                            });
                        } catch {
                            results.push({
                                file_name: record.files[i]?.name || `file_${i}.pdf`,
                                markdown: "",
                                error: "Failed to parse result",
                            });
                        }
                    }

                    record.results = results;
                }

                await env.BATCH_JOBS.put(
                    `batch:${userId}:${jobId}`,
                    JSON.stringify(record),
                    { expirationTtl: BATCH_JOB_TTL }
                );
            } else if (mistralStatus.status === "FAILED" || mistralStatus.status === "CANCELLED") {
                record.status = "failed";
                record.error = `Mistral job ${mistralStatus.status.toLowerCase()}`;
                record.updated_at = new Date().toISOString();

                await env.BATCH_JOBS.put(
                    `batch:${userId}:${jobId}`,
                    JSON.stringify(record),
                    { expirationTtl: BATCH_JOB_TTL }
                );
            }

            return jsonResponse({
                job_id: record.id,
                status: record.status,
                files: record.files.map(f => f.name),
                progress: {
                    total: mistralStatus.total_requests || record.files.length,
                    succeeded: mistralStatus.succeeded_requests || 0,
                    failed: mistralStatus.failed_requests || 0,
                },
                created_at: record.created_at,
                updated_at: record.updated_at,
                error: record.error,
            }, 200, setCookie);

        } catch (error) {
            // Return current status if we can't check Mistral
            return jsonResponse({
                job_id: record.id,
                status: record.status,
                files: record.files.map(f => f.name),
                created_at: record.created_at,
                updated_at: record.updated_at,
                error: record.error,
            }, 200, setCookie);
        }
    }

    return jsonResponse({
        job_id: record.id,
        status: record.status,
        files: record.files.map(f => f.name),
        created_at: record.created_at,
        updated_at: record.updated_at,
        error: record.error,
    }, 200, setCookie);
}

async function handleBatchResults(
    request: Request,
    env: Env,
    userId: string,
    setCookie?: string
): Promise<Response> {
    const url = new URL(request.url);
    const jobId = url.searchParams.get("id");

    if (!jobId) {
        return jsonError("Missing job id parameter", 400, setCookie);
    }

    const recordStr = await env.BATCH_JOBS.get(`batch:${userId}:${jobId}`);
    if (!recordStr) {
        return jsonError("Job not found", 404, setCookie);
    }

    const record: BatchJobRecord = JSON.parse(recordStr);

    if (record.status !== "completed") {
        return jsonError(`Job not completed. Current status: ${record.status}`, 400, setCookie);
    }

    return jsonResponse({
        job_id: record.id,
        status: record.status,
        results: record.results || [],
    }, 200, setCookie);
}

async function handleBatchList(
    request: Request,
    env: Env,
    userId: string,
    setCookie?: string
): Promise<Response> {
    try {
        const list = await env.BATCH_JOBS.list({ prefix: `batch:${userId}:` });

        const jobs: {
            job_id: string;
            status: string;
            files: string[];
            created_at: string;
            updated_at: string;
        }[] = [];

        for (const key of list.keys) {
            try {
                const recordStr = await env.BATCH_JOBS.get(key.name);
                if (recordStr) {
                    const record: BatchJobRecord = JSON.parse(recordStr);
                    jobs.push({
                        job_id: record.id,  // Use job_id for frontend compatibility
                        status: record.status,
                        files: record.files?.map(f => f.name) || [],  // Convert to string array
                        created_at: record.created_at,
                        updated_at: record.updated_at,
                    });
                }
            } catch (parseError) {
                // Skip invalid records
                console.error("Failed to parse batch record:", parseError);
            }
        }

        // Sort by created_at descending
        jobs.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

        return jsonResponse({ jobs }, 200, setCookie);
    } catch (error) {
        console.error("handleBatchList error:", error);
        return jsonResponse({ jobs: [] }, 200, setCookie);
    }
}

// ============================================================================
// Main Entry Point
// ============================================================================

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const method = request.method.toUpperCase();
        const path = url.pathname;

        // Handle CORS preflight
        if (method === "OPTIONS") {
            return handleCORSPreflight(request);
        }

        // Set global request for CORS helpers
        currentRequest = request;

        // Get or create user ID
        const { userId, isNew } = getUserId(request);
        const setCookie = isNew ? createUserCookie(userId) : undefined;

        // Health check endpoint
        if (method === "GET" && (path === "/" || path === "/health")) {
            return addCORSHeaders(
                new Response(
                    JSON.stringify({
                        status: "ok",
                        service: "Legal Document OCR API",
                        version: "2.1.0",
                        modes: {
                            standard: {
                                endpoint: "POST /",
                                description: "Synchronous OCR processing",
                            },
                            batch: {
                                create: "POST /batch/create",
                                status: "GET /batch/status?id=xxx",
                                results: "GET /batch/results?id=xxx",
                                list: "GET /batch/list",
                                description: "Asynchronous batch processing (50% cheaper)",
                            },
                        },
                    }),
                    {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    }
                ),
                request,
                setCookie
            );
        }

        // Standard OCR endpoint
        if (method === "POST" && (path === "/" || path === "/ocr")) {
            try {
                const response = await handleOCRRequest(request);
                return setCookie ? addCORSHeaders(response, request, setCookie) : response;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Internal Worker Error";
                return jsonError(`Critical Worker Error: ${errorMessage}`, 500, setCookie);
            }
        }

        // Batch endpoints
        if (path.startsWith("/batch")) {
            if (method === "POST" && path === "/batch/create") {
                return handleBatchCreate(request, env, userId, setCookie);
            }
            if (method === "GET" && path === "/batch/status") {
                return handleBatchStatus(request, env, userId, setCookie);
            }
            if (method === "GET" && path === "/batch/results") {
                return handleBatchResults(request, env, userId, setCookie);
            }
            if (method === "GET" && path === "/batch/list") {
                return handleBatchList(request, env, userId, setCookie);
            }
        }

        // Method not allowed
        return jsonError(`Method ${method} not allowed for ${path}`, 405, setCookie);
    },
};
