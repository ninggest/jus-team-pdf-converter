export interface Env {
    BATCH_JOBS: KVNamespace;
}

export interface MistralOCRPage {
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

export interface MistralOCRResponse {
    pages: MistralOCRPage[];
    model: string;
    document_annotation: unknown | null;
    usage_info: {
        pages_processed: number;
        doc_size_bytes: number;
    };
}

export interface MistralErrorResponse {
    message?: string;
    detail?: string | { message: string }[];
}

export interface MistralFileUploadResponse {
    id: string;
    object: string;
    bytes: number;
    created_at: number;
    filename: string;
    purpose: string;
}

export interface MistralSignedUrlResponse {
    url: string;
}

export interface MistralBatchJob {
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

export interface BatchJobRecord {
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
