import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent, useMemo } from 'react';
import { PAYMENT_TYPES, WEBSITE_TECHNOLOGIES, WEBSITE_TYPES } from '../../lib/constants';
import '../../styles/pages/webconfig/index.scss';
import websiteBuilderStore from './store/websiteBuilderStore';
import { useCreateWebsite, useUpdateWebsite, useGetWebsite } from '../../service/SnippetService';
import type { ProjectSettings } from './store/websiteBuilderStore';
import type { ProjectSettings as LibProjectSettings } from '../../lib/types';

interface FormErrors {
    [key: string]: string;
}

// Extend ProjectSettings with additional properties used in this modal if necessary
type ExtendedProjectSettings = ProjectSettings & LibProjectSettings & {
    _id?: string; // Assuming _id might come from the backend
    name: string;
    websiteType: string;
    paymentType: string;
    paymentAmount: number;
    publishedUrl?: string;
    author?: string;
    version?: string;
    support?: string;
    thumbnail?: string;
    screenshots?: string[];
    features?: string[];
    technologies?: string[];
    snippet?: any[]; // Using any for snippet as its structure isn't fully defined here
    longDescription?: string;
};

interface WebSiteSaveModalProps {
    websiteId?: string;
}

// Default project settings
const defaultSettings: ExtendedProjectSettings = {
    _id: '',
    name: '',
    websiteType: '',
    paymentType: '',
    paymentAmount: 0,
    publishedUrl: '',
    author: '',
    version: '',
    support: '',
    thumbnail: '',
    screenshots: [],
    features: [],
    technologies: [],
    description: '',
    longDescription: '',
    snippet: [],
    title: 'My Website',
    favicon: '',
    siteUrl: '',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    fontFamily: 'sans-serif',
};

const WebSiteSaveModal: React.FC<WebSiteSaveModalProps> = ({ websiteId }) => {
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { page1SectionCodes, projectSettings, setIsSaveProject, addPage1SectionCodes, setProjectSettings } = websiteBuilderStore();

    const settings: ExtendedProjectSettings = useMemo(() => ({ ...defaultSettings, ...projectSettings }), [projectSettings]);

    // Fetch existing data if websiteId is provided
    const { data, isLoading, isError, error } = useGetWebsite(websiteId || '');

    useEffect(() => {
        if (data) {
            setProjectSettings(data.data || defaultSettings);
        }
    }, [data, setProjectSettings]);

    // Handle input changes
    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = e.target;

            // Clear error for this field
            if (formErrors[name]) {
                setFormErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }

            setProjectSettings({
                ...settings,
                [name]: name === 'paymentAmount' ? Number(value) : value,
            });
        },
        [settings, setProjectSettings, formErrors]
    );

    // Image preview effect
    useEffect(() => {
        if (!settings.thumbnail) {
            setImagePreview(null);
            return;
        }

        const img = new Image();
        img.onload = () => setImagePreview(settings.thumbnail || null);
        img.onerror = () => setImagePreview(null);
        img.src = settings.thumbnail;
    }, [settings.thumbnail]);

    // Auto-set price to 0 for free projects
    useEffect(() => {
        if (settings.paymentType === 'free' && settings.paymentAmount !== 0) {
            setProjectSettings({ ...settings, paymentAmount: 0 });
        }
    }, [settings.paymentType, settings, setProjectSettings]);

    // Array management helpers
    const addToArray = useCallback(
        (field: keyof ExtendedProjectSettings, value: string) => {
            if (!value?.trim()) return;
            const currentArray = Array.isArray(settings[field]) ? settings[field] : [];
            setProjectSettings({
                ...settings,
                [field]: [...currentArray, value.trim()],
            });
        },
        [settings, setProjectSettings]
    );

    const removeFromArray = useCallback(
        (field: keyof ExtendedProjectSettings, index: number) => {
            const currentArray = Array.isArray(settings[field]) ? [...settings[field]] : [];
            if (index >= 0 && index < currentArray.length) {
                currentArray.splice(index, 1);
                setProjectSettings({ ...settings, [field]: currentArray });
            }
        },
        [settings, setProjectSettings]
    );

    const addTechnologies = useCallback(
        (selectedOptions: string[]) => {
            const existingTech = Array.isArray(settings.technologies) ? settings.technologies : [];
            const uniqueTech = [...new Set([...existingTech, ...selectedOptions])];
            setProjectSettings({ ...settings, technologies: uniqueTech });
        },
        [settings, setProjectSettings]
    );

    // Form validation
    const validateForm = (): boolean => {
        const errors: FormErrors = {};
        if (!settings.name?.trim()) errors.name = 'Project name is required';
        if (!settings.websiteType) errors.websiteType = 'Website type is required';
        if (!settings.paymentType) errors.paymentType = 'Payment type is required';

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            alert(Object.values(errors)[0]);
            return false;
        }
        return true;
    };

    // Mutations
    const createMutation = useCreateWebsite({
        onSuccess: () => {
            alert('Website created successfully!');
            setIsSaveProject(false);
            setProjectSettings(defaultSettings);
            setTimeout(() => {
                window.history.go(-1);
            }, 1000);
        },
        onError: (error: Error) => {
            alert(`Error creating website: ${error.message}`);
        },
    });

    const updateMutation = useUpdateWebsite({
        onSuccess: () => {
            alert('Website updated successfully!');
            setIsSaveProject(false);
            setProjectSettings(defaultSettings);
            setTimeout(() => {
                window.history.go(-1);
            }, 1000);
        },
        onError: (error: Error) => {
            alert(`Error updating website: ${error.message}`);
        },
    });

    // Form submission
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;
        const websiteData = {
            ...settings,
            name: settings.name || '',
            websiteType: settings.websiteType || '',
            paymentType: settings.paymentType || '',
            snippet: page1SectionCodes || [],
        };

        if (websiteId) {
            updateMutation.mutate({ id: websiteId, data: websiteData });
        } else {
            createMutation.mutate(websiteData);
        }
    };

    // Input helpers
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, callback: (value: string) => void) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = e.currentTarget.value.trim();
            if (value) {
                callback(value);
                e.currentTarget.value = '';
            }
        }
    };

    const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>, callback: (value: string) => void) => {
        e.preventDefault();
        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
        const value = input?.value?.trim();
        if (value) {
            callback(value);
            input.value = '';
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending || isLoading;

    if (isLoading) {
        return (
            <div className="webconfig__modal">
                <div className="modal">
                    <div className="modal-content">
                        <div className="loading">Loading...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="webconfig__modal">
            <div className="modal">
                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">{websiteId ? 'Edit Project' : 'Add New Project'}</h2>
                    <div className="header-actions">
                        <button type="submit" form="itemForm" className="submit-button" disabled={isPending}>
                            {isPending ? 'Saving...' : websiteId ? 'Update' : 'Add'}
                        </button>
                        <button
                            className="modal-close"
                            onClick={() => {
                                setIsSaveProject(false);
                                setProjectSettings(defaultSettings);
                            }}
                            disabled={isPending}
                        >
                            <i className="pi pi-times"></i>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="modal-content">
                    <form onSubmit={handleSubmit} id="itemForm" className="form">
                        <div className="top-section">
                            {/* Basic Information */}
                            <div className="basic-info">
                                <div className="form-section">
                                    <h3>Basic Information</h3>

                                    <div className="form-field">
                                        <label htmlFor="name">Project Name*</label>
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            placeholder="Enter project name"
                                            value={settings.name}
                                            onChange={handleInputChange}
                                            required
                                            className={formErrors.name ? 'error' : ''}
                                        />
                                        {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                                    </div>

                                    <div className="form-row">
                                        <div className="form-field">
                                            <label htmlFor="websiteType">Website Type*</label>
                                            <select
                                                id="websiteType"
                                                name="websiteType"
                                                value={settings.websiteType}
                                                onChange={handleInputChange}
                                                required
                                                className={formErrors.websiteType ? 'error' : ''}
                                            >
                                                <option value="">Select Type</option>
                                                {WEBSITE_TYPES?.map((type) => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {formErrors.websiteType && <span className="error-text">{formErrors.websiteType}</span>}
                                        </div>

                                        <div className="form-field">
                                            <label htmlFor="paymentType">Payment Type*</label>
                                            <select
                                                id="paymentType"
                                                name="paymentType"
                                                value={settings.paymentType}
                                                onChange={handleInputChange}
                                                required
                                                className={formErrors.paymentType ? 'error' : ''}
                                            >
                                                <option value="">Select Payment Type</option>
                                                {PAYMENT_TYPES?.map((type) => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {formErrors.paymentType && <span className="error-text">{formErrors.paymentType}</span>}
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-field">
                                            <label htmlFor="paymentAmount">Payment Amount</label>
                                            <input
                                                id="paymentAmount"
                                                type="number"
                                                name="paymentAmount"
                                                placeholder="Enter amount"
                                                value={settings.paymentAmount}
                                                onChange={handleInputChange}
                                                disabled={settings.paymentType === 'free'}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>

                                        <div className="form-field">
                                            <label htmlFor="publishedUrl">Published URL</label>
                                            <input
                                                id="publishedUrl"
                                                type="url"
                                                name="publishedUrl"
                                                placeholder="https://example.com"
                                                value={settings.publishedUrl}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Project Details */}
                                <div className="form-section">
                                    <h3>Project Details</h3>

                                    <div className="form-row">
                                        <div className="form-field">
                                            <label htmlFor="author">Author</label>
                                            <input
                                                id="author"
                                                type="text"
                                                name="author"
                                                placeholder="Author name"
                                                value={settings.author}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label htmlFor="version">Version</label>
                                            <input
                                                id="version"
                                                type="text"
                                                name="version"
                                                placeholder="e.g., 1.0.0"
                                                value={settings.version}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="support">Support</label>
                                        <input
                                            id="support"
                                            type="text"
                                            name="support"
                                            placeholder="Support email or URL"
                                            value={settings.support}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Media Section */}
                            <div className="image-section">
                                {/* Thumbnail */}
                                <div className="form-section">
                                    <h3>Thumbnail</h3>

                                    <div className="form-field">
                                        <label htmlFor="thumbnail">Thumbnail URL</label>
                                        <input
                                            id="thumbnail"
                                            type="url"
                                            name="thumbnail"
                                            placeholder="https://example.com/image.jpg"
                                            value={settings.thumbnail}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="image-preview">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Thumbnail preview" />
                                        ) : (
                                            <div className="image-placeholder">
                                                <i className="pi pi-image" style={{ fontSize: '3rem' }}></i>
                                                <p>Image Preview</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Screenshots */}
                                <div className="form-section">
                                    <h3>Screenshots</h3>

                                    <div className="screenshots-grid">
                                        {settings.screenshots?.map((screenshot: string, index: number) => (
                                            <div key={index} className="screenshot-item">
                                                <img src={screenshot} alt={`Screenshot ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromArray('screenshots', index)}
                                                    className="screenshot-remove"
                                                    aria-label={`Remove screenshot ${index + 1}`}
                                                >
                                                    <i className="pi pi-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="screenshots-input">
                                        <input
                                            type="url"
                                            placeholder="Add screenshot URL and press Enter"
                                            onKeyDown={(e) => handleKeyDown(e, (value) => addToArray('screenshots', value))}
                                        />
                                        <button
                                            type="button"
                                            className="add-button"
                                            onClick={(e) => handleAddClick(e, (value) => addToArray('screenshots', value))}
                                        >
                                            Add Screenshot
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="form-section">
                            <h3>Features</h3>

                            <div className="features-list">
                                {settings.features?.map((feature: string, index: number) => (
                                    <div key={index} className="feature-item">
                                        <span>{feature}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFromArray('features', index)}
                                            className="remove-button"
                                            aria-label={`Remove feature: ${feature}`}
                                        >
                                            <i className="pi pi-times"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="features-input">
                                <input
                                    type="text"
                                    placeholder="Add feature and press Enter"
                                    onKeyDown={(e) => handleKeyDown(e, (value) => addToArray('features', value))}
                                />
                                <button type="button" className="add-button" onClick={(e) => handleAddClick(e, (value) => addToArray('features', value))}>
                                    Add Feature
                                </button>
                            </div>
                        </div>

                        {/* Technologies */}
                        <div className="form-section">
                            <h3>Technologies</h3>

                            <div className="technologies-container">
                                <div className="selected-technologies">
                                    {settings.technologies?.map((tech: string, index: number) => {
                                        const techObj = WEBSITE_TECHNOLOGIES?.find((t) => t.value === tech);
                                        return (
                                            <div key={index} className="technology-tag">
                                                {techObj?.label || tech}
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromArray('technologies', index)}
                                                    className="tag-remove"
                                                    aria-label={`Remove technology: ${techObj?.label || tech}`}
                                                >
                                                    <i className="pi pi-times"></i>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="tech-selection">
                                    <select
                                        multiple
                                        size={5}
                                        className="tech-select"
                                        onChange={(e) => {
                                            const selectedOptions = Array.from(e.target.selectedOptions)
                                                .map((option) => option.value)
                                                .filter(Boolean);

                                            if (selectedOptions.length > 0) {
                                                addTechnologies(selectedOptions);
                                            }

                                            // Clear selections
                                            Array.from(e.target.options).forEach((option) => {
                                                option.selected = false;
                                            });
                                        }}
                                    >
                                        {WEBSITE_TECHNOLOGIES?.filter((tech) => !settings.technologies?.includes(tech.value))?.map((tech) => (
                                            <option key={tech.value} value={tech.value}>
                                                {tech.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="tech-hint">Hold Ctrl/Cmd to select multiple</div>
                                </div>
                            </div>
                        </div>

                        {/* Descriptions */}
                        <div className="bottom-section">
                            <div className="form-section">
                                <h3>Descriptions</h3>

                                <div className="form-field">
                                    <label htmlFor="description">Short Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        placeholder="Brief description (100-200 characters)"
                                        value={settings.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="longDescription">Detailed Description</label>
                                    <textarea
                                        id="longDescription"
                                        name="longDescription"
                                        placeholder="Comprehensive description with features and benefits"
                                        value={settings.longDescription}
                                        onChange={handleInputChange}
                                        rows={6}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WebSiteSaveModal;
