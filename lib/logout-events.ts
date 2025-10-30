/**
 * Global logout events store
 * Stores recent logout events for users whose accounts were deactivated
 */

interface LogoutEvent {
    email: string;
    userType: 'superadmin' | 'admin' | 'user';
    timestamp: number;
}

// Store logout events for 5 minutes
const LOGOUT_EVENT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// In-memory store (in production, use Redis or similar)
const logoutEvents: Map<string, LogoutEvent> = new Map();

/**
 * Add a logout event for a user
 */
export function addLogoutEvent(email: string, userType: 'superadmin' | 'admin' | 'user') {
    const event: LogoutEvent = {
        email,
        userType,
        timestamp: Date.now()
    };
    
    logoutEvents.set(email, event);
    
    // Clean up old events
    cleanupOldEvents();
}

/**
 * Check if a user has a pending logout event
 */
export function hasLogoutEvent(email: string): boolean {
    const event = logoutEvents.get(email);
    
    if (!event) {
        return false;
    }
    
    // Check if event is still valid (not expired)
    const isValid = (Date.now() - event.timestamp) < LOGOUT_EVENT_TTL;
    
    if (!isValid) {
        logoutEvents.delete(email);
        return false;
    }
    
    return true;
}

/**
 * Remove a logout event (after user has been logged out)
 */
export function removeLogoutEvent(email: string) {
    logoutEvents.delete(email);
}

/**
 * Clean up expired events
 */
function cleanupOldEvents() {
    const now = Date.now();
    
    for (const [email, event] of logoutEvents.entries()) {
        if ((now - event.timestamp) >= LOGOUT_EVENT_TTL) {
            logoutEvents.delete(email);
        }
    }
}

/**
 * Get all active logout events (for debugging)
 */
export function getActiveLogoutEvents(): LogoutEvent[] {
    cleanupOldEvents();
    return Array.from(logoutEvents.values());
}
