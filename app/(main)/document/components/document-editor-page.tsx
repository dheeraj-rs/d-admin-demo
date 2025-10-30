'use client';

import * as React from 'react';
import { ArrowLeft, Save, Loader2, FolderOpen, Image as ImageIcon } from 'lucide-react';
import { RichTextEditor } from './rich-text-editor';
import { Document, Category } from './DocumentManager';
import toast from 'react-hot-toast';
import '../../../../styles/pages/documents/index.scss';

interface DocumentEditorPageProps {
    document: Document;
    categories: Category[];
    onBack: () => void;
    onSave: (title: string, content: string, categoryId: string, backgroundColor?: string, backgroundImage?: string) => Promise<void>;
}

export function DocumentEditorPage({
    document,
    categories,
    onBack,
    onSave,
}: DocumentEditorPageProps) {
    const [title, setTitle] = React.useState(document.title);
    const [content, setContent] = React.useState(document.content);
    const [categoryId, setCategoryId] = React.useState(document.category_id || '');
    const [backgroundColor, setBackgroundColor] = React.useState(document.background_color || '');
    const [backgroundImage, setBackgroundImage] = React.useState(document.background_image || '');
    const [isSaving, setIsSaving] = React.useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);
    const [showImageInput, setShowImageInput] = React.useState(false);

    React.useEffect(() => {
        const hasChanges =
            title !== document.title ||
            content !== document.content ||
            categoryId !== document.category_id ||
            backgroundColor !== document.background_color ||
            backgroundImage !== document.background_image;
        setHasUnsavedChanges(hasChanges);
    }, [title, content, categoryId, backgroundColor, backgroundImage, document]);

    const handleSave = React.useCallback(async () => {
        if (!title.trim()) {
            toast.error('Please enter a document title');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(title.trim(), content, categoryId, backgroundColor, backgroundImage);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Error saving document:', error);
        } finally {
            setIsSaving(false);
        }
    }, [title, content, categoryId, backgroundColor, backgroundImage, onSave]);

    const handleBack = () => {
        if (hasUnsavedChanges) {
            const confirmed = window.confirm(
                'You have unsaved changes. Are you sure you want to leave?'
            );
            if (!confirmed) return;
        }
        onBack();
    };

    // Auto-save every 30 seconds if there are changes
    React.useEffect(() => {
        if (!hasUnsavedChanges) return;

        const autoSaveTimer = setTimeout(() => {
            handleSave();
        }, 30000);

        return () => clearTimeout(autoSaveTimer);
    }, [hasUnsavedChanges, handleSave]);

    // Keyboard shortcut for save (Cmd/Ctrl + S)
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave]);

    const selectedCategory = categories.find((cat) => cat.id === categoryId);
    const availableCategories = categories.filter((cat) => cat.name !== 'All Documents');

    return (
        <div className="document-editor-page">
            <div className="editor-page-header">
                <div className="header-content">
                    <div className="header-left">
                        <button
                            onClick={handleBack}
                            className="back-button"
                        >
                            <ArrowLeft />
                        </button>

                        <div className="title-input-wrapper">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="title-input"
                                placeholder="Document Title"
                            />
                        </div>
                    </div>

                    <div className="header-actions">
                        <button
                            onClick={() => setShowImageInput(!showImageInput)}
                            className="image-button"
                            title="Card Background Image"
                        >
                            <ImageIcon />
                            <span className="button-text">Image</span>
                        </button>

                        <div className="category-dropdown-wrapper">
                            <button
                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                className="category-button"
                            >
                                <FolderOpen />
                                {selectedCategory ? (
                                    <>
                                        <span>{selectedCategory.icon}</span>
                                        <span className="category-name">{selectedCategory.name}</span>
                                    </>
                                ) : (
                                    <span className="category-name">Select Category</span>
                                )}
                            </button>

                            {showCategoryDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setShowCategoryDropdown(false)}
                                    />
                                    <div className="category-dropdown">
                                        {availableCategories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => {
                                                    setCategoryId(category.id);
                                                    setShowCategoryDropdown(false);
                                                }}
                                                className={`category-option ${categoryId === category.id ? 'selected' : ''}`}
                                            >
                                                <span>{category.icon}</span>
                                                <span>{category.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving || !hasUnsavedChanges}
                            className={`save-button ${hasUnsavedChanges ? 'has-changes' : ''}`}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    <span className="button-text">Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save />
                                    <span className="button-text">Save</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {showImageInput && (
                <div className="background-panel">
                    <div className="panel-content">
                        <div className="input-group">
                            <label>Card Background Image URL</label>
                            <input
                                type="text"
                                value={backgroundImage}
                                onChange={(e) => setBackgroundImage(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        <button
                            onClick={() => setShowImageInput(false)}
                            className="close-panel-button"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div className="editor-content-area">
                <div className="editor-wrapper">
                    <RichTextEditor content={content} onChange={setContent} />
                </div>
            </div>

            <div className="status-bar">
                <div className="status-left">
                    <span className="status-item">Last: {new Date(document.updated_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="status-item">{document.last_modified_by}</span>
                    <span>•</span>
                    <span className="status-item">{content.length} chars</span>
                    {hasUnsavedChanges && (
                        <>
                            <span>•</span>
                            <span className="status-item unsaved-indicator">Unsaved</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
