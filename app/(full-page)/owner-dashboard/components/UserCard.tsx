'use client';

import {
    Shield,
    Users,
    Crown,
    Mail,
    Calendar,
    Building,
    Key as KeyIcon,
    Trash2,
    Lock,
    Unlock,
    CheckCircle,
    AlertCircle,
    UserCheck,
    UserX,
} from 'lucide-react';
import { User } from '../types';

interface UserCardProps {
    user: User;
    collection: string;
    handleAction: (userId: string, action: string, collection: string, userName: string) => void;
}

export const UserCard = ({ user, collection, handleAction }: UserCardProps) => (
    <div key={user._id} className="user-card">
        <div className="user-info">
            <div className="user-header">
                <div className="user-avatar">
                    {collection === 'superadmins' ? (
                        <Crown size={24} />
                    ) : collection === 'admins' ? (
                        <Shield size={24} />
                    ) : (
                        <Users size={24} />
                    )}
                </div>
                <div className="user-details">
                    <h3>{user.name || user.username || 'Unknown'}</h3>
                    <p className="user-email">
                        <Mail size={14} />
                        {user.email}
                    </p>
                    {user.organizationName && (
                        <p className="user-org">
                            <Building size={14} />
                            {user.organizationName}
                        </p>
                    )}
                    {user.organizationKey && (
                        <p className="user-key">
                            <KeyIcon size={14} />
                            {user.organizationKey}
                        </p>
                    )}
                    {user.createdAt && (
                        <p className="user-date">
                            <Calendar size={14} />
                            {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            <div className="user-status">
                {user.isApproved !== undefined && (
                    <span className={`status-badge ${user.isApproved ? 'approved' : 'pending'}`}>
                        {user.isApproved ? (
                            <>
                                <CheckCircle size={14} /> Approved
                            </>
                        ) : (
                            <>
                                <AlertCircle size={14} /> Pending
                            </>
                        )}
                    </span>
                )}
                <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? (
                        <>
                            <Unlock size={14} /> Active
                        </>
                    ) : (
                        <>
                            <Lock size={14} /> Restricted
                        </>
                    )}
                </span>
            </div>
        </div>

        <div className="user-actions">
            {!user.isApproved && (
                <button
                    className="action-btn approve"
                    onClick={() => handleAction(user._id, 'approve', collection, user.name || user.email)}
                >
                    <UserCheck size={16} />
                    Approve
                </button>
            )}
            {user.isApproved && (
                <button
                    className="action-btn reject"
                    onClick={() => handleAction(user._id, 'reject', collection, user.name || user.email)}
                >
                    <UserX size={16} />
                    Reject
                </button>
            )}
            {user.isActive ? (
                <button
                    className="action-btn restrict"
                    onClick={() => handleAction(user._id, 'restrict', collection, user.name || user.email)}
                >
                    <Lock size={16} />
                    Restrict
                </button>
            ) : (
                <button
                    className="action-btn activate"
                    onClick={() => handleAction(user._id, 'activate', collection, user.name || user.email)}
                >
                    <Unlock size={16} />
                    Activate
                </button>
            )}
            <button
                className="action-btn delete"
                onClick={() => handleAction(user._id, 'delete', collection, user.name || user.email)}
            >
                <Trash2 size={16} />
                Delete
            </button>
        </div>
    </div>
);
