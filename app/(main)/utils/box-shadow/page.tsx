'use client';
import React, { useState } from 'react';
import { Copy, Moon, Sun, Check } from 'lucide-react';
// TypeScript interfaces and types
interface ShadowConfig {
    name: string;
    light: string;
    dark: string;
}

type CopiedState = number | null;

// Shadow configurations with proper typing
const shadows: ShadowConfig[] = [
    {
        name: 'Soft',
        light: '0 1px 3px rgba(0, 0, 0, 0.1)',
        dark: '0 1px 3px rgba(0, 0, 0, 0.6)',
    },
    {
        name: 'Medium',
        light: '0 2px 6px rgba(0, 0, 0, 0.12)',
        dark: '0 2px 6px rgba(0, 0, 0, 0.7)',
    },
    {
        name: 'Large',
        light: '0 4px 12px rgba(0, 0, 0, 0.15)',
        dark: '0 4px 12px rgba(0, 0, 0, 0.8)',
    },
    {
        name: 'X-Large',
        light: '0 8px 25px rgba(0, 0, 0, 0.15)',
        dark: '0 8px 25px rgba(0, 0, 0, 0.9)',
    },
    {
        name: '2XL',
        light: '0 12px 40px rgba(0, 0, 0, 0.18)',
        dark: '0 12px 40px rgba(0, 0, 0, 0.95)',
    },
    {
        name: 'Inner',
        light: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
        dark: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
    },
    {
        name: 'Inner Deep',
        light: 'inset 0 4px 8px rgba(0, 0, 0, 0.15)',
        dark: 'inset 0 4px 8px rgba(0, 0, 0, 0.6)',
    },
    {
        name: 'Elevated',
        light: '0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1)',
        dark: '0 2px 4px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.8)',
    },
    {
        name: 'Floating',
        light: '0 6px 20px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)',
        dark: '0 6px 20px rgba(0, 0, 0, 0.9), 0 2px 6px rgba(0, 0, 0, 0.6)',
    },
    {
        name: 'Intense',
        light: '0 20px 60px rgba(0, 0, 0, 0.2)',
        dark: '0 20px 60px rgba(0, 0, 0, 1)',
    },
    {
        name: 'Blue',
        light: '0 4px 14px rgba(159, 168, 218, 0.3)',
        dark: '0 4px 14px rgba(159, 168, 218, 0.6)',
    },
    {
        name: 'Purple',
        light: '0 4px 14px rgba(139, 92, 246, 0.2)',
        dark: '0 4px 14px rgba(139, 92, 246, 0.5)',
    },
    {
        name: 'Green',
        light: '0 4px 14px rgba(34, 197, 94, 0.2)',
        dark: '0 4px 14px rgba(34, 197, 94, 0.5)',
    },
    {
        name: 'Red',
        light: '0 4px 14px rgba(239, 68, 68, 0.2)',
        dark: '0 4px 14px rgba(239, 68, 68, 0.5)',
    },
    {
        name: 'Orange',
        light: '0 4px 14px rgba(249, 115, 22, 0.2)',
        dark: '0 4px 14px rgba(249, 115, 22, 0.5)',
    },
    {
        name: 'Pink',
        light: '0 4px 14px rgba(236, 72, 153, 0.2)',
        dark: '0 4px 14px rgba(236, 72, 153, 0.5)',
    },
    {
        name: 'Cyan',
        light: '0 4px 14px rgba(6, 182, 212, 0.2)',
        dark: '0 4px 14px rgba(6, 182, 212, 0.5)',
    },
    {
        name: 'Yellow',
        light: '0 4px 14px rgba(245, 158, 11, 0.2)',
        dark: '0 4px 14px rgba(245, 158, 11, 0.5)',
    },
    {
        name: 'Neon Blue',
        light: '0 0 20px rgba(159, 168, 218, 0.4)',
        dark: '0 0 20px rgba(159, 168, 218, 0.8)',
    },
    {
        name: 'Neon Green',
        light: '0 0 20px rgba(34, 197, 94, 0.3)',
        dark: '0 0 20px rgba(34, 197, 94, 0.8)',
    },
    {
        name: 'Neon Pink',
        light: '0 0 20px rgba(236, 72, 153, 0.3)',
        dark: '0 0 20px rgba(236, 72, 153, 0.8)',
    },
    {
        name: 'Bottom',
        light: '0 4px 8px rgba(0, 0, 0, 0.1)',
        dark: '0 4px 8px rgba(0, 0, 0, 0.6)',
    },
    {
        name: 'Top',
        light: '0 -4px 8px rgba(0, 0, 0, 0.1)',
        dark: '0 -4px 8px rgba(0, 0, 0, 0.6)',
    },
    {
        name: 'Left',
        light: '-4px 0 8px rgba(0, 0, 0, 0.1)',
        dark: '-4px 0 8px rgba(0, 0, 0, 0.6)',
    },
    {
        name: 'Right',
        light: '4px 0 8px rgba(0, 0, 0, 0.1)',
        dark: '4px 0 8px rgba(0, 0, 0, 0.6)',
    },
    {
        name: 'Brutal',
        light: '4px 4px 0 rgba(0, 0, 0, 0.8)',
        dark: '4px 4px 0 rgba(227, 227, 227, 0.3)',
    },
    {
        name: 'Retro',
        light: '3px 3px 0 #000, 6px 6px 0 rgba(0, 0, 0, 0.3)',
        dark: '3px 3px 0 rgba(227, 227, 227, 0.8), 6px 6px 0 rgba(227, 227, 227, 0.3)',
    },
    {
        name: 'Neumorphic',
        light: '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff',
        dark: '4px 4px 8px rgba(0, 0, 0, 0.8), -4px -4px 8px rgba(43, 43, 43, 0.5)',
    },
    {
        name: 'Pressed',
        light: 'inset 2px 2px 4px rgba(0, 0, 0, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.7)',
        dark: 'inset 2px 2px 4px rgba(0, 0, 0, 0.7), inset -2px -2px 4px rgba(43, 43, 43, 0.5)',
    },
    {
        name: 'Layered',
        light: '0 1px 3px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1)',
        dark: '0 1px 3px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.7), 0 8px 16px rgba(0, 0, 0, 0.8)',
    },
    {
        name: 'Outline',
        light: '0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1)',
        dark: '0 0 0 1px rgba(43, 43, 43, 0.8), 0 2px 4px rgba(0, 0, 0, 0.6)',
    },
    {
        name: 'Spread',
        light: '0 0 0 3px rgba(159, 168, 218, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)',
        dark: '0 0 0 3px rgba(159, 168, 218, 0.3), 0 2px 8px rgba(0, 0, 0, 0.6)',
    },
    {
        name: 'Glow',
        light: '0 0 16px rgba(159, 168, 218, 0.3)',
        dark: '0 0 16px rgba(159, 168, 218, 0.6)',
    },
    {
        name: 'Double',
        light: '0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)',
        dark: '0 2px 4px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.4)',
    },
    {
        name: 'Inset Glow',
        light: 'inset 0 0 8px rgba(159, 168, 218, 0.2)',
        dark: 'inset 0 0 8px rgba(159, 168, 218, 0.4)',
    },
    {
        name: 'Sharp',
        light: '2px 2px 0 rgba(0, 0, 0, 0.8)',
        dark: '2px 2px 0 rgba(227, 227, 227, 0.4)',
    },
    {
        name: 'Subtle',
        light: '0 1px 2px rgba(0, 0, 0, 0.05)',
        dark: '0 1px 2px rgba(0, 0, 0, 0.4)',
    },
];

export default function ShadowGallery(): React.JSX.Element {
    const [isDark, setIsDark] = useState<boolean>(true);
    const [copiedIndex, setCopiedIndex] = useState<CopiedState>(null);

    const copyToClipboard = async (shadowValue: string, index: number): Promise<void> => {
        try {
            await navigator.clipboard.writeText(`box-shadow: ${shadowValue};`);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const toggleTheme = (): void => {
        setIsDark(!isDark);
    };

    const getCurrentShadow = (shadow: ShadowConfig): string => {
        return isDark ? shadow.dark : shadow.light;
    };

    return (
        <div className="children__wrapper">
            <div className={`shadow-gallery ${isDark ? 'dark' : 'light'}`}>
                <button onClick={toggleTheme} className="theme-toggle">
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <div className="title">
                    <h1>CSS Box Shadow Gallery</h1>
                    <p>Click any shadow to copy its CSS code to clipboard</p>
                </div>

                <div className="grid">
                    {shadows.map((shadow: ShadowConfig, index: number) => {
                        const currentShadow: string = getCurrentShadow(shadow);
                        const isHovered: boolean = copiedIndex === index;

                        return (
                            <div key={index} className="shadow-box" style={{ boxShadow: currentShadow }} onClick={() => copyToClipboard(currentShadow, index)}>
                                <div className="shadow-number">#{index + 1}</div>
                                <div className="shadow-name">{shadow.name}</div>
                                <div className={`copy-icon ${isHovered ? 'copied' : ''}`}>{isHovered ? <Check size={12} /> : <Copy size={12} />}</div>
                                <div className="tooltip">{isHovered ? 'Copied!' : 'Click to copy CSS'}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
