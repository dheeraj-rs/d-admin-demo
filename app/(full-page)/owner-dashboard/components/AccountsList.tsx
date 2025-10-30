'use client';

import { Users, Mail, Building, CheckCircle, XCircle, Trash2, CreditCard } from 'lucide-react';
import { User } from '../types';

interface AccountsListProps {
    users: User[];
    handleAction: (userId: string, action: string, collection: string, userName: string) => void;
}

export const AccountsList = ({ users, handleAction }: AccountsListProps) => {
    // Group accounts by plan
    const freeAccounts = users.filter(u => !u.plan || u.plan === 'free');
    const proAccounts = users.filter(u => u.plan === 'pro');
    const maxAccounts = users.filter(u => u.plan === 'max');

    if (users.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">
                    <Users className="icon" />
                </div>
                <div className="empty-message">No Accounts Yet</div>
                <div className="empty-suggestion">
                    No accounts have been created yet. They will appear here once registered.
                </div>
            </div>
        );
    }

    const renderAccountCard = (user: User) => (
        <div key={user._id} className="email-item">
            <div className="email-row">
                <div className="email-icon user-icon">
                    {user.profilePicture ? (
                        <img
                            src={user.profilePicture}
                            alt={user.name || 'Profile'}
                            className="profile-img"
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                            ) : (
                        <Users className="icon" />
                    )}
                </div>
                <div className="email-content">
                    <div className="email-address">
                        <span>{user.name || user.username || 'Unknown'}</span>
                    </div>
                    <div className="email-category">
                        <Mail className="category-icon" />
                        <span>{user.email}</span>
                    </div>
                    {user.organizationName && (
                        <div className="email-category">
                            <Building className="category-icon" />
                            <span>{user.organizationName}</span>
                        </div>
                    )}
                </div>
            </div>

            <span className={`status-badge-corner ${user.isActive ? 'active' : 'inactive'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
            </span>

            <div className="copy-buttons">
                <button
                    onClick={() => handleAction(user._id, 'activate', 'users', user.name || user.email)}
                    className="copy-btn"
                    title="Set Active"
                >
                    <CheckCircle className="icon" />
                </button>
                <button
                    onClick={() => handleAction(user._id, 'inactive', 'users', user.name || user.email)}
                    className="copy-btn"
                    title="Set Inactive"
                >
                    <XCircle className="icon" />
                </button>
                <button
                    onClick={() => handleAction(user._id, 'delete', 'users', user.name || user.email)}
                    className="copy-btn delete-btn"
                    title="Delete"
                >
                    <Trash2 className="icon" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="emails-list">
            {/* FREE Plan Accounts */}
            {freeAccounts.length > 0 && (
                <div className="plan-section">
                    <h3 className="plan-header">
                        <CreditCard size={20} /> FREE Plan ({freeAccounts.length})
                    </h3>
                    {freeAccounts.map(renderAccountCard)}
                </div>
            )}

            {/* PRO Plan Accounts */}
            {proAccounts.length > 0 && (
                <div className="plan-section">
                    <h3 className="plan-header pro-plan">
                        <CreditCard size={20} /> PRO Plan ({proAccounts.length})
                    </h3>
                    {proAccounts.map(renderAccountCard)}
                </div>
            )}

            {/* MAX Plan Accounts */}
            {maxAccounts.length > 0 && (
                <div className="plan-section">
                    <h3 className="plan-header max-plan">
                        <CreditCard size={20} /> MAX Plan ({maxAccounts.length})
                    </h3>
                    {maxAccounts.map(renderAccountCard)}
                </div>
            )}
        </div>
    );
};
