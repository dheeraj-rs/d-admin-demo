'use client';

// Generate session ID function
function generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

const SESSION_KEY = 'd_admin_session_id';
const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export interface SessionData {
    sessionId: string;
    createdAt: number;
    lastAccessed: number;
    isAnonymous: boolean;
    userId?: string;
    superAdminId?: string;
}

export function getSessionId(): string {
    if (typeof window === 'undefined') return '';

    try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
            const sessionData: SessionData = JSON.parse(stored);

            // Check if session is expired
            if (Date.now() - sessionData.lastAccessed > SESSION_EXPIRY) {
                // Session expired, create new one
                return createNewSession();
            }

            // Update last accessed time
            sessionData.lastAccessed = Date.now();
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

            return sessionData.sessionId;
        }
    } catch (error) {
        console.error('Error reading session from localStorage:', error);
    }

    return createNewSession();
}

export function createNewSession(userId?: string, superAdminId?: string): string {
    if (typeof window === 'undefined') return '';

    const sessionId = generateSessionId();
    const sessionData: SessionData = {
        sessionId,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        isAnonymous: !userId,
        userId,
        superAdminId,
    };

    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (error) {
        console.error('Error saving session to localStorage:', error);
    }

    return sessionId;
}

export function updateSession(userId?: string, superAdminId?: string): string {
    if (typeof window === 'undefined') return '';

    try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
            const sessionData: SessionData = JSON.parse(stored);
            sessionData.userId = userId;
            sessionData.superAdminId = superAdminId;
            sessionData.isAnonymous = !userId;
            sessionData.lastAccessed = Date.now();

            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            return sessionData.sessionId;
        }
    } catch (error) {
        console.error('Error updating session:', error);
    }

    return createNewSession(userId, superAdminId);
}

export function clearSession(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(SESSION_KEY);
    } catch (error) {
        console.error('Error clearing session:', error);
    }
}

export function getSessionData(): SessionData | null {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error reading session data:', error);
    }

    return null;
}

export function isSessionValid(): boolean {
    const sessionData = getSessionData();
    if (!sessionData) return false;

    return Date.now() - sessionData.lastAccessed < SESSION_EXPIRY;
}

export function getSessionAge(): number {
    const sessionData = getSessionData();
    if (!sessionData) return 0;

    return Date.now() - sessionData.createdAt;
}

export function getTimeSinceLastAccess(): number {
    const sessionData = getSessionData();
    if (!sessionData) return 0;

    return Date.now() - sessionData.lastAccessed;
}
