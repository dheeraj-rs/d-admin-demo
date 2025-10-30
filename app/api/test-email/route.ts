import { NextRequest, NextResponse } from 'next/server';
import { sendSuperAdminApprovalEmail, sendSuperAdminApprovedEmail, sendSuperAdminRejectedEmail } from '../../../lib/email-service';

/**
 * Test Email API - For testing email functionality
 * This endpoint allows testing the email approval system
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, testEmail } = body;

        // Use test email or default to drjsde@gmail.com
        const targetEmail = testEmail || 'drjsde@gmail.com';

        console.log('📧 Testing email system...');
        console.log('   Type:', type);
        console.log('   Target Email:', targetEmail);

        let emailSent = false;
        let message = '';

        switch (type) {
            case 'approval':
                // Test approval request email (sent to owner)
                emailSent = await sendSuperAdminApprovalEmail(targetEmail, {
                    name: 'Test User',
                    email: 'testuser@example.com',
                    organizationName: 'Test Organization',
                    organizationKey: 'TEST-ORG-KEY',
                    id: 'test-id-12345',
                });
                message = 'Approval request email test';
                break;

            case 'approved':
                // Test approval confirmation email (sent to SuperAdmin)
                emailSent = await sendSuperAdminApprovedEmail(targetEmail, 'Test User', 'Test Organization');
                message = 'Approval confirmation email test';
                break;

            case 'rejected':
                // Test rejection email (sent to SuperAdmin)
                emailSent = await sendSuperAdminRejectedEmail(targetEmail, 'Test User', 'This is a test rejection');
                message = 'Rejection email test';
                break;

            default:
                return NextResponse.json({ success: false, error: 'Invalid email type. Use: approval, approved, or rejected' }, { status: 400 });
        }

        if (emailSent) {
            console.log('✅ Test email sent successfully');
            return NextResponse.json({
                success: true,
                message: `${message} sent successfully to ${targetEmail}`,
                emailSent: true,
            });
        } else {
            console.error('❌ Test email failed to send');
            return NextResponse.json({
                success: false,
                message: `${message} failed to send`,
                emailSent: false,
                error: 'Email sending failed. Check server logs for details.',
            });
        }
    } catch (error: any) {
        console.error('Test email error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to send test email',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}

/**
 * GET endpoint to show test email UI
 */
export async function GET(request: NextRequest) {
    return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Email Test System</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 800px;
                    margin: 50px auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #667eea;
                    text-align: center;
                    margin-bottom: 30px;
                }
                .test-section {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #667eea;
                }
                .test-section h3 {
                    margin-top: 0;
                    color: #333;
                }
                button {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                    margin: 5px;
                }
                button:hover {
                    opacity: 0.9;
                }
                button:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                }
                input {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 16px;
                    margin: 10px 0;
                }
                .result {
                    margin-top: 20px;
                    padding: 15px;
                    border-radius: 6px;
                    display: none;
                }
                .result.success {
                    background: #d1fae5;
                    border: 1px solid #10b981;
                    color: #065f46;
                    display: block;
                }
                .result.error {
                    background: #fee2e2;
                    border: 1px solid #ef4444;
                    color: #991b1b;
                    display: block;
                }
                .info {
                    background: #eff6ff;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #3b82f6;
                    margin: 20px 0;
                }
                .spinner {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border: 3px solid rgba(255,255,255,.3);
                    border-radius: 50%;
                    border-top-color: #fff;
                    animation: spin 1s ease-in-out infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📧 Email Test System</h1>
                
                <div class="info">
                    <strong>ℹ️ Test Email Configuration:</strong><br>
                    Default recipient: <strong>drjsde@gmail.com</strong><br>
                    You can change the email below to test with different addresses.
                </div>

                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">
                        Test Email Address:
                    </label>
                    <input 
                        type="email" 
                        id="testEmail" 
                        value="drjsde@gmail.com" 
                        placeholder="Enter email address"
                    />
                </div>

                <div class="test-section">
                    <h3>1️⃣ Approval Request Email</h3>
                    <p>This email is sent to the owner when a new SuperAdmin registers.</p>
                    <button onclick="sendTestEmail('approval')">
                        Send Approval Request Test
                    </button>
                </div>

                <div class="test-section">
                    <h3>2️⃣ Approval Confirmation Email</h3>
                    <p>This email is sent to the SuperAdmin when their account is approved.</p>
                    <button onclick="sendTestEmail('approved')">
                        Send Approval Confirmation Test
                    </button>
                </div>

                <div class="test-section">
                    <h3>3️⃣ Rejection Email</h3>
                    <p>This email is sent to the SuperAdmin when their account is rejected.</p>
                    <button onclick="sendTestEmail('rejected')">
                        Send Rejection Test
                    </button>
                </div>

                <div id="result" class="result"></div>
            </div>

            <script>
                async function sendTestEmail(type) {
                    const testEmail = document.getElementById('testEmail').value;
                    const resultDiv = document.getElementById('result');
                    const buttons = document.querySelectorAll('button');
                    
                    // Disable all buttons
                    buttons.forEach(btn => {
                        btn.disabled = true;
                        btn.innerHTML = '<span class="spinner"></span> Sending...';
                    });

                    resultDiv.className = 'result';
                    resultDiv.style.display = 'none';

                    try {
                        const response = await fetch('/api/test-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ type, testEmail }),
                        });

                        const data = await response.json();

                        if (data.success) {
                            resultDiv.className = 'result success';
                            resultDiv.innerHTML = '✅ ' + data.message;
                        } else {
                            resultDiv.className = 'result error';
                            resultDiv.innerHTML = '❌ ' + (data.error || data.message);
                        }
                    } catch (error) {
                        resultDiv.className = 'result error';
                        resultDiv.innerHTML = '❌ Network error: ' + error.message;
                    } finally {
                        // Re-enable buttons
                        buttons.forEach((btn, index) => {
                            btn.disabled = false;
                            const labels = [
                                'Send Approval Request Test',
                                'Send Approval Confirmation Test',
                                'Send Rejection Test'
                            ];
                            btn.innerHTML = labels[index];
                        });
                    }
                }
            </script>
        </body>
        </html>
        `,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
}
