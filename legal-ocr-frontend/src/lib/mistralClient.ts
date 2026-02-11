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
    formData.append("file", file);
    formData.append("purpose", "ocr");

    const response = await fetch(MISTRAL_FILES_ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Mistral Upload Failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
}
