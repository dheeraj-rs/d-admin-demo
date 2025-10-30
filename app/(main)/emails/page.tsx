'use client';

import React, { useState, useMemo } from 'react';
import { Mail, User, Gamepad2, HardDrive, TestTube, Briefcase, Crown, Plus, Search } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import '../../../styles/pages/emails/new-index.scss';

// Components
import { EmailCard } from '../../../components/emails/EmailCard';
import { NoteModalNew, INoteItem } from '../../../components/emails/NoteModalNew';
import { AccountModal } from '../../../components/emails/AccountModal';

// Hooks
import { useEmailAccounts } from '../../../hooks/useEmailAccounts';
import { useUserRole } from '../../../hooks/useUserRole';

// Helpers
import { copyToClipboard, handleEmailClick } from '../../../lib/emailHelpers';

interface GmailAccount {
    _id?: string;
    email: string;
    password: string;
    name: string;
    category: 'personal' | 'gaming' | 'backup' | 'testing' | 'professional' | 'pro-mails';
    notes: INoteItem[];
}

const categories = [
    { name: 'All Mails', value: 'all', icon: Mail, color: 'var(--primary-color)' },
    { name: 'Personal', value: 'personal', icon: User, color: 'var(--blue-500)' },
    { name: 'Gaming', value: 'gaming', icon: Gamepad2, color: 'var(--purple-500)' },
    { name: 'Backup', value: 'backup', icon: HardDrive, color: 'var(--green-500)' },
    { name: 'Testing', value: 'testing', icon: TestTube, color: 'var(--orange-500)' },
    { name: 'Professional', value: 'professional', icon: Briefcase, color: 'var(--indigo-500)' },
    { name: 'Pro Mails', value: 'pro-mails', icon: Crown, color: 'var(--yellow-500)' },
];

const EmailsPage = () => {
    const userRole = useUserRole();
    const { gmailAccounts, isLoading, refetch } = useEmailAccounts();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
    const [copiedPassword, setCopiedPassword] = useState<string | null>(null);
    const [copyingPassword, setCopyingPassword] = useState<string | null>(null);

    // Account Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
    const [selectedAccount, setSelectedAccount] = useState<GmailAccount | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<GmailAccount>({
        email: '',
        password: '',
        name: '',
        category: 'personal',
        notes: []
    });

    // Note Modal State
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [noteModalMode, setNoteModalMode] = useState<'view' | 'edit'>('view');
    const [selectedNoteAccount, setSelectedNoteAccount] = useState<GmailAccount | null>(null);
    const [noteFormData, setNoteFormData] = useState<INoteItem[]>([]);

    // Filtered accounts
    const filteredAccounts = useMemo(() => {
        return gmailAccounts.filter((account) => {
            const matchesSearch =
                searchQuery === '' ||
                account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                account.name.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = activeCategory === 'all' || account.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [gmailAccounts, searchQuery, activeCategory]);

    // Helper functions
    const getCategoryCount = (categoryValue: string) => {
        if (categoryValue === 'all') return gmailAccounts.length;
        return gmailAccounts.filter((acc) => acc.category === categoryValue).length;
    };

    const getCategoryIcon = (category: string) => {
        const cat = categories.find((c) => c.value === category);
        return cat ? cat.icon : Mail;
    };

    const getCategoryColor = (category: string) => {
        const cat = categories.find((c) => c.value === category);
        return cat ? cat.color : 'var(--primary-color)';
    };

    // Account CRUD handlers
    const handleAddAccount = () => {
        setModalMode('add');
        // Auto-select active category (default to 'personal' if 'all' is selected)
        const defaultCategory = activeCategory === 'all' ? 'personal' : activeCategory;
        setFormData({
            email: '',
            password: '',
            name: '',
            category: defaultCategory as any,
            notes: []
        });
        setShowModal(true);
    };

    const handleEditAccount = (account: GmailAccount) => {
        setModalMode('edit');
        setSelectedAccount(account);
        setFormData({
            email: account.email,
            password: account.password,
            name: account.name,
            category: account.category,
            notes: account.notes || []
        });
        setShowModal(true);
    };

    const handleDeleteAccount = (account: GmailAccount) => {
        setModalMode('delete');
        setSelectedAccount(account);
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            if (modalMode === 'add') {
                const response = await fetch('/api/gmail-accounts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();

                if (data.success) {
                    toast.success('Account added successfully!');
                    setShowModal(false);
                    await refetch();
                } else {
                    toast.error(data.error || 'Failed to add account');
                }
            } else if (modalMode === 'edit' && selectedAccount?._id) {
                const response = await fetch(`/api/gmail-accounts/${selectedAccount._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();

                if (data.success) {
                    toast.success('Account updated successfully!');
                    setShowModal(false);
                    await refetch();
                } else {
                    toast.error(data.error || 'Failed to update account');
                }
            } else if (modalMode === 'delete' && selectedAccount?._id) {
                const response = await fetch(`/api/gmail-accounts/${selectedAccount._id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();

                if (data.success) {
                    toast.success('Account deleted successfully!');
                    setShowModal(false);
                    await refetch();
                } else {
                    toast.error(data.error || 'Failed to delete account');
                }
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Note handlers
    const handleViewNote = (account: GmailAccount) => {
        setSelectedNoteAccount(account);
        setNoteFormData(account.notes || []);
        setNoteModalMode('view');
        setShowNoteModal(true);
    };

    const handleEditNote = () => {
        setNoteModalMode('edit');
    };

    const handleSaveNote = async (notes: INoteItem[]) => {
        if (!selectedNoteAccount?._id) return;

        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/gmail-accounts/${selectedNoteAccount._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: selectedNoteAccount.email,
                    password: selectedNoteAccount.password,
                    name: selectedNoteAccount.name,
                    category: selectedNoteAccount.category,
                    notes: notes
                })
            });
            const data = await response.json();

            if (data.success) {
                toast.success('Note saved successfully!');
                setNoteModalMode('view');
                await refetch();
            } else {
                toast.error(data.error || 'Failed to save note');
            }
        } catch (error) {
            console.error('Error saving note:', error);
            toast.error('Failed to save note');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteNote = async () => {
        if (!selectedNoteAccount?._id) return;

        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/gmail-accounts/${selectedNoteAccount._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: selectedNoteAccount.email,
                    password: selectedNoteAccount.password,
                    name: selectedNoteAccount.name,
                    category: selectedNoteAccount.category,
                    notes: []
                })
            });
            const data = await response.json();

            if (data.success) {
                toast.success('All notes deleted successfully!');
                setShowNoteModal(false);
                await refetch();
            } else {
                toast.error(data.error || 'Failed to delete note');
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error('Failed to delete note');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="children__wrapper">
            <Toaster position="top-right" />
            <div className="emails-page-wrapper">
                {/* Header Section */}
                <div className="emails-header">
                    <div className="header-title">
                        <Mail className="header-icon" />
                        <h1>Email Accounts</h1>
                    </div>
                    <div className="header-actions">
                        <div className="search-box">
                            <Search className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search emails..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <button className="add-email-btn" onClick={handleAddAccount}>
                            <Plus className="icon" />
                            <span className="btn-text">Add Email</span>
                        </button>
                    </div>
                </div>

                {/* Categories Filter */}
                <div className="emails-categories">
                    <div className="categories-scroll">
                        {categories.map((category) => (
                            <button
                                key={category.value}
                                className={`category-btn ${activeCategory === category.value ? 'active' : ''}`}
                                style={{ '--category-color': category.color } as React.CSSProperties}
                                onClick={() => setActiveCategory(category.value)}
                            >
                                <category.icon className="category-icon" />
                                <span className="category-name">{category.name}</span>
                                <span className="category-count">{getCategoryCount(category.value)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Section */}
                <div className="emails-content">
                    {isLoading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading accounts...</p>
                        </div>
                    ) : filteredAccounts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <Mail className="icon" />
                            </div>
                            <div className="empty-message">
                                {searchQuery ? 'No accounts found' : 'No Email Accounts Yet'}
                            </div>
                            <div className="empty-suggestion">
                                {searchQuery
                                    ? `No matches for "${searchQuery}". Try a different search term.`
                                    : 'Click the "Add Email" button above to add your first email account and start managing your credentials securely.'
                                }
                            </div>
                            {!searchQuery && (
                                <button className="empty-action-btn" onClick={handleAddAccount}>
                                    <Plus className="icon" />
                                    <span>Add Your First Email</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="emails-grid">
                            {filteredAccounts.map((account) => (
                                <EmailCard
                                    key={account._id}
                                    account={account}
                                    categoryIcon={getCategoryIcon(account.category)}
                                    categoryColor={getCategoryColor(account.category)}
                                    copiedEmail={copiedEmail === account._id}
                                    copiedPassword={copiedPassword === account._id}
                                    userRole={userRole}
                                    onEmailClick={() => handleEmailClick(account.email, account.password)}
                                    onCopyEmail={() => copyToClipboard(account.email, 'email', account._id, userRole, setCopiedEmail, setCopiedPassword, setCopyingPassword, copyingPassword)}
                                    onCopyPassword={() => copyToClipboard(account.password, 'password', account._id, userRole, setCopiedEmail, setCopiedPassword, setCopyingPassword, copyingPassword)}
                                    onViewNote={() => handleViewNote(account)}
                                    onEdit={() => handleEditAccount(account)}
                                    onDelete={() => handleDeleteAccount(account)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Modals */}
                <AccountModal
                    show={showModal}
                    mode={modalMode}
                    formData={formData}
                    selectedAccount={selectedAccount}
                    isSubmitting={isSubmitting}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    onFormChange={(data) => setFormData({ ...formData, ...data })}
                />

                <NoteModalNew
                    show={showNoteModal}
                    mode={noteModalMode}
                    accountEmail={selectedNoteAccount?.email || ''}
                    notes={noteFormData}
                    isSubmitting={isSubmitting}
                    onClose={() => setShowNoteModal(false)}
                    onEdit={handleEditNote}
                    onSave={handleSaveNote}
                    onDeleteAll={handleDeleteNote}
                    onCancel={() => {
                        setNoteModalMode('view');
                        setNoteFormData(selectedNoteAccount?.notes || []);
                    }}
                />
            </div>
        </div>
    );
};

export default EmailsPage;
