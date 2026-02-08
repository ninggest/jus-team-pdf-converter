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
 */

// ============================================================================
// Type Definitions
// ============================================================================

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

// ============================================================================
// CORS Configuration
// ============================================================================

const CORS_HEADERS: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400", // Cache preflight for 24 hours
};

/**
 * Handle CORS preflight requests
 */
function handleCORSPreflight(): Response {
    return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
    });
}

/**
 * Add CORS headers to a response
 */
function addCORSHeaders(response: Response): Response {
    const newHeaders = new Headers(response.headers);
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        newHeaders.set(key, value);
    });
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
    });
}

// ============================================================================
// Response Helpers
// ============================================================================

/**
 * Create a JSON error response
 */
function jsonError(message: string, status: number): Response {
    return addCORSHeaders(
        new Response(JSON.stringify({ error: message }), {
            status,
            headers: { "Content-Type": "application/json" },
        })
    );
}

/**
 * Create a plain text/markdown response
 */
function markdownResponse(content: string): Response {
    return addCORSHeaders(
        new Response(content, {
            status: 200,
            headers: {
                "Content-Type": "text/markdown; charset=utf-8",
            },
        })
    );
}

// ============================================================================
// API Key Extraction
// ============================================================================

/**
 * Extract API key from Authorization header
 * Expected format: "Bearer <API_KEY>"
 */
function extractApiKey(request: Request): string | null {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
        return null;
    }

    // Support both "Bearer " and "bearer " (case-insensitive)
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!bearerMatch) {
        return null;
    }

    return bearerMatch[1].trim();
}

// ============================================================================
// PDF Extraction from Request
// ============================================================================

/**
 * Extract PDF content from the request
 * Supports:
 * - multipart/form-data with a "file" field
 * - direct binary upload (application/pdf or application/octet-stream)
 */
async function extractPdfFromRequest(
    request: Request
): Promise<{ data: ArrayBuffer; filename: string } | null> {
    const contentType = request.headers.get("Content-Type") || "";

    // Handle multipart/form-data
    if (contentType.includes("multipart/form-data")) {
        try {
            const formData = await request.formData();
            const file = formData.get("file");

            // In Cloudflare Workers, check if it's a Blob-like object with arrayBuffer method
            if (!file || typeof file === "string") {
                return null;
            }

            // Cast to File type (Cloudflare Workers provides File-like objects)
            const fileBlob = file as unknown as {
                arrayBuffer: () => Promise<ArrayBuffer>;
                name?: string;
                type?: string;
            };

            // Validate that it's a PDF by checking type or filename
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

    // Handle direct binary upload
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

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// ============================================================================
// Mistral OCR API Integration
// ============================================================================

const MISTRAL_OCR_ENDPOINT = "https://api.mistral.ai/v1/ocr";
const MISTRAL_OCR_MODEL = "mistral-ocr-latest";

/**
 * Call the Mistral OCR API
 */
async function callMistralOCR(
    pdfBase64: string,
    apiKey: string
): Promise<MistralOCRResponse> {
    const requestBody = {
        model: MISTRAL_OCR_MODEL,
        document: {
            type: "document_url",
            document_url: `data:application/pdf;base64,${pdfBase64}`,
        },
        // Key for legal documents: extract headers/footers separately
        // This allows us to exclude page numbers, case references, etc.
        extract_header: true,
        extract_footer: true,
        // We don't need images, just text
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
// Markdown Processing
// ============================================================================

/**
 * Process the OCR response and extract clean Markdown
 *
 * For legal documents, we:
 * 1. Only use the main `markdown` field (headers/footers are already separated)
 * 2. Join pages with double newlines for proper paragraph separation
 * 3. Optionally clean up common legal document artifacts
 */
function processOCRToMarkdown(ocrResponse: MistralOCRResponse): string {
    if (!ocrResponse.pages || ocrResponse.pages.length === 0) {
        return "";
    }

    // Sort pages by index to ensure correct order
    const sortedPages = [...ocrResponse.pages].sort((a, b) => a.index - b.index);

    // Extract markdown from each page (excluding header/footer which are separate)
    const markdownParts = sortedPages
        .map((page) => page.markdown)
        .filter((md) => md && md.trim().length > 0);

    // Join with double newlines for paragraph separation between pages
    let combinedMarkdown = markdownParts.join("\n\n");

    // Optional: Clean up common artifacts in legal documents
    combinedMarkdown = cleanLegalDocumentMarkdown(combinedMarkdown);

    return combinedMarkdown;
}

/**
 * Clean up common artifacts in legal document Markdown
 */
function cleanLegalDocumentMarkdown(markdown: string): string {
    let cleaned = markdown;

    // Remove excessive blank lines (more than 2 consecutive)
    cleaned = cleaned.replace(/\n{4,}/g, "\n\n\n");

    // Trim leading/trailing whitespace
    cleaned = cleaned.trim();

    return cleaned;
}

// ============================================================================
// Main Request Handler
// ============================================================================

async function handleOCRRequest(request: Request): Promise<Response> {
    // 1. Extract API Key from Authorization header
    const apiKey = extractApiKey(request);
    if (!apiKey) {
        return jsonError(
            "Missing or invalid Authorization header. Expected: Bearer <MISTRAL_API_KEY>",
            401
        );
    }

    // 2. Extract PDF from request
    const pdfData = await extractPdfFromRequest(request);
    if (!pdfData) {
        return jsonError(
            "No valid PDF file found in request. Send as multipart/form-data with 'file' field or as binary with Content-Type: application/pdf",
            400
        );
    }

    // 3. Validate file size (Mistral has a 50MB limit)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (pdfData.data.byteLength > MAX_FILE_SIZE) {
        return jsonError(
            `File too large. Maximum size is 50MB. Your file: ${(pdfData.data.byteLength / 1024 / 1024).toFixed(2)}MB`,
            413
        );
    }

    // 4. Convert PDF to Base64
    const pdfBase64 = arrayBufferToBase64(pdfData.data);

    // 5. Call Mistral OCR API
    let ocrResponse: MistralOCRResponse;
    try {
        ocrResponse = await callMistralOCR(pdfBase64, apiKey);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";

        // Return appropriate status based on error
        if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
            return jsonError(`Invalid API Key: ${errorMessage}`, 401);
        }
        if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
            return jsonError(`Rate limit exceeded: ${errorMessage}`, 429);
        }

        return jsonError(`OCR processing failed: ${errorMessage}`, 500);
    }

    // 6. Process OCR response to clean Markdown
    const markdown = processOCRToMarkdown(ocrResponse);

    if (!markdown) {
        return jsonError(
            "No text content could be extracted from the PDF. The document may be empty or contain only images without text.",
            422
        );
    }

    // 7. Return the Markdown
    return markdownResponse(markdown);
}

// ============================================================================
// Main Entry Point
// ============================================================================

export default {
    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const method = request.method.toUpperCase();

        // Handle CORS preflight
        if (method === "OPTIONS") {
            return handleCORSPreflight();
        }

        // Health check endpoint
        if (method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
            return addCORSHeaders(
                new Response(
                    JSON.stringify({
                        status: "ok",
                        service: "Legal Document OCR API",
                        version: "1.0.0",
                        usage: {
                            method: "POST",
                            headers: {
                                Authorization: "Bearer <YOUR_MISTRAL_API_KEY>",
                                "Content-Type":
                                    "multipart/form-data OR application/pdf",
                            },
                            body: 'PDF file (as form field "file" or binary body)',
                            response: "text/markdown",
                        },
                    }),
                    {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    }
                )
            );
        }

        // OCR endpoint - POST only
        if (method === "POST") {
            return handleOCRRequest(request);
        }

        // Method not allowed
        return jsonError(`Method ${method} not allowed. Use POST to upload a PDF.`, 405);
    },
};
