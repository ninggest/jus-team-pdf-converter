// Allowed origins for CORS
export const ALLOWED_ORIGINS = [
    "https://ocr.jus.team",
    "https://jus-team-pdf-converter.pages.dev",
    "http://localhost:5173",
    "http://localhost:3000",
];

export const MISTRAL_FILES_ENDPOINT = "https://api.mistral.ai/v1/files";
export const MISTRAL_OCR_ENDPOINT = "https://api.mistral.ai/v1/ocr";
export const MISTRAL_BATCH_ENDPOINT = "https://api.mistral.ai/v1/batch/jobs";
export const MISTRAL_OCR_MODEL = "mistral-ocr-latest";
export const BATCH_JOB_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
