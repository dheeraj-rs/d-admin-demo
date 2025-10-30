'use client';

import {
    Crown,
    Mail,
    Building,
    Key as KeyIcon,
    CheckCircle,
    XCircle,
    Trash2,
    Shield,
} from 'lucide-react';
import { User } from '../types';

interface AdminsListProps {
    superadmins: User[];
    admins: User[];
    searchQuery: string;
    handleSuperAdminClick: (superAdmin: User) => void;
    handleAction: (userId: string, action: string, collection: string, userName: string) => void;
}

export const AdminsList = ({
    superadmins,
    admins,
    searchQuery,
    handleSuperAdminClick,
    handleAction,
}: AdminsListProps) => {
    const filteredAdmins = superadmins.filter(sa =>
        sa.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sa.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sa.organizationName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredAdmins.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">
                    <Shield className="icon" />
                </div>
                <div className="empty-message">
                    {searchQuery ? 'No Admins found' : 'No Admins Yet'}
                </div>
                <div className="empty-suggestion">
                    {searchQuery
                        ? `No matches for "${searchQuery}". Try a different search term.`
                        : 'No Admins have registered yet. They will appear here once registered.'
                    }
                </div>
            </div>
        );
    }

    return (
        <div className="emails-list">
            {filteredAdmins.map((admin) => (
                <div
                    key={admin._id}
                    className="email-item"
                    onClick={() => handleSuperAdminClick(admin)}
                >
                    <div className="email-row">
                        <div className="email-icon superadmin-icon">
                            {admin.profilePicture ? (
                                <img
                                    src={admin.profilePicture}
                                    alt={admin.name || 'Profile'}
                                    className="profile-img"
                                />
                            ) : (
                                <Shield className="icon" />
                            )}
                        </div>

                        <div className="email-content">
                            <div className="email-address">
                                <span>{admin.name || admin.email}</span>
                            </div>
                            <div className="email-category">
                                <Mail className="category-icon" />
                                <span>{admin.email}</span>
                            </div>
                            {admin.organizationName && (
                                <div className="email-category">
                                    <span className='status-badge'>
                                        <Building className="category-icon" />
                                        {admin.organizationName}
                                    </span>
                                    <span className="status-badge admin-badge">
                                        <Shield size={12} />
                                        {admins.filter(a => a.organizationKey === admin.organizationKey).length} Sub-Admins
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <span className={`status-badge-corner ${admin.isActive ? 'active' : 'inactive'}`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                    </span>

                    <div className="copy-buttons">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAction(admin._id, 'activate', 'superadmins', admin.name || admin.email);
                            }}
                            className="copy-btn"
                            title="Set Active"
                        >
                            <CheckCircle className="icon" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAction(admin._id, 'inactive', 'superadmins', admin.name || admin.email);
                            }}
                            className="copy-btn"
                            title="Set Inactive"
                        >
                            <XCircle className="icon" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAction(admin._id, 'delete', 'superadmins', admin.name || admin.email);
                            }}
                            className="copy-btn delete-btn"
                            title="Delete"
                        >
                            <Trash2 className="icon" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
