import {
    MISTRAL_FILES_ENDPOINT,
    MISTRAL_OCR_ENDPOINT,
    MISTRAL_BATCH_ENDPOINT,
    MISTRAL_OCR_MODEL,
} from "../config";
import type {
    MistralFileUploadResponse,
    MistralSignedUrlResponse,
    MistralOCRResponse,
    MistralErrorResponse,
    MistralBatchJob,
} from "../types";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = MAX_RETRIES
): Promise<Response> {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);

            // Handle Rate Limits (429)
            if (response.status === 429) {
                const retryAfter = response.headers.get("Retry-After");
                const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : Math.pow(2, i);
                console.warn(`Mistral rate limit (429). Retrying in ${waitSeconds}s...`);
                await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
                continue;
            }

            // Retry on 5xx server errors
            if (!response.ok && response.status >= 500) {
                const errorText = await response.text();
                throw new Error(`Mistral API error ${response.status}: ${errorText}`);
            }

            // If success (2xx) or client error (4xx) that is not 429, return immediately
            return response;

        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            console.warn(`Mistral fetch attempt ${i + 1} failed: ${lastError.message}`);

            // If it's the last attempt, don't wait
            if (i < retries - 1) {
                // Exponential backoff
                const delay = RETRY_DELAY * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError || new Error("Mistral fetch failed after retries");
}

export async function uploadFileToMistral(
    pdfData: ArrayBuffer,
    filename: string,
    apiKey: string,
    purpose: "ocr" = "ocr"
): Promise<string> {
    const formData = new FormData();
    const blob = new Blob([pdfData], { type: "application/pdf" });
    formData.append("file", blob, filename);
    formData.append("purpose", purpose);

    const response = await fetchWithRetry(MISTRAL_FILES_ENDPOINT, {
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

export async function getSignedUrl(fileId: string, apiKey: string): Promise<string> {
    const response = await fetchWithRetry(`${MISTRAL_FILES_ENDPOINT}/${fileId}/url`, {
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

export async function callMistralOCR(
    pdfData: ArrayBuffer,
    filename: string,
    apiKey: string
): Promise<MistralOCRResponse> {
    const fileId = await uploadFileToMistral(pdfData, filename, apiKey);
    const signedUrl = await getSignedUrl(fileId, apiKey);

    return callMistralOCRWithUrl(signedUrl, apiKey);
}

export async function callMistralOCRWithUrl(
    signedUrl: string,
    apiKey: string
): Promise<MistralOCRResponse> {
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

    const response = await fetchWithRetry(MISTRAL_OCR_ENDPOINT, {
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

export async function createMistralBatchJob(
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

    const response = await fetchWithRetry(MISTRAL_BATCH_ENDPOINT, {
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

export async function getMistralBatchJobStatus(
    batchId: string,
    apiKey: string
): Promise<MistralBatchJob> {
    const response = await fetchWithRetry(`${MISTRAL_BATCH_ENDPOINT}/${batchId}`, {
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

export async function downloadBatchResults(
    outputFileId: string,
    apiKey: string
): Promise<string> {
    const response = await fetchWithRetry(`${MISTRAL_FILES_ENDPOINT}/${outputFileId}/content`, {
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

// Processing Helpers

export function cleanLegalDocumentMarkdown(markdown: string): string {
    let cleaned = markdown;
    cleaned = cleaned.replace(/\n{4,}/g, "\n\n\n");
    cleaned = cleaned.trim();
    return cleaned;
}

export function processOCRToMarkdown(ocrResponse: MistralOCRResponse): string {
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
