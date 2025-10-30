'use client';
import Link from 'next/link';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { IconService } from '../../../../service/IconService';

declare namespace Demo {
    interface Icon {
        icon?: {
            tags?: string[];
        };
        properties?: {
            name?: string;
        };
    }
}

interface CodeBlockProps {
    code: string;
    language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'bash' }) => {
    const [copied, setCopied] = useState(false);

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    return (
        <div className="code-block">
            <code>{code}</code>
            <button className={`copy-code-btn ${copied ? 'copied' : ''}`} onClick={copyCode} aria-label={copied ? 'Copied!' : 'Copy code'}>
                {copied ? (
                    <>
                        <i className="pi pi-check"></i> Copied!
                    </>
                ) : (
                    <>
                        <i className="pi pi-copy"></i> Copy Code
                    </>
                )}
            </button>
        </div>
    );
};

const IconsDemo = () => {
    const [icons, setIcons] = useState<Demo.Icon[]>([]);
    const [filteredIcons, setFilteredIcons] = useState<Demo.Icon[]>([]);
    const [copiedIcon, setCopiedIcon] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIcons = async () => {
            try {
                setLoading(true);
                const data = await IconService.getIcons();
                const sortedData = [...data].sort((icon1, icon2) => {
                    const name1 = icon1.properties?.name || '';
                    const name2 = icon2.properties?.name || '';
                    return name1.localeCompare(name2);
                });
                setIcons(sortedData);
                setFilteredIcons(sortedData);
            } catch (error) {
                console.error('Failed to fetch icons:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIcons();
    }, []);

    const onFilter = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const searchValue = event.target.value.toLowerCase();
            setSearchTerm(searchValue);

            if (!searchValue) {
                setFilteredIcons(icons);
            } else {
                setFilteredIcons(
                    icons.filter((it) => {
                        const iconName = it.properties?.name?.toLowerCase() || '';
                        const iconTags = it.icon?.tags?.join(' ').toLowerCase() || '';
                        return iconName.includes(searchValue) || iconTags.includes(searchValue);
                    })
                );
            }
        },
        [icons]
    );

    const copyToClipboard = useCallback(async (iconName: string) => {
        const iconClass = `pi pi-${iconName}`;

        try {
            await navigator.clipboard.writeText(iconClass);
            setCopiedIcon(iconName);
            setTimeout(() => {
                setCopiedIcon(null);
            }, 3000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = iconClass;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                setCopiedIcon(iconName);
                setTimeout(() => {
                    setCopiedIcon(null);
                }, 3000);
            } catch (fallbackErr) {
                console.error('Failed to copy to clipboard:', fallbackErr);
            }

            document.body.removeChild(textArea);
        }
    }, []);

    const renderLoadingGrid = useMemo(
        () => (
            <div className="loading-grid">
                {Array.from({ length: 24 }).map((_, index) => (
                    <div key={index} className="loading-item">
                        <div className="loading-icon"></div>
                        <div className="loading-text"></div>
                    </div>
                ))}
            </div>
        ),
        []
    );

    const renderEmptyState = useMemo(
        () => (
            <div className="empty-state">
                <i className="empty-icon pi pi-search"></i>
                <div className="empty-message">No icons found</div>
                <div className="empty-suggestion">
                    {searchTerm
                        ? `No matches for "${searchTerm}". Try different keywords like "arrow", "social", or "ui".`
                        : 'There was an issue loading the icons. Please try refreshing the page.'}
                </div>
            </div>
        ),
        [searchTerm]
    );

    const visibleIcons = useMemo(() => {
        return filteredIcons.filter((iconMeta) => {
            const { icon } = iconMeta;
            return icon?.tags?.indexOf('deprecate') === -1;
        });
    }, [filteredIcons]);

    return (
        <div className="children__wrapper">
            <div className="icons-demo__wrapper">
                {/* Enhanced Header */}
                <div className="demo-header">
                    <i className="header-icons icon-1 pi pi-star-fill"></i>
                    <i className="header-icons icon-2 pi pi-heart-fill"></i>
                    <i className="header-icons icon-3 pi pi-apple"></i>
                    <h1>
                        DRJ Icons Library
                        <span className="version-badge">v2.0</span>
                    </h1>
                    <p className="subtitle">
                        A comprehensive collection of {icons.length}+ beautiful, scalable vector icons designed for modern web applications. Click any icon to
                        copy its class name.
                    </p>
                </div>
                {/* Search Section */}
                <div className="search-section fade-in-up">
                    <h3>
                        <i className="section-icon pi pi-search"></i>
                        Browse Icons
                    </h3>
                    <div className="search-wrapper">
                        <i className="search-icon pi pi-search"></i>
                        <input
                            type="text"
                            className="search-input"
                            onChange={onFilter}
                            placeholder="Search icons by name or tag (e.g., 'arrow', 'social', 'ui')..."
                            value={searchTerm}
                            aria-label="Search icons"
                        />
                    </div>
                    <div className="search-stats">
                        {loading ? (
                            <>
                                <i className="pi pi-spinner pi-spin"></i> Loading icons...
                            </>
                        ) : (
                            <>
                                <i className="pi pi-info-circle"></i> Showing {visibleIcons.length} of {icons.length} icons
                                {searchTerm && ` matching "${searchTerm}"`}
                            </>
                        )}
                    </div>
                </div>

                {/* Icons Grid */}
                {loading ? (
                    renderLoadingGrid
                ) : visibleIcons.length === 0 ? (
                    renderEmptyState
                ) : (
                    <div className="icons-grid">
                        {visibleIcons.map((iconMeta) => {
                            const { properties } = iconMeta;
                            const iconName = properties?.name || '';

                            return (
                                <div
                                    className={`icon-item ${copiedIcon === iconName ? 'copied' : ''} fade-in-up`}
                                    key={iconName}
                                    onClick={() => copyToClipboard(iconName)}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Copy ${iconName} icon class`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            copyToClipboard(iconName);
                                        }
                                    }}
                                >
                                    <i className={`icon-display pi pi-${iconName}`} aria-hidden="true"></i>
                                    <div className="icon-name">
                                        {copiedIcon === iconName ? (
                                            <div className="copy-indicator">
                                                <i className="check-icon pi pi-check"></i>
                                                Copied!
                                            </div>
                                        ) : (
                                            `pi-${iconName}`
                                        )}
                                    </div>
                                    <div className="copy-tooltip">Click to copy: pi pi-{iconName}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {/* Installation Section */}
                <div className="doc-section fade-in-up">
                    <h3>
                        <i className="section-icon pi pi-download"></i>
                        Installation
                    </h3>
                    <p>
                        Get started quickly by installing drjicons from npm. This package contains all the icons you need for your d-admin components and more.
                    </p>
                    <CodeBlock code="npm install drjicons --save" />
                    <p>Or if you prefer yarn:</p>
                    <CodeBlock code="yarn add drjicons" />
                    <p>After installation, import the CSS file in your main application file:</p>
                    <CodeBlock code={`import 'drjicons/dist/drjicons.css';`} language="jsx" />
                </div>

                {/* Quick Start & Styling Section */}
                <div className="doc-section fade-in-up">
                    <h3>
                        <i className="section-icon pi pi-bolt"></i>
                        Quick Start & Styling
                    </h3>

                    <p>
                        DrjIcons uses a simple and intuitive naming convention. All icons follow the <code>pi pi-{'{icon-name}'}</code> pattern. The library
                        includes a wide variety of icons for different use cases, with extensive styling and animation options.
                    </p>

                    <h4>Basic Usage</h4>
                    <CodeBlock
                        code={`// Basic icon usage
<i className="pi pi-check"></i>
<i className="pi pi-times"></i>
<i className="pi pi-home"></i>`}
                        language="jsx"
                    />

                    <h4>Styling Options</h4>
                    <CodeBlock
                        code={`// Size control
<i className="pi pi-cog" style={{ fontSize: '2rem' }}></i>

// Color customization
<i className="pi pi-heart" style={{ color: '#e74c3c' }}></i>

// With custom styling
<i className="pi pi-star" style={{ color: 'gold', fontSize: '1.5rem' }}></i>

// Using CSS classes
<style>
  .custom-icon {
    color: var(--primary-color);
    transition: transform 0.3s ease;
  }
  .custom-icon:hover {
    transform: scale(1.2);
  }
</style>
<i className="pi pi-cog custom-icon"></i>`}
                        language="jsx"
                    />

                    <h4>Animations & Effects</h4>
                    <CodeBlock
                        code={`// Animation examples
<i className="pi pi-spin pi-spinner"></i>  // Continuous spin
<i className="pi pi-pulse pi-heart"></i>    // Pulsing effect

// Using with buttons
<button className="icon-button">
  <i className="pi pi-user"></i> Profile
</button>`}
                        language="jsx"
                    />

                    <div
                        style={{
                            display: 'flex',
                            gap: '1.5rem',
                            alignItems: 'center',
                            marginTop: '1.5rem',
                            flexWrap: 'wrap',
                        }}
                    >
                        <i className="pi pi-check" style={{ fontSize: '1.75rem' }}></i>
                        <i className="pi pi-cog" style={{ fontSize: '1.75rem', color: 'var(--primary-color)' }}></i>
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.75rem', color: 'var(--primary-color)' }}></i>
                        <i className="pi pi-heart" style={{ fontSize: '1.75rem', color: '#e74c3c' }}></i>
                        <i className="pi pi-pulse pi-bell" style={{ fontSize: '1.75rem', color: '#f39c12' }}></i>
                        <i className="pi pi-star" style={{ fontSize: '1.75rem', color: 'gold' }}></i>
                    </div>
                </div>

                {/* Footer Documentation */}
                <div className="doc-section fade-in-up">
                    <h3>
                        <i className="section-icon pi pi-question-circle"></i>
                        Need More Icons?
                    </h3>
                    <p>
                        DrjIcons is actively maintained and new icons are added regularly. If you need a specific icon that&apos;s not available, you can request it
                        on our{' '}
                        <Link href="https://github.com/dheeraj-rs" target="_blank" rel="noopener noreferrer">
                            GitHub repository
                        </Link>
                        . We also welcome contributions from the community!
                    </p>
                    <p>
                        For more information about the drjicons library and{' '}
                        <Link href="https://www.dheerajrs.com/" target="_blank" rel="noopener noreferrer">
                            dheeraj-rs
                        </Link>
                        , visit our official website.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IconsDemo;
