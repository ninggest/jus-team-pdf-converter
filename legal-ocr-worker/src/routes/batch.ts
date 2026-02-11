import type { Env, BatchJobRecord } from "../types";
import { BATCH_JOB_TTL } from "../config";
import {
    createMistralBatchJob,
    getMistralBatchJobStatus,
    downloadBatchResults,
    processOCRToMarkdown,
    uploadFileToMistral
} from "../services/mistral";
import { saveBatchJob, getBatchJob, listBatchJobs as listStorageBatchJobs } from "../services/storage";
import { extractApiKey } from "../utils/auth";
import { extractMultiplePdfsFromRequest } from "../utils/file";
import { jsonError, jsonResponse } from "../utils/response";

export async function handleBatchCreate(
    request: Request,
    env: Env,
    userId: string,
    setCookie?: string
): Promise<Response> {
    const apiKey = extractApiKey(request);
    if (!apiKey) {
        return jsonError("Missing Authorization header", 401, request, setCookie);
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
                request,
                setCookie
            );
        }

        const rawFiles = await extractMultiplePdfsFromRequest(request);
        if (rawFiles.length === 0) {
            return jsonError("No PDF files found in request", 400, request, setCookie);
        }

        // Upload files to Mistral now
        for (const file of rawFiles) {
            try {
                const fileId = await uploadFileToMistral(file.data, file.filename, apiKey, "ocr");
                uploadedFiles.push({ name: file.filename, mistral_file_id: fileId });
            } catch (error) {
                return jsonError(`Failed to upload file ${file.filename} to Mistral`, 500, request, setCookie);
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
    await saveBatchJob(env, jobRecord);

    try {
        // Create Mistral batch job
        const mistralJob = await createMistralBatchJob(
            uploadedFiles.map(f => f.mistral_file_id),
            apiKey
        );

        jobRecord.mistral_batch_id = mistralJob.id;
        await saveBatchJob(env, jobRecord);

        return jsonResponse({
            job_id: jobId,
            status: "processing",
            file_count: uploadedFiles.length,
            created_at: now,
        }, 201, request, setCookie);

    } catch (error) {
        jobRecord.status = "failed";
        jobRecord.error = error instanceof Error ? error.message : "Unknown error";
        jobRecord.updated_at = new Date().toISOString();

        await saveBatchJob(env, jobRecord);

        return jsonError(`Failed to create batch job: ${jobRecord.error}`, 500, request, setCookie);
    }
}

export async function handleBatchStatus(
    request: Request,
    env: Env,
    userId: string,
    setCookie?: string
): Promise<Response> {
    const url = new URL(request.url);
    const jobId = url.searchParams.get("id");

    if (!jobId) {
        return jsonError("Missing job id parameter", 400, request, setCookie);
    }

    const apiKey = extractApiKey(request);
    if (!apiKey) {
        return jsonError("Missing Authorization header", 401, request, setCookie);
    }

    const record = await getBatchJob(env, userId, jobId);

    if (!record) {
        return jsonError("Job not found", 404, request, setCookie);
    }

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

                await saveBatchJob(env, record);

            } else if (mistralStatus.status === "FAILED" || mistralStatus.status === "CANCELLED") {
                record.status = "failed";
                record.error = `Mistral job ${mistralStatus.status.toLowerCase()}`;
                record.updated_at = new Date().toISOString();

                await saveBatchJob(env, record);
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
            }, 200, request, setCookie);

        } catch (error) {
            // Return current status if we can't check Mistral
            return jsonResponse({
                job_id: record.id,
                status: record.status,
                files: record.files.map(f => f.name),
                created_at: record.created_at,
                updated_at: record.updated_at,
                error: record.error,
            }, 200, request, setCookie);
        }
    }

    return jsonResponse({
        job_id: record.id,
        status: record.status,
        files: record.files.map(f => f.name),
        created_at: record.created_at,
        updated_at: record.updated_at,
        error: record.error,
    }, 200, request, setCookie);
}

export async function handleBatchResults(
    request: Request,
    env: Env,
    userId: string,
    setCookie?: string
): Promise<Response> {
    const url = new URL(request.url);
    const jobId = url.searchParams.get("id");

    if (!jobId) {
        return jsonError("Missing job id parameter", 400, request, setCookie);
    }

    const record = await getBatchJob(env, userId, jobId);

    if (!record) {
        return jsonError("Job not found", 404, request, setCookie);
    }

    if (record.status !== "completed") {
        return jsonError(`Job not completed. Current status: ${record.status}`, 400, request, setCookie);
    }

    return jsonResponse({
        job_id: record.id,
        status: record.status,
        results: record.results || [],
    }, 200, request, setCookie);
}

export async function handleBatchList(
    request: Request,
    env: Env,
    userId: string,
    setCookie?: string
): Promise<Response> {
    try {
        const jobs = await listStorageBatchJobs(env, userId);

        const jobList = jobs.map(record => ({
            job_id: record.id,  // Use job_id for frontend compatibility
            status: record.status,
            files: record.files?.map(f => f.name) || [],  // Convert to string array
            created_at: record.created_at,
            updated_at: record.updated_at,
        }));

        return jsonResponse({ jobs: jobList }, 200, request, setCookie);
    } catch (error) {
        console.error("handleBatchList error:", error);
        return jsonResponse({ jobs: [] }, 200, request, setCookie);
    }
}
