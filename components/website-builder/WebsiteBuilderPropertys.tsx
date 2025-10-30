import React, { useState, useCallback, useRef, useEffect, memo, useMemo } from 'react';
import { Layout, Type, Palette, Frame, Box, Sliders, Code, Save, X } from 'lucide-react';
import websiteBuilderStore from './store/websiteBuilderStore';

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

const WebsiteBuilderPropertys = ({ selectedNode, onApplyChanges }: WebsiteBuilderPropertysProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>('layout');
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [nodeStyle, setNodeStyle] = useState<any>({});
    const [nodeContent, setNodeContent] = useState<string>('');
    const [nodeHtml, setNodeHtml] = useState<string>('');
    const [nodeLabel, setNodeLabel] = useState<string>('');
    const [hasChanges, setHasChanges] = useState(false);

    const { activeSection, isPropertiesPanelOpen, updateComponentProps } = websiteBuilderStore();

    const panelRef = useRef<HTMLDivElement>(null);

    const categories = useMemo<Category[]>(
        () => [
            { id: 'layout', name: 'Layout', icon: <Layout size={20} />, propertyType: 'layout' },
            { id: 'typography', name: 'Typography', icon: <Type size={20} />, propertyType: 'typography' },
            { id: 'colors', name: 'Colors', icon: <Palette size={20} />, propertyType: 'colors' },
            { id: 'spacing', name: 'Spacing', icon: <Frame size={20} />, propertyType: 'spacing' },
            { id: 'borders', name: 'Borders', icon: <Box size={20} />, propertyType: 'borders' },
            { id: 'effects', name: 'Effects', icon: <Sliders size={20} />, propertyType: 'effects' },
            { id: 'content', name: 'Content', icon: <Code size={20} />, propertyType: 'content' },
        ],
        []
    );

    const handleCategoryClick = useCallback((categoryId: string) => {
        setSelectedCategory(categoryId);
        setIsPanelOpen(true);
    }, []);

    const closePanel = useCallback(() => {
        setIsPanelOpen(false);
    }, []);

    const handleStyleChange = (property: string, value: string) => {
        if (activeSection?.id) {
            updateComponentProps(activeSection.id, { [property]: value });
            setNodeStyle({
                ...nodeStyle,
                [property]: value,
            });
        }
        setHasChanges(true);
    };

    const handleContentChange = (value: string) => {
        setNodeContent(value);
        setHasChanges(true);
    };

    const handleHtmlChange = (value: string) => {
        setNodeHtml(value);
        setHasChanges(true);
    };

    const handleLabelChange = (value: string) => {
        setNodeLabel(value);
        setHasChanges(true);
    };

    const applyChanges = () => {
        if (!selectedNode || !hasChanges) return;

        const updatedData = { ...activeSection };

        // Update style properties
        updatedData.snippet = nodeStyle;

        // Update content based on node type
        if (activeSection?.type === 'text' || activeSection?.type === 'button') {
            updatedData.name = nodeContent;
        } else if (activeSection?.type === 'image') {
            updatedData.snippet = nodeContent;
        }

        // Update label if it exists
        if (nodeLabel) {
            updatedData.name = nodeLabel;
        }

        // Update HTML content if it exists
        if (nodeHtml) {
            updatedData.snippet = nodeHtml;
        }

        // Apply the changes if callback is provided
        if (onApplyChanges) {
            onApplyChanges(selectedNode, { data: updatedData });
        }

        setHasChanges(false);
    };

    const getCategoryTitle = useCallback(
        (categoryId: string | null) => {
            if (!categoryId) return '';
            const category = categories.find((c) => c.id === categoryId);
            return category ? category.name : '';
        },
        [categories]
    );

    // Handle clicks outside the panel
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isPanelOpen &&
                panelRef.current &&
                event.target &&
                !panelRef.current.contains(event.target as Node) &&
                !(event.target as Element).closest('.propertys-sections')
            ) {
                closePanel();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPanelOpen, closePanel]);

    // Effect to initialize node data when selected node changes
    useEffect(() => {
        if (activeSection) {
            setNodeStyle(activeSection?.snippet || {});
            setNodeLabel(activeSection?.name || '');
            setNodeHtml(activeSection?.snippet || '');

            if (activeSection?.type === 'text' || activeSection?.type === 'button') {
                setNodeContent(activeSection?.snippet || '');
            } else if (activeSection?.type === 'image') {
                setNodeContent(activeSection?.snippet || '');
            } else {
                setNodeContent('');
            }

            setHasChanges(false);
        }
    }, [activeSection]);

    if (isPropertiesPanelOpen) {
        return (
            <div className="website-builder-propertys__wrapper">
                <div className="propertys-sections">
                    <div ref={panelRef} className={`templates-panel-container ${isPanelOpen ? 'open' : ''}`}>
                        <div className="templates-panel">
                            <div className="property-panel-header">
                                <h3 className="panel-title" style={{ fontSize: '1.25rem' }}>
                                    {getCategoryTitle(selectedCategory)} Properties
                                </h3>
                                <div className="panel-actions">
                                    {hasChanges && (
                                        <button className="apply-button" onClick={applyChanges} style={{ fontSize: '0.875rem' }}>
                                            <Save size={16} />
                                            Apply
                                        </button>
                                    )}
                                    <button className="close-panel-btn" onClick={closePanel} aria-label="Close panel" style={{ fontSize: '1rem' }}>
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="property-content">
                                {!activeSection ? (
                                    <div className="no-selection" style={{ fontSize: '1rem' }}>
                                        <p>Select an element to edit properties</p>
                                    </div>
                                ) : (
                                    <div className="property-fields">
                                        {/* Display property fields based on selected category */}

                                        {/* Component/Label properties */}
                                        {selectedCategory === 'content' && activeSection?.name !== undefined && (
                                            <div className="property-section">
                                                <div className="section-header">
                                                    <h3 style={{ fontSize: '1.125rem' }}>Component</h3>
                                                </div>
                                                <div className="section-content">
                                                    <div className="property-field">
                                                        <label style={{ fontSize: '0.875rem' }}>Name</label>
                                                        <input
                                                            type="text"
                                                            value={nodeLabel}
                                                            onChange={(e) => handleLabelChange(e.target.value)}
                                                            style={{ fontSize: '0.875rem' }}
                                                        />
                                                    </div>
                                                    {activeSection?.type && (
                                                        <div className="property-field">
                                                            <label style={{ fontSize: '0.875rem' }}>Type</label>
                                                            <input type="text" value={activeSection?.type} disabled style={{ fontSize: '0.875rem' }} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* HTML Content */}
                                        {selectedCategory === 'content' && activeSection?.type === 'component' && activeSection?.snippet && (
                                            <div className="property-section">
                                                <div className="section-header">
                                                    <h3>HTML Content</h3>
                                                </div>
                                                <div className="section-content">
                                                    <div className="property-field">
                                                        <label>HTML Code</label>
                                                        <textarea
                                                            value={nodeHtml}
                                                            onChange={(e) => handleHtmlChange(e.target.value)}
                                                            rows={5}
                                                            className="code-editor"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Text Content */}
                                        {selectedCategory === 'content' &&
                                            (activeSection?.type === 'text' || activeSection?.type === 'button' || activeSection?.type === 'image') && (
                                                <div className="property-section">
                                                    <div className="section-header">
                                                        <h3>Content</h3>
                                                    </div>
                                                    <div className="section-content">
                                                        {activeSection?.type === 'text' && (
                                                            <div className="property-field">
                                                                <label>Text Content</label>
                                                                <textarea value={nodeContent} onChange={(e) => handleContentChange(e.target.value)} rows={3} />
                                                            </div>
                                                        )}

                                                        {activeSection?.type === 'button' && (
                                                            <div className="property-field">
                                                                <label>Button Text</label>
                                                                <input type="text" value={nodeContent} onChange={(e) => handleContentChange(e.target.value)} />
                                                            </div>
                                                        )}

                                                        {activeSection?.type === 'image' && (
                                                            <div className="property-field">
                                                                <label>Image URL</label>
                                                                <input type="text" value={nodeContent} onChange={(e) => handleContentChange(e.target.value)} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Layout Properties */}
                                        {selectedCategory === 'layout' && (
                                            <div className="property-section">
                                                <div className="section-content">
                                                    <div className="property-row">
                                                        <div className="property-field">
                                                            <label>Width</label>
                                                            <input
                                                                type="text"
                                                                value={nodeStyle.width || ''}
                                                                onChange={(e) => handleStyleChange('width', e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="property-field">
                                                            <label>Height</label>
                                                            <input
                                                                type="text"
                                                                value={nodeStyle.height || ''}
                                                                onChange={(e) => handleStyleChange('height', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="property-field">
                                                        <label>Display</label>
                                                        <select value={nodeStyle.display || ''} onChange={(e) => handleStyleChange('display', e.target.value)}>
                                                            <option value="">Default</option>
                                                            <option value="block">Block</option>
                                                            <option value="inline">Inline</option>
                                                            <option value="flex">Flex</option>
                                                            <option value="grid">Grid</option>
                                                            <option value="none">None</option>
                                                        </select>
                                                    </div>

                                                    {nodeStyle.display === 'flex' && (
                                                        <>
                                                            <div className="property-field">
                                                                <label>Flex Direction</label>
                                                                <select
                                                                    value={nodeStyle.flexDirection || 'row'}
                                                                    onChange={(e) => handleStyleChange('flexDirection', e.target.value)}
                                                                >
                                                                    <option value="row">Row</option>
                                                                    <option value="column">Column</option>
                                                                    <option value="row-reverse">Row Reverse</option>
                                                                    <option value="column-reverse">Column Reverse</option>
                                                                </select>
                                                            </div>

                                                            <div className="property-field">
                                                                <label>Justify Content</label>
                                                                <select
                                                                    value={nodeStyle.justifyContent || ''}
                                                                    onChange={(e) => handleStyleChange('justifyContent', e.target.value)}
                                                                >
                                                                    <option value="">Default</option>
                                                                    <option value="flex-start">Start</option>
                                                                    <option value="center">Center</option>
                                                                    <option value="flex-end">End</option>
                                                                    <option value="space-between">Space Between</option>
                                                                    <option value="space-around">Space Around</option>
                                                                </select>
                                                            </div>

                                                            <div className="property-field">
                                                                <label>Align Items</label>
                                                                <select
                                                                    value={nodeStyle.alignItems || ''}
                                                                    onChange={(e) => handleStyleChange('alignItems', e.target.value)}
                                                                >
                                                                    <option value="">Default</option>
                                                                    <option value="flex-start">Start</option>
                                                                    <option value="center">Center</option>
                                                                    <option value="flex-end">End</option>
                                                                    <option value="stretch">Stretch</option>
                                                                </select>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Typography Properties */}
                                        {selectedCategory === 'typography' && (
                                            <div className="property-section">
                                                <div className="section-content">
                                                    <div className="property-field">
                                                        <label>Font Family</label>
                                                        <select
                                                            value={nodeStyle.fontFamily || ''}
                                                            onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                                                        >
                                                            <option value="">Default</option>
                                                            <option value="'Inter', sans-serif">Inter</option>
                                                            <option value="'Roboto', sans-serif">Roboto</option>
                                                            <option value="'Playfair Display', serif">Playfair Display</option>
                                                            <option value="'Montserrat', sans-serif">Montserrat</option>
                                                            <option value="'Open Sans', sans-serif">Open Sans</option>
                                                        </select>
                                                    </div>

                                                    <div className="property-row">
                                                        <div className="property-field">
                                                            <label>Font Size</label>
                                                            <input
                                                                type="text"
                                                                value={nodeStyle.fontSize || ''}
                                                                onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="property-field">
                                                            <label>Line Height</label>
                                                            <input
                                                                type="text"
                                                                value={nodeStyle.lineHeight || ''}
                                                                onChange={(e) => handleStyleChange('lineHeight', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="property-field">
                                                        <label>Font Weight</label>
                                                        <select
                                                            value={nodeStyle.fontWeight || ''}
                                                            onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                                                        >
                                                            <option value="">Default</option>
                                                            <option value="normal">Normal</option>
                                                            <option value="bold">Bold</option>
                                                            <option value="300">Light</option>
                                                            <option value="500">Medium</option>
                                                            <option value="700">Bold</option>
                                                            <option value="900">Extra Bold</option>
                                                        </select>
                                                    </div>

                                                    <div className="property-field">
                                                        <label>Text Align</label>
                                                        <select
                                                            value={nodeStyle.textAlign || ''}
                                                            onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                                                        >
                                                            <option value="">Default</option>
                                                            <option value="left">Left</option>
                                                            <option value="center">Center</option>
                                                            <option value="right">Right</option>
                                                            <option value="justify">Justify</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Colors Properties */}
                                        {selectedCategory === 'colors' && (
                                            <div className="property-section">
                                                <div className="section-content">
                                                    <div className="property-field">
                                                        <label>Text Color</label>
                                                        <div className="color-picker">
                                                            <input
                                                                type="color"
                                                                value={nodeStyle.color || '#000000'}
                                                                onChange={(e) => handleStyleChange('color', e.target.value)}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={nodeStyle.color || ''}
                                                                onChange={(e) => handleStyleChange('color', e.target.value)}
                                                                placeholder="#000000"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="property-field">
                                                        <label>Background Color</label>
                                                        <div className="color-picker">
                                                            <input
                                                                type="color"
                                                                value={nodeStyle.backgroundColor || '#ffffff'}
                                                                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={nodeStyle.backgroundColor || ''}
                                                                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                                                placeholder="#ffffff"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Spacing Properties */}
                                        {selectedCategory === 'spacing' && (
                                            <div className="property-section">
                                                <div className="section-content">
                                                    <h4>Margin</h4>
                                                    <div className="spacing-editor">
                                                        <div className="spacing-row">
                                                            <input
                                                                type="text"
                                                                value={nodeStyle.marginTop || ''}
                                                                onChange={(e) => handleStyleChange('marginTop', e.target.value)}
                                                                placeholder="Top"
                                                            />
                                                        </div>
                                                        <div className="spacing-middle">
                                                            <input
                                                                type="text"
                                                                value={nodeStyle.marginLeft || ''}
                                                                onChange={(e) => handleStyleChange('marginLeft', e.target.value)}
                                                                placeholder="Left"
                                                            />
                                                            <div className="spacing-inner">
                                                                <span>Margin</span>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={nodeStyle.marginRight || ''}
                                                                onChange={(e) => handleStyleChange('marginRight', e.target.value)}
                                                                placeholder="Right"
                                                            />
                                                        </div>
                                                        <div className="spacing-row">
                                                            <input
                                                                type="text"
                                                                value={nodeStyle.marginBottom || ''}
                                                                onChange={(e) => handleStyleChange('marginBottom', e.target.value)}
                                                                placeholder="Bottom"
                                                            />
                                                        </div>
                                                    </div>

                                                    <h4>Padding</h4>
                                                    <div className="spacing-editor">
                                                        <div className="spacing-row">
                                                            <input
                                                                type="text"
                                                                value={nodeStyle.paddingTop || ''}
                                                                onChange={(e) => handleStyleChange('paddingTop', e.target.value)}
                                                                placeholder="Top"
                                                            />
                                                        </div>
                                                        <div className="spacing-middle">
                                                            <input
                                                                type="text"
                                                                value={nodeStyle.paddingLeft || ''}
                                                                onChange={(e) => handleStyleChange('paddingLeft', e.target.value)}
                                                                placeholder="Left"
                                                            />
                                                            <div className="spacing-inner">
                                                                <span>Padding</span>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={nodeStyle.paddingRight || ''}
                                                                onChange={(e) => handleStyleChange('paddingRight', e.target.value)}
                                                                placeholder="Right"
                                                            />
                                                        </div>
                                                        <div className="spacing-row">
                                                            <input
                                                                type="text"
                                                                value={nodeStyle.paddingBottom || ''}
                                                                onChange={(e) => handleStyleChange('paddingBottom', e.target.value)}
                                                                placeholder="Bottom"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Borders Properties */}
                                        {selectedCategory === 'borders' && (
                                            <div className="property-section">
                                                <div className="section-content">
                                                    <div className="property-row">
                                                        <div className="property-field">
                                                            <label>Border Width</label>
                                                            <input
                                                                type="text"
                                                                value={nodeStyle.borderWidth || ''}
                                                                onChange={(e) => handleStyleChange('borderWidth', e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="property-field">
                                                            <label>Border Style</label>
                                                            <select
                                                                value={nodeStyle.borderStyle || ''}
                                                                onChange={(e) => handleStyleChange('borderStyle', e.target.value)}
                                                            >
                                                                <option value="">Default</option>
                                                                <option value="solid">Solid</option>
                                                                <option value="dashed">Dashed</option>
                                                                <option value="dotted">Dotted</option>
                                                                <option value="double">Double</option>
                                                                <option value="none">None</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="property-field">
                                                        <label>Border Color</label>
                                                        <div className="color-picker">
                                                            <input
                                                                type="color"
                                                                value={nodeStyle.borderColor || '#000000'}
                                                                onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={nodeStyle.borderColor || ''}
                                                                onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                                                                placeholder="#000000"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="property-field">
                                                        <label>Border Radius</label>
                                                        <input
                                                            type="text"
                                                            value={nodeStyle.borderRadius || ''}
                                                            onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Effects Properties */}
                                        {selectedCategory === 'effects' && (
                                            <div className="property-section">
                                                <div className="section-content">
                                                    <div className="property-field">
                                                        <label>Opacity</label>
                                                        <div className="range-with-value">
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="1"
                                                                step="0.01"
                                                                value={typeof nodeStyle.opacity === 'number' ? nodeStyle.opacity : 1}
                                                                onChange={(e) => handleStyleChange('opacity', e.target.value)}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={typeof nodeStyle.opacity === 'number' ? nodeStyle.opacity : 1}
                                                                onChange={(e) => handleStyleChange('opacity', e.target.value)}
                                                                className="small-input"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="property-field">
                                                        <label>Box Shadow</label>
                                                        <input
                                                            type="text"
                                                            value={nodeStyle.boxShadow || ''}
                                                            onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
                                                            placeholder="0 4px 6px rgba(0,0,0,0.1)"
                                                        />
                                                    </div>

                                                    <div className="property-field">
                                                        <label>Transform</label>
                                                        <input
                                                            type="text"
                                                            value={nodeStyle.transform || ''}
                                                            onChange={(e) => handleStyleChange('transform', e.target.value)}
                                                            placeholder="rotate(45deg) scale(1.2)"
                                                        />
                                                    </div>

                                                    <div className="property-field">
                                                        <label>Transition</label>
                                                        <input
                                                            type="text"
                                                            value={nodeStyle.transition || ''}
                                                            onChange={(e) => handleStyleChange('transition', e.target.value)}
                                                            placeholder="all 0.3s ease"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="section-categories">
                        {categories.map((category) => (
                            <CategoryItem
                                key={category.id}
                                category={category}
                                isActive={selectedCategory === category.id && isPanelOpen}
                                onClick={() => handleCategoryClick(category.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }
};

export default WebsiteBuilderPropertys;
