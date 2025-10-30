import { NextRequest, NextResponse } from 'next/server';
import { isOwnerEmail, validateOwnerBackupKey, hasDatabaseBackupKeys, validateAndRemoveDatabaseBackupKey } from '../../../../lib/ownerAuth';
import { createEncryptedOwnerResponse } from '../../../../lib/owner-encryption';
import { connectDB } from '../../../../lib/mongodb';
import Owner from '../../../../models/Owner';
import { createAuthToken, createAuthSuccessResponse, AuthPayload } from '../../../../lib/unified-auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { email, backupKey, googleToken, name, twoFactorPin } = body;

        // Method 1: Google OAuth Login
        if (email && googleToken) {
            // Verify it's the owner email
            if (!isOwnerEmail(email)) {
                return NextResponse.json({ error: 'Unauthorized. Only owner can access.' }, { status: 403 });
            }

            // Decode JWT token to get actual Google ID (sub field)
            let actualGoogleId = email; // fallback to email if decoding fails
            try {
                const tokenParts = googleToken.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf-8'));
                    actualGoogleId = payload.sub || email;
                }
            } catch (error) {
                console.error('Failed to decode Google token:', error);
            }

            // Find or create owner
            let owner = await Owner.findOne({ email });
            if (!owner) {
                // Create owner if doesn't exist
                owner = await Owner.create({
                    email,
                    name: name || 'Owner',
                    googleId: actualGoogleId, // Use actual Google ID (sub)
                    backupKeys: [],
                    config: {},
                });
            } else {
                // Update existing owner with actual Google ID if different
                if (owner.googleId !== actualGoogleId) {
                    owner.googleId = actualGoogleId;
                    await owner.save();
                }
            }

            // Check if 2FA is enabled
            if (owner.twoFactorEnabled) {
                // If PIN not provided, return requiring 2FA
                if (!twoFactorPin) {
                    // Check if we already have a PIN in config
                    const storedPin = owner.config?.twoFactorPin;
                    const pinExpiry = owner.config?.twoFactorPinExpiry;

                    // Check if PIN exists and is still valid
                    if (storedPin && pinExpiry && new Date(pinExpiry) > new Date()) {
                        return NextResponse.json({
                            success: false,
                            requiresTwoFactor: true,
                            message: 'PIN verification required',
                            expiresAt: pinExpiry,
                        });
                    }

                    // PIN expired or doesn't exist, trigger new PIN send
                    return NextResponse.json({
                        success: false,
                        requiresTwoFactor: true,
                        requiresNewPin: true,
                        message: '2FA is enabled. Please request a new PIN.',
                    });
                }

                // Verify PIN
                const storedPin = owner.config?.twoFactorPin;
                const pinExpiry = owner.config?.twoFactorPinExpiry;

                if (!storedPin) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'No PIN found. Please request a new PIN.',
                        },
                        { status: 401 }
                    );
                }

                if (new Date(pinExpiry) < new Date()) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'PIN expired. Please request a new PIN.',
                        },
                        { status: 401 }
                    );
                }

                if (storedPin !== twoFactorPin) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'Invalid PIN. Please try again.',
                        },
                        { status: 401 }
                    );
                }

                // PIN verified, clear it
                owner.config = {
                    ...owner.config,
                    twoFactorPin: null,
                    twoFactorPinExpiry: null,
                };
            }

            // Update login tracking
            owner.lastLogin = new Date();
            await owner.save();

            // Create unified auth token
            const authPayload: AuthPayload = {
                userId: owner._id.toString(),
                email: owner.email,
                name: owner.name,
                role: 'owner',
                isOwner: true,
                permissions: {
                    isOwner: true,
                    fullAccess: true,
                    canManageAdmins: true,
                    canManageAccounts: true,
                },
            };

            const token = await createAuthToken(authPayload);

            // Create encrypted response - hide sensitive data
            const ownerData = {
                email,
                name: name || 'Owner',
                role: 'owner' as const,
                isOwner: true as const,
            };

            const encryptedUser = createEncryptedOwnerResponse(ownerData);

            return createAuthSuccessResponse(
                encryptedUser,
                token,
                'owner',
                { method: 'google' }
            );
        }

        // Method 2: Backup Key Login
        if (backupKey) {
            console.log('🔑 Backup key login attempt');

            // Check if database has generated keys
            const hasDbKeys = await hasDatabaseBackupKeys();
            console.log('📋 Has database backup keys:', hasDbKeys);

            let isValid = false;
            let keyType = '';

            if (hasDbKeys) {
                // If DB has keys, ONLY use DB keys (ignore env keys)
                console.log('🔐 Validating against database backup keys...');
                isValid = await validateAndRemoveDatabaseBackupKey(backupKey);
                keyType = 'database';
            } else {
                // If no DB keys, use env keys
                console.log('🔐 Validating against environment backup keys...');
                isValid = validateOwnerBackupKey(backupKey);
                keyType = 'env';
            }

            console.log('✅ Backup key validation result:', { isValid, keyType });

            if (!isValid) {
                const errorMsg = hasDbKeys ? 'Invalid backup key. Database keys are in use (env keys disabled).' : 'Invalid backup key from environment';
                console.log('❌', errorMsg);
                return NextResponse.json({ error: errorMsg }, { status: 401 });
            }

            const ownerEmail = process.env.OWNER_EMAIL || 'drjsde@gmail.com';

            // Find or create owner
            let owner = await Owner.findOne({ email: ownerEmail });
            if (!owner) {
                // Create owner if doesn't exist
                owner = await Owner.create({
                    email: ownerEmail,
                    name: 'Owner',
                    googleId: `${ownerEmail}-backup`,
                    backupKeys: [],
                    config: {},
                });
            }

            // ✅ Backup keys bypass 2FA - they are already strong authentication
            console.log('🔐 Backup key login successful - bypassing 2FA (backup keys are trusted)');
            // No 2FA check for backup keys

            // Update login tracking
            owner.lastLogin = new Date();
            await owner.save();

            // Create unified auth token
            const authPayload: AuthPayload = {
                userId: owner._id.toString(),
                email: owner.email,
                name: owner.name,
                role: 'owner',
                isOwner: true,
                permissions: {
                    isOwner: true,
                    fullAccess: true,
                    canManageAdmins: true,
                    canManageAccounts: true,
                },
            };

            const token = await createAuthToken(authPayload);

            // Create encrypted response - hide sensitive data
            const ownerData = {
                email: ownerEmail,
                name: 'Owner',
                role: 'owner' as const,
                isOwner: true as const,
            };

            const encryptedUser = createEncryptedOwnerResponse(ownerData);

            return createAuthSuccessResponse(
                encryptedUser,
                token,
                'owner',
                { method: 'backup-key', keyType }
            );
        }

        return NextResponse.json({ error: 'Invalid login method' }, { status: 400 });
    } catch (error) {
        console.error('Owner login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
