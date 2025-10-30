import { NextRequest, NextResponse } from 'next/server';
import { encrypt, decrypt } from '../../../lib/encryption';
import { authenticate } from '../../../lib/auth-middleware';
import { getOrganizationKey } from '../../../lib/data-isolation';
import { getTenantGmailAccountModel } from '../../../lib/tenant-models';
import { initializeTenantDatabase } from '../../../lib/tenant-db-connect';
import { convertNotesToArray } from '../../../lib/notesConverter';

export const dynamic = 'force-dynamic';

// GET - Fetch all Gmail accounts with optional filters (TENANT-SPECIFIC)
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { authenticated, user, error } = await authenticate(request);
    
    if (!authenticated || !user) {
      return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
    }

    // Get organization key
    const organizationKey = getOrganizationKey(user);
    if (!organizationKey) {
      return NextResponse.json({ success: false, error: 'Invalid user role or missing organization key' }, { status: 403 });
    }

    // Get tenant-specific model (use name|userId for database naming)
    const GmailAccountModel = await getTenantGmailAccountModel(
      organizationKey,
      `${user.name}|${user.userId}`
    );

    const url = new URL(request.url);
    
    // Extract query parameters
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    
    // Build query - NO organizationKey filter needed (separate database!)
    const query: any = {};
    
    // Add search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { email: { $regex: searchRegex } },
        { name: { $regex: searchRegex } }
      ];
    }
    
    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Get all accounts from tenant database
    const accounts = await GmailAccountModel.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    // Return accounts with masked passwords and converted notes
    const maskedAccounts = accounts.map((account: any) => ({
      ...account,
      password: '*'.repeat(12), // Show fixed length asterisks
      notes: convertNotesToArray(account.notes) // Auto-convert old string notes to array
    }));
    
    return NextResponse.json({
      success: true,
      data: maskedAccounts
    });
    
  } catch (error: any) {
    console.error('Error fetching Gmail accounts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Gmail accounts' },
      { status: 500 }
    );
  }
}

// POST - Create a new Gmail account (TENANT-SPECIFIC)
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { authenticated, user, error } = await authenticate(request);
    
    if (!authenticated || !user) {
      return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
    }

    // Get organization key
    const organizationKey = getOrganizationKey(user);
    if (!organizationKey) {
      return NextResponse.json({ success: false, error: 'Invalid user role or missing organization key' }, { status: 403 });
    }

    // Get tenant-specific model (use name|userId for database naming)
    const GmailAccountModel = await getTenantGmailAccountModel(
      organizationKey,
      `${user.name}|${user.userId}`
    );

    // Initialize tenant database if this is the first time
    await initializeTenantDatabase(organizationKey, `${user.name}|${user.userId}`);

    const data = await request.json();
    
    // Validate required fields
    if (!data.email || !data.password || !data.name || !data.category) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Check if email already exists in tenant database
    const existingAccount = await GmailAccountModel.findOne({ email: data.email });
    if (existingAccount) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    // Encrypt password before saving
    const encryptedPassword = encrypt(data.password);
    
    const gmailAccount = new GmailAccountModel({
      ...data,
      password: encryptedPassword
    });
    await gmailAccount.save();
    
    return NextResponse.json({
      success: true,
      data: gmailAccount
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating Gmail account:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create Gmail account' },
      { status: 500 }
    );
  }
}
