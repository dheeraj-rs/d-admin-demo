import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from './mongodb';
import TenantAdmin from '../models/SuperAdmin';
import Account from '../models/Account';
import { hasLogoutEvent, removeLogoutEvent } from './logout-events';

/**
 * Validates if a user's account is still active
 * Call this at the start of any protected API route
 */
export async function validateUserSession(email: string, userType: 'admin' | 'account'): Promise<{ isValid: boolean; message?: string }> {
    try {
        // FIRST: Check if there's a pending logout event (immediate check, no DB query needed)
        if (hasLogoutEvent(email)) {
            console.log(`🚨 Logout event detected for ${email} - forcing logout`);
            removeLogoutEvent(email); // Remove the event after detection
            return { isValid: false, message: 'Your account has been deactivated by the administrator' };
        }

        await connectDB();

        let user: any = null;

        if (userType === 'admin') {
            user = await TenantAdmin.findOne({ email }).lean();
        } else if (userType === 'account') {
            user = await Account.findOne({ email }).lean();
        }

        if (!user) {
            return { isValid: false, message: 'User not found' };
        }

        if (!user.isActive) {
            return { isValid: false, message: 'Account has been deactivated' };
        }

        // Check if account is blocked
        if (user.isBlocked) {
            const reason = user.blockedReason ? ` Reason: ${user.blockedReason}` : '';
            return { isValid: false, message: `Account has been blocked by administrator.${reason}` };
        }

        return { isValid: true };
    } catch (error) {
        console.error('Error validating user session:', error);
        return { isValid: false, message: 'Error validating session' };
    }
}

/**
 * Middleware to check user session from request headers
 * Returns 401 if account is deactivated
 */
export async function checkUserActiveStatus(request: NextRequest): Promise<NextResponse | null> {
    try {
        // Get user info from headers (you'll need to send this from client)
        const userEmail = request.headers.get('x-user-email');
        const userType = request.headers.get('x-user-type') as 'admin' | 'account' | null;

        if (!userEmail || !userType) {
            // No user info in headers, skip check
            return null;
        }

        const { isValid, message } = await validateUserSession(userEmail, userType);

        if (!isValid) {
            return NextResponse.json(
                {
                    error: 'ACCOUNT_DEACTIVATED',
                    message: message || 'Your account has been deactivated',
                    requiresLogout: true,
                },
                { status: 401 }
            );
        }

        return null; // User is active, continue
    } catch (error) {
        console.error('Error in checkUserActiveStatus:', error);
        return null;
    }
}
