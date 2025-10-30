'use client';

import { useState } from 'react';
import { Shield, Plus, Eye, EyeOff, Copy, CheckCircle, Lock, Key } from 'lucide-react';
import { BackupKey } from '../types';
import { OwnerPasswordModal } from '../../../../components/modals/OwnerPasswordModal';
import toast from 'react-hot-toast';

interface SettingsSectionProps {
    twoFactorEnabled: boolean;
    backupKeys: BackupKey[];
    showKeys: { [key: string]: boolean };
    passwordRequired: boolean;
    hasPassword: boolean;
    handleToggleTwoFactor: () => void;
    handleGenerateBackupKey: () => void;
    handleTogglePasswordRequired: (password: string) => Promise<void>;
    handleSetPassword: (currentPassword: string, newPassword: string) => Promise<void>;
    setShowKeys: (keys: { [key: string]: boolean }) => void;
    copyToClipboard: (text: string) => void;
}

export const SettingsSection = ({
    twoFactorEnabled,
    backupKeys,
    showKeys,
    passwordRequired,
    hasPassword,
    handleToggleTwoFactor,
    handleGenerateBackupKey,
    handleTogglePasswordRequired,
    handleSetPassword,
    setShowKeys,
    copyToClipboard,
}: SettingsSectionProps) => {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showToggleModal, setShowToggleModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const handlePasswordSubmit = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsProcessing(true);
        try {
            await handleSetPassword(currentPassword, newPassword);
            setShowPasswordModal(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            toast.success('✅ Password updated successfully!');
        } catch (error: any) {
            console.error('Password update error:', error);
            // Handle specific error cases
            if (error.message?.includes('JSON')) {
                toast.error('Session expired. Please login again.');
                setTimeout(() => window.location.href = '/owner-login', 2000);
            } else {
                toast.error(error.message || 'Failed to update password');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="settings-section-wrapper">
            {/* Password Management */}
            <div className="settings-card">
                <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Lock size={18} />
                        Owner Password
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-color-secondary)' }}>
                        {hasPassword ? 'Update your owner password for critical operations' : 'Set a password for critical operations (currently using env variable)'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                        }}
                    >
                        <Key size={14} />
                        {hasPassword ? 'Update Password' : 'Set Password'}
                    </button>
                </div>

                {/* Password Required Toggle */}
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--surface-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                                Require Password
                            </h4>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-color-secondary)' }}>
                                When disabled, critical operations won&apos;t require password verification
                            </p>
                        </div>
                        <button
                            onClick={() => setShowToggleModal(true)}
                            style={{
                                position: 'relative',
                                width: '56px',
                                height: '28px',
                                borderRadius: '14px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background 0.3s',
                                background: passwordRequired ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'var(--surface-border)',
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '2px',
                                    left: passwordRequired ? '30px' : '2px',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    transition: 'left 0.3s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                }}
                            />
                        </button>
                    </div>
                    {!passwordRequired && (
                        <div style={{ marginTop: '12px', padding: '12px', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px' }}>
                            <p style={{ margin: 0, fontSize: '12px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <strong>⚠️ Warning:</strong> Password verification is disabled. Critical operations can be performed without password.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            {/* Two-Factor Authentication */}
            <div className="settings-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Shield size={18} />
                            Two-Factor Authentication
                        </h3>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-color-secondary)' }}>
                            Add an extra layer of security to your account
                        </p>
                    </div>
                    <button
                        onClick={handleToggleTwoFactor}
                        style={{
                            position: 'relative',
                            width: '56px',
                            height: '28px',
                            borderRadius: '14px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background 0.3s',
                            background: twoFactorEnabled ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'var(--surface-border)',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: '2px',
                                left: twoFactorEnabled ? '30px' : '2px',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'white',
                                transition: 'left 0.3s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            }}
                        />
                    </button>
                </div>
                {twoFactorEnabled && (
                    <div style={{ marginTop: '16px', padding: '12px', background: '#d1fae5', border: '1px solid #10b981', borderRadius: '8px' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: '#065f46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle size={14} />
                            <strong>Two-factor authentication is enabled.</strong> You&apos;ll be prompted for a verification code during login.
                        </p>
                    </div>
                )}
            </div>

            {/* Backup Keys */}
            <div className="settings-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={18} />
                        Backup Keys
                    </h3>
                    <button onClick={handleGenerateBackupKey} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                        <Plus size={14} />
                        Generate
                    </button>
                </div>
                <div style={{ marginBottom: '12px', padding: '12px', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#92400e' }}>
                        <strong>Note:</strong> Generates 6 keys at once. Old keys cleared. Once DB has keys, env keys disabled. Keys auto-delete after use.
                    </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {backupKeys.length === 0 ? (
                        <p style={{ color: 'var(--text-color-secondary)', fontSize: '13px', margin: 0 }}>No backup keys generated yet. Click Generate to create 6 new keys.</p>
                    ) : (
                        <div style={{ padding: '16px', background: 'var(--surface-ground)', borderRadius: '12px', border: '2px solid var(--primary-color)' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-color-secondary)', marginBottom: '12px' }}>
                                Generated: {new Date(backupKeys[0].generatedAt).toLocaleString()}
                            </div>
                            <div
                                className="backup-keys-scroll"
                                style={{
                                    display: 'flex',
                                    gap: '10px',
                                    overflowX: 'auto',
                                    paddingBottom: '8px',
                                }}
                            >
                                {backupKeys.map((key, idx) => (
                                    <div key={idx} style={{
                                        minWidth: '130px',
                                        padding: '12px',
                                        background: 'var(--surface-card)',
                                        borderRadius: '10px',
                                        border: '2px solid var(--surface-border)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px',
                                        alignItems: 'center',
                                    }}>
                                        <code style={{
                                            fontFamily: 'monospace',
                                            fontSize: '15px',
                                            fontWeight: 800,
                                            color: 'var(--primary-color)',
                                            letterSpacing: '1px',
                                        }}>
                                            {showKeys[idx] ? key.key : '•••••••••'}
                                        </code>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button
                                                onClick={() => setShowKeys({ ...showKeys, [idx]: !showKeys[idx] })}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--text-color-secondary)',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                                title={showKeys[idx] ? 'Hide' : 'Show'}
                                            >
                                                {showKeys[idx] ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(key.key)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--text-color-secondary)',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                                title="Copy"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => {
                                    const allKeys = backupKeys.map(k => k.key).join(' ');
                                    copyToClipboard(allKeys);
                                }}
                                style={{
                                    marginTop: '12px',
                                    padding: '10px 16px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    justifyContent: 'center',
                                    width: '100%',
                                }}
                            >
                                <Copy size={14} />
                                Copy All {backupKeys.length} Keys
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Set/Update Password Modal */}
            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => !isProcessing && setShowPasswordModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <Lock className="modal-icon secure" />
                            <h3>{hasPassword ? 'Update Password' : 'Set Password'}</h3>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: '16px', fontSize: '13px' }}>
                                {hasPassword
                                    ? 'Enter your current password and choose a new password.'
                                    : 'Enter the env OWNER_PASSWORD to verify, then set your new password.'}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', display: 'block' }}>
                                        {hasPassword ? 'Current Password' : 'Verification Password (from env)'}
                                    </label>
                                    <input
                                        type="password"
                                        placeholder={hasPassword ? 'Enter current password' : 'Enter env OWNER_PASSWORD'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        disabled={isProcessing}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid var(--surface-border)',
                                            fontSize: '13px',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', display: 'block' }}>
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Enter new password (min 6 characters)"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        disabled={isProcessing}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid var(--surface-border)',
                                            fontSize: '13px',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', display: 'block' }}>
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handlePasswordSubmit()}
                                        disabled={isProcessing}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid var(--surface-border)',
                                            fontSize: '13px',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setShowPasswordModal(false)} className="btn-cancel" disabled={isProcessing}>
                                Cancel
                            </button>
                            <button onClick={handlePasswordSubmit} className="btn-success" disabled={isProcessing || !currentPassword || !newPassword || !confirmPassword}>
                                {isProcessing ? 'Processing...' : hasPassword ? 'Update Password' : 'Set Password'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Password Requirement Modal */}
            <OwnerPasswordModal
                isOpen={showToggleModal}
                onClose={() => setShowToggleModal(false)}
                onConfirm={async (password) => {
                    await handleTogglePasswordRequired(password);
                    setShowToggleModal(false);
                }}
                title="Confirm Password Requirement Change"
                description={`You are about to ${passwordRequired ? 'disable' : 'enable'} password requirement for critical operations. Please enter your password to confirm:`}
                confirmButtonText="Confirm Change"
                loading={false}
            />
        </div>
    );
};
