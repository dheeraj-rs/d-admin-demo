import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Owner Authentication Middleware
 * Validates owner_token from httpOnly cookies
 * Returns authenticated owner data or error response
 */
export async function authenticateOwner(request: NextRequest) {
    try {
        // Get owner_token from httpOnly cookie
        const ownerToken = request.cookies.get('owner_token')?.value;

        if (!ownerToken) {
            return {
                authenticated: false,
                error: 'Owner authentication required',
                response: NextResponse.json(
                    { 
                        success: false, 
                        error: 'Owner authentication required. Please login as owner.' 
                    },
                    { status: 401 }
                ),
            };
        }

        // Verify JWT token
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'drjadmin');
        const { payload } = await jwtVerify(ownerToken, secret);

        // Validate owner permissions
        const isOwner = (payload as any).permissions?.isOwner === true;
        
        if (!isOwner) {
            return {
                authenticated: false,
                error: 'Invalid owner token',
                response: NextResponse.json(
                    { 
                        success: false, 
                        error: 'Invalid owner credentials. Access denied.' 
                    },
                    { status: 403 }
                ),
            };
        }

        // Return authenticated owner data
        return {
            authenticated: true,
            owner: {
                email: (payload as any).email,
                name: (payload as any).name,
                role: 'owner',
                isOwner: true,
            },
            payload,
        };
    } catch (error) {
        console.error('Owner token verification failed:', error);
        return {
            authenticated: false,
            error: 'Invalid or expired owner token',
            response: NextResponse.json(
                { 
                    success: false, 
                    error: 'Invalid or expired owner token. Please login again.' 
                },
                { status: 401 }
            ),
        };
    }
}

/**
 * Require Owner Authentication
 * Use this as a wrapper for owner-only API routes
 * Returns error response if not authenticated as owner
 */
export async function requireOwnerAuth(request: NextRequest) {
    const authResult = await authenticateOwner(request);
    
    if (!authResult.authenticated) {
        return authResult.response;
    }
    
    return null; // No error, proceed with request
}
