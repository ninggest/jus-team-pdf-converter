export function getUserId(request: Request): { userId: string; isNew: boolean } {
    // 1. Check for X-Access-Code (New "Pickup Code" system)
    const accessCode = request.headers.get("X-Access-Code");
    if (accessCode && accessCode.length >= 4) {
        return { userId: accessCode, isNew: false };
    }

    // 2. Check for X-User-Id header (Backward compatibility)
    const headerId = request.headers.get("X-User-Id");
    if (headerId && headerId.length > 5) {
        return { userId: headerId, isNew: false };
    }

    // 3. Fallback to Cookie (Legacy support)
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(
        cookieHeader.split(";").map(c => {
            const [key, ...vals] = c.trim().split("=");
            return [key, vals.join("=")];
        })
    );

    if (cookies["jus_user_id"]) {
        return { userId: cookies["jus_user_id"], isNew: false };
    }

    // 4. New user - return random
    return { userId: crypto.randomUUID(), isNew: true };
}

export function createUserCookie(userId: string): string {
    // Cookie valid for 1 year
    return `jus_user_id=${userId}; Path=/; Max-Age=31536000; SameSite=None; Secure`;
}

export function extractApiKey(request: Request): string | null {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return null;

    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!bearerMatch) return null;

    return bearerMatch[1].trim();
}
