'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Shield, Save, X, Eye, EyeOff, Key, Plus, Edit2, Trash2, FolderPlus } from 'lucide-react';
import '../../styles/components/pin-protection-settings.scss';

interface ProtectedPage {
    pagePath: string;
    pageName: string;
    isEnabled: boolean;
    icon?: string;
    category?: string;
    pin?: string;
}

const AVAILABLE_PAGES = {
    isPinEnabled: false,
    category: ['Home', 'Website', 'Elements', 'Utils', 'Tools', 'Software', 'Document', 'Settings'],
    websitePages: [
        { pagePath: '/', pageName: 'Dashboard', icon: 'pi pi-fw pi-home', category: 'Home', isEnabled: false, hasOwnPin: false },
        { pagePath: '/website-builder', pageName: 'Website Builder', icon: 'pi pi-fw pi-plus', category: 'Website', isEnabled: false, hasOwnPin: false },
        { pagePath: '/websites', pageName: 'Websites', icon: 'pi pi-fw pi-globe', category: 'Website', isEnabled: false, hasOwnPin: false },
        { pagePath: '/webconfig', pageName: 'Website Config', icon: 'pi pi-fw pi-server', category: 'Website', isEnabled: false, hasOwnPin: false },
        { pagePath: '/webconfig/live', pageName: 'Live Websites', icon: 'pi pi-fw pi-globe', category: 'Website', isEnabled: false, hasOwnPin: false },
        { pagePath: '/webconfig/templates', pageName: 'Templates', icon: 'pi pi-fw pi-file', category: 'Website', isEnabled: false, hasOwnPin: false },
        { pagePath: '/webconfig/paid', pageName: 'Paid Websites', icon: 'pi pi-fw pi-dollar', category: 'Website', isEnabled: false, hasOwnPin: false },
        { pagePath: '/webconfig/free', pageName: 'Free Websites', icon: 'pi pi-fw pi-gift', category: 'Website', isEnabled: false, hasOwnPin: false },
        { pagePath: '/webconfig/premium', pageName: 'Premium Websites', icon: 'pi pi-fw pi-star', category: 'Website', isEnabled: false, hasOwnPin: false },
        { pagePath: '/webconfig/snippet', pageName: 'Snippet Websites', icon: 'pi pi-fw pi-users', category: 'Website', isEnabled: false, hasOwnPin: false },
        { pagePath: '/webconfig/personal', pageName: 'My Personal Websites', icon: 'pi pi-fw pi-user', category: 'Website', isEnabled: false, hasOwnPin: false },
        { pagePath: '/add-elements', pageName: 'Add Elements', icon: 'pi pi-fw pi-plus', category: 'Elements', isEnabled: false, hasOwnPin: false },
        { pagePath: '/elements/common/formlayout', pageName: 'Form Layout', icon: 'pi pi-fw pi-id-card', category: 'Elements', isEnabled: false, hasOwnPin: false },
        { pagePath: '/elements/common/button', pageName: 'Button', icon: 'pi pi-fw pi-mobile', category: 'Elements', isEnabled: false, hasOwnPin: false },
        { pagePath: '/elements/common/card', pageName: 'Card', icon: 'pi pi-fw pi-id-card', category: 'Elements', isEnabled: false, hasOwnPin: false },
        { pagePath: '/elements/common/input', pageName: 'Input', icon: 'pi pi-fw pi-check-square', category: 'Elements', isEnabled: false, hasOwnPin: false },
        { pagePath: '/elements/common/table', pageName: 'Table', icon: 'pi pi-fw pi-table', category: 'Elements', isEnabled: false, hasOwnPin: false },
        { pagePath: '/elements/common/other', pageName: 'Other', icon: 'pi pi-fw pi-ellipsis-h', category: 'Elements', isEnabled: false, hasOwnPin: false },
        { pagePath: '/elements/sections/header', pageName: 'Header', icon: 'pi pi-fw pi-sitemap', category: 'Elements', isEnabled: false, hasOwnPin: false },
        { pagePath: '/elements/sections/hero', pageName: 'Hero', icon: 'pi pi-fw pi-sitemap', category: 'Elements', isEnabled: false, hasOwnPin: false },
        { pagePath: '/elements/sections/footer', pageName: 'Footer', icon: 'pi pi-fw pi-sitemap', category: 'Elements', isEnabled: false, hasOwnPin: false },
        { pagePath: '/elements/sections/auth/login', pageName: 'Login', icon: 'pi pi-fw pi-sign-in', category: 'Elements', isEnabled: false, hasOwnPin: false },
        { pagePath: '/elements/sections/auth/error', pageName: 'Error', icon: 'pi pi-fw pi-times-circle', category: 'Elements', isEnabled: false, hasOwnPin: false },
        { pagePath: '/elements/sections/auth/access', pageName: 'Access Denied', icon: 'pi pi-fw pi-lock', category: 'Elements', isEnabled: false, hasOwnPin: false },
        { pagePath: '/elements/sections/notfound', pageName: 'Not Found', icon: 'pi pi-fw pi-exclamation-circle', category: 'Elements', isEnabled: false, hasOwnPin: false },
        { pagePath: '/utils/icons', pageName: 'Icons', icon: 'pi pi-fw pi-eye', category: 'Utils', isEnabled: false, hasOwnPin: false },
        { pagePath: '/utils/flex', pageName: 'Flex', icon: 'pi pi-fw pi-desktop', category: 'Utils', isEnabled: false, hasOwnPin: false },
        { pagePath: '/utils/box-shadow', pageName: 'Shadow', icon: 'pi pi-fw pi-hashtag', category: 'Utils', isEnabled: false, hasOwnPin: false },
        { pagePath: '/utils/color-palettes', pageName: 'Color Palettes', icon: 'pi pi-fw pi-palette', category: 'Utils', isEnabled: false, hasOwnPin: false },
        { pagePath: '/emails', pageName: 'Emails', icon: 'pi pi-fw pi-envelope', category: 'Tools', isEnabled: false, hasOwnPin: false },
        { pagePath: '/ai-websites', pageName: 'AI Websites', icon: 'pi pi-fw pi-sparkles', category: 'Tools', isEnabled: false, hasOwnPin: false },
        { pagePath: '/software/chatbot', pageName: 'Chat Bot', icon: 'pi pi-fw pi-comment', category: 'Software', isEnabled: false, hasOwnPin: false },
        { pagePath: '/software/iconmaker', pageName: 'Icon Maker', icon: 'pi pi-fw pi-eraser', category: 'Software', isEnabled: false, hasOwnPin: false },
        { pagePath: '/document', pageName: 'Documentation', icon: 'pi pi-fw pi-file-edit', category: 'Document', isEnabled: false, hasOwnPin: false },
        { pagePath: '/knowledge', pageName: 'Private knowledge', icon: 'pi pi-fw pi-exclamation-circle', category: 'Document', isEnabled: false, hasOwnPin: false },
        { pagePath: '/settings', pageName: 'Settings', icon: 'pi pi-fw pi-cog', category: 'Settings', isEnabled: false, hasOwnPin: false },
    ]
}

interface PinProtectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PinProtectionModal: React.FC<PinProtectionModalProps> = ({ isOpen, onClose }) => {
    const [protectedPages, setProtectedPages] = useState<ProtectedPage[]>([]);
    const [categories, setCategories] = useState<string[]>(AVAILABLE_PAGES.category);
    const [isLoading, setIsLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);
    const [expandedPage, setExpandedPage] = useState<string | null>(null);
    const [pagePin, setPagePin] = useState<{ [key: string]: string }>({});
    const [showPagePin, setShowPagePin] = useState<{ [key: string]: boolean }>({});
    const [showAddPageModal, setShowAddPageModal] = useState(false);
    const [showEditPageModal, setShowEditPageModal] = useState(false);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [editingPage, setEditingPage] = useState<ProtectedPage | null>(null);
    const [newPage, setNewPage] = useState({
        pagePath: '',
        pageName: '',
        icon: 'pi pi-fw pi-file',
        category: 'Home'
    });
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchPagesAndCategories();
        }
    }, [isOpen]);

    const fetchPagesAndCategories = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/pin-settings/pages');
            const data = await response.json();

            if (data.success) {
                setProtectedPages(data.pages || []);
                setCategories(data.categories || AVAILABLE_PAGES.category);
            } else {
                // Fallback to default data if API fails
                const initialPages = AVAILABLE_PAGES.websitePages.map(page => ({
                    pagePath: page.pagePath,
                    pageName: page.pageName,
                    icon: page.icon,
                    category: page.category,
                    isEnabled: false,
                }));
                setProtectedPages(initialPages);
                setCategories(AVAILABLE_PAGES.category);
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
            // Fallback to default data
            const initialPages = AVAILABLE_PAGES.websitePages.map(page => ({
                pagePath: page.pagePath,
                pageName: page.pageName,
                icon: page.icon,
                category: page.category,
                isEnabled: false,
            }));
            setProtectedPages(initialPages);
            setCategories(AVAILABLE_PAGES.category);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePage = (pagePath: string) => {
        setProtectedPages(prev =>
            prev.map(page =>
                page.pagePath === pagePath
                    ? { ...page, isEnabled: !page.isEnabled }
                    : page
            )
        );
        setHasChanges(true);
    };

    const handleSetPagePin = (pagePath: string, pin: string) => {
        setPagePin(prev => ({ ...prev, [pagePath]: pin }));
    };

    const handleSavePagePin = async (pagePath: string) => {
        const pin = pagePin[pagePath];
        if (!pin || pin.length < 4) {
            return;
        }

        try {
            const response = await fetch('/api/pin-settings/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'setPagePin',
                    pagePath: pagePath,
                    pin: pin
                })
            });

            const data = await response.json();

            if (data.success) {
                setPagePin(prev => ({ ...prev, [pagePath]: '' }));
                setExpandedPage(null);
                await fetchPagesAndCategories();
            }
        } catch (error) {
            console.error('Error setting page PIN:', error);
        }
    };

    const handleSaveSettings = async () => {
        try {
            const response = await fetch('/api/pin-settings/pages', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pages: protectedPages,
                    categories: categories
                })
            });

            const data = await response.json();

            if (data.success) {
                setHasChanges(false);
                await fetchPagesAndCategories();
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const handleAddPage = async () => {
        if (!newPage.pagePath || !newPage.pageName) {
            return;
        }

        try {
            const response = await fetch('/api/pin-settings/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'addPage',
                    page: {
                        pagePath: newPage.pagePath,
                        pageName: newPage.pageName,
                        icon: newPage.icon,
                        category: newPage.category,
                        isEnabled: false
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                setNewPage({
                    pagePath: '',
                    pageName: '',
                    icon: 'pi pi-fw pi-file',
                    category: categories[0] || 'Home'
                });
                setShowAddPageModal(false);
                await fetchPagesAndCategories();
            }
        } catch (error) {
            console.error('Error adding page:', error);
        }
    };

    const handleEditPage = async () => {
        if (!editingPage) return;

        try {
            const response = await fetch('/api/pin-settings/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'editPage',
                    page: editingPage
                })
            });

            const data = await response.json();

            if (data.success) {
                setEditingPage(null);
                setShowEditPageModal(false);
                await fetchPagesAndCategories();
            }
        } catch (error) {
            console.error('Error editing page:', error);
        }
    };

    const handleDeletePage = async (pagePath: string) => {
        if (!confirm('Are you sure you want to delete this page?')) {
            return;
        }

        try {
            const response = await fetch('/api/pin-settings/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deletePage',
                    pagePath: pagePath
                })
            });

            const data = await response.json();

            if (data.success) {
                await fetchPagesAndCategories();
            }
        } catch (error) {
            console.error('Error deleting page:', error);
        }
    };

    const openEditModal = (page: ProtectedPage) => {
        setEditingPage({ ...page });
        setShowEditPageModal(true);
    };

    const handleAddCategory = async () => {
        if (!newCategory || categories.includes(newCategory)) {
            return;
        }

        try {
            const response = await fetch('/api/pin-settings/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'addCategory',
                    category: newCategory
                })
            });

            const data = await response.json();

            if (data.success) {
                setNewCategory('');
                setShowAddCategoryModal(false);
                await fetchPagesAndCategories();
            }
        } catch (error) {
            console.error('Error adding category:', error);
        }
    };

    const handleDeleteCategory = async (category: string) => {
        const pagesInCategory = protectedPages.filter(p => p.category === category);

        if (pagesInCategory.length > 0) {
            if (!confirm(`This category has ${pagesInCategory.length} page(s). Delete anyway?`)) {
                return;
            }
        }

        try {
            const response = await fetch('/api/pin-settings/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deleteCategory',
                    category: category
                })
            });

            const data = await response.json();

            if (data.success) {
                await fetchPagesAndCategories();
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="pin-protection-modal-overlay">
            <div className="pin-protection-modal">
                {/* Header */}
                <div className="modal-header">
                    <div className="header-title">
                        <Shield size={24} />
                        <h2>Protected Pages Manager</h2>
                    </div>
                    <div className="header-actions">
                        <button
                            onClick={() => setShowAddCategoryModal(true)}
                            className="btn-secondary"
                            title="Add Category"
                        >
                            <FolderPlus size={18} />
                            Add Category
                        </button>
                        <button
                            onClick={() => setShowAddPageModal(true)}
                            className="btn-secondary"
                            title="Add Page"
                        >
                            <Plus size={18} />
                            Add Page
                        </button>
                        {hasChanges && (
                            <button
                                onClick={handleSaveSettings}
                                className="btn-primary"
                            >
                                <Save size={18} />
                                Save All Changes
                            </button>
                        )}
                        <button onClick={onClose} className="close-button">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className={`modal-content ${isLoading ? 'loading' : ''}`}>
                    {isLoading ? (
                        <>
                            <div className="spinner"></div>
                            <p>Loading pages...</p>
                        </>
                    ) : (
                        <>
                            {/* Protected Pages */}
                            <div className="settings-section">
                                <div className="section-header">
                                    <Lock size={20} />
                                    <h3>Protected Pages</h3>
                                    <span className="page-count">
                                        {protectedPages.filter(p => p.isEnabled).length} / {protectedPages.length} protected
                                    </span>
                                </div>

                                <div className="protected-pages-list">
                                    {categories.map(category => {
                                        const categoryPages = protectedPages.filter(p => p.category === category);
                                        if (categoryPages.length === 0) return null;

                                        return (
                                            <div key={category} className="page-category">
                                                <div className="category-header">
                                                    <h4>{category}</h4>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category)}
                                                        className="btn-icon-danger"
                                                        title="Delete Category"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="pages-grid">
                                                    {categoryPages.map(page => {
                                                        const isExpanded = expandedPage === page.pagePath;
                                                        return (
                                                            <div key={page.pagePath} className={`page-card ${isExpanded ? 'expanded' : ''} ${page.isEnabled ? 'protected' : 'unprotected'}`}>
                                                                <div className="page-card-header">
                                                                    <div className="page-info">
                                                                        <div className="page-icon">
                                                                            {page.isEnabled ? <Lock size={20} /> : <Shield size={20} />}
                                                                        </div>
                                                                        <div className="page-details">
                                                                            <span className="page-name">{page.pageName}</span>
                                                                            <span className="page-path">{page.pagePath}</span>
                                                                            {page.category && (
                                                                                <span className="category-badge">{page.category}</span>
                                                                            )}
                                                                            {page.pin && (
                                                                                <span className="pin-badge">
                                                                                    <Key size={12} /> Custom PIN
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="page-controls">
                                                                        {page.isEnabled && (
                                                                            <button
                                                                                onClick={() => setExpandedPage(isExpanded ? null : page.pagePath)}
                                                                                className="pin-config-btn"
                                                                                title="Set PIN"
                                                                            >
                                                                                <Key size={16} />
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => openEditModal(page)}
                                                                            className="btn-icon-edit"
                                                                            title="Edit Page"
                                                                        >
                                                                            <Edit2 size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeletePage(page.pagePath)}
                                                                            className="btn-icon-danger"
                                                                            title="Delete Page"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleTogglePage(page.pagePath)}
                                                                            className={`toggle-switch ${page.isEnabled ? 'active' : ''}`}
                                                                            title="Enable/Disable protection"
                                                                        >
                                                                            <span className="toggle-slider"></span>
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {isExpanded && page.isEnabled && (
                                                                    <div className="page-card-content">
                                                                        <div className="pin-input-section">
                                                                            <label>Set Custom PIN for this page</label>
                                                                            <div className="pin-input-group">
                                                                                <div className="input-with-icon">
                                                                                    <input
                                                                                        type={showPagePin[page.pagePath] ? 'text' : 'password'}
                                                                                        value={pagePin[page.pagePath] || ''}
                                                                                        onChange={(e) => handleSetPagePin(page.pagePath, e.target.value.replace(/\D/g, '').slice(0, 8))}
                                                                                        placeholder={page.pin ? '••••••' : 'Enter PIN (4-8 digits)'}
                                                                                        maxLength={8}
                                                                                    />
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => setShowPagePin(prev => ({ ...prev, [page.pagePath]: !prev[page.pagePath] }))}
                                                                                        className="toggle-visibility"
                                                                                    >
                                                                                        {showPagePin[page.pagePath] ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                                    </button>
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => handleSavePagePin(page.pagePath)}
                                                                                    disabled={!pagePin[page.pagePath] || pagePin[page.pagePath].length < 4}
                                                                                    className="btn-small"
                                                                                >
                                                                                    <Save size={14} />
                                                                                    {page.pin ? 'Update' : 'Set PIN'}
                                                                                </button>
                                                                            </div>
                                                                            {page.pin && (
                                                                                <p className="pin-hint">Current PIN is set. Enter new PIN to update.</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Add Page Modal */}
            {showAddPageModal && (
                <div className="crud-modal-overlay" onClick={() => setShowAddPageModal(false)}>
                    <div className="crud-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="crud-modal-header">
                            <h3><Plus size={20} /> Add New Page</h3>
                            <button onClick={() => setShowAddPageModal(false)} className="close-button">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="crud-modal-body">
                            <div className="form-group">
                                <label>Page Name *</label>
                                <input
                                    type="text"
                                    value={newPage.pageName}
                                    onChange={(e) => setNewPage({ ...newPage, pageName: e.target.value })}
                                    placeholder="e.g., Dashboard"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Page Path *</label>
                                <input
                                    type="text"
                                    value={newPage.pagePath}
                                    onChange={(e) => setNewPage({ ...newPage, pagePath: e.target.value })}
                                    placeholder="e.g., /dashboard"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Icon Class</label>
                                <input
                                    type="text"
                                    value={newPage.icon}
                                    onChange={(e) => setNewPage({ ...newPage, icon: e.target.value })}
                                    placeholder="e.g., pi pi-fw pi-home"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    value={newPage.category}
                                    onChange={(e) => setNewPage({ ...newPage, category: e.target.value })}
                                    className="form-select"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="crud-modal-footer">
                            <button onClick={() => setShowAddPageModal(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button
                                onClick={handleAddPage}
                                disabled={!newPage.pageName || !newPage.pagePath}
                                className="btn-primary"
                            >
                                <Plus size={16} /> Add Page
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Page Modal */}
            {showEditPageModal && editingPage && (
                <div className="crud-modal-overlay" onClick={() => setShowEditPageModal(false)}>
                    <div className="crud-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="crud-modal-header">
                            <h3><Edit2 size={20} /> Edit Page</h3>
                            <button onClick={() => setShowEditPageModal(false)} className="close-button">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="crud-modal-body">
                            <div className="form-group">
                                <label>Page Name *</label>
                                <input
                                    type="text"
                                    value={editingPage.pageName}
                                    onChange={(e) => setEditingPage({ ...editingPage, pageName: e.target.value })}
                                    placeholder="e.g., Dashboard"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Page Path *</label>
                                <input
                                    type="text"
                                    value={editingPage.pagePath}
                                    onChange={(e) => setEditingPage({ ...editingPage, pagePath: e.target.value })}
                                    placeholder="e.g., /dashboard"
                                    className="form-input"
                                    disabled
                                />
                                <small className="form-hint">Path cannot be changed</small>
                            </div>
                            <div className="form-group">
                                <label>Icon Class</label>
                                <input
                                    type="text"
                                    value={editingPage.icon || ''}
                                    onChange={(e) => setEditingPage({ ...editingPage, icon: e.target.value })}
                                    placeholder="e.g., pi pi-fw pi-home"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    value={editingPage.category}
                                    onChange={(e) => setEditingPage({ ...editingPage, category: e.target.value })}
                                    className="form-select"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="crud-modal-footer">
                            <button onClick={() => setShowEditPageModal(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button
                                onClick={handleEditPage}
                                disabled={!editingPage.pageName}
                                className="btn-primary"
                            >
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Category Modal */}
            {showAddCategoryModal && (
                <div className="crud-modal-overlay" onClick={() => setShowAddCategoryModal(false)}>
                    <div className="crud-modal crud-modal-small" onClick={(e) => e.stopPropagation()}>
                        <div className="crud-modal-header">
                            <h3><FolderPlus size={20} /> Add New Category</h3>
                            <button onClick={() => setShowAddCategoryModal(false)} className="close-button">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="crud-modal-body">
                            <div className="form-group">
                                <label>Category Name *</label>
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="e.g., Analytics"
                                    className="form-input"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                            </div>
                            <div className="existing-categories">
                                <label>Existing Categories:</label>
                                <div className="category-chips">
                                    {categories.map(cat => (
                                        <span key={cat} className="category-chip">{cat}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="crud-modal-footer">
                            <button onClick={() => setShowAddCategoryModal(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCategory}
                                disabled={!newCategory || categories.includes(newCategory)}
                                className="btn-primary"
                            >
                                <Plus size={16} /> Add Category
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PinProtectionModal;
