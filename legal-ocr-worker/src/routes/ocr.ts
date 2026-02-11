import type { MistralOCRResponse } from "../types";
import { MISTRAL_OCR_MODEL } from "../config";
import { callMistralOCR, processOCRToMarkdown, getSignedUrl, callMistralOCRWithUrl } from "../services/mistral";
import { extractApiKey } from "../utils/auth";
import { extractPdfFromRequest } from "../utils/file";
import { jsonError, markdownResponse } from "../utils/response";

export async function handleOCRRequest(request: Request): Promise<Response> {
    const apiKey = extractApiKey(request);
    if (!apiKey) {
        return jsonError(
            "Missing or invalid Authorization header. Expected: Bearer <MISTRAL_API_KEY>",
            401,
            request
        );
    }

    const contentType = request.headers.get("Content-Type") || "";
    let ocrResponse: MistralOCRResponse;

    // Mode 1: Process by Mistral File ID (Direct Upload from Client)
    if (contentType.includes("application/json")) {
        try {
            const body = (await request.json()) as { mistral_file_id?: string };
            if (!body.mistral_file_id) {
                return jsonError("Missing mistral_file_id in JSON body", 400, request);
            }

            const signedUrl = await getSignedUrl(body.mistral_file_id, apiKey);
            ocrResponse = await callMistralOCRWithUrl(signedUrl, apiKey);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return jsonError(`OCR processing failed: ${errorMessage}`, 500, request);
        }
    }
    // Mode 2: Upload and Process (Legacy / Fallback)
    else {
        const pdfData = await extractPdfFromRequest(request);
        if (!pdfData) {
            return jsonError(
                "No valid PDF file found in request. Send JSON with { mistral_file_id } OR multipart/form-data with 'file'",
                400,
                request
            );
        }

        // Pre-check Content-Length to avoid OOM
        const contentLength = request.headers.get("Content-Length");
        const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

        if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
            const sizeMb = (parseInt(contentLength) / 1024 / 1024).toFixed(2);
            return jsonError(
                `File too large. Maximum size is 50MB. Your upload: ${sizeMb}MB`,
                413,
                request
            );
        }

        try {
            ocrResponse = await callMistralOCR(pdfData.data, pdfData.filename, apiKey);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error occurred";

            if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
                return jsonError(`Invalid API Key: ${errorMessage}`, 401, request);
            }
            if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
                return jsonError(`Rate limit exceeded: ${errorMessage}`, 429, request);
            }

            return jsonError(`OCR processing failed: ${errorMessage}`, 500, request);
        }
    }

    const markdown = processOCRToMarkdown(ocrResponse);

    if (!markdown) {
        return jsonError(
            "No text content could be extracted from the PDF. The document may be empty or contain only images without text.",
            422,
            request
        );
    }

    return markdownResponse(markdown, request);
}
