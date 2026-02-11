import type { MistralFileUploadResponse, MistralErrorResponse } from "../types";

const MISTRAL_FILES_ENDPOINT = "https://api.mistral.ai/v1/files";

/**
 * Upload file directly to Mistral API
 * Returns the file ID
 */
/**
 * Upload file directly to Mistral API
 * Returns the file ID
 */
export async function uploadToMistral(
    file: File,
    apiKey: string,
    onProgress?: (progress: number) => void
): Promise<string> {
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("purpose", "ocr");

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            return await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", MISTRAL_FILES_ENDPOINT);
                xhr.setRequestHeader("Authorization", `Bearer ${apiKey}`);

                if (onProgress) {
                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const percentComplete = (event.loaded / event.total) * 100;
                            onProgress(percentComplete);
                        }
                    };
                }

                xhr.onload = async () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const data = JSON.parse(xhr.responseText) as MistralFileUploadResponse;
                            resolve(data.id);
                        } catch (e) {
                            reject(new Error("Invalid JSON response from Mistral"));
                        }
                    } else {
                        // Handle Rate Limiting (429) specially
                        if (xhr.status === 429) {
                            const retryAfter = xhr.getResponseHeader("Retry-After");
                            const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : Math.pow(2, attempts);
                            console.warn(`Mistral Rate Limit (429). waiting ${waitSeconds}s...`);

                            // We reject with a special error object to trigger retry in the outer loop
                            reject({ isRateLimit: true, waitSeconds });
                            return;
                        }

                        let errorMessage = `Mistral Upload Failed (${xhr.status}): ${xhr.statusText}`;
                        try {
                            const errorJson = JSON.parse(xhr.responseText) as MistralErrorResponse;
                            if (errorJson.message) errorMessage = errorJson.message;
                        } catch { /* ignore */ }
                        reject(new Error(errorMessage));
                    }
                };

                xhr.onerror = () => reject(new Error("Network error during upload"));
                xhr.send(formData);
            });

        } catch (error: any) {
            // Handle XHR-based Rate Limit Retry
            if (error.isRateLimit) {
                await new Promise(resolve => setTimeout(resolve, error.waitSeconds * 1000));
                attempts++;
                continue;
            }

            attempts++;
            console.warn(`Upload attempt ${attempts} failed:`, error);

            if (attempts >= maxAttempts) {
                throw error;
            }

            // Exponential backoff for other errors: 1s, 2s, 4s...
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
        }
    }

    throw new Error("Upload failed after max retries");
}
