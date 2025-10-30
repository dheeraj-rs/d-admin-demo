import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '../../../../lib/encryption';
import { authenticate } from '../../../../lib/auth-middleware';
import { getOrganizationKey } from '../../../../lib/data-isolation';
import { getTenantGmailAccountModel } from '../../../../lib/tenant-models';

export const dynamic = 'force-dynamic';

// POST - Decrypt password for copying (Super Admin only, TENANT-SPECIFIC)
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { authenticated, user, error } = await authenticate(request);
    
    if (!authenticated || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify user is Super Admin
    if (user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Super Admin access required' },
        { status: 403 }
      );
    }

    const organizationKey = getOrganizationKey(user);
    if (!organizationKey) {
      return NextResponse.json({ success: false, error: 'Invalid user role' }, { status: 403 });
    }

    // Use name|userId for consistent database naming
    const GmailAccountModel = await getTenantGmailAccountModel(
      organizationKey,
      `${user.name}|${user.userId}`
    );
    
    const { accountId } = await request.json();
    
    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required' },
        { status: 400 }
      );
    }
    
    // Get account from tenant database
    const account = await GmailAccountModel.findById(accountId).lean();
    
    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }
    
    // Decrypt password
    const decryptedPassword = decrypt((account as any).password);
    
    return NextResponse.json({
      success: true,
      password: decryptedPassword
    });
    
  } catch (error: any) {
    console.error('Error decrypting password:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to decrypt password' },
      { status: 500 }
    );
  }
}
