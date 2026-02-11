/**
 * Batch processor utility for sequential file processing
 */

export interface FileItem {
    id: string;
    file: File;
    status: "queued" | "processing" | "completed" | "failed";
    markdown?: string;
    error?: string;
}

export type FileUpdateCallback = (id: string, update: Partial<FileItem>) => void;

/**
 * Process a single file through the OCR API
 */
import { uploadToMistral } from "./mistralClient";

/**
 * Process a single file through the OCR API
 * Now uses Direct Upload pattern:
 * 1. Upload to Mistral directly -> get ID
 * 2. Send ID to Worker -> get Markdown
 */
async function processFile(
    file: File,
    apiKey: string,
    workerUrl: string
): Promise<string> {
    // 1. Upload directly to Mistral (Bypasses Worker 50MB limit)
    let fileId: string;
    try {
        fileId = await uploadToMistral(file, apiKey);
    } catch (error) {
        throw new Error(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // 2. Call Worker with Reference ID
    const response = await fetch(workerUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ mistral_file_id: fileId, filename: file.name }),
    });

    if (!response.ok) {
        let errorMessage = `Error: ${response.status} ${response.statusText}`;
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch {
                // Keep default error message
            }
        }
        throw new Error(errorMessage);
    }

    const markdown = await response.text();
    if (!markdown || markdown.trim().length === 0) {
        throw new Error("No content extracted from the document.");
    }

    return markdown;
}

/**
 * Process files sequentially to avoid rate limits
 */
export async function processFilesSequentially(
    files: FileItem[],
    apiKey: string,
    workerUrl: string,
    onUpdate: FileUpdateCallback,
    shouldStop: () => boolean
): Promise<void> {
    for (const fileItem of files) {
        // Check if we should stop processing
        if (shouldStop()) {
            break;
        }

        // Skip already processed files
        if (fileItem.status !== "queued") {
            continue;
        }

        // Mark as processing
        onUpdate(fileItem.id, { status: "processing" });

        try {
            const markdown = await processFile(fileItem.file, apiKey, workerUrl);
            onUpdate(fileItem.id, { status: "completed", markdown });
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error occurred";
            onUpdate(fileItem.id, { status: "failed", error: errorMessage });
        }
    }
}

/**
 * Generate unique ID for file items
 */
export function generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
