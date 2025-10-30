import nodemailer from 'nodemailer';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'drjsde';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Create transporter with better error handling
const createTransporter = () => {
    try {
        const emailUser = process.env.EMAIL_USER || 'drjsde@gmail.com';
        const emailPassword = process.env.EMAIL_PASSWORD;

        console.log('📧 Creating email transporter...');
        console.log('   Email User:', emailUser);
        console.log('   Password configured:', emailPassword ? 'Yes' : 'No');
        console.log('   Password length:', emailPassword ? emailPassword.length : 0);

        if (!emailPassword) {
            console.error('❌ EMAIL_PASSWORD not configured in .env');
            return null;
        }

        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPassword,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    } catch (error) {
        console.error('❌ Error creating email transporter:', error);
        return null;
    }
};

/**
 * Encrypt email for approval link
 */
export function encryptEmail(email: string): string {
    try {
        // Create a 32-byte key from ENCRYPTION_KEY
        const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
        // Create a random 16-byte IV
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(email, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Return IV + encrypted data (IV needed for decryption)
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt email');
    }
}

/**
 * Decrypt email from approval link
 */
export function decryptEmail(encryptedEmail: string): string {
    try {
        // Split IV and encrypted data
        const parts = encryptedEmail.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = parts[1];

        // Create a 32-byte key from ENCRYPTION_KEY
        const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Invalid encrypted email');
    }
}

/**
 * Send SuperAdmin approval request email to owner
 */
export async function sendSuperAdminApprovalEmail(
    ownerEmail: string,
    superAdminData: {
        name: string;
        email: string;
        organizationName: string;
        organizationKey: string;
        id: string;
    }
): Promise<boolean> {
    try {
        const transporter = createTransporter();

        if (!transporter) {
            console.error('❌ Email transporter not configured');
            return false;
        }

        // Verify transporter
        try {
            await transporter.verify();
            console.log('✅ Email transporter verified successfully');
        } catch (verifyError: any) {
            console.error('❌ Email transporter verification failed:', verifyError.message);
            return false;
        }

        const encryptedEmail = encryptEmail(ownerEmail);
        const approveUrl = `${APP_URL}/api/auth/approve-superadmin?id=${superAdminData.id}&email=${encryptedEmail}&action=approve`;
        const rejectUrl = `${APP_URL}/api/auth/approve-superadmin?id=${superAdminData.id}&email=${encryptedEmail}&action=reject`;

        const mailOptions = {
            from: `"D-Admin Platform" <${process.env.EMAIL_USER || 'drjsde@gmail.com'}>`,
            to: ownerEmail,
            subject: '🔔 New SuperAdmin Registration Approval Required',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                        .content { background: white; padding: 30px; border-radius: 8px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header h1 { color: #667eea; margin: 0; font-size: 28px; }
                        .info-box { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
                        .info-box p { margin: 10px 0; }
                        .button { display: inline-block; padding: 12px 30px; margin: 10px 5px; text-decoration: none; border-radius: 6px; font-weight: bold; }
                        .approve-btn { background: #10b981; color: white; }
                        .reject-btn { background: #ef4444; color: white; }
                        .button-container { text-align: center; margin: 30px 0; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            <div class="header">
                                <h1>🔐 SuperAdmin Approval Request</h1>
                            </div>
                            
                            <p>Hello Owner,</p>
                            <p>A new SuperAdmin registration requires your approval:</p>
                            
                            <div class="info-box">
                                <p><strong>Name:</strong> ${superAdminData.name}</p>
                                <p><strong>Email:</strong> ${superAdminData.email}</p>
                                <p><strong>Organization:</strong> ${superAdminData.organizationName}</p>
                                <p><strong>Organization Key:</strong> ${superAdminData.organizationKey}</p>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Important:</strong> Please verify the identity of this user before approving access.
                            </div>
                            
                            <div class="button-container">
                                <a href="${approveUrl}" class="button approve-btn">✓ Approve Access</a>
                                <a href="${rejectUrl}" class="button reject-btn">✗ Reject Request</a>
                            </div>
                            
                            <div class="footer">
                                <p>This is an automated email from D-Admin Platform.</p>
                                <p>&copy; 2025 D-Admin. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ SuperAdmin approval email sent successfully');
        console.log('   To:', ownerEmail);
        console.log('   Message ID:', info.messageId);
        return true;
    } catch (error: any) {
        console.error('❌ Error sending SuperAdmin approval email:', error);
        console.error('   Error details:', error.message);
        return false;
    }
}

/**
 * Send approval confirmation email to SuperAdmin with login link
 */
export async function sendSuperAdminApprovedEmail(superAdminEmail: string, superAdminName: string, organizationName: string): Promise<boolean> {
    try {
        const transporter = createTransporter();

        if (!transporter) {
            console.error('❌ Email transporter not configured');
            return false;
        }

        const loginUrl = `${APP_URL}/superadmin-login`;

        const mailOptions = {
            from: `"D-Admin Platform" <${process.env.EMAIL_USER || 'drjsde@gmail.com'}>`,
            to: superAdminEmail,
            subject: '🎉 Your SuperAdmin Account Has Been Approved!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                        .content { background: white; padding: 30px; border-radius: 8px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header h1 { color: #10b981; margin: 0; font-size: 28px; }
                        .success-icon { text-align: center; font-size: 64px; margin: 20px 0; }
                        .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3); }
                        .button-container { text-align: center; margin: 30px 0; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            <div class="header">
                                <div class="success-icon">✅</div>
                                <h1>Account Approved!</h1>
                            </div>
                            
                            <p>Hello <strong>${superAdminName}</strong>,</p>
                            <p>🎉 Great news! Your SuperAdmin account for <strong>${organizationName}</strong> has been approved by the owner.</p>
                            <p><strong>You can now access your SuperAdmin dashboard!</strong></p>
                            
                            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                                <h3 style="margin: 0 0 10px 0; color: #065f46;">📧 Login Instructions:</h3>
                                <ol style="margin: 0; padding-left: 20px; color: #065f46;">
                                    <li>Click the "Login to Dashboard" button below</li>
                                    <li>Sign in using your <strong>Google account</strong> (${superAdminEmail})</li>
                                    <li>You'll be automatically logged in as SuperAdmin</li>
                                </ol>
                            </div>
                            
                            <div class="button-container">
                                <a href="${loginUrl}" class="button">🚀 Login to Dashboard</a>
                            </div>
                            
                            <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #3b82f6;">
                                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                                    <strong>🔐 Security Note:</strong> Always use your Google account (${superAdminEmail}) to login. 
                                    Your account is protected by Google's authentication system.
                                </p>
                            </div>
                            
                            <div class="footer">
                                <p>Welcome to D-Admin Platform!</p>
                                <p>&copy; 2025 D-Admin. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Login link email sent successfully');
        console.log('   To:', superAdminEmail);
        console.log('   Message ID:', info.messageId);
        return true;
    } catch (error: any) {
        console.error('❌ Error sending login link email:', error);
        console.error('   Error details:', error.message);
        return false;
    }
}

/**
 * Send Admin approval request email to SuperAdmin
 */
export async function sendAdminApprovalEmail(
    superAdminEmail: string,
    adminData: {
        name: string;
        email: string;
        id: string;
        organizationKey: string;
    }
): Promise<boolean> {
    try {
        const transporter = createTransporter();
        
        if (!transporter) {
            console.error('❌ Email transporter not configured');
            return false;
        }

        const encryptedEmail = encryptEmail(superAdminEmail);
        const approveUrl = `${APP_URL}/api/auth/approve-admin?id=${adminData.id}&email=${encryptedEmail}&action=approve`;
        const rejectUrl = `${APP_URL}/api/auth/approve-admin?id=${adminData.id}&email=${encryptedEmail}&action=reject`;

        const mailOptions = {
            from: `"D-Admin Platform" <${process.env.EMAIL_USER || 'drjsde@gmail.com'}>`,
            to: superAdminEmail,
            subject: '🔔 New Admin Registration Approval Required',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                        .content { background: white; padding: 30px; border-radius: 8px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header h1 { color: #667eea; margin: 0; font-size: 28px; }
                        .info-box { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
                        .info-box p { margin: 10px 0; }
                        .button { display: inline-block; padding: 12px 30px; margin: 10px 5px; text-decoration: none; border-radius: 6px; font-weight: bold; }
                        .approve-btn { background: #10b981; color: white; }
                        .reject-btn { background: #ef4444; color: white; }
                        .button-container { text-align: center; margin: 30px 0; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            <div class="header">
                                <h1>🔐 Admin Approval Request</h1>
                            </div>
                            
                            <p>Hello SuperAdmin,</p>
                            <p>A new Admin registration requires your approval:</p>
                            
                            <div class="info-box">
                                <p><strong>Name:</strong> ${adminData.name}</p>
                                <p><strong>Email:</strong> ${adminData.email}</p>
                                <p><strong>Organization:</strong> ${adminData.organizationKey}</p>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Important:</strong> Please verify the identity of this user before approving access.
                            </div>
                            
                            <div class="button-container">
                                <a href="${approveUrl}" class="button approve-btn">✓ Approve Access</a>
                                <a href="${rejectUrl}" class="button reject-btn">✗ Reject Request</a>
                            </div>
                            
                            <div class="footer">
                                <p>This is an automated email from D-Admin Platform.</p>
                                <p>&copy; 2025 D-Admin. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Admin approval email sent successfully');
        console.log('   To:', superAdminEmail);
        console.log('   Message ID:', info.messageId);
        return true;
    } catch (error: any) {
        console.error('❌ Error sending Admin approval email:', error);
        console.error('   Error details:', error.message);
        return false;
    }
}

/**
 * Send admin invite email with invite URL and access key
 */
export async function sendAdminInviteEmail(
    invitedEmail: string,
    inviteData: {
        inviteUrl: string;
        adminAccessKey: string;
        superAdminName: string;
        expiresAt: Date;
    }
): Promise<boolean> {
    try {
        const transporter = createTransporter();

        if (!transporter) {
            console.error('❌ Email transporter not configured');
            return false;
        }

        // Verify transporter
        try {
            await transporter.verify();
            console.log('✅ Email transporter verified successfully');
        } catch (verifyError: any) {
            console.error('❌ Email transporter verification failed:', verifyError.message);
            return false;
        }

        const expiryDate = new Date(inviteData.expiresAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const mailOptions = {
            from: `"D-Admin Platform" <${process.env.EMAIL_USER || 'drjsde@gmail.com'}>`,
            to: invitedEmail,
            subject: '🎉 You\'re Invited to Join as Admin!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                        .content { background: white; padding: 30px; border-radius: 8px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header h1 { color: #667eea; margin: 0; font-size: 28px; }
                        .invite-icon { text-align: center; font-size: 64px; margin: 20px 0; }
                        .info-box { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
                        .info-box p { margin: 10px 0; }
                        .key-box { background: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0; border: 2px dashed #3b82f6; text-align: center; }
                        .key-box code { font-size: 18px; font-weight: bold; color: #1e40af; font-family: 'Courier New', monospace; letter-spacing: 1px; }
                        .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3); }
                        .button-container { text-align: center; margin: 30px 0; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .steps { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .steps h3 { margin: 0 0 15px 0; color: #065f46; }
                        .steps ol { margin: 0; padding-left: 20px; color: #065f46; }
                        .steps li { margin: 8px 0; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            <div class="header">
                                <div class="invite-icon">📧</div>
                                <h1>Admin Invitation</h1>
                            </div>
                            
                            <p>Hello!</p>
                            <p>🎉 <strong>${inviteData.superAdminName}</strong> has invited you to join their organization as an Admin on D-Admin Platform!</p>
                            
                            <div class="info-box">
                                <p><strong>Invited by:</strong> ${inviteData.superAdminName}</p>
                                <p><strong>Your Email:</strong> ${invitedEmail}</p>
                                <p><strong>Expires:</strong> ${expiryDate}</p>
                            </div>
                            
                            <div class="steps">
                                <h3>📋 Registration Steps:</h3>
                                <ol>
                                    <li>Click the "Accept Invitation" button below</li>
                                    <li>Sign in with your Google account (${invitedEmail})</li>
                                    <li>Enter the Admin Access Key provided below</li>
                                    <li>Complete your profile details</li>
                                    <li>Wait for final approval from SuperAdmin</li>
                                </ol>
                            </div>
                            
                            <div class="key-box">
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">🔑 Your Admin Access Key:</p>
                                <code>${inviteData.adminAccessKey}</code>
                                <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">Copy this key - you'll need it during registration</p>
                            </div>
                            
                            <div class="button-container">
                                <a href="${inviteData.inviteUrl}" class="button">🚀 Accept Invitation</a>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Important:</strong>
                                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                    <li>This invitation expires on <strong>${expiryDate}</strong></li>
                                    <li>You must use the email address <strong>${invitedEmail}</strong> to register</li>
                                    <li>Keep your Admin Access Key secure and don't share it</li>
                                    <li>If you didn't expect this invitation, please ignore this email</li>
                                </ul>
                            </div>
                            
                            <div class="footer">
                                <p>Welcome to D-Admin Platform!</p>
                                <p>&copy; 2025 D-Admin. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Admin invite email sent successfully');
        console.log('   To:', invitedEmail);
        console.log('   Message ID:', info.messageId);
        return true;
    } catch (error: any) {
        console.error('❌ Error sending admin invite email:', error);
        console.error('   Error details:', error.message);
        return false;
    }
}

/**
 * Send rejection email to SuperAdmin
 */
export async function sendSuperAdminRejectedEmail(superAdminEmail: string, superAdminName: string, reason?: string): Promise<boolean> {
    try {
        const transporter = createTransporter();

        if (!transporter) {
            console.error('❌ Email transporter not configured');
            return false;
        }

        const mailOptions = {
            from: `"D-Admin Platform" <${process.env.EMAIL_USER || 'drjsde@gmail.com'}>`,
            to: superAdminEmail,
            subject: '❌ SuperAdmin Account Registration Rejected',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background: #ef4444; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                        .content { background: white; padding: 30px; border-radius: 8px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header h1 { color: #ef4444; margin: 0; font-size: 28px; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            <div class="header">
                                <h1>Request Rejected</h1>
                            </div>
                            
                            <p>Hello ${superAdminName},</p>
                            <p>Unfortunately, your SuperAdmin registration request has been rejected.</p>
                            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                            <p>If you believe this is an error, please contact the platform owner.</p>
                            
                            <div class="footer">
                                <p>&copy; 2025 D-Admin. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Rejection email sent successfully');
        console.log('   To:', superAdminEmail);
        console.log('   Message ID:', info.messageId);
        return true;
    } catch (error: any) {
        console.error('❌ Error sending rejection email:', error);
        console.error('   Error details:', error.message);
        return false;
    }
}

/**
 * Send deletion approval request email to Owner for SuperAdmin deletion
 */
export async function sendSuperAdminDeletionApprovalEmail(
    ownerEmail: string,
    data: {
        id: string;
        name: string;
        email: string;
        organizationName: string;
        organizationKey: string;
        token: string;
    }
): Promise<boolean> {
    try {
        const transporter = createTransporter();
        if (!transporter) {
            console.error('❌ Email transporter not configured');
            return false;
        }

        const approveUrl = `${APP_URL}/api/owner/approve-superadmin-deletion?token=${encodeURIComponent(data.token)}`;

        const mailOptions = {
            from: `"D-Admin Platform" <${process.env.EMAIL_USER || 'drjsde@gmail.com'}>`,
            to: ownerEmail,
            subject: '⚠️ URGENT: Approve SuperAdmin Deletion',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); padding: 30px; border-radius: 10px; }
                        .content { background: white; padding: 25px; border-radius: 8px; }
                        .button { display: inline-block; padding: 14px 28px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 16px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            <h2 style="color: #ef4444;">⚠️ SuperAdmin Deletion Approval Required</h2>
                            <p>A request has been made to <strong>permanently delete</strong> the following SuperAdmin:</p>
                            <ul>
                                <li><strong>Name:</strong> ${data.name}</li>
                                <li><strong>Email:</strong> ${data.email}</li>
                                <li><strong>Organization:</strong> ${data.organizationName}</li>
                                <li><strong>Organization Key:</strong> ${data.organizationKey}</li>
                            </ul>
                            <div class="warning">
                                <strong>⚠️ DANGER:</strong> Approving this will:
                                <ul>
                                    <li>Permanently delete the SuperAdmin account</li>
                                    <li>Delete all Admins in this organization</li>
                                    <li>Drop the entire tenant database</li>
                                    <li>Remove all users and data for this organization</li>
                                </ul>
                                <p><strong>This action CANNOT be undone!</strong></p>
                            </div>
                            <p style="text-align: center;">
                                <a href="${approveUrl}" class="button">Approve Permanent Deletion</a>
                            </p>
                            <p style="font-size: 12px; color: #666; margin-top: 20px;">If you did not request this deletion, please ignore this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ SuperAdmin deletion approval email sent successfully');
        console.log('   To:', ownerEmail);
        console.log('   Message ID:', info.messageId);
        return true;
    } catch (error: any) {
        console.error('❌ Error sending superadmin deletion approval email:', error);
        console.error('   Error details:', error.message);
        return false;
    }
}

/**
 * Send Admin invite email with secure token-based registration link
 */
export async function sendSuperAdminInviteEmail(
    invitedEmail: string,
    inviteToken: string,
    expiresAt: Date
): Promise<boolean> {
    try {
        const transporter = createTransporter();

        if (!transporter) {
            console.error('❌ Email transporter not configured');
            return false;
        }

        // Verify transporter
        try {
            await transporter.verify();
            console.log('✅ Email transporter verified successfully');
        } catch (verifyError: any) {
            console.error('❌ Email transporter verification failed:', verifyError.message);
            return false;
        }

        const registrationUrl = `${APP_URL}/register-admin?token=${encodeURIComponent(inviteToken)}`;
        console.log('📧 Registration URL:', registrationUrl);
        
        const expiryDate = new Date(expiresAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const mailOptions = {
            from: `"D-Admin Platform" <${process.env.EMAIL_USER || 'drjsde@gmail.com'}>`,
            to: invitedEmail,
            subject: '🎉 You\'re Invited to Join D-Admin as Admin!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                        .content { background: white; padding: 30px; border-radius: 8px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header h1 { color: #667eea; margin: 0; font-size: 28px; }
                        .invite-icon { text-align: center; font-size: 64px; margin: 20px 0; }
                        .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3); }
                        .button-container { text-align: center; margin: 30px 0; }
                        .info-box { background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }
                        .steps { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .steps h3 { margin: 0 0 15px 0; color: #1e40af; }
                        .steps ol { margin: 0; padding-left: 20px; color: #1e40af; }
                        .steps li { margin: 8px 0; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            <div class="header">
                                <div class="invite-icon">🛡️</div>
                                <h1>Admin Invitation</h1>
                            </div>
                            
                            <p>Hello!</p>
                            <p>🎉 You have been invited to join <strong>D-Admin Platform</strong> as an <strong>Admin</strong>!</p>
                            
                            <div class="info-box">
                                <p style="margin: 0; color: #065f46;">
                                    <strong>🔐 As an Admin, you will have:</strong>
                                    <br />• Full control over your organization
                                    <br />• Ability to manage accounts and users
                                    <br />• Access to powerful dashboard features
                                    <br />• Your own tenant with unique hostname
                                </p>
                            </div>
                            
                            <div class="steps">
                                <h3>📋 Registration Steps:</h3>
                                <ol>
                                    <li>Click the "Register as Admin" button below</li>
                                    <li>Complete your registration with email and password</li>
                                    <li>Set up your organization details</li>
                                    <li>Get your unique hostname (e.g., yourcompany.d-admin.com)</li>
                                    <li>Start managing your organization immediately!</li>
                                </ol>
                            </div>
                            
                            <div class="button-container">
                                <a href="${registrationUrl}" class="button">🚀 Register as Admin</a>
                            </div>
                            
                            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                <strong>⚠️ Important Security Information:</strong>
                                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                    <li>This invitation link is <strong>unique and secure</strong> - only for <strong>${invitedEmail}</strong></li>
                                    <li>The link expires on <strong>${expiryDate}</strong></li>
                                    <li>You must use the Google account <strong>${invitedEmail}</strong> to register</li>
                                    <li>Do not share this invitation link with anyone</li>
                                    <li>After registration, wait for owner approval before accessing the dashboard</li>
                                    <li>If you didn't expect this invitation, please ignore this email</li>
                                </ul>
                            </div>
                            
                            <div class="footer">
                                <p>Welcome to D-Admin Platform!</p>
                                <p>&copy; 2025 D-Admin. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ SuperAdmin invite email sent successfully');
        console.log('   To:', invitedEmail);
        console.log('   Message ID:', info.messageId);
        return true;
    } catch (error: any) {
        console.error('❌ Error sending SuperAdmin invite email:', error);
        console.error('   Error details:', error.message);
        return false;
    }
}

/**
 * Send Two-Factor Authentication PIN email to owner
 */
export async function sendOwner2FAPinEmail(
    ownerEmail: string,
    pin: string,
    expiresAt: Date
): Promise<boolean> {
    try {
        const transporter = createTransporter();

        if (!transporter) {
            console.error('❌ Email transporter not configured');
            return false;
        }

        // Verify transporter
        try {
            await transporter.verify();
            console.log('✅ Email transporter verified successfully');
        } catch (verifyError: any) {
            console.error('❌ Email transporter verification failed:', verifyError.message);
            return false;
        }

        const expiryMinutes = Math.round((expiresAt.getTime() - Date.now()) / 60000);

        const mailOptions = {
            from: `"D-Admin Platform" <${process.env.EMAIL_USER || 'drjsde@gmail.com'}>`,
            to: ownerEmail,
            subject: '🔐 Your Two-Factor Authentication PIN',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                        .content { background: white; padding: 30px; border-radius: 8px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header h1 { color: #667eea; margin: 0; font-size: 28px; }
                        .pin-box { background: #eff6ff; padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0; border: 3px dashed #3b82f6; }
                        .pin-code { font-size: 42px; font-weight: bold; color: #1e40af; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 15px 0; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .info { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
                        .icon { font-size: 48px; text-align: center; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            <div class="icon">🔐</div>
                            <div class="header">
                                <h1>Two-Factor Authentication</h1>
                            </div>
                            
                            <p>Hello Owner,</p>
                            <p>A login attempt was made to your D-Admin owner account. Use this PIN to complete your login:</p>
                            
                            <div class="pin-box">
                                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your 6-digit verification PIN:</p>
                                <div class="pin-code">${pin}</div>
                                <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">Valid for ${expiryMinutes} minutes</p>
                            </div>

                            <div class="info">
                                <strong>📱 How to use this PIN:</strong>
                                <ol style="margin: 10px 0 0 0; padding-left: 20px; color: #1e40af;">
                                    <li>Return to the login page</li>
                                    <li>Enter this 6-digit PIN in the verification field</li>
                                    <li>Click "Verify PIN" to complete your login</li>
                                </ol>
                            </div>

                            <div class="warning">
                                <strong>⏰ Important Security Information:</strong>
                                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                    <li>This PIN is valid for <strong>${expiryMinutes} minutes</strong> only</li>
                                    <li>Do not share this PIN with anyone</li>
                                    <li>If you did not attempt to login, please secure your account immediately</li>
                                    <li>D-Admin staff will never ask for your PIN</li>
                                </ul>
                            </div>

                            <div class="footer">
                                <p>This is an automated email from D-Admin Platform.</p>
                                <p>&copy; 2025 D-Admin. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ 2FA PIN email sent successfully');
        console.log('   To:', ownerEmail);
        console.log('   Message ID:', info.messageId);
        console.log('   PIN valid for:', expiryMinutes, 'minutes');
        return true;
    } catch (error: any) {
        console.error('❌ Error sending 2FA PIN email:', error);
        console.error('   Error details:', error.message);
        return false;
    }
}
