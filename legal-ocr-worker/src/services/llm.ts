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

export async function refineMarkdownWithLLM(
    markdown: string,
    apiKey: string
): Promise<string> {
    if (!markdown || markdown.trim().length === 0) {
        return markdown;
    }

    const systemPrompt = `You are a legal document assistant. Your task is to refine OCR output.

1. **Image Descriptions**: Analyze text around ![...] placeholders.
    - **Legal Elements**: If the context suggests a signature, seal, or official stamp (e.g., near text like "签字", "签名", "盖章", "法定代表人", "Signed by"), rewrite the placeholder as \`![Signature/Seal]\`.
    - **Evidence/Attachments**: If the context implies an ID card, license, or invoice (e.g., "身份证", "营业执照"), rewrite as \`![ID Card]\` or \`![Business License]\`.
    - **Captions**: If you find a specific caption (e.g., "Figure 1: Org Chart"), use it: \`![Figure 1: Org Chart]\`.
    - **Decorative**: If the image appears to be a decorative element (header icon, separator) with no semantic reference, REMOVE the placeholder line entirely.
    - If strictly unsure, keep the generic placeholder.

2. **Formatting**: 
    - Merge paragraph lines that were incorrectly split by the OCR.
    - Ensure strictly ONE empty line between paragraphs.
    - Do NOT merge headers or list items into paragraphs.

3. **Cleanup**: 
    - Remove residual headers/footers (e.g., repeating page numbers, "Confidential" stamps at page boundaries).
    
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
                temperature: 0.2, // Low temperature for deterministic formatting
                max_tokens: 8000, // Allow large output for long docs
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`LLM refinement failed: ${response.status} ${errorText}`);
            // Fallback: return original markdown if LLM fails
            return markdown;
        }

        const data = (await response.json()) as MistralChatResponse;
        const refinedContent = data.choices[0]?.message?.content;

        if (!refinedContent) {
            console.warn("LLM returned empty content");
            return markdown;
        }

        return refinedContent;
    } catch (error) {
        console.error("LLM refinement exception:", error);
        return markdown;
    }
}
