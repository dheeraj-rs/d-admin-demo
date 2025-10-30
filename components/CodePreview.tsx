import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import '../app/globals.css';

interface ComponentData {
    id: string;
    name: string;
    type: string;
    snippet: string;
    language: string;
    version: string;
    props: Record<string, any>;
    styles?: string;
    script?: string;
}

interface CodePreviewProps {
    components: ComponentData[];
    className?: string;
    previewScope?: string;
    isolated?: boolean;
    iframeHeight?: string;
    includeTailwind?: boolean;
    tailwindCDN?: string;
    customCSS?: string;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center h-32">
        <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
            <p className="text-xs text-gray-500">Loading preview...</p>
        </div>
    </div>
);

const CodePreview: React.FC<CodePreviewProps> = ({
    components,
    className = '',
    previewScope = 'code-preview',
    isolated = true,
    iframeHeight = '400px',
    includeTailwind = true,
    tailwindCDN = 'https://cdn.tailwindcss.com',
    customCSS = ''
}) => {
    console.log('components :', components);
    const [isLoading, setIsLoading] = useState(false);
    const [previewKey, setPreviewKey] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Process template literals with props
    const processSnippetWithProps = useCallback((snippet: string, props: Record<string, any>): string => {
        let processed = snippet;
        Object.keys(props).forEach((propName) => {
            const regex1 = new RegExp(`\\$\\{${propName}\\}`, 'g');
            const regex2 = new RegExp(`\\{${propName}\\}`, 'g');
            const propValue = String(props[propName] || '');
            processed = processed.replace(regex1, propValue);
            processed = processed.replace(regex2, propValue);
        });
        return processed;
    }, []);

    // Convert React/JSX to HTML
    const convertReactToHTML = useCallback((reactCode: string): string => {
        try {
            let processed = reactCode;

            // Extract JSX from React component
            if (processed.includes('return (') || processed.includes('return<') ||
                processed.includes('=>(') || processed.includes('=><')) {
                const jsxMatch =
                    processed.match(/return\s*\(([^]*?)\)/m) ||
                    processed.match(/return\s*(<[^]*?)/m) ||
                    processed.match(/=>\s*\(([^]*?)\)/m) ||
                    processed.match(/=>\s*(<[^]*?)/m);

                if (jsxMatch) {
                    processed = jsxMatch[1] || jsxMatch[0];
                }
            }

            // Convert JSX to HTML
            processed = processed
                .replace(/className=/g, 'class=')
                .replace(/htmlFor=/g, 'for=')
                .replace(/onClick=/g, 'onclick=')
                .replace(/onChange=/g, 'onchange=')
                .replace(/onInput=/g, 'oninput=')
                .replace(/strokeWidth=/g, 'stroke-width=')
                .replace(/strokeLinecap=/g, 'stroke-linecap=')
                .replace(/strokeLinejoin=/g, 'stroke-linejoin=')
                .replace(/<React\.Fragment>/g, '')
                .replace(/<\/React\.Fragment>/g, '')
                .replace(/<>/g, '')
                .replace(/<\/>/g, '');

            return processed;
        } catch (error) {
            console.warn('React to HTML conversion failed:', error);
            return reactCode;
        }
    }, []);

    // Extract Tailwind classes from the parent document
    const extractTailwindStyles = useCallback((): string => {
        if (typeof window === 'undefined') return '';

        try {
            const styleSheets = Array.from(document.styleSheets);
            let tailwindCSS = '';

            styleSheets.forEach(sheet => {
                try {
                    const rules = Array.from(sheet.cssRules || sheet.rules || []);
                    rules.forEach(rule => {
                        if (rule.cssText && (
                            rule.cssText.includes('--tw-') ||
                            rule.cssText.includes('.') && (
                                rule.cssText.includes('flex') ||
                                rule.cssText.includes('grid') ||
                                rule.cssText.includes('text-') ||
                                rule.cssText.includes('bg-') ||
                                rule.cssText.includes('border-') ||
                                rule.cssText.includes('p-') ||
                                rule.cssText.includes('m-') ||
                                rule.cssText.includes('w-') ||
                                rule.cssText.includes('h-') ||
                                rule.cssText.includes('rounded') ||
                                rule.cssText.includes('shadow')
                            )
                        )) {
                            tailwindCSS += rule.cssText + '\n';
                        }
                    });
                } catch (e) {
                    // Skip stylesheets that can't be accessed (CORS)
                }
            });

            return tailwindCSS;
        } catch (error) {
            console.warn('Failed to extract Tailwind styles:', error);
            return '';
        }
    }, []);

    // Process components and combine content for iframe
    const iframeContent = useMemo(() => {
        let combinedHTML = '';
        let combinedCSS = '';
        let combinedJS = '';

        components.forEach((component) => {
            // Process HTML
            let processedHTML = processSnippetWithProps(component.snippet, component.props || {});

            // Handle React/JSX content
            const lowerLang = component.language.toLowerCase();
            if (lowerLang === 'react' || lowerLang === 'jsx' || lowerLang === 'tsx' ||
                processedHTML.includes('React') || processedHTML.includes('return (')) {
                processedHTML = convertReactToHTML(processedHTML);
            }

            combinedHTML += processedHTML;

            // Add component styles
            if (component.styles) {
                combinedCSS += component.styles + '\n';
            }

            // Add component scripts
            if (component.script) {
                combinedJS += `
                    try {
                        ${component.script}
                    } catch(e) {
                        console.error('Script error in ${component.name}:', e);
                    }
                `;
            }
        });

        // Get Tailwind styles
        const extractedTailwindCSS = includeTailwind ? extractTailwindStyles() : '';

        // Create complete HTML document for iframe
        const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Preview</title>
    ${includeTailwind ? `<script src="${tailwindCDN}"></script>` : ''}
    <style>
        /* Reset styles to avoid inheritance */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            padding: 16px;
        }
        
        /* Extracted Tailwind styles */
        ${extractedTailwindCSS}
        
        /* Custom CSS */
        ${customCSS}
        
        /* Component styles */
        ${combinedCSS}
        
        /* Common Tailwind utility classes if extraction fails */
        ${!extractedTailwindCSS ? `
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .text-center { text-align: center; }
        .p-4 { padding: 1rem; }
        .p-8 { padding: 2rem; }
        .m-4 { margin: 1rem; }
        .rounded { border-radius: 0.25rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .bg-white { background-color: #ffffff; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .bg-blue-500 { background-color: #3b82f6; }
        .text-white { color: #ffffff; }
        .text-gray-800 { color: #1f2937; }
        .border { border-width: 1px; }
        .border-gray-300 { border-color: #d1d5db; }
        .shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); }
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        ` : ''}
    </style>
    ${includeTailwind ? `
    <script>
        // Configure Tailwind for the iframe
        if (typeof tailwind !== 'undefined') {
            tailwind.config = {
                darkMode: 'class',
                theme: {
                    extend: {}
                }
            };
        }
    </script>
    ` : ''}
</head>
<body>
    ${combinedHTML}
    
    ${combinedJS ? `<script>
        ${combinedJS}
    </script>` : ''}
</body>
</html>`;

        return htmlDocument;
    }, [components, processSnippetWithProps, convertReactToHTML, includeTailwind, tailwindCDN, customCSS, extractTailwindStyles]);

    // Handle loading state
    useEffect(() => {
        if (components.length > 0) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                setIsLoading(false);
                setPreviewKey(prev => prev + 1);
            }, 500); // Increased timeout for Tailwind to load
            return () => clearTimeout(timer);
        }
    }, [components]);

    // Update iframe content
    useEffect(() => {
        if (iframeRef.current && iframeContent && !isLoading) {
            const iframe = iframeRef.current;

            // Set up iframe load handler
            const handleIframeLoad = () => {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                    iframeDoc.open();
                    iframeDoc.write(iframeContent);
                    iframeDoc.close();
                }
            };

            if (iframe.contentDocument?.readyState === 'complete') {
                handleIframeLoad();
            } else {
                iframe.onload = handleIframeLoad;
            }
        }
    }, [iframeContent, isLoading, previewKey]);

    // Non-isolated fallback (original behavior with Tailwind support)
    const renderDirectPreview = () => {
        let combinedHTML = '';
        let combinedCSS = '';

        components.forEach((component) => {
            let processedHTML = processSnippetWithProps(component.snippet, component.props || {});

            const lowerLang = component.language.toLowerCase();
            if (lowerLang === 'react' || lowerLang === 'jsx' || lowerLang === 'tsx' ||
                processedHTML.includes('React') || processedHTML.includes('return (')) {
                processedHTML = convertReactToHTML(processedHTML);
            }

            combinedHTML += `<div class="component-wrapper">${processedHTML}</div>`;

            if (component.styles) {
                combinedCSS += component.styles + '\n';
            }
        });

        return (
            <div className={`${previewScope}-container ${className}`}>
                {combinedCSS && (
                    <style dangerouslySetInnerHTML={{ __html: combinedCSS }} />
                )}
                {customCSS && (
                    <style dangerouslySetInnerHTML={{ __html: customCSS }} />
                )}
                <div dangerouslySetInnerHTML={{ __html: combinedHTML }} />
            </div>
        );
    };

    // Show loading state
    if (isLoading && components.length > 0) {
        return <LoadingIndicator />;
    }

    // Show empty state
    if (components.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <div className="text-gray-400 text-lg mb-2">📋</div>
                    <p className="text-gray-500">No components to preview</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Add components to see the preview
                    </p>
                </div>
            </div>
        );
    }

    // Render iframe or direct preview based on isolated prop
    if (isolated) {
        return (
            <div className={`preview-container ${className}`} key={previewKey}>
                <iframe
                    ref={iframeRef}
                    className="w-full border-0 bg-white rounded-lg"
                    style={{
                        height: iframeHeight,
                        minHeight: '200px'
                    }}
                    title="Component Preview"
                    sandbox="allow-scripts allow-same-origin"
                />
            </div>
        );
    }

    return renderDirectPreview();
};

export default CodePreview;