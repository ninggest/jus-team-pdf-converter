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

export async function getSignedUrl(fileId: string, apiKey: string): Promise<string> {
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

export async function getMistralBatchJobStatus(
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

export async function downloadBatchResults(
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
