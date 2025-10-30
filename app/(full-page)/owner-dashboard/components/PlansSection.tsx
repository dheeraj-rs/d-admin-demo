'use client';

import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiSave, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { OwnerPasswordModal } from '../../../../components/modals/OwnerPasswordModal';

interface PagePermission {
    pagePath: string;
    pageName: string;
    category: string;
    free: {
        read: boolean;
        write: boolean;
        delete: boolean;
    };
    pro: {
        read: boolean;
        write: boolean;
        delete: boolean;
    };
    max: {
        read: boolean;
        write: boolean;
        delete: boolean;
    };
}

interface PlansSectionProps {
    onSave: (permissions: PagePermission[]) => Promise<void>;
    onReset: () => Promise<PagePermission[]>;
}

export const PlansSection: React.FC<PlansSectionProps> = ({ onSave, onReset }) => {
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    // Define all pages in your application with their default permissions
    const [pagePermissions, setPagePermissions] = useState<PagePermission[]>([
        // Dashboard & Main Pages
        {
            pagePath: '/dashboard',
            pageName: 'Dashboard',
            category: 'Main',
            free: { read: true, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/profile',
            pageName: 'Profile',
            category: 'Main',
            free: { read: true, write: true, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/settings',
            pageName: 'Settings',
            category: 'Main',
            free: { read: true, write: true, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },

        // AI Websites
        {
            pagePath: '/ai-websites',
            pageName: 'AI Websites List',
            category: 'AI Websites',
            free: { read: true, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/ai-websites/create',
            pageName: 'Create AI Website',
            category: 'AI Websites',
            free: { read: false, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/ai-websites/edit',
            pageName: 'Edit AI Website',
            category: 'AI Websites',
            free: { read: false, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/ai-websites/preview',
            pageName: 'Preview AI Website',
            category: 'AI Websites',
            free: { read: true, write: false, delete: false },
            pro: { read: true, write: false, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/ai-websites/deploy',
            pageName: 'Deploy AI Website',
            category: 'AI Websites',
            free: { read: false, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },

        // Data Store
        {
            pagePath: '/datastore',
            pageName: 'Data Store',
            category: 'Data',
            free: { read: true, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/datastore/create',
            pageName: 'Create Data Entry',
            category: 'Data',
            free: { read: false, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },

        // Gmail Accounts
        {
            pagePath: '/gmail-accounts',
            pageName: 'Gmail Accounts',
            category: 'Email',
            free: { read: true, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/gmail-accounts/add',
            pageName: 'Add Gmail Account',
            category: 'Email',
            free: { read: false, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },

        // Messages
        {
            pagePath: '/messages',
            pageName: 'Messages',
            category: 'Communication',
            free: { read: true, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },

        // Analytics
        {
            pagePath: '/analytics',
            pageName: 'Analytics Dashboard',
            category: 'Analytics',
            free: { read: false, write: false, delete: false },
            pro: { read: true, write: false, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/analytics/reports',
            pageName: 'Analytics Reports',
            category: 'Analytics',
            free: { read: false, write: false, delete: false },
            pro: { read: true, write: false, delete: false },
            max: { read: true, write: true, delete: true },
        },

        // Payment & Billing
        {
            pagePath: '/billing',
            pageName: 'Billing',
            category: 'Payment',
            free: { read: true, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/upgrade',
            pageName: 'Upgrade Plan',
            category: 'Payment',
            free: { read: true, write: false, delete: false },
            pro: { read: true, write: false, delete: false },
            max: { read: true, write: false, delete: false },
        },

        // Admin Features
        {
            pagePath: '/admin/users',
            pageName: 'User Management',
            category: 'Admin',
            free: { read: false, write: false, delete: false },
            pro: { read: false, write: false, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/admin/settings',
            pageName: 'Admin Settings',
            category: 'Admin',
            free: { read: false, write: false, delete: false },
            pro: { read: false, write: false, delete: false },
            max: { read: true, write: true, delete: true },
        },

        // Templates
        {
            pagePath: '/templates',
            pageName: 'Templates Library',
            category: 'Templates',
            free: { read: true, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/templates/create',
            pageName: 'Create Template',
            category: 'Templates',
            free: { read: false, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },

        // API & Integrations
        {
            pagePath: '/api-keys',
            pageName: 'API Keys',
            category: 'API',
            free: { read: false, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/webhooks',
            pageName: 'Webhooks',
            category: 'API',
            free: { read: false, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/integrations',
            pageName: 'Integrations',
            category: 'API',
            free: { read: false, write: false, delete: false },
            pro: { read: true, write: false, delete: false },
            max: { read: true, write: true, delete: true },
        },

        // Content Management
        {
            pagePath: '/content',
            pageName: 'Content Manager',
            category: 'Content',
            free: { read: true, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/media',
            pageName: 'Media Library',
            category: 'Content',
            free: { read: true, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },

        // Team & Collaboration
        {
            pagePath: '/team',
            pageName: 'Team Members',
            category: 'Team',
            free: { read: false, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/team/invite',
            pageName: 'Invite Team Member',
            category: 'Team',
            free: { read: false, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },

        // Reports
        {
            pagePath: '/reports',
            pageName: 'Reports',
            category: 'Reports',
            free: { read: false, write: false, delete: false },
            pro: { read: true, write: false, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/reports/export',
            pageName: 'Export Reports',
            category: 'Reports',
            free: { read: false, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },

        // Security
        {
            pagePath: '/security',
            pageName: 'Security Settings',
            category: 'Security',
            free: { read: true, write: false, delete: false },
            pro: { read: true, write: true, delete: false },
            max: { read: true, write: true, delete: true },
        },
        {
            pagePath: '/security/logs',
            pageName: 'Security Logs',
            category: 'Security',
            free: { read: false, write: false, delete: false },
            pro: { read: true, write: false, delete: false },
            max: { read: true, write: false, delete: true },
        },
    ]);

    // Load permissions from database on component mount
    useEffect(() => {
        const loadPermissionsFromDB = async () => {
            try {
                console.log('🔄 Loading permissions from database...');
                const dbPermissions = await onReset();

                if (dbPermissions && dbPermissions.length > 0) {
                    console.log('✅ Loaded permissions from DB:', dbPermissions.length, 'pages');
                    setPagePermissions(dbPermissions);
                } else {
                    console.log('⚠️ No permissions in database, using default permissions');
                    // Keep the hardcoded defaults - they will be saved on first save
                }
            } catch (error) {
                console.error('❌ Failed to load permissions from database:', error);
                console.log('📋 Using default permissions as fallback');
                // Keep the hardcoded defaults as fallback
            }
        };

        loadPermissionsFromDB();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    const categories = ['all', ...Array.from(new Set(pagePermissions.map((p) => p.category)))];

    const filteredPermissions = pagePermissions.filter((permission) => {
        const matchesCategory = selectedCategory === 'all' || permission.category === selectedCategory;
        const matchesSearch =
            searchQuery === '' ||
            permission.pageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            permission.pagePath.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handlePermissionChange = (
        index: number,
        plan: 'free' | 'pro' | 'max',
        action: 'read' | 'write' | 'delete',
        value: boolean
    ) => {
        const newPermissions = [...pagePermissions];
        const globalIndex = pagePermissions.findIndex(
            (p) => p.pagePath === filteredPermissions[index].pagePath
        );

        newPermissions[globalIndex][plan][action] = value;

        // Security rules: write requires read, delete requires write and read
        if (action === 'read' && !value) {
            newPermissions[globalIndex][plan].write = false;
            newPermissions[globalIndex][plan].delete = false;
        } else if (action === 'write' && value) {
            newPermissions[globalIndex][plan].read = true;
        } else if (action === 'write' && !value) {
            newPermissions[globalIndex][plan].delete = false;
        } else if (action === 'delete' && value) {
            newPermissions[globalIndex][plan].read = true;
            newPermissions[globalIndex][plan].write = true;
        }

        setPagePermissions(newPermissions);
    };

    const handleSaveClick = () => {
        setShowSaveConfirm(true);
    };

    const handleSaveConfirm = async (password: string) => {
        setSaving(true);
        try {
            // Verify owner password first
            const verifyResponse = await fetch('/api/owner/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyData.success) {
                toast.error('Invalid password. Permission changes not saved.');
                setSaving(false);
                return;
            }

            // Password verified, proceed with save
            await onSave(pagePermissions);
            setShowSaveConfirm(false);
            toast.success('✅ Plan permissions saved successfully!');
        } catch (error) {
            toast.error('Failed to save permissions');
        } finally {
            setSaving(false);
        }
    };

    const handleResetClick = () => {
        setShowResetConfirm(true);
    };

    const handleResetConfirm = async () => {
        setResetting(true);
        try {
            // Fetch permissions from database
            const dbPermissions = await onReset();
            setPagePermissions(dbPermissions);
            setShowResetConfirm(false);
            toast.success('✅ Permissions reset to database values!');
        } catch (error) {
            toast.error('Failed to reset permissions');
        } finally {
            setResetting(false);
        }
    };

    const getPlanSummary = (plan: 'free' | 'pro' | 'max') => {
        const total = pagePermissions.length;
        const readable = pagePermissions.filter((p) => p[plan].read).length;
        const writable = pagePermissions.filter((p) => p[plan].write).length;
        const deletable = pagePermissions.filter((p) => p[plan].delete).length;

        return { total, readable, writable, deletable };
    };

    return (
        <div className="plans-section">
            <div className="plans-header">
                <h2>Plan Permissions Management</h2>
                <p className="plans-description">
                    Configure page-level permissions for each plan tier. Control read, write, and delete access
                    to ensure proper security and feature gating.
                </p>
            </div>

            {/* Plan Summaries */}
            <div className="plan-summaries">
                {(['free', 'pro', 'max'] as const).map((plan) => {
                    const summary = getPlanSummary(plan);
                    return (
                        <div key={plan} className={`plan-summary plan-${plan}`}>
                            <h3>{plan.toUpperCase()} Plan</h3>
                            <div className="summary-stats">
                                <div className="stat">
                                    <span className="stat-value">{summary.readable}</span>
                                    <span className="stat-label">Read Access</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{summary.writable}</span>
                                    <span className="stat-label">Write Access</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{summary.deletable}</span>
                                    <span className="stat-label">Delete Access</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="plans-filters">
                <div className="filter-group">
                    <label>Category:</label>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat === 'all' ? 'All Categories' : cat}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="Search pages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-actions">
                    <button onClick={handleResetClick} className="btn-secondary" disabled={saving || resetting}>
                        <FiRefreshCw /> {resetting ? 'Resetting...' : 'Reset'}
                    </button>
                    <button onClick={handleSaveClick} className="btn-primary" disabled={saving || resetting}>
                        <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Permissions Table */}
            <div className="permissions-table-wrapper">
                <table className="permissions-table">
                    <thead>
                        <tr>
                            <th className="page-col">Page</th>
                            <th className="category-col">Category</th>
                            <th className="plan-col" colSpan={3}>
                                FREE Plan
                            </th>
                            <th className="plan-col" colSpan={3}>
                                PRO Plan
                            </th>
                            <th className="plan-col" colSpan={3}>
                                MAX Plan
                            </th>
                        </tr>
                        <tr>
                            <th></th>
                            <th></th>
                            <th className="action-col">R</th>
                            <th className="action-col">W</th>
                            <th className="action-col">D</th>
                            <th className="action-col">R</th>
                            <th className="action-col">W</th>
                            <th className="action-col">D</th>
                            <th className="action-col">R</th>
                            <th className="action-col">W</th>
                            <th className="action-col">D</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPermissions.map((permission, index) => (
                            <tr key={permission.pagePath}>
                                <td className="page-info">
                                    <div className="page-name">{permission.pageName}</div>
                                    <div className="page-path">{permission.pagePath}</div>
                                </td>
                                <td className="category-badge">
                                    <span className={`badge badge-${permission.category.toLowerCase()}`}>
                                        {permission.category}
                                    </span>
                                </td>

                                {/* FREE Plan */}
                                {(['read', 'write', 'delete'] as const).map((action) => (
                                    <td key={`free-${action}`} className="permission-cell">
                                        <label className="permission-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={permission.free[action]}
                                                onChange={(e) =>
                                                    handlePermissionChange(index, 'free', action, e.target.checked)
                                                }
                                            />
                                            <span className="checkmark">
                                                {permission.free[action] ? <FiCheck /> : <FiX />}
                                            </span>
                                        </label>
                                    </td>
                                ))}

                                {/* PRO Plan */}
                                {(['read', 'write', 'delete'] as const).map((action) => (
                                    <td key={`pro-${action}`} className="permission-cell">
                                        <label className="permission-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={permission.pro[action]}
                                                onChange={(e) =>
                                                    handlePermissionChange(index, 'pro', action, e.target.checked)
                                                }
                                            />
                                            <span className="checkmark">
                                                {permission.pro[action] ? <FiCheck /> : <FiX />}
                                            </span>
                                        </label>
                                    </td>
                                ))}

                                {/* MAX Plan */}
                                {(['read', 'write', 'delete'] as const).map((action) => (
                                    <td key={`max-${action}`} className="permission-cell">
                                        <label className="permission-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={permission.max[action]}
                                                onChange={(e) =>
                                                    handlePermissionChange(index, 'max', action, e.target.checked)
                                                }
                                            />
                                            <span className="checkmark">
                                                {permission.max[action] ? <FiCheck /> : <FiX />}
                                            </span>
                                        </label>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Security Notes */}
            <div className="security-notes">
                <h4>🔒 Security Rules:</h4>
                <ul>
                    <li>
                        <strong>Read Access:</strong> Required for viewing any page content
                    </li>
                    <li>
                        <strong>Write Access:</strong> Automatically grants Read access. Required for creating/editing
                    </li>
                    <li>
                        <strong>Delete Access:</strong> Automatically grants Read and Write access. Highest permission
                        level
                    </li>
                    <li>
                        <strong>Cascading Rules:</strong> Disabling Read will disable Write and Delete. Disabling Write
                        will disable Delete
                    </li>
                </ul>
            </div>

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="modal-overlay" onClick={() => !resetting && setShowResetConfirm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <FiAlertTriangle className="modal-icon warning" />
                            <h3>Reset Permissions?</h3>
                        </div>
                        <div className="modal-body">
                            <p>
                                <strong>⚠️ WARNING:</strong> This will reset all permission changes to the last saved values from the database.
                            </p>
                            <p>All unsaved changes will be lost. This action cannot be undone.</p>
                            <p>Are you absolutely sure you want to reset?</p>
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setShowResetConfirm(false)} className="btn-cancel" disabled={resetting}>
                                Cancel
                            </button>
                            <button onClick={handleResetConfirm} className="btn-danger" disabled={resetting}>
                                <FiRefreshCw /> {resetting ? 'Resetting...' : 'Yes, Reset All'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Confirmation Modal with Owner Password */}
            <OwnerPasswordModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={handleSaveConfirm}
                title="Owner Approval Required"
                description="🔐 Security Check: These permission changes affect all users with paid plans. Please enter your owner password to confirm:"
                confirmButtonText="Confirm & Save"
                loading={saving}
            />
        </div>
    );
};
