import { ALLOWED_ORIGINS } from "../config";

export function getCORSHeaders(request: Request): Record<string, string> {
    const origin = request.headers.get("Origin") || "";
    let allowedOrigin = ALLOWED_ORIGINS[0];

    if (ALLOWED_ORIGINS.includes(origin)) {
        allowedOrigin = origin;
    } else if (origin.endsWith(".jus-team-pdf-converter.pages.dev") || origin.endsWith(".legal-ocr-frontend.pages.dev")) {
        allowedOrigin = origin;
    }

    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id, X-Access-Code",
        "Access-Control-Max-Age": "86400",
        "Access-Control-Allow-Credentials": "true",
    };
}

export function handleCORSPreflight(request: Request): Response {
    return new Response(null, {
        status: 204,
        headers: getCORSHeaders(request),
    });
}

export function addCORSHeaders(response: Response, request: Request, setCookie?: string): Response {
    const newHeaders = new Headers(response.headers);
    const corsHeaders = getCORSHeaders(request);
    Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
    });
    if (setCookie) {
        newHeaders.set("Set-Cookie", setCookie);
    }
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
    });
}
