// components/LayoutGallery.tsx
'use client';

import React, { useState } from 'react';

interface LayoutItem {
    id: string;
    name: string;
    description: string;
    preview: React.ReactNode;
    css: string;
    html: string;
    category: 'flexbox' | 'grid' | 'bento' | 'positioning' | 'cards';
}

const LayoutGallery: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [copyType, setCopyType] = useState<'css' | 'html'>('css');

    const layouts: LayoutItem[] = [
        {
            id: 'flex-center',
            name: 'Flex Center',
            description: 'Perfect centering with flexbox',
            category: 'flexbox',
            preview: (
                <div className="preview-container">
                    <div className="flex-center-preview">
                        <div className="center-item"></div>
                    </div>
                </div>
            ),
            css: `.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--surface-ground);
  color: var(--text-color);
}`,
            html: `<div class="flex-center">
  <div class="content">
    <h1>Centered Content</h1>
    <p>This content is perfectly centered</p>
  </div>
</div>`,
        },
        {
            id: 'flex-space-between',
            name: 'Space Between',
            description: 'Distribute items with space between',
            category: 'flexbox',
            preview: (
                <div className="preview-container">
                    <div className="flex-space-between-preview">
                        <div className="item"></div>
                        <div className="item"></div>
                        <div className="item"></div>
                    </div>
                </div>
            ),
            css: `.space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--inline-spacing);
  padding: var(--content-padding);
  background: var(--surface-section);
  border-radius: var(--border-radius);
}`,
            html: `<div class="space-between">
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
  <div class="item">Item 3</div>
</div>`,
        },
        {
            id: 'bento-grid-1',
            name: 'Bento Grid Classic',
            description: 'Instagram-style bento grid layout',
            category: 'bento',
            preview: (
                <div className="preview-container">
                    <div className="bento-grid-1-preview">
                        <div className="bento-item large"></div>
                        <div className="bento-item small"></div>
                        <div className="bento-item small"></div>
                        <div className="bento-item medium"></div>
                        <div className="bento-item medium"></div>
                    </div>
                </div>
            ),
            css: `.bento-grid-classic {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 120px);
  gap: var(--inline-spacing);
  padding: var(--content-padding);
  background: var(--surface-ground);
}

.bento-item {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: var(--content-padding);
  color: var(--text-color);
  transition: all 0.3s ease;
}

.bento-item:hover {
  background: var(--surface-hover);
  transform: translateY(-2px);
}

.large { grid-column: span 2; grid-row: span 2; }
.medium { grid-column: span 2; grid-row: span 1; }
.small { grid-column: span 1; grid-row: span 1; }

@media (max-width: 768px) {
  .bento-grid-classic {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto;
  }
  .large, .medium, .small {
    grid-column: span 1;
    grid-row: span 1;
  }
}`,
            html: `<div class="bento-grid-classic">
  <div class="bento-item large">
    <h3>Featured Content</h3>
    <p>Large showcase area</p>
  </div>
  <div class="bento-item small">Item 1</div>
  <div class="bento-item small">Item 2</div>
  <div class="bento-item medium">
    <h4>Medium Content</h4>
    <p>Description here</p>
  </div>
  <div class="bento-item medium">
    <h4>Another Item</h4>
    <p>More content</p>
  </div>
</div>`,
        },
        {
            id: 'bento-grid-2',
            name: 'Bento Grid Masonry',
            description: 'Pinterest-style masonry bento grid',
            category: 'bento',
            preview: (
                <div className="preview-container">
                    <div className="bento-grid-2-preview">
                        <div className="bento-item tall"></div>
                        <div className="bento-item wide"></div>
                        <div className="bento-item square"></div>
                        <div className="bento-item square"></div>
                        <div className="bento-item wide"></div>
                    </div>
                </div>
            ),
            css: `.bento-grid-masonry {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-auto-rows: 100px;
  gap: var(--inline-spacing);
  padding: var(--content-padding);
  background: var(--surface-ground);
}

.bento-item {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: var(--content-padding);
  color: var(--text-color);
  transition: all 0.3s ease;
}

.bento-item:hover {
  background: var(--surface-hover);
  border-color: var(--primary-color);
}

.tall { grid-row: span 3; }
.wide { grid-column: span 2; }
.square { grid-row: span 2; }

@media (max-width: 768px) {
  .bento-grid-masonry {
    grid-template-columns: 1fr;
  }
  .wide {
    grid-column: span 1;
  }
}`,
            html: `<div class="bento-grid-masonry">
  <div class="bento-item tall">
    <h3>Tall Item</h3>
    <p>Extended content area</p>
  </div>
  <div class="bento-item wide">
    <h3>Wide Feature</h3>
    <p>Spans multiple columns</p>
  </div>
  <div class="bento-item square">Square 1</div>
  <div class="bento-item square">Square 2</div>
  <div class="bento-item wide">
    <h3>Another Wide</h3>
  </div>
</div>`,
        },
        {
            id: 'dashboard-grid',
            name: 'Dashboard Grid',
            description: 'Professional dashboard layout',
            category: 'bento',
            preview: (
                <div className="preview-container">
                    <div className="dashboard-grid-preview">
                        <div className="dash-header"></div>
                        <div className="dash-main"></div>
                        <div className="dash-sidebar"></div>
                        <div className="dash-widget"></div>
                        <div className="dash-widget"></div>
                    </div>
                </div>
            ),
            css: `.dashboard-grid {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main widget1"
    "sidebar main widget2";
  grid-template-columns: 250px 1fr 300px;
  grid-template-rows: 80px 1fr 1fr;
  gap: var(--inline-spacing);
  min-height: 100vh;
  padding: var(--content-padding);
  background: var(--surface-ground);
}

.dash-header {
  grid-area: header;
  background: var(--surface-section);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: var(--content-padding);
  color: var(--text-color);
}

.dash-sidebar {
  grid-area: sidebar;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: var(--content-padding);
}

.dash-main {
  grid-area: main;
  background: var(--surface-section);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: var(--content-padding);
}

.dash-widget1 { grid-area: widget1; }
.dash-widget2 { grid-area: widget2; }

.dash-widget1, .dash-widget2 {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: var(--content-padding);
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "widget1"
      "widget2";
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
}`,
            html: `<div class="dashboard-grid">
  <header class="dash-header">
    <h1>Dashboard Header</h1>
  </header>
  <aside class="dash-sidebar">
    <nav>Navigation Menu</nav>
  </aside>
  <main class="dash-main">
    <h2>Main Content Area</h2>
    <p>Primary dashboard content</p>
  </main>
  <div class="dash-widget1">
    <h3>Widget 1</h3>
    <p>Statistics or chart</p>
  </div>
  <div class="dash-widget2">
    <h3>Widget 2</h3>
    <p>Additional metrics</p>
  </div>
</div>`,
        },
        {
            id: 'card-grid',
            name: 'Card Grid Layout',
            description: 'Responsive card grid with hover effects',
            category: 'cards',
            preview: (
                <div className="preview-container">
                    <div className="card-grid-preview">
                        <div className="card-item"></div>
                        <div className="card-item"></div>
                        <div className="card-item"></div>
                        <div className="card-item"></div>
                    </div>
                </div>
            ),
            css: `.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: calc(var(--inline-spacing) * 2);
  padding: var(--content-padding);
  background: var(--surface-ground);
}

.card-item {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: calc(var(--content-padding) * 1.5);
  color: var(--text-color);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.card-item:hover {
  background: var(--surface-hover);
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-color: var(--primary-color);
}

.card-item h3 {
  color: var(--primary-color);
  margin-bottom: var(--inline-spacing);
}

.card-item p {
  color: var(--text-color-secondary);
  line-height: 1.6;
}`,
            html: `<div class="card-grid">
  <div class="card-item">
    <h3>Card Title 1</h3>
    <p>Card description and content goes here. This is a flexible card layout.</p>
  </div>
  <div class="card-item">
    <h3>Card Title 2</h3>
    <p>Another card with different content but same styling structure.</p>
  </div>
  <div class="card-item">
    <h3>Card Title 3</h3>
    <p>Third card demonstrating the responsive grid behavior.</p>
  </div>
  <div class="card-item">
    <h3>Card Title 4</h3>
    <p>Fourth card completing the grid layout example.</p>
  </div>
</div>`,
        },
        {
            id: 'magazine-layout',
            name: 'Magazine Layout',
            description: 'Editorial magazine-style layout',
            category: 'bento',
            preview: (
                <div className="preview-container">
                    <div className="magazine-layout-preview">
                        <div className="mag-hero"></div>
                        <div className="mag-article"></div>
                        <div className="mag-sidebar"></div>
                        <div className="mag-feature"></div>
                    </div>
                </div>
            ),
            css: `.magazine-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 300px auto auto;
  gap: calc(var(--inline-spacing) * 2);
  padding: var(--content-padding);
  background: var(--surface-ground);
  max-width: 1200px;
  margin: 0 auto;
}

.mag-hero {
  grid-column: 1 / -1;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: calc(var(--content-padding) * 2);
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mag-article {
  background: var(--surface-section);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: calc(var(--content-padding) * 1.5);
}

.mag-sidebar {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: var(--content-padding);
  grid-row: span 2;
}

.mag-feature {
  background: var(--surface-overlay);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: calc(var(--content-padding) * 1.5);
}

@media (max-width: 768px) {
  .magazine-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  
  .mag-sidebar {
    grid-row: span 1;
  }
}`,
            html: `<div class="magazine-layout">
  <div class="mag-hero">
    <h1>Hero Article Title</h1>
  </div>
  <div class="mag-article">
    <h2>Main Article</h2>
    <p>Article content and text goes here...</p>
  </div>
  <div class="mag-sidebar">
    <h3>Sidebar</h3>
    <ul>
      <li>Related Link 1</li>
      <li>Related Link 2</li>
      <li>Related Link 3</li>
    </ul>
  </div>
  <div class="mag-feature">
    <h3>Featured Content</h3>
    <p>Additional featured content or advertisements.</p>
  </div>
</div>`,
        },
        {
            id: 'holy-grail',
            name: 'Holy Grail Layout',
            description: 'Classic header, sidebar, main, footer layout',
            category: 'grid',
            preview: (
                <div className="preview-container">
                    <div className="holy-grail-preview">
                        <div className="header"></div>
                        <div className="sidebar"></div>
                        <div className="main"></div>
                        <div className="footer"></div>
                    </div>
                </div>
            ),
            css: `.holy-grail {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: var(--inline-spacing);
  padding: var(--content-padding);
  background: var(--surface-ground);
}

.header {
  grid-area: header;
  background: var(--surface-section);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: var(--content-padding);
  color: var(--text-color);
}

.sidebar {
  grid-area: sidebar;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: var(--content-padding);
}

.main {
  grid-area: main;
  background: var(--surface-section);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: var(--content-padding);
}

.footer {
  grid-area: footer;
  background: var(--surface-overlay);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: var(--content-padding);
}

@media (max-width: 768px) {
  .holy-grail {
    grid-template-areas: 
      "header"
      "main"
      "sidebar"
      "footer";
    grid-template-columns: 1fr;
  }
}`,
            html: `<div class="holy-grail">
  <header class="header">
    <h1>Website Header</h1>
  </header>
  <aside class="sidebar">
    <nav>
      <ul>
        <li><a href="#">Navigation Item 1</a></li>
        <li><a href="#">Navigation Item 2</a></li>
        <li><a href="#">Navigation Item 3</a></li>
      </ul>
    </nav>
  </aside>
  <main class="main">
    <h2>Main Content Area</h2>
    <p>This is the main content area of the page.</p>
  </main>
  <footer class="footer">
    <p>&copy; 2024 Your Website. All rights reserved.</p>
  </footer>
</div>`,
        },
        {
            id: 'sticky-header',
            name: 'Sticky Header',
            description: 'Header that stays at top while scrolling',
            category: 'positioning',
            preview: (
                <div className="preview-container">
                    <div className="sticky-header-preview">
                        <div className="sticky-header-item"></div>
                        <div className="content-area"></div>
                    </div>
                </div>
            ),
            css: `.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--surface-section);
  border-bottom: 1px solid var(--surface-border);
  padding: var(--content-padding);
  color: var(--text-color);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.sticky-header.scrolled {
  background: var(--surface-overlay);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.content-area {
  padding: calc(var(--content-padding) * 2);
  background: var(--surface-ground);
  min-height: 200vh;
  color: var(--text-color);
}`,
            html: `<div class="sticky-header">
  <nav>
    <h1>Sticky Navigation</h1>
    <ul>
      <li><a href="#">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  </nav>
</div>
<div class="content-area">
  <h2>Page Content</h2>
  <p>Scroll down to see the sticky header in action...</p>
  <p>The header will remain fixed at the top of the viewport.</p>
</div>`,
        },
    ];

    const categories = [
        { id: 'all', name: 'All Layouts' },
        { id: 'flexbox', name: 'Flexbox' },
        { id: 'grid', name: 'Grid' },
        { id: 'bento', name: 'Bento Grids' },
        { id: 'cards', name: 'Cards' },
        { id: 'positioning', name: 'Positioning' },
    ];

    const filteredLayouts = layouts.filter((layout) => {
        const matchesSearch =
            layout.name.toLowerCase().includes(searchTerm.toLowerCase()) || layout.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || layout.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const copyToClipboard = async (content: string, id: string, type: 'css' | 'html') => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedId(id);
            setCopyType(type);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    return (
        <div className="children__wrapper">
            <div className="layout-gallery__wrapper">
                <div className="gallery-header">
                    <h1 className="gallery-title">Layout Library</h1>
                    <p className="gallery-description">
                        Modern responsive layouts including Bento Grids, Dashboard layouts, and more. Click any layout to copy CSS or HTML code.
                    </p>

                    <div className="gallery-controls">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search layouts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="category-filters">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="layouts-count">
                        Showing {filteredLayouts.length} of {layouts.length} layouts
                    </div>

                    <div className="layouts-grid">
                        {filteredLayouts.map((layout) => (
                            <div key={layout.id} className="layout-card">
                                <div className="layout-preview">{layout.preview}</div>

                                <div className="layout-info">
                                    <h3 className="layout-name">{layout.name}</h3>
                                    <p className="layout-description">{layout.description}</p>
                                    <span className="layout-category">{layout.category}</span>
                                </div>

                                <div className="copy-buttons">
                                    <button
                                        onClick={() => copyToClipboard(layout.css, layout.id, 'css')}
                                        className={`copy-btn css-btn ${copiedId === layout.id && copyType === 'css' ? 'copied' : ''}`}
                                    >
                                        {copiedId === layout.id && copyType === 'css' ? '✓ CSS Copied!' : 'Copy CSS'}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(layout.html, layout.id, 'html')}
                                        className={`copy-btn html-btn ${copiedId === layout.id && copyType === 'html' ? 'copied' : ''}`}
                                    >
                                        {copiedId === layout.id && copyType === 'html' ? '✓ HTML Copied!' : 'Copy HTML'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredLayouts.length === 0 && (
                        <div className="no-results">
                            <p>No layouts found matching your search criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LayoutGallery;
