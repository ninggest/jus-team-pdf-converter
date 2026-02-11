import type { BatchJob } from "./batchApi";

const HISTORY_KEY_PREFIX = "ocr_job_history_";

export interface JobHistoryItem extends BatchJob {
    savedAt: string;
}

/**
 * Get job history for a specific access code
 */
export function getJobHistory(accessCode: string): JobHistoryItem[] {
    if (!accessCode) return [];
    const key = `${HISTORY_KEY_PREFIX}${accessCode.toUpperCase()}`;
    try {
        const json = localStorage.getItem(key);
        return json ? JSON.parse(json) : [];
    } catch {
        return [];
    }
}

/**
 * Save or update a job in history
 */
export function saveJobToHistory(accessCode: string, job: BatchJob) {
    if (!accessCode) return;
    const key = `${HISTORY_KEY_PREFIX}${accessCode.toUpperCase()}`;
    const history = getJobHistory(accessCode);

    const existingIndex = history.findIndex((item) => item.job_id === job.job_id);
    const newItem: JobHistoryItem = {
        ...job,
        savedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
        history[existingIndex] = newItem;
    } else {
        // Add new job to start of list
        history.unshift(newItem);
    }

    // Keep max 50 items
    const trimmedHistory = history.slice(0, 50);
    localStorage.setItem(key, JSON.stringify(trimmedHistory));
}

/**
 * Clear history for an access code
 */
export function clearJobHistory(accessCode: string) {
    if (!accessCode) return;
    const key = `${HISTORY_KEY_PREFIX}${accessCode.toUpperCase()}`;
    localStorage.removeItem(key);
}
