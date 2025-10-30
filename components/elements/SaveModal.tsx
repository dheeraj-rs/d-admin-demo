'use client';
import { useState, useEffect } from 'react';
import { ESaveFormData, ESaveModalProps } from '../../types';
export default function SaveModal({ isVisible, onClose, onSave, isLoading, initialData }: ESaveModalProps) {
    const [formData, setFormData] = useState<ESaveFormData>(
        initialData || {
            title: '',
            description: '',
            hashtags: [],
            componentType: '',
            complexity: 'beginner',
        }
    );

    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    if (!isVisible) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setTouchedFields((prev) => ({
            ...prev,
            [name]: true,
        }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name } = e.target;
        setTouchedFields((prev) => ({
            ...prev,
            [name]: true,
        }));
        validateField(name, formData[name as keyof ESaveFormData]);
    };

    const validateField = (fieldName: string, value: any): boolean => {
        let error = '';
        switch (fieldName) {
            case 'title':
                if (!value || value.trim() === '') {
                    error = 'Title is required';
                }
                break;
            case 'description':
                if (!value || value.trim() === '') {
                    error = 'Description is required';
                }
                break;
            case 'componentType':
                if (!value) {
                    error = 'Component type is required';
                }
                break;
            case 'complexity':
                if (!value) {
                    error = 'Complexity is required';
                }
                break;
        }
        if (error) {
            setErrors((prev) => ({
                ...prev,
                [fieldName]: error,
            }));
            return false;
        }
        return true;
    };

    const handleAddTag = () => {
        if (tagInput.trim()) {
            const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
            if (!formData.hashtags.includes(newTag)) {
                setFormData((prev) => ({
                    ...prev,
                    hashtags: [...prev.hashtags, newTag],
                }));
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData((prev) => ({
            ...prev,
            hashtags: prev.hashtags.filter((t) => t !== tag),
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;
        const allFields: Record<string, boolean> = {
            title: true,
            description: true,
            componentType: true,
            complexity: true,
        };
        setTouchedFields(allFields);
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
            isValid = false;
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
            isValid = false;
        }
        if (!formData.componentType) {
            newErrors.componentType = 'Component type is required';
            isValid = false;
        }
        if (!formData.complexity) {
            newErrors.complexity = 'Complexity is required';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const saveResult = await onSave(formData);
                if (saveResult === false) {
                    return;
                }
            } catch (error) {
                console.error('Error in save operation:', error);
            }
        }
    };

    const getFieldClass = (fieldName: string) => {
        return errors[fieldName] && touchedFields[fieldName] ? 'error' : '';
    };

    return (
        <div
            className="element-code-save-modal__wrapper"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Save Element</h2>
                    <button className="close-button" onClick={onClose} type="button" aria-label="Close">
                        <i className="pi pi-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="compact-form">
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label htmlFor="title">Title*</label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getFieldClass('title')}
                                placeholder="Enter element title"
                                autoFocus
                            />
                            {errors.title && touchedFields.title && (
                                <div className="error-message">
                                    <i className="pi pi-exclamation-circle"></i> {errors.title}
                                </div>
                            )}
                        </div>
                        <div className="form-group full-width">
                            <label htmlFor="description">Description*</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getFieldClass('description')}
                                placeholder="Brief description of your element"
                                rows={3}
                            />
                            {errors.description && touchedFields.description && (
                                <div className="error-message">
                                    <i className="pi pi-exclamation-circle"></i> {errors.description}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="componentType">Component Type*</label>
                            <select
                                id="componentType"
                                name="componentType"
                                value={formData.componentType}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getFieldClass('componentType')}
                            >
                                <option value="">Select type</option>
                                <option value="header">Header</option>
                                <option value="hero">Hero</option>
                                <option value="about">About</option>
                                <option value="services">Services</option>
                                <option value="contact">Contact</option>
                                <option value="footer">Footer</option>
                                <option value="button">Button</option>
                                <option value="card">Card</option>
                                <option value="form">Form</option>
                                <option value="input">Input</option>
                                <option value="table">Table</option>
                                <option value="auth-access">Auth Access</option>
                                <option value="auth-error">Auth Error</option>
                                <option value="auth-login">Auth Login</option>
                                <option value="notfound">Not Found</option>
                                <option value="sections">Sections</option>
                                <option value="other">Other</option>
                            </select>
                            {errors.componentType && touchedFields.componentType && (
                                <div className="error-message">
                                    <i className="pi pi-exclamation-circle"></i> {errors.componentType}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="complexity">Complexity*</label>
                            <select
                                id="complexity"
                                name="complexity"
                                value={formData.complexity}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getFieldClass('complexity')}
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                            {errors.complexity && touchedFields.complexity && (
                                <div className="error-message">
                                    <i className="pi pi-exclamation-circle"></i> {errors.complexity}
                                </div>
                            )}
                        </div>
                        <div className="form-group full-width">
                            <label>Tags</label>
                            <div className="tags-input">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Add a tag and press Enter"
                                />
                                <button type="button" onClick={handleAddTag} className="tag-button">
                                    <i className="pi pi-plus"></i>
                                </button>
                            </div>
                            <div className="tags-container">
                                {formData.hashtags.map((tag) => (
                                    <div key={tag} className="tag">
                                        <span>{tag}</span>
                                        <button type="button" onClick={() => handleRemoveTag(tag)} aria-label={`Remove tag ${tag}`}>
                                            <i className="pi pi-times"></i>
                                        </button>
                                    </div>
                                ))}
                                {formData.hashtags.length === 0 && <span className="empty-tags">No tags added yet</span>}
                            </div>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="cancel-button">
                            Cancel
                        </button>
                        <button type="submit" className="save-button" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <i className="pi pi-spin pi-spinner mr-1"></i>
                                    Saving...
                                </>
                            ) : (
                                'Save Element'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
