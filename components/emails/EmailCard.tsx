'use client';

import React from 'react';
import { Mail, Check, Key, FileText, Edit, Trash2 } from 'lucide-react';

export interface INoteItem {
    id: string;
    key: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
}

interface EmailCardProps {
    account: {
        _id?: string;
        email: string;
        password: string;
        name: string;
        category: string;
        notes: INoteItem[];
    };
    categoryIcon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    categoryColor: string;
    copiedEmail: boolean;
    copiedPassword: boolean;
    userRole: string;
    onEmailClick: () => void;
    onCopyEmail: () => void;
    onCopyPassword: () => void;
    onViewNote: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const EmailCard: React.FC<EmailCardProps> = ({
    account,
    categoryIcon: Icon,
    categoryColor,
    copiedEmail,
    copiedPassword,
    userRole,
    onEmailClick,
    onCopyEmail,
    onCopyPassword,
    onViewNote,
    onEdit,
    onDelete,
}) => {
    return (
        <div className="email-item" onClick={onEmailClick}>
            <div className="email-icon" style={{ backgroundColor: categoryColor }}>
                <Mail className="icon" />
            </div>

            <div className="email-content">
                <div className="email-address">{account.email}</div>
                <div className="email-category">
                    <Icon className="category-icon" style={{ color: categoryColor }} />
                    <span>{account.name}</span>
                </div>
            </div>

            <div className="copy-buttons">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCopyEmail();
                    }}
                    className="copy-btn"
                    title="Copy email"
                >
                    {copiedEmail ? (
                        <Check className="icon success" />
                    ) : (
                        <Mail className="icon" />
                    )}
                </button>
                
                {userRole === 'superadmin' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCopyPassword();
                        }}
                        className="copy-btn"
                        title="Copy password"
                    >
                        {copiedPassword ? (
                            <Check className="icon success" />
                        ) : (
                            <Key className="icon" />
                        )}
                    </button>
                )}
                
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewNote();
                    }}
                    className={`copy-btn note-btn ${account.notes && account.notes.length > 0 ? 'has-note' : ''}`}
                    title={account.notes && account.notes.length > 0 ? 'View notes' : 'Add notes'}
                >
                    <FileText className="icon" />
                </button>
                
                {userRole === 'superadmin' && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            className="copy-btn edit-btn"
                            title="Edit account"
                        >
                            <Edit className="icon" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="copy-btn delete-btn"
                            title="Delete account"
                        >
                            <Trash2 className="icon" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
