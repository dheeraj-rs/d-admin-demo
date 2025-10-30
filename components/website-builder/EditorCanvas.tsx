'use client';
import SectionPreview from './components/SectionPreview';
import { MouseEvent, useState, useRef, useCallback, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import websiteBuilderStore from './store/websiteBuilderStore';
import HtmlWebsitePreview from '../code-preview/HtmlWebsitePreview';

const EditorCanvas = ({ id }: { id?: string }) => {
    const { isDragging, viewportSize, page1SectionCodes, togglePropertiesPanel, setActiveSection, isPreviewMode, addPage1SectionCodes, setPage1SectionCodes } =
        websiteBuilderStore();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const componentsContainerRef = useRef<HTMLDivElement | null>(null);
    const [isOver, setIsOver] = useState(false);

    const handleCanvasClick = useCallback(
        (e: MouseEvent) => {
            if (isPreviewMode) return;
            if (e.target === e.currentTarget || e.target === componentsContainerRef.current) {
                e.preventDefault();
                e.stopPropagation();
                setActiveSection(null);
                togglePropertiesPanel(false);
            }
        },
        [setActiveSection, isPreviewMode, togglePropertiesPanel]
    );

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        if (isDragging && !isPreviewMode) {
            setIsOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setIsOver(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!isDragging || isPreviewMode) return;
        setIsOver(true);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);
    };

    const getDropZoneClass = () => {
        const baseClass = `editor__page editor__page--${viewportSize}`;
        if (isPreviewMode) return `${baseClass} preview-mode`;
        if (isOver && isDragging) return `${baseClass} drop-target-active`;
        if (isDragging) return `${baseClass} drop-target`;
        if (isOver) return `${baseClass} drop-target-exit`;
        return baseClass;
    };

    return (
        <div className="website-builder-canvas__wrapper">
            <div className="editor__canvas-container" style={{ height: '100%', overflow: 'hidden' }}>
                <div
                    className={getDropZoneClass()}
                    ref={containerRef}
                    onClick={handleCanvasClick}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {isPreviewMode ? (
                        <HtmlWebsitePreview sections={page1SectionCodes} />
                    ) : page1SectionCodes?.length > 0 ? (
                        <div
                            className="editor__components-container"
                            ref={componentsContainerRef}
                            onClick={handleCanvasClick}
                            style={{ minHeight: '100%', paddingBottom: '100px' }}
                        >
                            {page1SectionCodes?.map((Section, i) => (
                                <SectionPreview key={Section.id} Section={Section} />
                            ))}
                        </div>
                    ) : (
                        <div className="editor__empty-canvas">
                            <LayoutGrid size={48} />
                            <h3>Your canvas is empty</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditorCanvas;
