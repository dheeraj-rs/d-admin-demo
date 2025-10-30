import React, { useState, useEffect } from 'react';
import { WebConfigEditModalProps } from '../../../../types';
import { PAYMENT_TYPES, WEBSITE_TECHNOLOGIES, WEBSITE_TYPES } from '../../../../lib/constants';

const WebConfigEditModal: React.FC<WebConfigEditModalProps> = ({ isEditing, currentItem, setCurrentItem, handleSubmit, handleFillRandom, initialCategory, onClose }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageError, setImageError] = useState<boolean>(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentItem({
            ...currentItem,
            [name]: value,
        });
    };

    useEffect(() => {
        if (currentItem?.image) {
            const img = new Image();
            img.src = currentItem.image;
            img.onload = () => {
                setImagePreview(currentItem.image || null);
                setImageError(false);
            };
            img.onerror = () => {
                setImageError(true);
                setImagePreview(null);
            };
        } else {
            setImagePreview(null);
            setImageError(false);
        }
    }, [currentItem?.image]);

    useEffect(() => {
        // Extract the category to a separate variable for dependency check
        const currentCategory = currentItem?.category;
        
        if (currentCategory === 'free') {
            setCurrentItem((prev: any) => ({
                ...prev,
                price: 0,
            }));
        }
    }, [currentItem?.category, setCurrentItem]);

    return (
        <div className="webconfig__modal">
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">{isEditing ? 'Edit' : 'Add New'}</h2>
                    <div className="header-actions">
                        <button type="button" onClick={handleFillRandom} className="random-button">
                            Fill Random
                        </button>
                        <div className="form-buttons">
                            <button type="submit" form="itemForm" className="submit-button">
                                {isEditing ? 'Update' : 'Add'}
                            </button>
                            <button className="modal-close" onClick={onClose}>
                                <i className="pi pi-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="modal-content">
                    <form onSubmit={handleSubmit} id="itemForm" className="form">
                        <div className="top-section">
                            <div className="basic-info">
                                <div className="form-section">
                                    <h3>Basic Information</h3>
                                    <div className="form-field">
                                        <label htmlFor="name">Name*</label>
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            placeholder="Product Name"
                                            value={currentItem?.name || ''}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-field">
                                            <label htmlFor="type">Type*</label>
                                            <select id="type" name="type" value={currentItem?.type || ''} onChange={handleInputChange} required>
                                                <option value="">Select Type</option>
                                                {WEBSITE_TYPES?.map((type) => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-field">
                                            <label htmlFor="category">Category*</label>
                                            <select id="category" name="category" value={currentItem?.category || ''} onChange={handleInputChange} required disabled={initialCategory !== 'all'}>
                                                <option value="">Select Category</option>
                                                {PAYMENT_TYPES?.map((category) => (
                                                    <option key={category.value} value={category.value}>
                                                        {category.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-field">
                                        <label htmlFor="title">Title</label>
                                        <input
                                            id="title"
                                            type="text"
                                            name="title"
                                            placeholder="Product Title"
                                            value={currentItem?.title || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label htmlFor="framework">Framework</label>
                                        <input
                                            id="framework"
                                            type="text"
                                            name="framework"
                                            placeholder="Framework"
                                            value={currentItem?.framework || 'Flutter'}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="form-section">
                                    <h3>Pricing & Stats</h3>
                                    <div className="form-row">
                                        <div className="form-field">
                                            <label htmlFor="price">Price*</label>
                                            <input
                                                id="price"
                                                type="number"
                                                name="price"
                                                placeholder="Price"
                                                value={currentItem?.category !== 'free' ? currentItem?.price || 0 : 0}
                                                onChange={handleInputChange}
                                                disabled={currentItem?.category === 'free'}
                                                required
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label htmlFor="rating">Rating</label>
                                            <input
                                                id="rating"
                                                type="number"
                                                name="rating"
                                                placeholder="Rating"
                                                value={currentItem?.rating || 0}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="5"
                                                step="0.1"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-field">
                                            <label htmlFor="downloads">Downloads</label>
                                            <input
                                                id="downloads"
                                                type="number"
                                                name="downloads"
                                                placeholder="Downloads"
                                                value={currentItem?.downloads || 0}
                                                onChange={handleInputChange}
                                                min="0"
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label htmlFor="version">Version</label>
                                            <input
                                                id="version"
                                                type="text"
                                                name="version"
                                                placeholder="Version"
                                                value={currentItem?.version || ''}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="image-section">
                                <div className="form-section">
                                    <h3>Image*</h3>
                                    <div className="form-field">
                                        <label htmlFor="image">Image URL</label>
                                        <input
                                            id="image"
                                            type="text"
                                            name="image"
                                            placeholder="Image URL"
                                            value={currentItem?.image || ''}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="image-preview">
                                        {imageError ? (
                                            <div className="image-error">Invalid Image URL</div>
                                        ) : imagePreview ? (
                                            <img src={imagePreview} alt="Preview" />
                                        ) : (
                                            <div className="image-placeholder">
                                                <i className="pi pi-image" style={{ fontSize: '3rem' }}></i>
                                                <p>Image Preview</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="form-section">
                                    <h3>Screenshots</h3>
                                    <div className="screenshots-grid">
                                        {currentItem?.screenshots?.map((screenshot: string, index: number) => (
                                            <div key={index} className="screenshot-item">
                                                <img src={screenshot} alt={`Screenshot ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newScreenshots = [...(currentItem?.screenshots || [])];
                                                        newScreenshots.splice(index, 1);
                                                        setCurrentItem((prev: any) => ({
                                                            ...prev,
                                                            screenshots: newScreenshots,
                                                        }));
                                                    }}
                                                    className="screenshot-remove"
                                                >
                                                    <i className="pi pi-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="screenshots-input">
                                        <input
                                            type="text"
                                            placeholder="Add screenshot URL"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const input = e.target as HTMLInputElement;
                                                    const value = input.value.trim();
                                                    if (value) {
                                                        setCurrentItem((prev: any) => ({
                                                            ...prev,
                                                            screenshots: [...(prev?.screenshots || []), value],
                                                        }));
                                                        input.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="add-button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                const value = input.value.trim();
                                                if (value) {
                                                    setCurrentItem((prev: any) => ({
                                                        ...prev,
                                                        screenshots: [...(prev?.screenshots || []), value],
                                                    }));
                                                    input.value = '';
                                                }
                                            }}
                                        >
                                            Add Screenshot
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bottom-section">
                            <div className="form-section">
                                <h3>Descriptions</h3>
                                <div className="form-field">
                                    <label htmlFor="url">Product URL*</label>
                                    <input
                                        id="url"
                                        type="text"
                                        name="url"
                                        placeholder="Product URL"
                                        value={currentItem?.url || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-field">
                                    <label htmlFor="description">Description*</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        placeholder="Short description (shown in listings)"
                                        value={currentItem?.description || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-field">
                                    <label htmlFor="longDescription">Long Description</label>
                                    <textarea
                                        id="longDescription"
                                        name="longDescription"
                                        placeholder="Detailed description (shown on product page)"
                                        value={currentItem?.longDescription || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="form-section">
                                <h3>Additional Details</h3>
                                <div className="form-row">
                                    <div className="form-field">
                                        <label htmlFor="author">Author</label>
                                        <input
                                            id="author"
                                            type="text"
                                            name="author"
                                            placeholder="Author"
                                            value={currentItem?.author || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label htmlFor="support">Support</label>
                                        <input
                                            id="support"
                                            type="text"
                                            name="support"
                                            placeholder="Support Email/URL"
                                            value={currentItem?.support || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-field">
                                        <label htmlFor="fileSize">File Size</label>
                                        <input
                                            id="fileSize"
                                            type="text"
                                            name="fileSize"
                                            placeholder="File Size"
                                            value={currentItem?.fileSize || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label htmlFor="estimatedTime">Estimated Time</label>
                                        <input
                                            id="estimatedTime"
                                            type="text"
                                            name="estimatedTime"
                                            placeholder="e.g. 2 hours"
                                            value={currentItem?.estimatedTime || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-section">
                                <h3>Features</h3>
                                <div className="features-list">
                                    {currentItem?.features?.map((feature: string, index: number) => (
                                        <div key={index} className="feature-item">
                                            <span>{feature}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newFeatures = [...(currentItem?.features || [])];
                                                    newFeatures.splice(index, 1);
                                                    setCurrentItem((prev: any) => ({
                                                        ...prev,
                                                        features: newFeatures,
                                                    }));
                                                }}
                                            >
                                                <i className="pi pi-times"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="features-input">
                                    <input
                                        type="text"
                                        placeholder="Add feature"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const input = e.target as HTMLInputElement;
                                                const value = input.value.trim();
                                                if (value) {
                                                    setCurrentItem((prev: any) => ({
                                                        ...prev,
                                                        features: [...(prev?.features || []), value],
                                                    }));
                                                    input.value = '';
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="add-button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                            const value = input.value.trim();
                                            if (value) {
                                                setCurrentItem((prev: any) => ({
                                                    ...prev,
                                                    features: [...(prev?.features || []), value],
                                                }));
                                                input.value = '';
                                            }
                                        }}
                                    >
                                        Add Feature
                                    </button>
                                </div>
                            </div>
                            <div className="form-section">
                                <h3>Technologies</h3>
                                <div className="technologies-container">
                                    <div className="selected-technologies">
                                        {currentItem?.technologies?.map((tech: string, index: number) => {
                                            const techObj = WEBSITE_TECHNOLOGIES.find((t) => t.value === tech);
                                            return (
                                                <div key={index} className="technology-tag">
                                                    {techObj?.label || tech}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newTech = [...(currentItem?.technologies || [])];
                                                            newTech.splice(index, 1);
                                                            setCurrentItem({
                                                                ...currentItem,
                                                                technologies: newTech,
                                                            });
                                                        }}
                                                        className="tag-remove"
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
                                                const selectedOptions = Array.from(e.target.selectedOptions).map((option) => option.value);
                                                setCurrentItem({
                                                    ...currentItem,
                                                    technologies: [...new Set([...(currentItem?.technologies || []), ...selectedOptions])],
                                                });
                                                Array.from(e.target.options).forEach((option) => {
                                                    option.selected = false;
                                                });
                                            }}
                                        >
                                            {WEBSITE_TECHNOLOGIES.filter((tech) => !currentItem?.technologies?.includes(tech.value)).map((tech) => (
                                                <option key={tech.value} value={tech.value}>
                                                    {tech.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="tech-hint">Hold Ctrl/Cmd to select multiple</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WebConfigEditModal;
