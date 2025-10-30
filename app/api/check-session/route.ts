import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import TenantAdmin from '../../../models/SuperAdmin';
import Account from '../../../models/Account';
import Owner from '../../../models/Owner';
import { hasLogoutEvent, removeLogoutEvent } from '../../../lib/logout-events';

// Simple in-memory cache with 30-second TTL
const sessionCache = new Map<string, { isActive: boolean; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, userType } = body;

        if (!email || !userType) {
            return NextResponse.json({
                isActive: false,
                message: 'Missing email or userType',
            });
        }

        // FIRST: Check if there's a pending logout event (always check, never cache)
        if (hasLogoutEvent(email)) {
            console.log(`🚨 Logout event detected for ${email} in check-session`);
            removeLogoutEvent(email);
            sessionCache.delete(`${email}:${userType}`); // Clear cache
            return NextResponse.json({
                isActive: false,
                message: 'Your account has been deactivated by the administrator',
                userType,
            });
        }

        // Check cache first
        const cacheKey = `${email}:${userType}`;
        const cached = sessionCache.get(cacheKey);
        const now = Date.now();

        if (cached && now - cached.timestamp < CACHE_TTL) {
            // Return cached result
            return NextResponse.json({
                isActive: cached.isActive,
                userType,
                cached: true,
            });
        }

        await connectDB();

        let user: any = null;

        // Check based on userType
        if (userType === 'owner') {
            user = await Owner.findOne({ email }).lean();
        } else if (userType === 'admin' || userType === 'superadmin') {
            // Both admin and superadmin now use TenantAdmin model
            user = await TenantAdmin.findOne({ email }).lean();
        } else if (userType === 'user' || userType === 'account') {
            // User is now Account model
            user = await Account.findOne({ email }).lean();
        }

        if (!user) {
            return NextResponse.json({
                isActive: false,
                message: 'User not found',
            });
        }

        // Check if account is active
        const isActive = user.isActive === true;

        // Update cache
        sessionCache.set(cacheKey, { isActive, timestamp: now });

        if (!isActive) {
            return NextResponse.json({
                isActive: false,
                message: 'Your account has been deactivated by the administrator',
                userType,
            });
        }

        return NextResponse.json({
            isActive: true,
            userType,
        });
    } catch (error) {
        console.error('Error checking session:', error);
        return NextResponse.json(
            {
                isActive: false,
                message: 'Error checking session',
            },
            { status: 500 }
        );
    }
}
