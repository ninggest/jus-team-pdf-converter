import { MISTRAL_CHAT_ENDPOINT, MISTRAL_CHAT_MODEL } from "../config";

interface MistralMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface MistralChatResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        message: MistralMessage;
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

const MAX_CHUNK_SIZE = 12000;
const CONCURRENCY_LIMIT = 5;

export async function refineMarkdownWithLLM(
    markdown: string,
    apiKey: string
): Promise<string> {
    if (!markdown || markdown.trim().length === 0) {
        return markdown;
    }

    // Split into chunks to avoid model "summarization" lazyness and token limits
    const chunks = chunkMarkdown(markdown, MAX_CHUNK_SIZE);

    if (chunks.length === 1) {
        return await processChunk(chunks[0], apiKey);
    }

    console.log(`Processing ${chunks.length} LLM chunks in parallel (limit: ${CONCURRENCY_LIMIT})...`);

    // Process chunks in parallel with a concurrency limit
    const processedChunks: string[] = new Array(chunks.length);

    for (let i = 0; i < chunks.length; i += CONCURRENCY_LIMIT) {
        const batch = chunks.slice(i, i + CONCURRENCY_LIMIT);
        const batchPromises = batch.map((chunk, index) => {
            const chunkIndex = i + index;
            return processChunk(chunk, apiKey).then(result => {
                processedChunks[chunkIndex] = result;
            });
        });
        await Promise.all(batchPromises);
    }

    return processedChunks.join("\n\n");
}

function chunkMarkdown(text: string, maxLen: number): string[] {
    const chunks: string[] = [];
    let currentChunk = "";

    // Split by paragraph to maintain context within a chunk
    const paragraphs = text.split("\n\n");

    for (const p of paragraphs) {
        if ((currentChunk + p).length > maxLen && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = "";
        }

        // If a single paragraph is too large, split it by lines
        if (p.length > maxLen) {
            const lines = p.split("\n");
            for (const line of lines) {
                if ((currentChunk + line).length > maxLen && currentChunk.length > 0) {
                    chunks.push(currentChunk.trim());
                    currentChunk = "";
                }
                currentChunk += line + "\n";
            }
        } else {
            currentChunk += p + "\n\n";
        }
    }

    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

async function processChunk(
    markdown: string,
    apiKey: string
): Promise<string> {
    const systemPrompt = `You are a legal document assistant. Your task is to refine OCR output.

### CRITICAL INSTRUCTION (STRICT FAITHFULNESS)
1. **DO NOT SUMMARIZE**: You must preserve EVERY SINGLE WORD from the input.
2. **DO NOT OMIT**: Never skip any sections, paragraphs, or small details.
3. **DO NOT PARAPHRASE**: Keep the original legal wording exactly as is.
4. **WRITTEN REPRODUCTION**: Your output should be a word-for-word reproduction of the input, with only the specific formatting and tag replacements allowed below.

1. **Image Descriptions**: Analyze text around ![...] placeholders.
    - **Legal Elements**: If context suggests a signature, seal (e.g., "签字", "盖章", "Signed by"), rewrite as \`![Signature/Seal]\`.
    - **Evidence**: If context implies ID card/license (e.g., "身份证", "营业执照"), rewrite as \`![ID Card]\` or \`![Business License]\`.
    - **Decorative**: If no semantic reference, REMOVE the placeholder line.
    - Otherwise, keep the generic placeholder.

2. **Formatting**: 
    - Merge paragraph lines that were incorrectly split by OCR.
    - Ensure strictly ONE empty line between paragraphs.
    - Do NOT merge headers or list items into paragraphs.

3. **Cleanup**: 
    - Remove residual headers/footers (e.g., repeating page numbers).

Output ONLY the refined markdown. Do not add any conversational text.`;

    try {
        const response = await fetch(MISTRAL_CHAT_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: MISTRAL_CHAT_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: markdown },
                ],
                temperature: 0.1, // Even lower for maximum stability
                max_tokens: 8000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`LLM refinement failed: ${response.status} ${errorText}`);
            return markdown;
        }

        const data = (await response.json()) as MistralChatResponse;
        const refinedContent = data.choices[0]?.message?.content;

        return refinedContent || markdown;
    } catch (error) {
        console.error("LLM refinement exception:", error);
        return markdown;
    }
}
