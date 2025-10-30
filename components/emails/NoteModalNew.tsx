'use client';

import React, { useState } from 'react';
import { X, FileText, Mail, Edit, Trash2, Plus } from 'lucide-react';

export interface INoteItem {
    id: string;
    key: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
}

interface NoteModalProps {
    show: boolean;
    mode: 'view' | 'edit';
    accountEmail: string;
    notes: INoteItem[];
    isSubmitting: boolean;
    onClose: () => void;
    onEdit: () => void;
    onSave: (notes: INoteItem[]) => void;
    onDeleteAll: () => void;
    onCancel: () => void;
}

export const NoteModalNew: React.FC<NoteModalProps> = ({
    show,
    mode,
    accountEmail,
    notes,
    isSubmitting,
    onClose,
    onEdit,
    onSave,
    onDeleteAll,
    onCancel,
}) => {
    const [editingNotes, setEditingNotes] = useState<INoteItem[]>(notes);

    React.useEffect(() => {
        setEditingNotes(notes);
    }, [notes, mode]);

    if (!show) return null;

    const handleAddNote = () => {
        const newNote: INoteItem = {
            id: new Date().getTime().toString(),
            key: '',
            value: '',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        setEditingNotes([...editingNotes, newNote]);
    };

    const handleUpdateNote = (id: string, field: 'key' | 'value', value: string) => {
        setEditingNotes(editingNotes.map(note =>
            note.id === id
                ? { ...note, [field]: value, updatedAt: new Date() }
                : note
        ));
    };

    const handleDeleteNote = (id: string) => {
        setEditingNotes(editingNotes.filter(note => note.id !== id));
    };

    const handleSaveNotes = () => {
        // Filter out empty notes
        const validNotes = editingNotes.filter(note => note.key.trim() && note.value.trim());
        onSave(validNotes);
    };

    return (
        <div className="email-modal-overlay" onClick={onClose}>
            <div className="email-modal-container note-modal" onClick={(e) => e.stopPropagation()}>
                <div className="email-modal-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText className="icon" />
                        {mode === 'view' ? 'Note Details' : 'Edit Notes'}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <X className="icon" />
                    </button>
                </div>

                <div className="email-modal-body">
                    <div className="note-account-info">
                        <Mail className="icon" />
                        <span>{accountEmail}</span>
                    </div>

                    <div className="note-details-section">
                        {mode === 'view' ? (
                            <div className="note-view-content">
                                {notes.length === 0 ? (
                                    <div className="empty-note-state">
                                        <FileText className="empty-icon" />
                                        <p>No notes added yet</p>
                                        <span>Click Edit to add usage details, subscription info, and more</span>
                                    </div>
                                ) : (
                                    <div className="note-lines">
                                        {notes.map((note) => (
                                            <div key={note.id} className="note-line note-line-keyvalue">
                                                <span className="note-key">{note.key.toUpperCase()}</span>
                                                <span className="note-value">{note.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="note-edit-content-new">
                                <div className="note-edit-header">
                                    <label className="note-label">Note Items</label>
                                    <button className="add-note-btn" onClick={handleAddNote}>
                                        <Plus className="icon" />
                                        Add Note
                                    </button>
                                </div>

                                {editingNotes.length === 0 ? (
                                    <div className="empty-edit-state">
                                        <p>No notes yet. Click &quot;Add Note&quot; to create one.</p>
                                    </div>
                                ) : (
                                    <div className="note-edit-list">
                                        {editingNotes.map((note, index) => (
                                            <div key={note.id} className="note-edit-item">
                                                <div className="note-edit-number">{index + 1}</div>
                                                <div className="note-edit-fields">
                                                    <input
                                                        type="text"
                                                        placeholder="Key (e.g., Netflix, Curser)"
                                                        value={note.key}
                                                        onChange={(e) => handleUpdateNote(note.id, 'key', e.target.value)}
                                                        className="note-key-input"
                                                    />
                                                    <textarea
                                                        placeholder="Value (e.g., subscription ends 20-12-2025)&#10;Press Enter for new line"
                                                        value={note.value}
                                                        onChange={(e) => handleUpdateNote(note.id, 'value', e.target.value)}
                                                        className="note-value-textarea"
                                                        rows={3}
                                                    />
                                                </div>
                                                <button
                                                    className="delete-note-item-btn"
                                                    onClick={() => handleDeleteNote(note.id)}
                                                    title="Delete this note"
                                                >
                                                    <Trash2 className="icon" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="note-hint">
                                    <span>💡 Tip: Add structured notes with clear keys and values for better organization</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="email-modal-footer note-modal-footer">
                    {mode === 'view' ? (
                        <>
                            <button className="note-close-btn" onClick={onClose}>
                                Close
                            </button>
                            <div style={{ display: 'flex', gap: '0.625rem' }}>
                                {notes.length > 0 && (
                                    <button
                                        className="note-delete-btn"
                                        onClick={onDeleteAll}
                                        disabled={isSubmitting}
                                    >
                                        <Trash2 className="btn-icon" />
                                        {isSubmitting ? 'Deleting...' : 'Delete All'}
                                    </button>
                                )}
                                <button className="note-edit-btn" onClick={onEdit}>
                                    <Edit className="btn-icon" />
                                    Edit
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                className="note-close-btn"
                                onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                className="note-save-btn"
                                onClick={handleSaveNotes}
                                disabled={isSubmitting}
                            >
                                {isSubmitting && (
                                    <span className="spinner" style={{
                                        display: 'inline-block',
                                        width: '14px',
                                        height: '14px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: 'white',
                                        borderRadius: '50%',
                                        animation: 'spin 0.6s linear infinite',
                                        marginRight: '8px',
                                        verticalAlign: 'middle'
                                    }}></span>
                                )}
                                {isSubmitting ? 'Saving...' : 'Save Notes'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
