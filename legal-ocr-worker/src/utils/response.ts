import { addCORSHeaders } from "./cors";

export function jsonError(message: string, status: number, request: Request, setCookie?: string): Response {
    return addCORSHeaders(
        new Response(JSON.stringify({ error: message }), {
            status,
            headers: { "Content-Type": "application/json" },
        }),
        request,
        setCookie
    );
}

export function jsonResponse(data: unknown, status: number = 200, request: Request, setCookie?: string): Response {
    return addCORSHeaders(
        new Response(JSON.stringify(data), {
            status,
            headers: { "Content-Type": "application/json" },
        }),
        request,
        setCookie
    );
}

export function markdownResponse(content: string, request: Request): Response {
    return addCORSHeaders(
        new Response(content, {
            status: 200,
            headers: {
                "Content-Type": "text/markdown; charset=utf-8",
            },
        }),
        request
    );
}
