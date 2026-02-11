/**
 * Batch API client for Mistral OCR batch processing
 */

export interface BatchJob {
    job_id: string;
    status: "queued" | "uploading" | "processing" | "completed" | "failed";
    files: string[];
    progress?: {
        total: number;
        succeeded: number;
        failed: number;
    };
    created_at: string;
    updated_at?: string;
    error?: string;
}

export interface BatchResult {
    file_name: string;
    markdown: string;
    error?: string;
}

export interface BatchResultsResponse {
    job_id: string;
    status: string;
    results: BatchResult[];
}

export interface BatchListResponse {
    jobs: BatchJob[];
}

/**
 * Create a new batch OCR job
 */
import { uploadToMistral } from "./mistralClient";

/**
 * Create a new batch OCR job
 * Uses Direct Upload:
 * 1. Uploads files to Mistral client-side
 * 2. Sends IDs to Worker to start batch
 */
export async function createBatchJob(
    files: File[],
    apiKey: string,
    workerUrl: string,
    accessCode: string
): Promise<BatchJob> {

    // 1. Upload all files to Mistral in parallel
    const uploadedFiles = await Promise.all(
        files.map(async (file) => {
            try {
                const id = await uploadToMistral(file, apiKey);
                return { name: file.name, mistral_file_id: id };
            } catch (error) {
                console.error(`Failed to upload ${file.name}:`, error);
                throw new Error(`Failed to upload ${file.name} to Mistral`);
            }
        })
    );

    // 2. Create Batch Job on Worker with File IDs
    const response = await fetch(`${workerUrl}/batch/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "X-Access-Code": accessCode,
        },
        body: JSON.stringify({ files: uploadedFiles }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as { error?: string }).error || `Failed to create batch job: ${response.status}`);
    }

    return (await response.json()) as BatchJob;
}

/**
 * Get the status of a batch job
 */
export async function getBatchStatus(
    jobId: string,
    apiKey: string,
    workerUrl: string,
    accessCode: string
): Promise<BatchJob> {
    const response = await fetch(`${workerUrl}/batch/status?id=${encodeURIComponent(jobId)}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "X-Access-Code": accessCode,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as { error?: string }).error || `Failed to get batch status: ${response.status}`);
    }

    return (await response.json()) as BatchJob;
}

/**
 * Get the results of a completed batch job
 */
export async function getBatchResults(
    jobId: string,
    apiKey: string,
    workerUrl: string,
    accessCode: string
): Promise<BatchResultsResponse> {
    const response = await fetch(`${workerUrl}/batch/results?id=${encodeURIComponent(jobId)}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "X-Access-Code": accessCode,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as { error?: string }).error || `Failed to get batch results: ${response.status}`);
    }

    return (await response.json()) as BatchResultsResponse;
}

/**
 * List all batch jobs for the current user (using Access Code)
 */
export async function listBatchJobs(workerUrl: string, accessCode: string): Promise<BatchListResponse> {
    const response = await fetch(`${workerUrl}/batch/list`, {
        method: "GET",
        headers: {
            "X-Access-Code": accessCode,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as { error?: string }).error || `Failed to list batch jobs: ${response.status}`);
    }

    return (await response.json()) as BatchListResponse;
}

/**
 * Poll batch job status until completed or failed
 */
export async function pollBatchStatus(
    jobId: string,
    apiKey: string,
    workerUrl: string,
    accessCode: string,
    onStatusChange: (status: BatchJob) => void,
    intervalMs = 5000,
    maxAttempts = 120 // 10 minutes max with 5s interval
): Promise<BatchJob> {
    let attempts = 0;

    while (attempts < maxAttempts) {
        const status = await getBatchStatus(jobId, apiKey, workerUrl, accessCode);
        onStatusChange(status);

        if (status.status === "completed" || status.status === "failed") {
            return status;
        }

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
        attempts++;
    }

    throw new Error("Batch job timed out");
}
