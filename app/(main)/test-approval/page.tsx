'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Mail, CheckCircle, XCircle, Loader2, Send } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function TestApprovalPage() {
    const [loading, setLoading] = useState(false);
    const [testEmail, setTestEmail] = useState('drjsde@gmail.com');
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    useEffect(() => {
        loadPendingRequests();
    }, []);

    const loadPendingRequests = async () => {
        setLoadingRequests(true);
        try {
            const response = await fetch('/api/test-approval/list', {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                }
            });
            const data = await response.json();
            if (data.success) {
                setPendingRequests(data.requests || []);
                console.log('📊 Loaded requests:', data.requests.length);
            }
        } catch (error) {
            console.error('Error loading requests:', error);
            toast.error('Failed to load requests');
        } finally {
            setLoadingRequests(false);
        }
    };

    const sendTestApprovalEmail = async () => {
        setLoading(true);
        try {
            toast.loading('Sending test approval email...', { id: 'sending' });

            const response = await fetch('/api/test-approval/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testEmail }),
            });

            const data = await response.json();
            toast.dismiss('sending');

            if (data.success) {
                toast.success('✅ Approval email sent to ' + testEmail);
                // Auto-refresh the list
                setTimeout(() => {
                    loadPendingRequests();
                }, 500);
            } else {
                toast.error('❌ ' + (data.error || 'Failed to send email'));
            }
        } catch (error: any) {
            toast.dismiss('sending');
            toast.error('❌ Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px 20px'
        }}>
            <Toaster position="top-center" />

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: '12px',
                    marginBottom: '30px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <Shield size={48} style={{ color: '#667eea', marginBottom: '15px' }} />
                    <h1 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '32px' }}>
                        📧 Approval Email Test System
                    </h1>
                    <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
                        Test the complete approval email flow: Send → Approve/Reject → Status
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    {/* Left Panel - Send Test Email */}
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{
                            margin: '0 0 20px 0',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <Send size={24} />
                            Send Test Approval Email
                        </h2>

                        <div style={{
                            background: '#eff6ff',
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            border: '1px solid #3b82f6'
                        }}>
                            <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
                                <strong>ℹ️ How it works:</strong><br />
                                1. Enter email address (default: drjsde@gmail.com)<br />
                                2. Click &quot;Send Test Email&quot;<br />
                                3. Check your email inbox<br />
                                4. Click Approve or Reject link<br />
                                5. See status update in right panel
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#333'
                            }}>
                                <Mail size={18} style={{ display: 'inline', marginRight: '8px' }} />
                                Test Email Address
                            </label>
                            <input
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="Enter email address"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <small style={{ color: '#6b7280', fontSize: '13px', display: 'block', marginTop: '6px' }}>
                                This email will receive the approval request
                            </small>
                        </div>

                        <button
                            onClick={sendTestApprovalEmail}
                            disabled={loading || !testEmail}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: loading || !testEmail ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: loading || !testEmail ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="spinner" size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Send Test Approval Email
                                </>
                            )}
                        </button>

                        <div style={{
                            background: '#fff3cd',
                            padding: '15px',
                            borderRadius: '8px',
                            marginTop: '20px',
                            border: '1px solid #ffc107'
                        }}>
                            <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
                                <strong>⚠️ Note:</strong> This creates a test SuperAdmin registration.
                                Check the email inbox for approval/rejection links.
                            </p>
                        </div>
                    </div>

                    {/* Right Panel - Pending Requests Status */}
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h2 style={{
                                margin: 0,
                                color: '#333',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <Shield size={24} />
                                Approval Status
                            </h2>
                            <button
                                onClick={() => {
                                    loadPendingRequests();
                                    toast.success('🔄 Refreshing status...');
                                }}
                                disabled={loadingRequests}
                                style={{
                                    padding: '8px 16px',
                                    background: loadingRequests ? '#9ca3af' : '#667eea',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: loadingRequests ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}
                            >
                                {loadingRequests ? 'Loading...' : '🔄 Refresh'}
                            </button>
                        </div>

                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            {loadingRequests ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 size={40} style={{ color: '#667eea', animation: 'spin 1s linear infinite' }} />
                                    <p style={{ color: '#666', marginTop: '15px' }}>Loading requests...</p>
                                </div>
                            ) : pendingRequests.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px',
                                    background: '#f9fafb',
                                    borderRadius: '8px'
                                }}>
                                    <Mail size={48} style={{ color: '#d1d5db', marginBottom: '15px' }} />
                                    <p style={{ color: '#6b7280', margin: 0 }}>
                                        No requests yet. Send a test email to get started.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {pendingRequests.map((request, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                padding: '20px',
                                                background: request.approvalStatus === 'approved'
                                                    ? '#d1fae5'
                                                    : request.approvalStatus === 'rejected'
                                                        ? '#fee2e2'
                                                        : '#f9fafb',
                                                borderRadius: '8px',
                                                border: request.approvalStatus === 'approved'
                                                    ? '2px solid #10b981'
                                                    : request.approvalStatus === 'rejected'
                                                        ? '2px solid #ef4444'
                                                        : '2px solid #e5e7eb'
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: '12px'
                                            }}>
                                                <div>
                                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#333' }}>
                                                        {request.name}
                                                    </h3>
                                                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                                                        {request.email}
                                                    </p>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    background: request.approvalStatus === 'approved'
                                                        ? '#10b981'
                                                        : request.approvalStatus === 'rejected'
                                                            ? '#ef4444'
                                                            : '#f59e0b',
                                                    color: 'white',
                                                    fontSize: '13px',
                                                    fontWeight: '600'
                                                }}>
                                                    {request.approvalStatus === 'approved' && (
                                                        <>
                                                            <CheckCircle size={16} />
                                                            Approved
                                                        </>
                                                    )}
                                                    {request.approvalStatus === 'rejected' && (
                                                        <>
                                                            <XCircle size={16} />
                                                            Rejected
                                                        </>
                                                    )}
                                                    {request.approvalStatus === 'pending' && (
                                                        <>
                                                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                                            Pending
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{
                                                fontSize: '13px',
                                                color: '#6b7280',
                                                borderTop: '1px solid #e5e7eb',
                                                paddingTop: '12px',
                                                marginTop: '12px'
                                            }}>
                                                <p style={{ margin: '4px 0' }}>
                                                    <strong>Organization:</strong> {request.organizationName}
                                                </p>
                                                <p style={{ margin: '4px 0' }}>
                                                    <strong>Created:</strong> {new Date(request.createdAt).toLocaleString()}
                                                </p>
                                                {request.approvedAt && (
                                                    <p style={{ margin: '4px 0', color: '#10b981' }}>
                                                        <strong>Approved:</strong> {new Date(request.approvedAt).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: '12px',
                    marginTop: '30px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📋 Testing Instructions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
                            <div style={{ fontSize: '32px', marginBottom: '10px' }}>1️⃣</div>
                            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Send Email</h4>
                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                                Enter email address and click &quot;Send Test Approval Email&quot;
                            </p>
                        </div>
                        <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
                            <div style={{ fontSize: '32px', marginBottom: '10px' }}>2️⃣</div>
                            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Check Email</h4>
                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                                Open the email and click &quot;Approve&quot; or &quot;Reject&quot; button
                            </p>
                        </div>
                        <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
                            <div style={{ fontSize: '32px', marginBottom: '10px' }}>3️⃣</div>
                            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>See Status</h4>
                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                                Click &quot;Refresh&quot; to see the updated approval status
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .spinner {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}
