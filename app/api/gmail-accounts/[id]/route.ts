import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { encrypt } from '../../../../lib/encryption';
import { authenticate } from '../../../../lib/auth-middleware';
import { getOrganizationKey } from '../../../../lib/data-isolation';
import { getTenantGmailAccountModel } from '../../../../lib/tenant-models';

export const dynamic = 'force-dynamic';

// GET - Fetch a single Gmail account by ID (TENANT-SPECIFIC)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated, user, error } = await authenticate(request);
    if (!authenticated || !user) {
      return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
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
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid account ID' },
        { status: 400 }
      );
    }
    
    const account = await GmailAccountModel.findById(id);
    
    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: account
    });
    
  } catch (error: any) {
    console.error('Error fetching Gmail account:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Gmail account' },
      { status: 500 }
    );
  }
}

// PUT - Update a Gmail account by ID (TENANT-SPECIFIC)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated, user, error } = await authenticate(request);
    if (!authenticated || !user) {
      return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
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
    const { id } = await params;
    const data = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid account ID' },
        { status: 400 }
      );
    }
    
    // If email is being updated, check if it already exists
    if (data.email) {
      const existingAccount = await GmailAccountModel.findOne({ 
        email: data.email,
        _id: { $ne: id }
      });
      
      if (existingAccount) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 409 }
        );
      }
    }
    
    // If password is being updated and it's not masked, encrypt it
    const updateData = { ...data };
    if (data.password && !data.password.startsWith('*')) {
      updateData.password = encrypt(data.password);
    } else if (data.password && data.password.startsWith('*')) {
      // Don't update password if it's masked (user didn't change it)
      delete updateData.password;
    }
    
    const updatedAccount = await GmailAccountModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedAccount) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedAccount
    });
    
  } catch (error: any) {
    console.error('Error updating Gmail account:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update Gmail account' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a Gmail account by ID (TENANT-SPECIFIC)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated, user, error } = await authenticate(request);
    if (!authenticated || !user) {
      return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
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
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid account ID' },
        { status: 400 }
      );
    }
    
    const deletedAccount = await GmailAccountModel.findByIdAndDelete(id);
    
    if (!deletedAccount) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
      data: deletedAccount
    });
    
  } catch (error: any) {
    console.error('Error deleting Gmail account:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete Gmail account' },
      { status: 500 }
    );
  }
}
