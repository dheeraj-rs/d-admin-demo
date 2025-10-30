'use client';

import * as React from 'react';
import {
    X,
    Save,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Link2,
    Image as ImageIcon,
    Undo,
    Redo,
} from 'lucide-react';
import { Document } from './DocumentManager';
import '../../../../styles/pages/documents/index.scss';

interface DocumentEditorProps {
    document: Document;
    onClose: () => void;
    onSave: (title: string, content: string) => void;
}

export function DocumentEditor({ document, onClose, onSave }: DocumentEditorProps) {
    const [title, setTitle] = React.useState(document.title);
    const [content, setContent] = React.useState(document.content);
    const [isSaving, setIsSaving] = React.useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(title, content);
        setIsSaving(false);
    };

    return (
        <div className="document-editor-modal" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="title-input"
                        placeholder="Document Title"
                    />
                    <div className="header-actions">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="save-button"
                        >
                            <Save size={16} />
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button className="close-button" onClick={onClose}>
                            <X />
                        </button>
                    </div>
                </div>

                <div className="toolbar">
                    <div className="toolbar-group">
                        <button className="toolbar-button">
                            <Undo size={16} />
                        </button>
                        <button className="toolbar-button">
                            <Redo size={16} />
                        </button>
                    </div>

                    <div className="toolbar-group">
                        <button className="toolbar-button">
                            <Bold size={16} />
                        </button>
                        <button className="toolbar-button">
                            <Italic size={16} />
                        </button>
                        <button className="toolbar-button">
                            <Underline size={16} />
                        </button>
                    </div>

                    <div className="toolbar-group">
                        <button className="toolbar-button">
                            <AlignLeft size={16} />
                        </button>
                        <button className="toolbar-button">
                            <AlignCenter size={16} />
                        </button>
                        <button className="toolbar-button">
                            <AlignRight size={16} />
                        </button>
                    </div>

                    <div className="toolbar-group">
                        <button className="toolbar-button">
                            <List size={16} />
                        </button>
                        <button className="toolbar-button">
                            <ListOrdered size={16} />
                        </button>
                    </div>

                    <div className="toolbar-group">
                        <button className="toolbar-button">
                            <Link2 size={16} />
                        </button>
                        <button className="toolbar-button">
                            <ImageIcon size={16} />
                        </button>
                    </div>
                </div>

                <div className="editor-content">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="content-textarea"
                        placeholder="Start typing your document..."
                    />
                </div>

                <div className="modal-footer">
                    <div className="footer-info">
                        <span>Last modified: {new Date(document.updated_at).toLocaleString()}</span>
                        <span>{content.length} characters</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
