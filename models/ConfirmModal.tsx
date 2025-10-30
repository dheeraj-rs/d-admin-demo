'use client';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'OK',
    cancelText = 'Cancel',
    type = 'info'
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const getTypeColor = () => {
        switch (type) {
            case 'danger':
                return '#ef4444';
            case 'warning':
                return '#f59e0b';
            case 'success':
                return '#10b981';
            default:
                return '#6366f1';
        }
    };

    return (
        <div
            className="confirm-modal-overlay"
            onClick={onCancel}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
            }}
        >
            <div
                className="confirm-modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: 'var(--surface-card)',
                    borderRadius: '12px',
                    padding: '24px',
                    maxWidth: '400px',
                    width: '90%',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    animation: 'modalSlideIn 0.2s ease-out',
                }}
            >
                <div style={{ marginBottom: '16px' }}>
                    <h3
                        style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: 600,
                            color: 'var(--text-color)',
                        }}
                    >
                        {title}
                    </h3>
                </div>
                <div style={{ marginBottom: '24px' }}>
                    <p
                        style={{
                            margin: 0,
                            fontSize: '14px',
                            color: 'var(--text-color-secondary)',
                            lineHeight: '1.5',
                        }}
                    >
                        {message}
                    </p>
                </div>
                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'flex-end',
                    }}
                >
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '1px solid var(--surface-border)',
                            backgroundColor: 'transparent',
                            color: 'var(--text-color)',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: getTypeColor(),
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
            <style jsx>{`
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
