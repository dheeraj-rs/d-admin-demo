'use client';

import { ProjectFileItem } from '../../../../service/ProjectBuilder/ProjectStructure';
import { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface CreateItemModalProps {
    onClose: () => void;
    onSubmit: (item: Omit<ProjectFileItem, 'id'>) => void;
}

export default function CreateItemModal({ onClose, onSubmit }: CreateItemModalProps) {
    const [type, setType] = useState<'file' | 'folder'>('file');
    const [name, setName] = useState('');
    const [extension, setExtension] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        let fileName = name.trim();
        let fileExtension = extension.trim();

        // If it's a file and has an extension in the name, extract it
        if (type === 'file' && fileName.includes('.')) {
            const parts = fileName.split('.');
            if (parts.length > 1) {
                fileExtension = parts.pop() || '';
                fileName = parts.join('.');
            }
        }

        // Add extension if it's a file and doesn't have one
        if (type === 'file' && fileExtension) {
            fileName = `${fileName}.${fileExtension}`;
        }

        const item: Omit<ProjectFileItem, 'id'> = {
            name: fileName,
            type,
            extension: type === 'file' ? fileExtension : undefined,
            content: type === 'file' ? '' : undefined,
            children: type === 'folder' ? [] : undefined,
        };

        onSubmit(item);
    };

    const commonExtensions = [
        { value: 'tsx', label: 'TSX' },
        { value: 'ts', label: 'TypeScript' },
        { value: 'jsx', label: 'JSX' },
        { value: 'js', label: 'JavaScript' },
        { value: 'css', label: 'CSS' },
        { value: 'scss', label: 'SCSS' },
        { value: 'json', label: 'JSON' },
        { value: 'md', label: 'Markdown' },
        { value: 'txt', label: 'Text' },
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Create New {type === 'file' ? 'File' : 'Folder'}</h3>
                    <button className="btn btn-icon btn-secondary" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Type</label>
                            <div className="radio-group">
                                <div className="radio-item">
                                    <input
                                        type="radio"
                                        id="file"
                                        name="type"
                                        value="file"
                                        checked={type === 'file'}
                                        onChange={(e) => setType(e.target.value as 'file')}
                                    />
                                    <label htmlFor="file">File</label>
                                </div>
                                <div className="radio-item">
                                    <input
                                        type="radio"
                                        id="folder"
                                        name="type"
                                        value="folder"
                                        checked={type === 'folder'}
                                        onChange={(e) => setType(e.target.value as 'folder')}
                                    />
                                    <label htmlFor="folder">Folder</label>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="name">{type === 'file' ? 'File' : 'Folder'} Name</label>
                            <input
                                type="text"
                                id="name"
                                className="input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={type === 'file' ? 'e.g., component' : 'e.g., components'}
                                required
                                autoFocus
                            />
                        </div>

                        {type === 'file' && (
                            <div className="form-group">
                                <label htmlFor="extension">Extension</label>
                                <select id="extension" className="input" value={extension} onChange={(e) => setExtension(e.target.value)}>
                                    <option value="">Select extension...</option>
                                    {commonExtensions.map((ext) => (
                                        <option key={ext.value} value={ext.value}>
                                            .{ext.value} ({ext.label})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    className="input input-sm"
                                    style={{ marginTop: '8px' }}
                                    value={extension}
                                    onChange={(e) => setExtension(e.target.value)}
                                    placeholder="Or type custom extension"
                                />
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Create {type === 'file' ? 'File' : 'Folder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
