'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, AlertCircle, Mail } from 'lucide-react';

export interface INoteItem {
    id: string;
    key: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
}

interface GmailAccount {
    email: string;
    password: string;
    name: string;
    category: 'personal' | 'gaming' | 'backup' | 'testing' | 'professional' | 'pro-mails';
    notes: INoteItem[];
}

interface AccountModalProps {
    show: boolean;
    mode: 'add' | 'edit' | 'delete';
    formData: GmailAccount;
    selectedAccount: { email: string } | null;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: () => void;
    onFormChange: (data: Partial<GmailAccount>) => void;
}

const EMAIL_DOMAINS = [
    '@gmail.com',
    '@icloud.com',
    '@outlook.com',
    '@yahoo.com',
    '@hotmail.com',
    '@protonmail.com',
];

export const AccountModal: React.FC<AccountModalProps> = ({
    show,
    mode,
    formData,
    selectedAccount,
    isSubmitting,
    onClose,
    onSubmit,
    onFormChange,
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Handle email input change and show suggestions
    const handleEmailChange = (value: string) => {
        onFormChange({ email: value });

        // Show suggestions if user typed 6+ characters and no @ symbol
        if (value.length >= 6 && !value.includes('@')) {
            const emailSuggestions = EMAIL_DOMAINS.map(domain => value + domain);
            setSuggestions(emailSuggestions);
            setShowSuggestions(true);
            setSelectedSuggestionIndex(-1);
        } else {
            setShowSuggestions(false);
        }
    };

    // Handle suggestion selection
    const selectSuggestion = (suggestion: string) => {
        onFormChange({ email: suggestion });
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => 
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
            e.preventDefault();
            selectSuggestion(suggestions[selectedSuggestionIndex]);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                emailInputRef.current &&
                !emailInputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset suggestions when modal closes
    useEffect(() => {
        if (!show) {
            setShowSuggestions(false);
            setSuggestions([]);
            setSelectedSuggestionIndex(-1);
        }
    }, [show]);

    if (!show) return null;

    return (
        <div className="email-modal-overlay" onClick={onClose}>
            <div className="email-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="email-modal-header">
                    <h2>
                        {mode === 'add' && 'Add New Account'}
                        {mode === 'edit' && 'Edit Account'}
                        {mode === 'delete' && 'Delete Account'}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X className="icon" />
                    </button>
                </div>

                <div className="email-modal-body">
                    {mode === 'delete' ? (
                        <div className="delete-confirmation">
                            <AlertCircle className="warning-icon" />
                            <p>Are you sure you want to delete this account?</p>
                            <div className="account-info">
                                <strong>{selectedAccount?.email}</strong>
                            </div>
                        </div>
                    ) : (
                        <div className="form-fields">
                            <div className="form-field email-field-with-suggestions">
                                <label>Email</label>
                                <div className="email-input-wrapper">
                                    <input
                                        ref={emailInputRef}
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleEmailChange(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Enter email address (e.g., username)"
                                        autoComplete="off"
                                    />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div ref={suggestionsRef} className="email-suggestions">
                                            {suggestions.map((suggestion, index) => (
                                                <div
                                                    key={suggestion}
                                                    className={`suggestion-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                                                    onClick={() => selectSuggestion(suggestion)}
                                                    onMouseMove={() => setSelectedSuggestionIndex(index)}
                                                >
                                                    <Mail className="suggestion-icon" />
                                                    <span>{suggestion}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {formData.email.length >= 6 && !formData.email.includes('@') && (
                                    <small className="email-hint">
                                        💡 Type 6+ characters to see email suggestions
                                    </small>
                                )}
                            </div>
                            <div className="form-field">
                                <label>Password</label>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) => onFormChange({ password: e.target.value })}
                                    placeholder={mode === 'edit' ? 'Clear to change password' : 'Enter password'}
                                />
                                {mode === 'edit' && formData.password.startsWith('*') && (
                                    <small style={{ color: 'var(--text-color-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                        Password is encrypted. Clear the field to set a new password.
                                    </small>
                                )}
                            </div>
                            <div className="form-field">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => onFormChange({ name: e.target.value })}
                                    placeholder="Enter account name"
                                />
                            </div>
                            <div className="form-field">
                                <label>Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => onFormChange({ category: e.target.value as any })}
                                >
                                    <option value="personal">Personal</option>
                                    <option value="gaming">Gaming</option>
                                    <option value="backup">Backup</option>
                                    <option value="testing">Testing</option>
                                    <option value="professional">Professional</option>
                                    <option value="pro-mails">Pro Mails</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="email-modal-footer">
                    <button
                        className="cancel-button"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        className={`save-button ${mode === 'delete' ? 'delete-button' : ''}`}
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        style={{ minWidth: '140px' }}
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
                        {isSubmitting ? (
                            <>
                                {mode === 'add' && 'Adding...'}
                                {mode === 'edit' && 'Updating...'}
                                {mode === 'delete' && 'Deleting...'}
                            </>
                        ) : (
                            <>
                                {mode === 'add' && 'Add Account'}
                                {mode === 'edit' && 'Update Account'}
                                {mode === 'delete' && 'Delete Account'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
