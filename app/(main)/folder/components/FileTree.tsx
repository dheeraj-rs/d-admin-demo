'use client';

import { ProjectFileItem } from '../../../../service/ProjectBuilder/ProjectStructure';
import { useState } from 'react';
import { FiFolder, FiFile } from 'react-icons/fi';

interface FileTreeProps {
    files: ProjectFileItem[];
    selectedFile: ProjectFileItem | null;
    onFileSelect: (file: ProjectFileItem) => void;
    onCreateNew: (parentId?: string) => void;
    onDelete: (id: string) => void;
    onRename: (id: string, newName: string) => void;
}

interface FileItemProps {
    item: ProjectFileItem;
    level: number;
    selectedFile: ProjectFileItem | null;
    onFileSelect: (file: ProjectFileItem) => void;
    onCreateNew: (parentId?: string) => void;
    onDelete: (id: string) => void;
    onRename: (id: string, newName: string) => void;
}

function FileTreeItem({ item, level, selectedFile, onFileSelect, onCreateNew, onDelete, onRename }: FileItemProps) {
    const [isExpanded, setIsExpanded] = useState(level === 0);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState(item.name);
    const isSelected = selectedFile?.id === item.id;

    const getFileIcon = (item: ProjectFileItem) => {
        if (item.type === 'folder') {
            if (isExpanded) {
                return <i className="pi pi-folder-open file-icon" />;
            }
            return <i className="pi pi-folder file-icon" />;
        }
        return <i className="pi pi-file file-icon" />;
    };

    const handleToggle = () => {
        if (item.type === 'folder') {
            setIsExpanded(!isExpanded);
        } else {
            onFileSelect(item);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete ${item.name}?`)) {
            onDelete(item.id);
        }
    };

    const handleAddNew = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCreateNew(item.id);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRenaming(true);
        setRenameValue(item.name);
    };

    const handleRenameSubmit = () => {
        if (renameValue.trim() && renameValue.trim() !== item.name) {
            onRename(item.id, renameValue.trim());
        }
        setIsRenaming(false);
    };

    const handleRenameCancel = () => {
        setIsRenaming(false);
        setRenameValue(item.name);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRenameSubmit();
        } else if (e.key === 'Escape') {
            handleRenameCancel();
        }
    };

    const handleInputClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <li className={`file-item ${isSelected ? 'active' : ''}`}>
            <div className="file-item-content" onClick={handleToggle}>
                {item.type === 'folder' && (
                    <div className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                )}
                {getFileIcon(item)}
                {isRenaming ? (
                    <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onClick={handleInputClick}
                        autoFocus
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: '2px',
                            padding: '1px 4px',
                            fontSize: 'inherit',
                            color: 'inherit',
                            flex: 1,
                            marginLeft: '4px',
                        }}
                    />
                ) : (
                    <span className="file-name">
                        {item.name}{' '}
                        {item.saved === false && (
                            <span
                                style={{
                                    fontSize: '8px',
                                    color: 'var(--warning-color)',
                                    marginLeft: '0.5rem',
                                }}
                            >
                                ●
                            </span>
                        )}
                    </span>
                )}

                <div className="file-actions">
                    {!isRenaming ? (
                        <button onClick={handleEditClick} title="Edit">
                            <i className="pi pi-pencil" />
                        </button>
                    ) : (
                        <button onClick={handleRenameSubmit} title="Save">
                            <i className="pi pi-check" />
                        </button>
                    )}
                    {!isRenaming && item.type === 'folder' && (
                        <button onClick={handleAddNew} title="Add new item">
                            <i className="pi pi-plus" />
                        </button>
                    )}
                    {!isRenaming && (
                        <button onClick={handleDelete} title="Delete">
                            <i className="pi pi-trash" />
                        </button>
                    )}
                </div>
            </div>

            {item.type === 'folder' && isExpanded && item.children && (
                <ul className="folder-children">
                    {item.children.map((child) => (
                        <FileTreeItem
                            key={child.id}
                            item={child}
                            level={level + 1}
                            selectedFile={selectedFile}
                            onFileSelect={onFileSelect}
                            onCreateNew={onCreateNew}
                            onDelete={onDelete}
                            onRename={onRename}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

export default function FileTree({ files, selectedFile, onFileSelect, onCreateNew, onDelete, onRename }: FileTreeProps) {
    return (
        <ul className="file-tree">
            {files.map((file) => (
                <FileTreeItem
                    key={file.id}
                    item={file}
                    level={0}
                    selectedFile={selectedFile}
                    onFileSelect={onFileSelect}
                    onCreateNew={onCreateNew}
                    onDelete={onDelete}
                    onRename={onRename}
                />
            ))}
        </ul>
    );
}
