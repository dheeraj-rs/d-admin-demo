/**
 * Safely parse JSON response, handling HTML error pages
 * @param response - Fetch response object
 * @returns Parsed JSON data or error object
 */
export async function safeJsonParse(response: Response) {
    const contentType = response.headers.get('content-type');
    
    // Check if response is actually JSON
    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but received:', contentType, text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Please check your network connection.');
    }
    
    try {
        return await response.json();
    } catch (error) {
        console.error('Failed to parse JSON:', error);
        throw new Error('Invalid JSON response from server');
    }
}

/**
 * Fetch wrapper with automatic JSON validation
 * @param url - URL to fetch
 * @param options - Fetch options
 * @returns Parsed JSON data
 */
export async function safeFetch(url: string, options?: RequestInit) {
    try {
        const response = await fetch(url, options);
        return await safeJsonParse(response);
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}
