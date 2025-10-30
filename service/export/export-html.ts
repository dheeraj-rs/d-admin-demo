import { ProjectSettings } from '../../lib/types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ComponentInstance {
    id: string;
    name: string;
    type: string;
    snippet: string;
    language: string;
    route?: string;
}

interface PageConfig {
    name: string;
    route: string;
    components: ComponentInstance[];
    title?: string;
}

export async function exportHtmlProject(components: ComponentInstance[], settings: ProjectSettings, pages?: PageConfig[]): Promise<void> {
    const zip = new JSZip();

    // If pages are provided, use multi-page setup, otherwise single page
    const pageConfigs = pages || [
        {
            name: 'index',
            route: '/',
            components: components,
            title: settings.title,
        },
    ];

    // 1. Add HTML pages
    addHtmlPages(zip, pageConfigs, settings);

    // 2. Add CSS and JS files
    addAssets(zip, components, pageConfigs);

    // 3. Add README
    addDocumentation(zip, settings);

    // Generate and download
    const zipContent = await zip.generateAsync({ type: 'blob' });
    saveAs(zipContent, `${settings.title.toLowerCase().replace(/\s+/g, '-')}-html.zip`);
}

function addHtmlPages(zip: JSZip, pageConfigs: PageConfig[], settings: ProjectSettings) {
    // Generate navigation for multi-page setup
    const navigation = pageConfigs.length > 1 ? generateNavigation(pageConfigs) : '';

    pageConfigs.forEach((page) => {
        const fileName = page.route === '/' ? 'index.html' : `${page.name}.html`;
        const pageHtml = generatePageHtml(page, navigation, settings, pageConfigs);

        zip.file(fileName, pageHtml);
    });
}

function generateNavigation(pageConfigs: PageConfig[]): string {
    // Helper function to get the correct filename for a page
    const getPageFileName = (page: PageConfig) => {
        return page.route === '/' ? 'index.html' : `${page.name}.html`;
    };

    return `
    <nav class="bg-white shadow-lg border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-8">
                    <a href="index.html" class="text-xl font-bold text-blue-600">Home</a>
                    <div class="hidden md:flex space-x-6">
                        ${pageConfigs
                            .filter((page) => page.route !== '/') // Exclude home page from navigation links
                            .map(
                                (page) =>
                                    `<a href="${getPageFileName(page)}" class="text-gray-700 hover:text-blue-600 transition-colors duration-200">${
                                        page.title || page.name.charAt(0).toUpperCase() + page.name.slice(1)
                                    }</a>`
                            )
                            .join('\n                        ')}
                    </div>
                </div>
                <div class="md:hidden">
                    <button id="mobile-menu-btn" class="text-gray-700 hover:text-blue-600 focus:outline-none" aria-expanded="false" aria-controls="mobile-menu">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div id="mobile-menu" class="hidden md:hidden pb-4 border-t border-gray-100 pt-4">
                ${pageConfigs
                    .filter((page) => page.route !== '/') // Exclude home page from mobile navigation too
                    .map(
                        (page) =>
                            `<a href="${getPageFileName(page)}" class="block py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200">${
                                page.title || page.name.charAt(0).toUpperCase() + page.name.slice(1)
                            }</a>`
                    )
                    .join('\n                ')}
            </div>
        </div>
    </nav>`;
}

function generatePageHtml(page: PageConfig, navigation: string, settings: ProjectSettings, allPages: PageConfig[]): string {
    const componentsHtml = page.components.map((component) => processComponentSnippet(component.snippet)).join('\n        ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title || page.name.charAt(0).toUpperCase() + page.name.slice(1)} - ${settings.title}</title>
    <link
      href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
      rel="stylesheet"
    />
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link href="styles.css" rel="stylesheet">
    
    <meta name="description" content="${settings.description || ''}">
    <meta name="author" content="${settings.title}">
</head>
<body class="font-sans bg-gray-50 text-gray-900">
    ${navigation}
    
    <main class="min-h-screen">
        ${componentsHtml}
    </main>
    <script src="script.js"></script>
</body>
</html>`;
}

function processComponentSnippet(snippet: string): string {
    // Clean and process HTML snippet for proper HTML output
    // Use more precise regex patterns to avoid modifying content within attribute values
    return (
        snippet
            // Convert JSX className to HTML class (only when it's an attribute)
            .replace(/\bclassName=/g, 'class=')
            // Convert JSX htmlFor to HTML for (only when it's an attribute)
            .replace(/\bhtmlFor=/g, 'for=')
            // Clean up auto-generated IDs - remove timestamp and random suffixes
            .replace(/\bid="([^"]+)-\d{13}-[a-zA-Z0-9]+"/g, 'id="$1"')
            // Clean up auto-generated IDs in href anchors as well
            .replace(/href="#([^"]+)-\d{13}-[a-zA-Z0-9]+"/g, 'href="#$1"')
            // Remove HTML/JSX comments
            .replace(/<!--[\s\S]*?-->/g, '')
            // Remove JSX-style comments {/* */}
            .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '')
            // Handle onClick and other event handlers - convert to lowercase for HTML
            .replace(/\bonClick=/g, 'onclick=')
            .replace(/\bonChange=/g, 'onchange=')
            .replace(/\bonSubmit=/g, 'onsubmit=')
            .replace(/\bonFocus=/g, 'onfocus=')
            .replace(/\bonBlur=/g, 'onblur=')
            .replace(/\bonMouseOver=/g, 'onmouseover=')
            .replace(/\bonMouseOut=/g, 'onmouseout=')
            // Handle self-closing tags - convert JSX style to HTML style
            .replace(/(<(?:img|input|br|hr|meta|link|area|base|col|embed|source|track|wbr)[^>]*?)\/>/gi, '$1>')
            // Clean up any extra whitespace
            .trim()
    );
}

function addAssets(zip: JSZip, components: ComponentInstance[], pageConfigs: PageConfig[]) {
    // Custom CSS file for additional styles
    zip.file(
        'styles.css',
        `/* Custom Styles */
  html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  scroll-behavior: smooth;
}

* {
  box-sizing: border-box;
}
:root {
    --primary-color: #3b82f6;
    --secondary-color: #6b7280;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --error-color: #ef4444;
}

/* Smooth transitions */
* {
    transition: all 0.2s ease-in-out;
}

/* Custom scrollbar */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

/* Loading animation */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.fade-in {
    animation: fadeIn 0.6s ease-out;
}

/* Button hover effects */
.btn-hover:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Card hover effects */
.card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Focus styles */
.focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

/* Active nav link styling */
.nav-active {
    color: var(--primary-color) !important;
    font-weight: 600;
}

/* Print styles */
@media print {
    nav, footer {
        display: none;
    }
    
    body {
        background: white !important;
        color: black !important;
    }
}`
    );

    // JavaScript file for interactivity with improved navigation handling
    zip.file(
        'script.js',
        `// Pure HTML Project JavaScript
(function() {
    'use strict';
    
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
        initSmoothScroll();
        initFormHandling();
        initButtonEffects();
        initLazyLoading();
        initActiveNavigation();
        
        console.log('HTML Project initialized successfully!');
    });
    
    // Mobile menu functionality
    function initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', function() {
                const isHidden = mobileMenu.classList.contains('hidden');
                
                if (isHidden) {
                    mobileMenu.classList.remove('hidden');
                    mobileMenuBtn.setAttribute('aria-expanded', 'true');
                } else {
                    mobileMenu.classList.add('hidden');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Close mobile menu when window is resized to desktop
            window.addEventListener('resize', function() {
                if (window.innerWidth >= 768) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }
    
    // Active navigation highlighting
    function initActiveNavigation() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('nav a[href]');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('nav-active');
            }
        });
    }
    
    // Smooth scroll for anchor links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Close mobile menu if open
                    const mobileMenu = document.getElementById('mobile-menu');
                    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
                    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                        if (mobileMenuBtn) {
                            mobileMenuBtn.setAttribute('aria-expanded', 'false');
                        }
                    }
                }
            });
        });
    }
    
    // Form handling
    function initFormHandling() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(form);
                const data = Object.fromEntries(formData);
                
                // Simple validation
                const requiredFields = form.querySelectorAll('[required]');
                let isValid = true;
                
                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.classList.add('border-red-500');
                        showMessage('Please fill in all required fields.', 'error');
                    } else {
                        field.classList.remove('border-red-500');
                    }
                });
                
                if (isValid) {
                    console.log('Form submitted:', data);
                    showMessage('Form submitted successfully!', 'success');
                    form.reset();
                }
            });
        });
    }
    
    // Button loading effects
    function initButtonEffects() {
        document.querySelectorAll('button[type="submit"], .btn-submit').forEach(button => {
            button.addEventListener('click', function() {
                if (!this.disabled && this.form && this.form.checkValidity()) {
                    const originalText = this.textContent;
                    this.textContent = 'Loading...';
                    this.disabled = true;
                    
                    setTimeout(() => {
                        this.textContent = originalText;
                        this.disabled = false;
                    }, 2000);
                }
            });
        });
    }
    
    // Lazy loading for images
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('opacity-0');
                        img.classList.add('opacity-100');
                        observer.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('opacity-0');
                img.classList.add('opacity-100');
            });
        }
    }
    
    // Utility function to show messages
    function showMessage(message, type = 'info') {
        const colors = {
            success: 'bg-green-100 border-green-400 text-green-700',
            error: 'bg-red-100 border-red-400 text-red-700',
            warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
            info: 'bg-blue-100 border-blue-400 text-blue-700'
        };
        
        const messageDiv = document.createElement('div');
        messageDiv.className = \`fixed top-4 right-4 p-4 border rounded-lg shadow-lg z-50 \${colors[type]} fade-in\`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
    
    // Add fade-in animation to elements as they come into view
    const observeElements = document.querySelectorAll('.card, .component, section');
    if (observeElements.length > 0 && 'IntersectionObserver' in window) {
        const fadeInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        });
        
        observeElements.forEach(el => fadeInObserver.observe(el));
    }
})();`
    );
}

function addDocumentation(zip: JSZip, settings: ProjectSettings) {
    zip.file(
        'README.md',
        `# ${settings.title}

${settings.description || 'Static HTML project with TailwindCSS'}

## 🚀 Quick Start

1. **Extract the files** to your desired location
2. **Open \`index.html\`** in your web browser
3. **That's it!** No build process required.

## 📁 Project Structure

\`\`\`
${settings.title.toLowerCase().replace(/\s+/g, '-')}-html/
├── index.html          # Main page
├── [other].html        # Additional pages (if any)
├── styles.css          # Custom CSS styles
├── script.js           # JavaScript functionality
└── README.md           # This file
\`\`\`

## ✨ Features

- **Pure HTML/CSS/JS** - No build process required
- **TailwindCSS via CDN** - Modern utility-first CSS framework
- **Responsive Design** - Mobile-first approach
- **Interactive Elements** - Mobile menu, smooth scrolling, form handling
- **Navigation Highlighting** - Active page highlighting
- **Cross-browser Compatible** - Works in all modern browsers
- **Print Friendly** - Optimized for printing

## 🌐 Deployment

### GitHub Pages
1. Create a new repository on GitHub
2. Upload all files to the repository
3. Go to Settings > Pages
4. Select "Deploy from a branch" and choose "main"
5. Your site will be available at \`https://username.github.io/repository-name\`

### Netlify
1. Drag and drop the entire folder to [Netlify Drop](https://app.netlify.com/drop)
2. Your site will be deployed instantly with a custom URL

### Any Web Server
Simply upload all files to your web server's public directory.

## 🎨 Customization

### Colors
Edit the CSS variables in \`styles.css\`:
\`\`\`css
:root {
    --primary-color: #3b82f6;
    --secondary-color: #6b7280;
    /* Add your custom colors */
}
\`\`\`

### TailwindCSS Config
Modify the Tailwind configuration in each HTML file's \`<script>\` tag:
\`\`\`javascript
tailwind.config = {
    theme: {
        extend: {
            // Your customizations
        }
    }
}
\`\`\`

## 📱 Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
`
    );

    // Add a simple license file
    zip.file(
        'LICENSE',
        `MIT License

Copyright (c) ${new Date().getFullYear()} ${settings.title}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`
    );
}

// Export function for creating different page configurations
export function createPageConfig(name: string, route: string, components: ComponentInstance[], title?: string): PageConfig {
    return {
        name,
        route,
        components,
        title,
    };
}

// Helper function for batch page creation
export function createMultiPageProject(
    components: ComponentInstance[],
    settings: ProjectSettings,
    pageGroups: { [pageName: string]: ComponentInstance[] }
): Promise<void> {
    const pages: PageConfig[] = Object.entries(pageGroups).map(([name, pageComponents]) =>
        createPageConfig(name, name === 'home' ? '/' : `/${name}`, pageComponents)
    );

    return exportHtmlProject(components, settings, pages);
}
