import type { Env, BatchJobRecord } from "../types";
import { BATCH_JOB_TTL } from "../config";

export async function saveBatchJob(
    env: Env,
    job: BatchJobRecord
): Promise<void> {
    const key = `batch:${job.user_id}:${job.id}`;
    await env.BATCH_JOBS.put(key, JSON.stringify(job), {
        expirationTtl: BATCH_JOB_TTL,
    });
}

export async function getBatchJob(
    env: Env,
    userId: string,
    jobId: string
): Promise<BatchJobRecord | null> {
    const key = `batch:${userId}:${jobId}`;
    const recordStr = await env.BATCH_JOBS.get(key);

    if (!recordStr) {
        return null;
    }

    try {
        return JSON.parse(recordStr) as BatchJobRecord;
    } catch {
        return null; // Or handle parsing error?
    }
}

export async function listBatchJobs(
    env: Env,
    userId: string
): Promise<BatchJobRecord[]> {
    const list = await env.BATCH_JOBS.list({ prefix: `batch:${userId}:` });
    const jobs: BatchJobRecord[] = [];

    for (const key of list.keys) {
        try {
            const recordStr = await env.BATCH_JOBS.get(key.name);
            if (recordStr) {
                const record = JSON.parse(recordStr) as BatchJobRecord;
                jobs.push(record);
            }
        } catch (parseError) {
            console.error("Failed to parse batch record:", parseError);
        }
    }

    // Sort by created_at descending
    jobs.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

    return jobs;
}
