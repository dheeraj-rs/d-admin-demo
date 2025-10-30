'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Globe, ExternalLink, MessageSquare, Code, Video, Image, Wand2, Music, FileText, Brain, Palette, Database, Zap, Crown, Copy, Plus, Edit, Trash2, X } from 'lucide-react';
import { useLanguage } from '../../../lib/i18n';
import toast, { Toaster } from 'react-hot-toast';
import { safeJsonParse } from '../../../lib/safe-fetch';
import anime from 'animejs';
import '../../../styles/pages/auth/index.scss';
import '../../../styles/pages/emails/index.scss';
import '../../../styles/pages/ai-websites/index.scss';

interface AIWebsite {
    _id: string;
    name: string;
    url: string;
    description: string;
    category: 'chatting' | 'website-building' | 'video-editing' | 'photo-editing' | 'image-generation' | 'music-generation' | 'text-generation' | 'code-assistant' | 'design' | 'data-analysis' | 'productivity' | 'other';
    status: 'free' | 'paid' | 'freemium';
    featured?: boolean;
    priority: number;
    imageUrl?: string;
    iconUrl?: string;
}

const AIWebsitesPage = () => {
    const { t } = useLanguage();
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [aiWebsites, setAiWebsites] = useState<AIWebsite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedWebsite, setSelectedWebsite] = useState<AIWebsite | null>(null);
    const [formData, setFormData] = useState<Partial<AIWebsite>>({
        name: '',
        url: '',
        description: '',
        category: 'chatting',
        status: 'free',
        featured: false,
        priority: 1
    });

    // Fetch AI Websites from MongoDB
    useEffect(() => {
        fetchAIWebsites();
    }, []);

    const fetchAIWebsites = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/ai-websites');
            const data = await safeJsonParse(response);

            if (data.success && data.data) {
                setAiWebsites(data.data);
            } else {
                console.error('API response error:', data);
                toast.error(data.error || 'Failed to load websites');
            }
        } catch (error) {
            console.error('Error fetching AI websites:', error);
            toast.error('Failed to load websites');
        } finally {
            setIsLoading(false);
        }
    };

    const categories = [
        { id: 'all', label: 'All Websites', icon: Globe },
        { id: 'chatting', label: 'Chatting', icon: MessageSquare },
        { id: 'website-building', label: 'Website Building', icon: Code },
        { id: 'video-editing', label: 'Video Editing', icon: Video },
        { id: 'photo-editing', label: 'Photo Editing', icon: Image },
        { id: 'image-generation', label: 'Image Generation', icon: Wand2 },
        { id: 'music-generation', label: 'Music Generation', icon: Music },
        { id: 'text-generation', label: 'Text Generation', icon: FileText },
        { id: 'code-assistant', label: 'Code Assistant', icon: Brain },
        { id: 'design', label: 'Design', icon: Palette },
        { id: 'data-analysis', label: 'Data Analysis', icon: Database },
        { id: 'productivity', label: 'Productivity', icon: Zap },
    ];

    const filteredWebsites = useMemo(() => {
        const filtered = aiWebsites.filter(website => {
            const matchesCategory = activeCategory === 'all' || website.category === activeCategory;
            return matchesCategory;
        });
        // Sort by priority
        return filtered.sort((a, b) => a.priority - b.priority);
    }, [aiWebsites, activeCategory]);

    const handleVisitWebsite = (url: string, name: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
        toast.success(`Opening ${name}...`);
    };

    const handleCopyUrl = (url: string, name: string) => {
        navigator.clipboard.writeText(url);
        toast.success(`${name} URL copied!`);
    };

    const handleAddWebsite = () => {
        setModalMode('add');
        setFormData({
            name: '',
            url: '',
            description: '',
            category: 'chatting',
            status: 'free',
            featured: false,
            priority: filteredWebsites.length + 1
        });
        setShowModal(true);
    };

    const handleEditWebsite = (website: AIWebsite) => {
        setModalMode('edit');
        setSelectedWebsite(website);
        setFormData(website);
        setShowModal(true);
    };

    const handleDeleteWebsite = async (id: string) => {
        if (confirm('Are you sure you want to delete this website?')) {
            try {
                const response = await fetch(`/api/ai-websites/${id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();

                if (data.success) {
                    setAiWebsites(prev => prev.filter(w => w._id !== id));
                    toast.success('Website deleted successfully!');
                } else {
                    toast.error(data.error || 'Failed to delete website');
                }
            } catch (error) {
                console.error('Error deleting website:', error);
                toast.error('Failed to delete website');
            }
        }
    };

    const handleSaveWebsite = async () => {
        if (!formData.name || !formData.url) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (modalMode === 'add') {
                const response = await fetch('/api/ai-websites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();

                if (data.success) {
                    await fetchAIWebsites(); // Refresh list
                    toast.success('Website added successfully!');
                    setShowModal(false);
                } else {
                    toast.error(data.error || 'Failed to add website');
                }
            } else {
                // EDIT MODE
                const response = await fetch(`/api/ai-websites/${selectedWebsite?._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();

                if (data.success) {
                    await fetchAIWebsites(); // Refresh list
                    toast.success('Website updated successfully!');
                    setShowModal(false);
                } else {
                    toast.error(data.error || 'Failed to update website');
                }
            }
        } catch (error) {
            console.error('Error saving website:', error);
            toast.error('Failed to save website');
        }
    };

    const getCategoryIcon = (category: string) => {
        const icons: { [key: string]: any } = {
            'chatting': MessageSquare,
            'website-building': Code,
            'video-editing': Video,
            'photo-editing': Image,
            'image-generation': Wand2,
            'music-generation': Music,
            'text-generation': FileText,
            'code-assistant': Brain,
            'design': Palette,
            'data-analysis': Database,
            'productivity': Zap,
        };
        const Icon = icons[category] || Globe;
        return <Icon className="category-icon" size={16} />;
    };

    useEffect(() => {
        anime({
            targets: '.website-card',
            translateY: [20, 0],
            opacity: [0, 1],
            delay: anime.stagger(50),
            duration: 600,
            easing: 'easeOutQuad'
        });
    }, [filteredWebsites, activeCategory]);

    return (
        <div className="emails-page ai-websites-page">
            <Toaster position="top-right" />

            <div className="emails-container">
                {/* Categories as Tabs with Add Button */}
                <div className="categories-tabs">
                    <div className="categories-scroll">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            const count = category.id === 'all'
                                ? aiWebsites.length
                                : aiWebsites.filter(w => w.category === category.id).length;

                            return (
                                <button
                                    key={category.id}
                                    className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(category.id)}
                                >
                                    <Icon size={18} />
                                    <span>{category.label}</span>
                                    <span className="count-badge">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                    <button className="category-tab add-btn" onClick={handleAddWebsite}>
                        <Plus size={18} />
                        <span className="add-text">Add Website</span>
                    </button>
                </div>

                {/* Websites Grid */}
                <div className="websites-grid">
                    {isLoading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading AI websites...</p>
                        </div>
                    ) : filteredWebsites.length === 0 ? (
                        <div className="empty-state">
                            <Globe size={64} />
                            <h3>No websites found</h3>
                            <p>Add your first website to get started</p>
                        </div>
                    ) : (
                        filteredWebsites.map((website) => {
                            const Icon = getCategoryIcon(website.category);

                            return (
                                <div
                                    key={website._id}
                                    className={`website-card ${website.featured ? 'featured' : ''}`}
                                    style={{
                                        backgroundImage: website.imageUrl ? `url(${website.imageUrl})` : 'none'
                                    }}
                                >
                                    <div className="card-overlay"></div>
                                    <div className="card-inner">
                                        <div className="card-header">
                                            <div
                                                className="website-icon-wrapper"
                                                onClick={() => handleVisitWebsite(website.url, website.name)}
                                            >
                                                <div
                                                    className="website-icon"
                                                    style={{
                                                        backgroundImage: website.iconUrl ? `url(${website.iconUrl})` : 'none'
                                                    }}
                                                >
                                                    {!website.iconUrl && Icon}
                                                </div>
                                            </div>

                                            <span className={`status-badge status-${website.status}`}>
                                                {website.status === 'free' && '🆓 Free'}
                                                {website.status === 'paid' && '💎 Paid'}
                                                {website.status === 'freemium' && '⭐ Freemium'}
                                            </span>
                                        </div>

                                        <div className="card-content">
                                            <h3
                                                className="website-name"
                                                onClick={() => handleVisitWebsite(website.url, website.name)}
                                            >
                                                {website.name}
                                            </h3>
                                            <p className="website-description">{website.description}</p>
                                        </div>

                                        <div className="card-actions">
                                            <button
                                                className="action-icon"
                                                onClick={() => handleCopyUrl(website.url, website.name)}
                                                title="Copy URL"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button
                                                className="action-icon"
                                                onClick={() => handleEditWebsite(website)}
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="action-icon delete"
                                                onClick={() => handleDeleteWebsite(website._id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button
                                                className="action-icon primary"
                                                onClick={() => handleVisitWebsite(website.url, website.name)}
                                                title="Visit"
                                            >
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="email-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="email-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="email-modal-header">
                            <h2>{modalMode === 'add' ? 'Add New Website' : 'Edit Website'}</h2>
                            <button className="close-button" onClick={() => setShowModal(false)}>
                                <X className="icon" />
                            </button>
                        </div>

                        <div className="email-modal-body">
                            <div className="form-fields">
                                <div className="form-field">
                                    <label>Website Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter website name"
                                    />
                                </div>

                                <div className="form-field">
                                    <label>URL *</label>
                                    <input
                                        type="url"
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Enter description"
                                        rows={3}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Image URL</label>
                                    <input
                                        type="url"
                                        value={formData.imageUrl || ''}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Icon URL</label>
                                    <input
                                        type="url"
                                        value={formData.iconUrl || ''}
                                        onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                                        placeholder="https://example.com/icon.png"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                        >
                                            <option value="chatting">Chatting</option>
                                            <option value="website-building">Website Building</option>
                                            <option value="video-editing">Video Editing</option>
                                            <option value="photo-editing">Photo Editing</option>
                                            <option value="image-generation">Image Generation</option>
                                            <option value="music-generation">Music Generation</option>
                                            <option value="text-generation">Text Generation</option>
                                            <option value="code-assistant">Code Assistant</option>
                                            <option value="design">Design</option>
                                            <option value="data-analysis">Data Analysis</option>
                                            <option value="productivity">Productivity</option>
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label>Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        >
                                            <option value="free">Free</option>
                                            <option value="paid">Paid</option>
                                            <option value="freemium">Freemium</option>
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label>Priority</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="email-modal-footer">
                            <button className="cancel-button" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="submit-button"
                                onClick={handleSaveWebsite}
                                disabled={!formData.name || !formData.url}
                            >
                                {modalMode === 'add' ? 'Add Website' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIWebsitesPage;
