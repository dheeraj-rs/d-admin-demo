import React, { useState, useCallback, useRef, useEffect, memo, useMemo } from 'react';
import {} from 'lucide-react';
import websiteBuilderStore, { SectionCodeProps } from './store/websiteBuilderStore';
import { Layout, Home, Grid, Info, Phone, Mail, FileText, X, ChevronRight, Search, Type, ChevronLeft } from 'lucide-react';
import { useGetAllElements } from '../../service/elementApi';
import HtmlPreview from '../code-preview/HtmlPreview';
import PreviewLoading from '../loading/PreviewLoading';

interface PropertyNode {
    id: string;
    type: string;
    data: {
        style?: Record<string, string | number>;
        text?: string;
        src?: string;
        label?: string;
        html?: string;
        componentType?: string;
        snippets?: any[];
    };
}

type Category = {
    id: string;
    name: string;
    icon: React.ReactNode;
    propertyType: string;
};

interface CategoryItemProps {
    category: Category;
    isActive: boolean;
    onClick: () => void;
}

const CategoryItem = memo(({ category, isActive, onClick }: CategoryItemProps) => (
    <div className={`section-item ${isActive ? 'active' : ''}`} onClick={onClick} style={{ fontSize: '1rem' }}>
        <div className="section-icon" style={{ fontSize: '1.25rem' }}>
            {category.icon}
        </div>
        <div className="section-name" style={{ fontSize: '0.875rem' }}>
            {category.name}
        </div>
    </div>
));
CategoryItem.displayName = 'CategoryItem';

interface WebsiteBuilderPropertysProps {
    selectedNode?: PropertyNode | null;
    onApplyChanges?: (node: PropertyNode, changes: any) => void;
}

const WebsitesBuilderSidebar = ({ selectedNode, onApplyChanges }: WebsiteBuilderPropertysProps) => {
    const [selectedSection, setSelectedSection] = useState<string | null>('header');
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    const panelRef = useRef<HTMLDivElement>(null);
    const { isDragging, setIsDragging, activeSection, addPage1SectionCodes, setDraggedSection, replaceSection } = websiteBuilderStore();

    const sections = useMemo(
        () => [
            { id: 'header', name: 'Header', icon: <Layout size={20} />, componentType: 'header' },
            { id: 'hero', name: 'Hero', icon: <Home size={20} />, componentType: 'hero' },
            { id: 'features', name: 'Features', icon: <Grid size={20} />, componentType: 'features' },
            { id: 'about', name: 'About', icon: <Info size={20} />, componentType: 'about' },
            { id: 'contact', name: 'Contact', icon: <Phone size={20} />, componentType: 'contact' },
            { id: 'footer', name: 'Footer', icon: <Mail size={20} />, componentType: 'footer' },
            { id: 'gallery', name: 'Gallery', icon: <FileText size={20} />, componentType: 'gallery' },
            { id: 'blog', name: 'Blog', icon: <FileText size={20} />, componentType: 'blog' },
            { id: 'content', name: 'Content', icon: <Type size={20} />, componentType: 'content' },
        ],
        []
    );

    // Helpers
    const getCurrentComponentType = useCallback(() => {
        if (!selectedSection) return 'header';
        const section = sections.find((s) => s.id === selectedSection);
        return section ? section.componentType : 'header';
    }, [selectedSection, sections]);

    // Data fetching
    const { data, isLoading, isError, refetch } = useGetAllElements(page, 10, {
        componentType: getCurrentComponentType(),
        search: searchTerm,
    });

    // Elements to display
    const elements = useMemo(() => {
        if (!data || !data.data) return [];
        return data?.data
            ?.map((item) => {
                const htmlSnippet = item.snippets.find((snippet) => snippet.language === 'html');
                if (htmlSnippet) {
                    return {
                        id: htmlSnippet._id,
                        name: item?.title,
                        type: item.componentType,
                        snippet: htmlSnippet.code,
                        language: htmlSnippet.language,
                        version: htmlSnippet.version,
                    };
                }
                return null;
            })
            ?.filter((item) => item !== null);
    }, [data]);

    // Panel handlers
    const closePanel = useCallback(() => {
        setIsPanelOpen(false);
        // setIsExpanded(false);
    }, []);

    // Toggle Expand Panel
    const toggleExpandPanel = useCallback(() => {
        setIsExpanded((prev) => !prev);
        if (isExpanded) {
            setIsTransitioning(true);
            setTimeout(() => setIsTransitioning(false), 300);
        }
    }, [isExpanded]);

    // Handle clicking outside the panel
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isPanelOpen &&
                panelRef.current &&
                event.target &&
                !panelRef.current.contains(event.target as Node) &&
                !(event.target as Element).closest('.sidebar-sections')
            ) {
                closePanel();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isPanelOpen, closePanel]);

    // Reset drag state when drag ends
    useEffect(() => {
        const handleDragEnd = () => {
            if (isDragging) setIsDragging(false);
        };
        document.addEventListener('dragend', handleDragEnd);
        return () => document.removeEventListener('dragend', handleDragEnd);
    }, [isDragging, setIsDragging]);

    // Handle section Tab click
    const handleSectionTabClick = useCallback(
        (sectionId: string) => {
            if (selectedSection === sectionId && isPanelOpen) {
                setIsPanelOpen(false);
                return;
            }
            setIsPanelOpen(true);
            setIsTransitioning(true);
            setSelectedSection(sectionId);
            setSearchTerm('');
            setPage(1);

            setTimeout(() => setIsTransitioning(false), 300);
        },
        [selectedSection, isPanelOpen]
    );

    // Handle selecting element by click
    const handleSelectElement = useCallback(
        (element: Omit<SectionCodeProps, 'props'>) => {
            const elementWithProps: SectionCodeProps = {
                ...element,
                props: {},
            };
            setDraggedSection(elementWithProps);
            if (activeSection) {
                replaceSection(elementWithProps, activeSection.id);
            } else {
                addPage1SectionCodes(elementWithProps);
            }

            setIsDragging(false);
            closePanel();
        },
        [closePanel, setDraggedSection, setIsDragging, activeSection, replaceSection, addPage1SectionCodes]
    );

    // Get template Title
    const getSectionTitle = useCallback(
        (sectionId: string | null) => {
            if (!sectionId) return '';
            const section = sections.find((s) => s.id === sectionId);
            return section ? section.name : '';
        },
        [sections]
    );

    // Get Template Count
    const getTemplateCount = useCallback(() => {
        return data?.pagination?.total || 0;
    }, [data]);

    // Drag handlers
    const handleDragStart = useCallback(
        (element: Omit<SectionCodeProps, 'props'>) => {
            setIsDragging(true);
            setTimeout(() => closePanel(), 100);
        },
        [setIsDragging, closePanel]
    );

    // Drag end handler
    const handleDragEnd = useCallback(
        (event: React.DragEvent<HTMLDivElement>, element: Omit<SectionCodeProps, 'props'>) => {
            event.preventDefault();
            const elementWithProps: SectionCodeProps = {
                ...element,
                props: {},
            };
            addPage1SectionCodes(elementWithProps);
            setTimeout(() => {
                setIsDragging(false);
                setDraggedSection(null);
            }, 50);
        },
        [setIsDragging, setDraggedSection, addPage1SectionCodes]
    );

    // Drag over handler
    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        if (event.currentTarget.style) {
            event.currentTarget.style.cursor = 'copy';
        }
    }, []);

    // Load more handler
    const handleLoadMore = useCallback(() => {
        setPage((prevPage) => prevPage + 1);
    }, []);

    return (
        <div className="websites-builder-sidebar-tab__wrapper">
            <div className="sidebar-sections">
                <div className="section-categories">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            className={`section-item ${selectedSection === section.id && isPanelOpen ? 'active' : ''}`}
                            onClick={() => handleSectionTabClick(section.id)}
                        >
                            <div className="section-icon">{section.icon}</div>
                            <div className="section-name">{section.name}</div>
                        </div>
                    ))}
                </div>
                <div ref={panelRef} className={`templates-panel-container ${isPanelOpen ? 'open' : ''}  ${isExpanded ? 'expanded' : ''}`}>
                    <div className="templates-panel">
                        <div className="templates-header">
                            <h2 className="section-title" style={{ fontSize: '1.25rem' }}>
                                {getSectionTitle(selectedSection)}
                            </h2>
                            <div className="template-actions">
                                <div className="template-count" style={{ fontSize: '0.875rem' }}>
                                    {getTemplateCount()} components
                                </div>
                                <button className="view-all-btn" onClick={toggleExpandPanel} aria-label="View all templates" style={{ fontSize: '1rem' }}>
                                    {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                                </button>
                                <button className="close-panel-btn" onClick={closePanel} aria-label="Close panel" style={{ fontSize: '1rem' }}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="templates-search" style={{ fontSize: '0.875rem' }}>
                            <Search size={16} />
                            <input type="text" placeholder="Search components..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="templates-grid" onDragOver={handleDragOver}>
                            {isLoading ? (
                                <PreviewLoading />
                            ) : isError ? (
                                <div className="error-message">
                                    Error loading components. <button onClick={() => refetch()}>Retry</button>
                                </div>
                            ) : elements.length > 0 ? (
                                <>
                                    {elements.map((element, index) => (
                                        <div
                                            key={`${element.id}${index}`}
                                            className="template-item"
                                            onClick={() => handleSelectElement(element)}
                                            draggable
                                            onDragStart={(e) => handleDragStart(element)}
                                            onDragEnd={(e) => handleDragEnd(e, element)}
                                        >
                                            {element.snippet && (
                                                <HtmlPreview
                                                    key={element.id}
                                                    refreshKey={element.id}
                                                    htmlString={element.snippet}
                                                    enableTailwind={true}
                                                    previewScope={`editor-preview-${element.type}`}
                                                />
                                            )}
                                            <div className="template-info">
                                                <div className="template-name">{element.name}</div>
                                            </div>
                                        </div>
                                    ))}

                                    {data?.pagination && data.pagination.page < data.pagination.pages && (
                                        <div className="load-more">
                                            <button onClick={handleLoadMore}>Load More</button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="no-templates-message">No sections {searchTerm && <span>matching &quot;{searchTerm}&quot;</span>}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebsitesBuilderSidebar;
