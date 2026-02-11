import type { Env } from "./types";
import { handleCORSPreflight, addCORSHeaders } from "./utils/cors";
import { getUserId, createUserCookie } from "./utils/auth";
import { jsonError, jsonResponse } from "./utils/response";
import { handleOCRRequest } from "./routes/ocr";
import {
    handleBatchCreate,
    handleBatchStatus,
    handleBatchResults,
    handleBatchList
} from "./routes/batch";

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const method = request.method.toUpperCase();
        const path = url.pathname;

        // Handle CORS preflight
        if (method === "OPTIONS") {
            return handleCORSPreflight(request);
        }

        // Get or create user ID
        const { userId, isNew } = getUserId(request);
        const setCookie = isNew ? createUserCookie(userId) : undefined;

        // Health check endpoint
        if (method === "GET" && (path === "/" || path === "/health")) {
            return jsonResponse(
                {
                    status: "ok",
                    service: "Legal Document OCR API",
                    version: "2.2.0",
                    modes: {
                        standard: {
                            endpoint: "POST /",
                            description: "Synchronous OCR processing",
                        },
                        batch: {
                            create: "POST /batch/create",
                            status: "GET /batch/status?id=xxx",
                            results: "GET /batch/results?id=xxx",
                            list: "GET /batch/list",
                            description: "Asynchronous batch processing (50% cheaper)",
                        },
                    },
                },
                200,
                request,
                setCookie
            );
        }

        // Standard OCR endpoint
        if (method === "POST" && (path === "/" || path === "/ocr")) {
            try {
                const response = await handleOCRRequest(request);
                return setCookie ? addCORSHeaders(response, request, setCookie) : response;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Internal Worker Error";
                return jsonError(`Critical Worker Error: ${errorMessage}`, 500, request, setCookie);
            }
        }

        // Batch endpoints
        if (path.startsWith("/batch")) {
            if (method === "POST" && path === "/batch/create") {
                return handleBatchCreate(request, env, userId, setCookie);
            }
            if (method === "GET" && path === "/batch/status") {
                return handleBatchStatus(request, env, userId, setCookie);
            }
            if (method === "GET" && path === "/batch/results") {
                return handleBatchResults(request, env, userId, setCookie);
            }
            if (method === "GET" && path === "/batch/list") {
                return handleBatchList(request, env, userId, setCookie);
            }
        }

        // Method not allowed
        return jsonError(`Method ${method} not allowed for ${path}`, 405, request, setCookie);
    },
};
