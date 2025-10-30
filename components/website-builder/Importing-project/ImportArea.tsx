'use client';

import { useState } from 'react';

interface ImportAreaProps {
    onImportClick: () => void;
    onZipImportClick: () => void;
    onDrop: (e: React.DragEvent) => void;
    isProcessingZip?: boolean;
}

export default function ImportArea({ onImportClick, onZipImportClick, onDrop, isProcessingZip = false }: ImportAreaProps) {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="import-area" onDrop={onDrop} onDragOver={handleDragOver}>
            <div className="import-icon">📁</div>
            <div className="import-text">
                <h3>Drop folders or zip files here</h3>
                <p>or</p>
                <div className="import-buttons">
                    <button className="import-btn primary" onClick={onImportClick} disabled={isProcessingZip}>
                        Select Folder
                    </button>
                    <button className="import-btn secondary" onClick={onZipImportClick} disabled={isProcessingZip}>
                        Select Zip Files
                    </button>
                </div>
            </div>
            <div className="import-subtitle">Click to browse or drag and drop a folder</div>
        </div>
    );
}
