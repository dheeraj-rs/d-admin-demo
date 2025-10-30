import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure email transporter with better error handling
const createTransporter = () => {
    try {
        const emailUser = process.env.EMAIL_USER || 'drjsde@gmail.com';
        const emailPassword = process.env.EMAIL_PASSWORD;

        console.log('📧 Creating email transporter...');
        console.log('   Email User:', emailUser);
        console.log('   Password configured:', emailPassword ? 'Yes' : 'No');

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
        console.error('Error creating email transporter:', error);
        return null;
    }
};

// Email templates
const templates = {
    'superadmin-pre-approval': (data: any) => `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                .note { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 New Super Admin Access Request</h1>
                </div>
                <div class="content">
                    <p>Hello Master Admin,</p>
                    <p>Someone has requested Super Admin access to your system:</p>
                    
                    <div class="info-box">
                        <p><strong>Name:</strong> ${data.requestName}</p>
                        <p><strong>Email:</strong> ${data.requestEmail}</p>
                        <p><strong>Requested At:</strong> ${new Date(data.requestedAt).toLocaleString()}</p>
                    </div>
                    
                    <div class="note">
                        <p><strong>⚠️ Important:</strong> This is a pre-approval notification. The user will need to sign in with Google after you approve their request.</p>
                    </div>
                    
                    <p style="color: #666; font-size: 0.9em; margin-top: 30px;">
                        This is an automated notification from your D-Admin system.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `,

    'superadmin-request-confirmation': (data: any) => `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .step { padding: 10px 0; border-bottom: 1px solid #eee; }
                .step:last-child { border-bottom: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✓ Request Received</h1>
                </div>
                <div class="content">
                    <p>Hello ${data.requestName},</p>
                    <p>Thank you for requesting Super Admin access. Your request has been received and sent to the master admin for review.</p>
                    
                    <div class="steps">
                        <h3>Next Steps:</h3>
                        <div class="step"><strong>1.</strong> Master admin will review your request</div>
                        <div class="step"><strong>2.</strong> You'll receive an approval notification</div>
                        <div class="step"><strong>3.</strong> Sign in with Google to complete setup</div>
                        <div class="step"><strong>4.</strong> Start using the Super Admin portal</div>
                    </div>
                    
                    <p>This process usually takes a few minutes to a few hours. You'll receive an email notification once your request is approved.</p>
                    
                    <p style="color: #666; font-size: 0.9em; margin-top: 30px;">
                        If you have any questions, please contact the master admin.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `,

    'superadmin-approval': (data: any) => `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 40px 30px; }
                .info-box { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea; }
                .info-box p { margin: 12px 0; font-size: 16px; }
                .button-container { text-align: center; margin: 40px 0; }
                .button { display: inline-block; padding: 15px 40px; margin: 10px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
                .approve { background: #4CAF50; color: white; }
                .reject { background: #f44336; color: white; }
                .note { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px; font-size: 14px; color: #856404; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #e9ecef; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 New Super Admin Access Request</h1>
                </div>
                <div class="content">
                    <p>Hello Master Admin,</p>
                    <p>A new user has requested Super Admin access to your D-Admin system. Please review their details below:</p>
                    
                    <div class="info-box">
                        <p><strong>Applicant Name:</strong> ${data.adminName || 'Not provided'}</p>
                        <p><strong>Email Address:</strong> ${data.adminEmail || 'Not provided'}</p>
                        <p><strong>Request Time:</strong> ${new Date(data.requestedAt).toLocaleString()}</p>
                    </div>
                    
                    <p>Please take action by clicking one of the buttons below:</p>
                    
                    <div class="button-container">
                        <a href="${data.approveUrl}" class="button approve">✓ Approve Access</a>
                        <a href="${data.rejectUrl}" class="button reject">✗ Reject Request</a>
                    </div>
                    
                    <div class="note">
                        <strong>⚠️ Important:</strong> Clicking these buttons will immediately process the request. The applicant will receive an email notification about your decision.
                    </div>
                </div>
                <div class="footer">
                    <p>This is an automated email from your D-Admin System</p>
                    <p>© ${new Date().getFullYear()} D-Admin. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `,

    'superadmin-approved': (data: any) => `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 40px 30px; text-align: center; }
                .success-icon { font-size: 60px; margin-bottom: 10px; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 40px 30px; }
                .status-box { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0; border-radius: 4px; }
                .status-box p { margin: 8px 0; color: #155724; }
                .button-container { text-align: center; margin: 30px 0; }
                .button { display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #e9ecef; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="success-icon">✓</div>
                    <h1>Access Approved!</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${data.adminName || 'User'}</strong>,</p>
                    <p>Congratulations! Your Super Admin access request has been <strong>approved</strong> by the master admin.</p>
                    
                    <div class="status-box">
                        <p><strong>✓ Status:</strong> Approved</p>
                        <p><strong>📧 Your Email:</strong> ${data.adminEmail || 'N/A'}</p>
                        <p><strong>🕒 Approved At:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    
                    <p>You can now sign in to the D-Admin portal using your Google account:</p>
                    
                    <div class="button-container">
                        <a href="${data.loginUrl || process.env.NEXT_PUBLIC_APP_URL + '/admin'}" class="button">🚀 Sign In Now</a>
                    </div>
                    
                    <p>Welcome to the team! If you have any questions, please contact the master admin.</p>
                </div>
                <div class="footer">
                    <p>This is an automated email from your D-Admin System</p>
                    <p>© ${new Date().getFullYear()} D-Admin. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `,

    'superadmin-rejected': (data: any) => `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .header { background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 40px 30px; text-align: center; }
                .error-icon { font-size: 60px; margin-bottom: 10px; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 40px 30px; }
                .status-box { background: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 25px 0; border-radius: 4px; }
                .status-box p { margin: 8px 0; color: #721c24; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #e9ecef; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="error-icon">✗</div>
                    <h1>Request Not Approved</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${data.adminName || 'User'}</strong>,</p>
                    <p>Thank you for your interest in becoming a Super Admin for D-Admin.</p>
                    
                    <div class="status-box">
                        <p><strong>✗ Status:</strong> Rejected</p>
                        <p><strong>📧 Your Email:</strong> ${data.adminEmail || 'N/A'}</p>
                        <p><strong>🕒 Reviewed At:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    
                    <p>After careful review, the master admin has decided not to approve your Super Admin access request at this time.</p>
                    <p>If you believe this is an error or would like to discuss this decision, please contact the master admin directly.</p>
                    <p>Thank you for your understanding.</p>
                </div>
                <div class="footer">
                    <p>This is an automated email from your D-Admin System</p>
                    <p>© ${new Date().getFullYear()} D-Admin. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `,
};

// POST - Send email
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { to, subject, template, data } = body;

        if (!to || !subject) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        let htmlContent = '';

        if (template && templates[template as keyof typeof templates]) {
            htmlContent = templates[template as keyof typeof templates](data);
        } else {
            htmlContent = data.html || '';
        }

        const transporter = createTransporter();

        if (!transporter) {
            console.error('❌ Email transporter not configured');
            return NextResponse.json({ success: false, error: 'Email service not configured. Please check EMAIL_PASSWORD in .env' }, { status: 500 });
        }

        // Verify transporter configuration
        try {
            await transporter.verify();
            console.log('✅ Email transporter verified successfully');
        } catch (verifyError: any) {
            console.error('❌ Email transporter verification failed:', verifyError);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Email configuration invalid. Please check EMAIL_USER and EMAIL_PASSWORD in .env',
                    details: verifyError.message,
                },
                { status: 500 }
            );
        }

        const mailOptions = {
            from: `"D-Admin System" <${process.env.EMAIL_USER || 'drjsde@gmail.com'}>`,
            to,
            subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Email sent successfully');
        console.log('   To:', to);
        console.log('   Subject:', subject);
        console.log('   Message ID:', info.messageId);

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId,
        });
    } catch (error: any) {
        console.error('❌ Error sending email:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to send email',
                details: error.code || 'Unknown error',
            },
            { status: 500 }
        );
    }
}
