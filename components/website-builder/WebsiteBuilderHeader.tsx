'use client';
import { Monitor, Redo, Smartphone, Tablet, Undo, LayoutGrid, GitBranch } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import websiteBuilderStore from './store/websiteBuilderStore';
import { ToastRef } from '../../types';
import { exportProject } from '../../service/export/export';
import Toast from '../sample/Toast/Toast';

interface WebsiteBuilderHeaderProps {
    websiteId?: string | null;
}

const WebsiteBuilderHeader = ({ websiteId }: WebsiteBuilderHeaderProps) => {
    const {
        page1SectionCodes,
        projectSettings,
        viewportSize,
        setViewportSize,
        isPreviewMode,
        togglePreviewMode,
        canUndo,
        canRedo,
        undo,
        redo,
        setIsSaveProject,
        canvasType,
        setCanvasType,
        toggleProjectFilesPanel,
        isProjectFilesPanelOpen,
        setSelectedProjectFile,
        selectedProjectFile,
    } = websiteBuilderStore();
    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
    const [isFileTypeDropdownOpen, setIsFileTypeDropdownOpen] = useState(false);
    const exportDropdownRef = useRef<HTMLDivElement>(null);
    const toastRef = useRef<ToastRef>(null);

    const exportOptions: { id: 'next' | 'astro' | 'html' | 'vite' | 'custom'; label: string }[] = [
        { id: 'next', label: 'Next.js' },
        { id: 'astro', label: 'Astro' },
        { id: 'html', label: 'HTML' },
        { id: 'vite', label: 'Vite' },
        { id: 'custom', label: 'Import files' },
    ];

    const toggleCanvasType = () => {
        setCanvasType(canvasType === 'classic' ? 'flow' : 'classic');
        toggleProjectFilesPanel(false);
    };

    const toggleExportDropdown = () => {
        setIsExportDropdownOpen(!isExportDropdownOpen);
    };

    const toggleFileTypeDropdown = () => {
        setIsFileTypeDropdownOpen(!isFileTypeDropdownOpen);
    };

    const projectFilesType = (id: string) => {
        toggleProjectFilesPanel(true);
        setIsFileTypeDropdownOpen(false);
        setSelectedProjectFile(id);
    };

    const handleExportOption = async (format: 'next' | 'astro' | 'html' | 'vite' | 'custom') => {
        if (page1SectionCodes?.length === 0) {
            toastRef.current?.show({
                severity: 'error',
                summary: 'Nothing to export ',
                detail: 'Add some components to your website first',
                life: 5000,
            });
            return;
        }

        try {
            await exportProject(format, page1SectionCodes, projectSettings);
            toastRef.current?.show({
                severity: 'success',
                summary: 'Export successful',
                detail: `Your ${format.toUpperCase()} project has been downloaded.`,
                life: 3000,
            });
        } catch (error) {
            toastRef.current?.show({
                severity: 'error',
                summary: 'Export failed',
                detail: error instanceof Error ? error.message : 'An unknown error occurred',
                life: 5000,
            });
        }
        setIsExportDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
                setIsExportDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header>
            <div className="websites-builder-header__wrapper">
                <div className="header-container">
                    <div className="header-items">
                        <div className="layout-actions">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.history.go(-1);
                                }}
                                title="Go back"
                            >
                                <i className="pi pi-chevron-left" />
                            </button>
                            <div className="component-title">
                                <p className="button-text">{websiteId ? 'Edit Website' : 'Add Website'}</p>
                            </div>
                            <div className="editor__toolbar-section">
                                <button className="add-button btn--icon btn--sm" onClick={undo} disabled={!canUndo} title="Undo">
                                    <Undo size={16} />
                                    <span className="button-text">Undo</span>
                                </button>

                                <button className="add-button btn--icon btn--sm" onClick={redo} disabled={!canRedo} title="Redo">
                                    <Redo size={16} />
                                    <span className="button-text">Redo</span>
                                </button>

                                {/* <button className="add-button btn--icon btn--sm" onClick={toggleProjectFiles} title="Toggle Project Files">
                                    <i className="pi pi-file-edit" />
                                    <span className="button-text">Files</span>
                                </button> */}
                                <div className="export-dropdown" ref={exportDropdownRef}>
                                    <button
                                        className={`add-button ${isFileTypeDropdownOpen ? 'open' : ''} ${isProjectFilesPanelOpen ? 'active' : ''}`}
                                        onClick={toggleFileTypeDropdown}
                                        title="Export website"
                                    >
                                        <i className="pi pi-file-edit" />
                                        <span className={`button-text ${isProjectFilesPanelOpen ? 'active' : ''}`}>Files</span>
                                    </button>

                                    <div className={`export-dropdown__content ${isFileTypeDropdownOpen ? 'open' : ''}`}>
                                        {exportOptions.map((option) => (
                                            <button
                                                key={option.id}
                                                className={`export-dropdown__item ${selectedProjectFile === option.id ? 'active' : ''}`}
                                                onClick={() => projectFilesType(option.id)}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="page-actions">
                            <div className="editor__toolbar-section">
                                <button
                                    className={`add-button btn--icon btn--sm ${viewportSize === 'mobile' ? 'active' : ''}`}
                                    onClick={() => setViewportSize('mobile')}
                                    title="Mobile View"
                                >
                                    <Smartphone size={16} />
                                </button>

                                <button
                                    className={`add-button btn--icon btn--sm ${viewportSize === 'tablet' ? 'active' : ''}`}
                                    onClick={() => setViewportSize('tablet')}
                                    title="Tablet View"
                                >
                                    <Tablet size={16} />
                                </button>

                                <button
                                    className={`add-button btn--icon btn--sm ${viewportSize === 'desktop' ? 'active' : ''}`}
                                    onClick={() => setViewportSize('desktop')}
                                    title="Desktop View"
                                >
                                    <Monitor size={16} />
                                </button>
                            </div>
                            <div className="editor__toolbar-section">
                                <button className="add-button btn--icon" onClick={toggleCanvasType} title="Switch to Classic View">
                                    {canvasType === 'classic' ? <LayoutGrid size={16} /> : <GitBranch size={16} />}
                                    <span className="button-text">Canvas</span>
                                </button>

                                <button className="add-button btn--icon" onClick={() => { }} title="Publish website">
                                    <i className="pi pi-cloud-upload" />
                                    <span className="button-text">Publish</span>
                                </button>
                            </div>
                        </div>
                        <div className="header-fixed-items">
                            <button
                                onClick={() => {
                                    togglePreviewMode();
                                    toggleProjectFilesPanel(false);
                                }}
                                className={`copy-button ${isPreviewMode ? 'active' : ''}`}
                                title="Preview website"
                            >
                                <i className="button-icon pi pi-eye" />
                                <span className={`button-text ${isPreviewMode ? 'active' : ''}`}>Preview</span>
                            </button>
                            <button className="add-button btn--icon" onClick={() => setIsSaveProject(true)} title="Save project">
                                <i className="button-icon pi pi-database" />
                                <span className="button-text">Save</span>
                            </button>
                            <div className="export-dropdown" ref={exportDropdownRef}>
                                <button className={`add-button ${isExportDropdownOpen ? 'open' : ''}`} onClick={toggleExportDropdown} title="Export website">
                                    <i className="pi pi-file-export" />
                                    <span className="button-text">Export</span>
                                </button>

                                <div className={`export-dropdown__content ${isExportDropdownOpen ? 'open' : ''}`}>
                                    {exportOptions.map((option) => (
                                        <button key={option.id} className="export-dropdown__item" onClick={() => handleExportOption(option.id)}>
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toast ref={toastRef} />
        </header>
    );
};

export default WebsiteBuilderHeader;
