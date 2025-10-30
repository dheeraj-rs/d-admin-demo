'use client';

import { useState } from 'react';
import { ProjectFileItem } from './project';

interface FileTreeProps {
    files: ProjectFileItem[];
    selectedFile: ProjectFileItem | null;
    onFileSelect: (file: ProjectFileItem) => void;
    projectName: string;
    onBack: () => void;
    onSaveProject: () => void;
}

export default function FileTree({ files, selectedFile, onFileSelect, projectName, onBack, onSaveProject }: FileTreeProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));

    const toggleFolder = (folderId: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
        }
        setExpandedFolders(newExpanded);
    };

    const renderFileItem = (item: ProjectFileItem, depth: number = 0) => {
        const isExpanded = expandedFolders.has(item.id);
        const isSelected = selectedFile?.id === item.id;

        return (
            <div key={item.id} style={{ marginLeft: `${depth * 1}rem` }}>
                <div
                    className={`file-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                        if (item.type === 'folder') {
                            toggleFolder(item.id);
                        } else {
                            onFileSelect(item);
                        }
                    }}
                >
                    {item.type === 'folder' && (
                        <div className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    )}

                    <div className={`file-icon ${item.type}`}>
                        {item.type === 'folder' ? (
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                />
                            </svg>
                        ) : (
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        )}
                    </div>

                    <span className="file-name">{item.name}</span>
                    {item.extension && <span className="file-path">.{item.extension}</span>}
                </div>

                {item.type === 'folder' && isExpanded && item.children && (
                    <div className="file-children">{item.children.map((child) => renderFileItem(child, depth + 1))}</div>
                )}
            </div>
        );
    };

    const generateStructureDisplay = (items: ProjectFileItem[], indent: string = ''): string => {
        let result = '';
        items.forEach((item, index) => {
            const isLast = index === items.length - 1;
            const prefix = isLast ? '└── ' : '├── ';
            result += `${indent}${prefix}${item.name}\n`;

            if (item.type === 'folder' && item.children && item.children.length > 0) {
                const nextIndent = indent + (isLast ? '    ' : '│   ');
                result += generateStructureDisplay(item.children, nextIndent);
            }
        });
        return result;
    };

    return (
        <div className="file-tree-container">
            <div className="file-tree">
                <div className="file-tree-header">
                    <button className="btn btn-secondary" onClick={onBack}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Projects
                    </button>
                    <h3 style={{ margin: '0 0 0 1rem', flex: 1 }}>{projectName}</h3>
                    <button className="btn export-btn" onClick={onSaveProject}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        Save Project
                    </button>
                </div>

                <div className="file-tree-content">{files.map((file) => renderFileItem(file))}</div>
            </div>

            <div className="structure-display">
                <div className="structure-title">Project Structure (Array Format)</div>
                <div className="structure-content">{generateStructureDisplay(files)}</div>
            </div>

            {selectedFile && (
                <div style={{ marginTop: '2rem' }}>
                    <h3>File Preview: {selectedFile.name}</h3>
                    {selectedFile.content ? (
                        <div className="code-preview">
                            <pre>{selectedFile.content}</pre>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No content available for this file</p>
                    )}
                </div>
            )}
        </div>
    );
}
