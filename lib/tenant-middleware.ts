/**
 * ==========================================
 * TENANT MIDDLEWARE
 * ==========================================
 * 
 * Middleware for handling tenant-based requests.
 * Automatically extracts and validates tenant information from requests.
 * 
 * FEATURES:
 * - Hostname-based tenant resolution
 * - Request context enrichment with tenant data
 * - Tenant validation and access control
 * - Automatic tenant filtering for API requests
 * 
 * ==========================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTenantByHostname, validateTenantAccess } from './tenant-management';

/**
 * Extended request with tenant context
 */
export interface TenantRequest extends NextRequest {
    tenant?: {
        tenantId: string;
        hostname: string;
        organizationKey: string;
        organizationName: string;
        superAdminId: string;
    };
}

/**
 * Extract tenant from request hostname
 * @param request - Next.js request object
 * @returns Tenant information or null
 */
export async function extractTenantFromRequest(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    
    // Remove port if present
    const cleanHostname = hostname.split(':')[0];
    
    // Check if this is a tenant-specific hostname
    if (cleanHostname.includes('.d-admin.com')) {
        try {
            const tenant = await getTenantByHostname(cleanHostname);
            return tenant;
        } catch (error) {
            console.error('Error extracting tenant from hostname:', error);
            return null;
        }
    }
    
    return null;
}

/**
 * Middleware to validate tenant access
 * @param request - Next.js request
 * @param tenantId - Required tenant ID
 * @param adminId - Admin ID from auth
 * @returns Response or null if valid
 */
export async function validateTenantMiddleware(
    request: NextRequest,
    tenantId: string,
    adminId: string
): Promise<NextResponse | null> {
    const isValid = await validateTenantAccess(tenantId, adminId);
    
    if (!isValid) {
        return NextResponse.json(
            { error: 'Access denied: Invalid tenant access' },
            { status: 403 }
        );
    }
    
    return null;
}

/**
 * Get tenant context from request headers
 * @param request - Next.js request
 * @returns Tenant ID from headers or null
 */
export function getTenantIdFromHeaders(request: NextRequest): string | null {
    return request.headers.get('x-tenant-id');
}

/**
 * Add tenant headers to response
 * @param response - Next.js response
 * @param tenantId - Tenant identifier
 * @returns Response with tenant headers
 */
export function addTenantHeaders(response: NextResponse, tenantId: string): NextResponse {
    response.headers.set('x-tenant-id', tenantId);
    return response;
}

/**
 * Create tenant-aware API response
 * @param data - Response data
 * @param tenantId - Tenant identifier
 * @param status - HTTP status code
 * @returns Next.js response with tenant context
 */
export function createTenantResponse(
    data: any,
    tenantId: string,
    status: number = 200
): NextResponse {
    const response = NextResponse.json(data, { status });
    return addTenantHeaders(response, tenantId);
}

/**
 * Tenant isolation error response
 * @returns 403 Forbidden response
 */
export function tenantIsolationError(): NextResponse {
    return NextResponse.json(
        { 
            error: 'Tenant Isolation Error',
            message: 'Access to this resource is restricted to the owning tenant'
        },
        { status: 403 }
    );
}

/**
 * Tenant not found error response
 * @returns 404 Not Found response
 */
export function tenantNotFoundError(): NextResponse {
    return NextResponse.json(
        { 
            error: 'Tenant Not Found',
            message: 'The requested tenant does not exist or is inactive'
        },
        { status: 404 }
    );
}

/**
 * Validate request has required tenant context
 * @param tenantId - Tenant ID to validate
 * @returns Error response or null if valid
 */
export function requireTenantContext(tenantId: string | null | undefined): NextResponse | null {
    if (!tenantId) {
        return NextResponse.json(
            { 
                error: 'Missing Tenant Context',
                message: 'This request requires tenant identification'
            },
            { status: 400 }
        );
    }
    return null;
}

const tenantMiddleware = {
    extractTenantFromRequest,
    validateTenantMiddleware,
    getTenantIdFromHeaders,
    addTenantHeaders,
    createTenantResponse,
    tenantIsolationError,
    tenantNotFoundError,
    requireTenantContext
};

export default tenantMiddleware;
