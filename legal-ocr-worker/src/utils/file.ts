export async function extractPdfFromRequest(
    request: Request
): Promise<{ data: ArrayBuffer; filename: string } | null> {
    const contentType = request.headers.get("Content-Type") || "";

    if (contentType.includes("multipart/form-data")) {
        try {
            const formData = await request.formData();
            const file = formData.get("file");

            if (!file || typeof file === "string") {
                return null;
            }

            const fileBlob = file as unknown as {
                arrayBuffer: () => Promise<ArrayBuffer>;
                name?: string;
                type?: string;
            };

            const fileName = (fileBlob.name || "").toLowerCase();
            const fileType = fileBlob.type || "";

            if (fileType !== "application/pdf" && !fileName.endsWith(".pdf")) {
                return null;
            }

            const arrayBuffer = await fileBlob.arrayBuffer();
            return {
                data: arrayBuffer,
                filename: fileBlob.name || "document.pdf",
            };
        } catch {
            return null;
        }
    }

    if (
        contentType.includes("application/pdf") ||
        contentType.includes("application/octet-stream")
    ) {
        try {
            const arrayBuffer = await request.arrayBuffer();
            if (arrayBuffer.byteLength === 0) {
                return null;
            }
            return {
                data: arrayBuffer,
                filename: "document.pdf",
            };
        } catch {
            return null;
        }
    }

    return null;
}

export async function extractMultiplePdfsFromRequest(
    request: Request
): Promise<{ data: ArrayBuffer; filename: string }[]> {
    const contentType = request.headers.get("Content-Type") || "";
    const files: { data: ArrayBuffer; filename: string }[] = [];

    if (!contentType.includes("multipart/form-data")) {
        return files;
    }

    try {
        const formData = await request.formData();
        const allFiles = formData.getAll("files[]");

        for (const file of allFiles) {
            if (typeof file === "string") continue;

            const fileBlob = file as unknown as {
                arrayBuffer: () => Promise<ArrayBuffer>;
                name?: string;
                type?: string;
            };

            const fileName = (fileBlob.name || "").toLowerCase();
            const fileType = fileBlob.type || "";

            if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
                const arrayBuffer = await fileBlob.arrayBuffer();
                files.push({
                    data: arrayBuffer,
                    filename: fileBlob.name || `document_${files.length}.pdf`,
                });
            }
        }
    } catch {
        // Return whatever we have
    }

    return files;
}
