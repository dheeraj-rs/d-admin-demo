/**
 * Get the base URL for the application
 * Works in both server and client environments
 * Prioritizes environment variable, then falls back to request headers
 */
export function getBaseUrl(request?: Request): string {
    // First priority: Environment variable
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    // Second priority: Request headers (for server-side)
    if (request) {
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        if (host) {
            return `${protocol}://${host}`;
        }
    }

    // Fallback for development
    return 'http://localhost:3000';
}
