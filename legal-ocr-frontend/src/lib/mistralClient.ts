import type { MistralFileUploadResponse, MistralErrorResponse } from "../types";

const MISTRAL_FILES_ENDPOINT = "https://api.mistral.ai/v1/files";

/**
 * Upload file directly to Mistral API
 * Returns the file ID
 */
export async function uploadToMistral(file: File, apiKey: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("purpose", "ocr");

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            const response = await fetch(MISTRAL_FILES_ENDPOINT, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
                body: formData,
            });

            if (!response.ok) {
                // Handle Rate Limiting (429) specially
                if (response.status === 429) {
                    const retryAfter = response.headers.get("Retry-After");
                    const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : Math.pow(2, attempts); // Default slightly exponential if header missing
                    console.warn(`Mistral Rate Limit (429). Waiting ${waitSeconds}s...`);
                    await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
                    attempts++;
                    continue; // Retry immediately after wait
                }

                // If it's a client error (4xx), don't retry (except 429 which is handled above)
                if (response.status >= 400 && response.status < 500) {
                    const errorText = await response.text();
                    let errorMessage = `Mistral Upload Failed (${response.status}): ${errorText}`;
                    try {
                        const errorJson = JSON.parse(errorText) as MistralErrorResponse;
                        if (errorJson.message) errorMessage = errorJson.message;
                    } catch { /* ignore */ }
                    throw new Error(errorMessage);
                }

                throw new Error(`Mistral Upload Failed: ${response.status} ${response.statusText}`);
            }

            const data = (await response.json()) as MistralFileUploadResponse;
            return data.id;

        } catch (error) {
            attempts++;
            console.warn(`Upload attempt ${attempts} failed:`, error);

            if (attempts >= maxAttempts) {
                throw error;
            }

            // Exponential backoff: 1s, 2s, 4s...
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
        }
    }

    throw new Error("Upload failed after max retries");
}
