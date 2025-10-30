import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '../../../../lib/mongodb';
import User from '../../../../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
    try {
        // Check both user_token (legacy) and plan_auth_token (Google auth)
        const userToken = request.cookies.get('user_token')?.value;
        const planAuthToken = request.cookies.get('plan_auth_token')?.value;

        const token = planAuthToken || userToken;

        if (!token) {
            console.log('⚠️ No auth token found');
            return NextResponse.json({ success: false, user: null });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        console.log('✅ Token decoded:', {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            plan: decoded.plan,
        });

        // If token has all user info (from plan_auth_token), return it directly
        if (decoded.email && decoded.name) {
            return NextResponse.json({
                success: true,
                user: {
                    id: decoded.userId,
                    email: decoded.email,
                    name: decoded.name,
                    profilePicture: decoded.profilePicture || '/api/placeholder/80/80',
                    plan: decoded.plan || 'FREE', // Plan for account users
                    tier: decoded.tier || 'free', // Tier for legacy users
                    role: decoded.role || 'account',
                    features: decoded.features || [],
                    isPlanActive: decoded.isPlanActive !== false,
                },
            });
        }

        // Fallback: Get user from database (for legacy users - minimal User model)
        await connectDB();
        const user = await User.findById(decoded.userId);

        if (!user) {
            console.log('❌ User not found in database');
            return NextResponse.json({ success: false, user: null });
        }

        console.log('✅ Legacy user found in database:', {
            id: user._id,
            email: user.email,
            role: user.role,
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role || 'user',
                plan: 'FREE', // Default for legacy users
                tier: 'free',
                isPlanActive: user.isActive,
            },
        });
    } catch (error) {
        console.error('❌ Error in /api/auth/user:', error);
        return NextResponse.json({ success: false, user: null });
    }
}
