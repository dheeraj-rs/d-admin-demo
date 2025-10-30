'use client';

import { useState } from 'react';
import { FiLock, FiAlertTriangle, FiSave } from 'react-icons/fi';

interface OwnerPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (password: string) => Promise<void>;
    title?: string;
    description?: string;
    confirmButtonText?: string;
    loading?: boolean;
}

export const OwnerPasswordModal: React.FC<OwnerPasswordModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Owner Approval Required',
    description = 'These changes affect all users. Please enter your owner password to confirm:',
    confirmButtonText = 'Confirm & Save',
    loading = false,
}) => {
    const [password, setPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = async () => {
        if (!password) {
            return;
        }

        setIsProcessing(true);
        try {
            await onConfirm(password);
            setPassword('');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        if (!isProcessing && !loading) {
            setPassword('');
            onClose();
        }
    };

    if (!isOpen) return null;

    const isDisabled = isProcessing || loading;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <FiLock className="modal-icon secure" />
                    <h3>{title}</h3>
                </div>
                <div className="modal-body">
                    {description && (
                        <p style={{ marginBottom: '16px' }}>
                            {description}
                        </p>
                    )}
                    <div className="password-input-group">
                        <input
                            type="password"
                            placeholder="Enter owner password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isDisabled && handleConfirm()}
                            disabled={isDisabled}
                            autoFocus
                        />
                    </div>
                    <div className="warning-note">
                        <FiAlertTriangle />
                        <span>Changes will take effect immediately for all users</span>
                    </div>
                </div>
                <div className="modal-actions">
                    <button onClick={handleClose} className="btn-cancel" disabled={isDisabled}>
                        Cancel
                    </button>
                    <button onClick={handleConfirm} className="btn-success" disabled={isDisabled || !password}>
                        <FiSave /> {isProcessing || loading ? 'Processing...' : confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};
