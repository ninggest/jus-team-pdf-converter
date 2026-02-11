/**
 * Client for interacting with Mistral API directly
 */

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
                // If it's a client error (4xx), don't retry (except 429)
                if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                    throw new Error(`Mistral Upload Failed: ${response.status} ${response.statusText}`);
                }
                throw new Error(`Mistral Upload Failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
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
