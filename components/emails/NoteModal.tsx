'use client';

import React from 'react';
import { X, FileText, Mail, Edit, Trash2 } from 'lucide-react';

interface NoteModalProps {
    show: boolean;
    mode: 'view' | 'edit';
    accountEmail: string;
    noteContent: string;
    isSubmitting: boolean;
    onClose: () => void;
    onEdit: () => void;
    onSave: () => void;
    onDelete: () => void;
    onNoteChange: (value: string) => void;
    onCancel: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
    show,
    mode,
    accountEmail,
    noteContent,
    isSubmitting,
    onClose,
    onEdit,
    onSave,
    onDelete,
    onNoteChange,
    onCancel,
}) => {
    if (!show) return null;

    const renderNoteLines = () => {
        if (!noteContent) {
            return (
                <div className="empty-note-state">
                    <FileText className="empty-icon" />
                    <p>No notes added yet</p>
                    <span>Click Edit to add usage details, subscription info, and more</span>
                </div>
            );
        }

        return (
            <div className="note-lines">
                {noteContent.split('\n').map((line, index) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return null;

                    const colonIndex = trimmedLine.indexOf(':');
                    if (colonIndex > 0) {
                        const key = trimmedLine.substring(0, colonIndex).trim()?.toUpperCase();
                        const value = trimmedLine.substring(colonIndex + 1).trim();
                        return (
                            <div key={index} className="note-line note-line-keyvalue">
                                <span className="note-key">{key}</span>
                                <span className="note-value">{value}</span>
                            </div>
                        );
                    }

                    return (
                        <div key={index} className="note-line">
                            <span className="note-text">{trimmedLine}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="email-modal-overlay" onClick={onClose}>
            <div className="email-modal-container note-modal" onClick={(e) => e.stopPropagation()}>
                <div className="email-modal-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText className="icon" />
                        {mode === 'view' ? 'Note Details' : 'Edit Note'}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X className="icon" />
                    </button>
                </div>

                <div className="email-modal-body">
                    <div className="note-account-info">
                        <Mail className="icon" />
                        <span>{accountEmail}</span>
                    </div>

                    <div className="note-details-section">
                        {mode === 'view' ? (
                            <div className="note-view-content">
                                {renderNoteLines()}
                            </div>
                        ) : (
                            <div className="note-edit-content">
                                <label className="note-label">Note Details</label>
                                <textarea
                                    value={noteContent}
                                    onChange={(e) => onNoteChange(e.target.value)}
                                    placeholder="Add notes about this email account...&#10;&#10;Examples:&#10;curser: using to all tokens using&#10;&#10;netflix: using the mail and 20-12-2025 end subscription&#10;&#10;amazon: prime membership active&#10;&#10;recovery email: backup@example.com"
                                    className="note-textarea"
                                />
                                <div className="note-hint">
                                    <span>💡 Tip: Use &quot;key: value&quot; format for better readability</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="email-modal-footer note-modal-footer">
                    {mode === 'view' ? (
                        <>
                            <button className="note-close-btn" onClick={onClose}>
                                Close
                            </button>
                            <div style={{ display: 'flex', gap: '0.625rem' }}>
                                {noteContent && (
                                    <button
                                        className="note-delete-btn"
                                        onClick={onDelete}
                                        disabled={isSubmitting}
                                    >
                                        <Trash2 className="btn-icon" />
                                        {isSubmitting ? 'Deleting...' : 'Delete'}
                                    </button>
                                )}
                                <button className="note-edit-btn" onClick={onEdit}>
                                    <Edit className="btn-icon" />
                                    Edit
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                className="note-close-btn"
                                onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                className="note-save-btn"
                                onClick={onSave}
                                disabled={isSubmitting}
                            >
                                {isSubmitting && (
                                    <span className="spinner" style={{
                                        display: 'inline-block',
                                        width: '14px',
                                        height: '14px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: 'white',
                                        borderRadius: '50%',
                                        animation: 'spin 0.6s linear infinite',
                                        marginRight: '8px',
                                        verticalAlign: 'middle'
                                    }}></span>
                                )}
                                {isSubmitting ? 'Saving...' : 'Save Note'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
