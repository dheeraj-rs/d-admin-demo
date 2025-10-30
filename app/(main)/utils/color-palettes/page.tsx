'use client';
import React, { useState } from 'react';

interface Color {
    name: string;
    hex: string;
    rgb: string;
    hsl: string;
}

interface ColorPalette {
    id: string;
    name: string;
    category: string;
    colors: Color[];
    description: string;
}

const ColorPalettes: React.FC = () => {
    const [copiedColor, setCopiedColor] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showCustomCreator, setShowCustomCreator] = useState<boolean>(false);
    const [customPalettes, setCustomPalettes] = useState<ColorPalette[]>([]);
    const [currentCustomPalette, setCurrentCustomPalette] = useState<{
        name: string;
        description: string;
        colors: string[];
    }>({
        name: '',
        description: '',
        colors: ['#ff0000', '#00ff00', '#0000ff'],
    });

    const colorPalettes: ColorPalette[] = [
        {
            id: 'modern-blue',
            name: 'Modern Blue',
            category: 'Professional',
            description: 'Clean and professional blue tones for corporate applications',
            colors: [
                { name: 'Navy', hex: '#1e3a8a', rgb: 'rgb(30, 58, 138)', hsl: 'hsl(220, 64%, 33%)' },
                { name: 'Royal Blue', hex: '#3b82f6', rgb: 'rgb(59, 130, 246)', hsl: 'hsl(217, 91%, 60%)' },
                { name: 'Sky Blue', hex: '#60a5fa', rgb: 'rgb(96, 165, 250)', hsl: 'hsl(213, 93%, 68%)' },
                { name: 'Light Blue', hex: '#93c5fd', rgb: 'rgb(147, 197, 253)', hsl: 'hsl(213, 94%, 78%)' },
                { name: 'Pale Blue', hex: '#dbeafe', rgb: 'rgb(219, 234, 254)', hsl: 'hsl(214, 100%, 93%)' },
            ],
        },
        {
            id: 'nature-green',
            name: 'Nature Green',
            category: 'Organic',
            description: 'Fresh and natural green palette inspired by nature',
            colors: [
                { name: 'Forest', hex: '#14532d', rgb: 'rgb(20, 83, 45)', hsl: 'hsl(144, 61%, 20%)' },
                { name: 'Emerald', hex: '#10b981', rgb: 'rgb(16, 185, 129)', hsl: 'hsl(160, 84%, 39%)' },
                { name: 'Mint', hex: '#34d399', rgb: 'rgb(52, 211, 153)', hsl: 'hsl(158, 64%, 52%)' },
                { name: 'Light Green', hex: '#6ee7b7', rgb: 'rgb(110, 231, 183)', hsl: 'hsl(156, 73%, 67%)' },
                { name: 'Pale Green', hex: '#d1fae5', rgb: 'rgb(209, 250, 229)', hsl: 'hsl(149, 80%, 90%)' },
            ],
        },
        {
            id: 'sunset-orange',
            name: 'Sunset Orange',
            category: 'Warm',
            description: 'Warm and energetic orange tones for creative projects',
            colors: [
                { name: 'Burnt Orange', hex: '#c2410c', rgb: 'rgb(194, 65, 12)', hsl: 'hsl(17, 88%, 40%)' },
                { name: 'Orange', hex: '#f97316', rgb: 'rgb(249, 115, 22)', hsl: 'hsl(25, 95%, 53%)' },
                { name: 'Light Orange', hex: '#fb923c', rgb: 'rgb(251, 146, 60)', hsl: 'hsl(27, 96%, 61%)' },
                { name: 'Peach', hex: '#fdba74', rgb: 'rgb(253, 186, 116)', hsl: 'hsl(31, 97%, 72%)' },
                { name: 'Cream', hex: '#fed7aa', rgb: 'rgb(254, 215, 170)', hsl: 'hsl(32, 98%, 83%)' },
            ],
        },
        {
            id: 'deep-purple',
            name: 'Deep Purple',
            category: 'Creative',
            description: 'Rich purple palette for creative and luxury applications',
            colors: [
                { name: 'Indigo', hex: '#4c1d95', rgb: 'rgb(76, 29, 149)', hsl: 'hsl(264, 67%, 35%)' },
                { name: 'Purple', hex: '#8b5cf6', rgb: 'rgb(139, 92, 246)', hsl: 'hsl(259, 89%, 66%)' },
                { name: 'Lavender', hex: '#a78bfa', rgb: 'rgb(167, 139, 250)', hsl: 'hsl(255, 91%, 76%)' },
                { name: 'Light Purple', hex: '#c4b5fd', rgb: 'rgb(196, 181, 253)', hsl: 'hsl(253, 95%, 85%)' },
                { name: 'Pale Purple', hex: '#e9d5ff', rgb: 'rgb(233, 213, 255)', hsl: 'hsl(249, 100%, 92%)' },
            ],
        },
        {
            id: 'monochrome',
            name: 'Monochrome',
            category: 'Neutral',
            description: 'Classic grayscale palette for minimal and elegant designs',
            colors: [
                { name: 'Black', hex: '#000000', rgb: 'rgb(0, 0, 0)', hsl: 'hsl(0, 0%, 0%)' },
                { name: 'Charcoal', hex: '#374151', rgb: 'rgb(55, 65, 81)', hsl: 'hsl(217, 19%, 27%)' },
                { name: 'Gray', hex: '#6b7280', rgb: 'rgb(107, 114, 128)', hsl: 'hsl(220, 9%, 46%)' },
                { name: 'Light Gray', hex: '#d1d5db', rgb: 'rgb(209, 213, 219)', hsl: 'hsl(220, 13%, 84%)' },
                { name: 'White', hex: '#ffffff', rgb: 'rgb(255, 255, 255)', hsl: 'hsl(0, 0%, 100%)' },
            ],
        },
        {
            id: 'cyberpunk',
            name: 'Cyberpunk',
            category: 'Tech',
            description: 'Futuristic neon colors for tech and gaming applications',
            colors: [
                { name: 'Electric Blue', hex: '#0066ff', rgb: 'rgb(0, 102, 255)', hsl: 'hsl(216, 100%, 50%)' },
                { name: 'Neon Green', hex: '#00ff41', rgb: 'rgb(0, 255, 65)', hsl: 'hsl(135, 100%, 50%)' },
                { name: 'Hot Pink', hex: '#ff0080', rgb: 'rgb(255, 0, 128)', hsl: 'hsl(330, 100%, 50%)' },
                { name: 'Cyber Yellow', hex: '#ffff00', rgb: 'rgb(255, 255, 0)', hsl: 'hsl(60, 100%, 50%)' },
                { name: 'Deep Purple', hex: '#8000ff', rgb: 'rgb(128, 0, 255)', hsl: 'hsl(270, 100%, 50%)' },
            ],
        },
        {
            id: 'earth-tones',
            name: 'Earth Tones',
            category: 'Natural',
            description: 'Warm and grounding earth-inspired colors',
            colors: [
                { name: 'Terra Cotta', hex: '#a0522d', rgb: 'rgb(160, 82, 45)', hsl: 'hsl(19, 56%, 40%)' },
                { name: 'Sienna', hex: '#cd853f', rgb: 'rgb(205, 133, 63)', hsl: 'hsl(30, 59%, 53%)' },
                { name: 'Goldenrod', hex: '#daa520', rgb: 'rgb(218, 165, 32)', hsl: 'hsl(43, 74%, 49%)' },
                { name: 'Khaki', hex: '#f0e68c', rgb: 'rgb(240, 230, 140)', hsl: 'hsl(54, 77%, 75%)' },
                { name: 'Beige', hex: '#f5f5dc', rgb: 'rgb(245, 245, 220)', hsl: 'hsl(60, 56%, 91%)' },
            ],
        },
        {
            id: 'ocean-blues',
            name: 'Ocean Blues',
            category: 'Cool',
            description: 'Deep and calming ocean-inspired blues',
            colors: [
                { name: 'Deep Sea', hex: '#003366', rgb: 'rgb(0, 51, 102)', hsl: 'hsl(210, 100%, 20%)' },
                { name: 'Ocean Blue', hex: '#006699', rgb: 'rgb(0, 102, 153)', hsl: 'hsl(200, 100%, 30%)' },
                { name: 'Cerulean', hex: '#0099cc', rgb: 'rgb(0, 153, 204)', hsl: 'hsl(195, 100%, 40%)' },
                { name: 'Sky Blue', hex: '#66ccff', rgb: 'rgb(102, 204, 255)', hsl: 'hsl(200, 100%, 70%)' },
                { name: 'Ice Blue', hex: '#ccf2ff', rgb: 'rgb(204, 242, 255)', hsl: 'hsl(195, 100%, 90%)' },
            ],
        },
    ];

    const categories = ['all', ...Array.from(new Set(colorPalettes.map((p) => p.category))), 'custom'];

    const allPalettes = [...customPalettes, ...colorPalettes];
    const filteredPalettes =
        selectedCategory === 'all'
            ? allPalettes
            : selectedCategory === 'custom'
            ? customPalettes
            : colorPalettes.filter((p) => p.category === selectedCategory);

    const copyToClipboard = async (colorValue: string, colorName: string) => {
        try {
            await navigator.clipboard.writeText(colorValue);
            setCopiedColor(`${colorName}-${colorValue}`);
            setTimeout(() => setCopiedColor(''), 2000);
        } catch (err) {
            console.error('Failed to copy color:', err);
        }
    };

    const getContrastColor = (hexColor: string): string => {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    };

    // Helper function to convert hex to RGB
    const hexToRgb = (hex: string): string => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    };

    // Helper function to convert hex to HSL
    const hexToHsl = (hex: string): string => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0,
            s = 0,
            l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    };

    // Add custom color to current palette
    const addCustomColor = () => {
        if (currentCustomPalette.colors.length < 8) {
            setCurrentCustomPalette((prev) => ({
                ...prev,
                colors: [...prev.colors, '#000000'],
            }));
        }
    };

    // Remove custom color
    const removeCustomColor = (index: number) => {
        if (currentCustomPalette.colors.length > 1) {
            setCurrentCustomPalette((prev) => ({
                ...prev,
                colors: prev.colors.filter((_, i) => i !== index),
            }));
        }
    };

    // Update custom color
    const updateCustomColor = (index: number, color: string) => {
        setCurrentCustomPalette((prev) => ({
            ...prev,
            colors: prev.colors.map((c, i) => (i === index ? color : c)),
        }));
    };

    // Save custom palette
    const saveCustomPalette = () => {
        if (currentCustomPalette.name.trim() && currentCustomPalette.colors.length > 0) {
            const newPalette: ColorPalette = {
                id: `custom-${Date.now()}`,
                name: currentCustomPalette.name,
                category: 'Custom',
                description: currentCustomPalette.description || 'Custom created palette',
                colors: currentCustomPalette.colors.map((hex, index) => ({
                    name: `Color ${index + 1}`,
                    hex,
                    rgb: hexToRgb(hex),
                    hsl: hexToHsl(hex),
                })),
            };

            setCustomPalettes((prev) => [...prev, newPalette]);
            setCurrentCustomPalette({
                name: '',
                description: '',
                colors: ['#ff0000', '#00ff00', '#0000ff'],
            });
            setShowCustomCreator(false);
            setSelectedCategory('custom');
        }
    };

    // Delete custom palette
    const deleteCustomPalette = (paletteId: string) => {
        setCustomPalettes((prev) => prev.filter((p) => p.id !== paletteId));
    };

    return (
        <div className="children__wrapper">
            <div className="color-palettes">
                <div className="color-palettes__header">
                    <h1 className="color-palettes__title">Color Palettes</h1>
                    <p className="color-palettes__subtitle">Professional color palettes for your next project. Click any color to copy its value.</p>
                </div>

                <div className="color-palettes__filters">
                    <div className="color-palettes__category-buttons">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`color-palettes__category-btn ${selectedCategory === category ? 'color-palettes__category-btn--active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                        ))}
                    </div>

                    <button className="color-palettes__create-btn" onClick={() => setShowCustomCreator(true)}>
                        + Create Custom Palette
                    </button>
                </div>

                {copiedColor && <div className="color-palettes__notification">Color copied to clipboard! ✓</div>}

                {/* Custom Palette Creator */}
                {showCustomCreator && (
                    <div className="color-palettes__modal-overlay" onClick={() => setShowCustomCreator(false)}>
                        <div className="color-palettes__modal" onClick={(e) => e.stopPropagation()}>
                            <div className="color-palettes__modal-header">
                                <h3>Create Custom Palette</h3>
                                <button className="color-palettes__modal-close" onClick={() => setShowCustomCreator(false)}>
                                    ×
                                </button>
                            </div>

                            <div className="color-palettes__modal-content">
                                <div className="color-palettes__form-group">
                                    <label>Palette Name</label>
                                    <input
                                        type="text"
                                        value={currentCustomPalette.name}
                                        onChange={(e) =>
                                            setCurrentCustomPalette((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter palette name"
                                        className="color-palettes__input"
                                    />
                                </div>

                                <div className="color-palettes__form-group">
                                    <label>Description (Optional)</label>
                                    <textarea
                                        value={currentCustomPalette.description}
                                        onChange={(e) =>
                                            setCurrentCustomPalette((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                        placeholder="Describe your palette"
                                        className="color-palettes__textarea"
                                    />
                                </div>

                                <div className="color-palettes__form-group">
                                    <label>Colors</label>
                                    <div className="color-palettes__custom-colors">
                                        {currentCustomPalette.colors.map((color, index) => (
                                            <div key={index} className="color-palettes__custom-color">
                                                <input
                                                    type="color"
                                                    value={color}
                                                    onChange={(e) => updateCustomColor(index, e.target.value)}
                                                    className="color-palettes__color-picker"
                                                />
                                                <input
                                                    type="text"
                                                    value={color}
                                                    onChange={(e) => updateCustomColor(index, e.target.value)}
                                                    className="color-palettes__color-input"
                                                />
                                                {currentCustomPalette.colors.length > 1 && (
                                                    <button onClick={() => removeCustomColor(index)} className="color-palettes__remove-color">
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        {currentCustomPalette.colors.length < 8 && (
                                            <button onClick={addCustomColor} className="color-palettes__add-color">
                                                + Add Color
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="color-palettes__preview">
                                    <h4>Preview</h4>
                                    <div className="color-palettes__preview-colors">
                                        {currentCustomPalette.colors.map((color, index) => (
                                            <div key={index} className="color-palettes__preview-swatch" style={{ backgroundColor: color }} title={color} />
                                        ))}
                                    </div>
                                </div>

                                <div className="color-palettes__modal-actions">
                                    <button onClick={() => setShowCustomCreator(false)} className="color-palettes__btn color-palettes__btn--secondary">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveCustomPalette}
                                        className="color-palettes__btn color-palettes__btn--primary"
                                        disabled={!currentCustomPalette.name.trim()}
                                    >
                                        Save Palette
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="color-palettes__grid">
                    {filteredPalettes.map((palette) => (
                        <div key={palette.id} className="color-palettes__palette">
                            <div className="color-palettes__palette-header">
                                <h3 className="color-palettes__palette-name">{palette.name}</h3>
                                <div className="color-palettes__palette-actions">
                                    <span className="color-palettes__palette-category">{palette.category}</span>
                                    {palette.category === 'Custom' && (
                                        <button
                                            onClick={() => deleteCustomPalette(palette.id)}
                                            className="color-palettes__delete-btn"
                                            title="Delete custom palette"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="color-palettes__palette-description">{palette.description}</p>

                            <div className="color-palettes__colors">
                                {palette.colors.map((color, index) => (
                                    <div key={index} className="color-palettes__color-group">
                                        <div
                                            className="color-palettes__color-swatch"
                                            style={{
                                                backgroundColor: color.hex,
                                                color: getContrastColor(color.hex),
                                            }}
                                        >
                                            <span className="color-palettes__color-name">{color.name}</span>
                                        </div>

                                        <div className="color-palettes__color-values">
                                            <div
                                                className="color-palettes__color-value"
                                                onClick={() => copyToClipboard(color.hex, color.name)}
                                                title="Click to copy HEX"
                                            >
                                                <span className="color-palettes__color-label">HEX</span>
                                                <span className="color-palettes__color-code">{color.hex}</span>
                                            </div>

                                            <div
                                                className="color-palettes__color-value"
                                                onClick={() => copyToClipboard(color.rgb, color.name)}
                                                title="Click to copy RGB"
                                            >
                                                <span className="color-palettes__color-label">RGB</span>
                                                <span className="color-palettes__color-code">{color.rgb}</span>
                                            </div>

                                            <div
                                                className="color-palettes__color-value"
                                                onClick={() => copyToClipboard(color.hsl, color.name)}
                                                title="Click to copy HSL"
                                            >
                                                <span className="color-palettes__color-label">HSL</span>
                                                <span className="color-palettes__color-code">{color.hsl}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="color-palettes__footer">
                    <p>Click any color value to copy it to your clipboard. Perfect for CSS, design tools, and development.</p>
                </div>
            </div>
        </div>
    );
};

export default ColorPalettes;
