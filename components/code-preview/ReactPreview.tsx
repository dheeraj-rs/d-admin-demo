'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as Babel from '@babel/standalone';

// Error display component
const ErrorDisplay: React.FC<{ title: string; message: string }> = ({ title, message }) => (
    <div className="error-container p-4 border border-red-300 rounded bg-red-50">
        <p className="error-title font-bold text-red-500">{title}:</p>
        <pre className="error-message mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-60 text-sm">{message}</pre>
    </div>
);

// Loading indicator component
const LoadingIndicator: React.FC = () => (
    <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
);

// Define the types for our snippets
export interface Snippet {
    id: string;
    language: string;
    code: string;
    name?: string;
    version?: string;
}

export interface ReactPreviewProps {
    snippets: Snippet[];
    codeContent?: Record<string, string>;
    refreshKey?: number;
    css?: string;
    showDebugInfo?: boolean;
    showComponentTitles?: boolean;
}

const ReactPreview: React.FC<ReactPreviewProps> = ({
    snippets,
    codeContent = {},
    refreshKey = 0,
    css = '',
    showDebugInfo = false,
    showComponentTitles = false,
}) => {
    const [error, setError] = useState<string | null>(null);
    const [isCompiling, setIsCompiling] = useState(false);
    const [compiledComponents, setCompiledComponents] = useState<Record<string, React.ComponentType>>({});
    const [compiledCode, setCompiledCode] = useState<string>('');
    const [tailwindLoaded, setTailwindLoaded] = useState(false);

    // Generate a stable class name for scoping CSS
    const previewScopeClass = useMemo(() => {
        const snippetIds = snippets.map((s) => s.id).join('-');
        return `tw-scope-${snippetIds.replace(/[^a-zA-Z0-9-]/g, '')}`;
    }, [snippets]);

    // Reset states when refresh key changes
    useEffect(() => {
        setError(null);
        setIsCompiling(true);
        setCompiledComponents({});
        setCompiledCode('');

        const timer = setTimeout(() => setIsCompiling(false), 300);
        return () => clearTimeout(timer);
    }, [refreshKey]);

    // Load Tailwind CSS dynamically and scope it to our container
    useEffect(() => {
        // Check if Tailwind is already loaded with our scope
        const existingStyle = document.getElementById(`tailwind-for-${previewScopeClass}`);
        if (existingStyle) {
            setTailwindLoaded(true);
            return;
        }

        // Add a new scoped style element
        const styleEl = document.createElement('style');
        styleEl.id = `tailwind-for-${previewScopeClass}`;
        document.head.appendChild(styleEl);

        // Load Tailwind CSS and scope it
        fetch('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css')
            .then((response) => response.text())
            .then((css) => {
                // Scope all Tailwind classes to our container
                const scopedCss = css
                    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
                    .replace(/([^{}]*)({[^}]*})/g, (match, selector, rules) => {
                        // Skip @media and other non-class selectors
                        if (selector.trim().startsWith('@')) {
                            return match;
                        }
                        // Scope each selector to our container
                        const scopedSelector = selector
                            .split(',')
                            .map((s: string) => `.${previewScopeClass} ${s.trim()}`)
                            .join(',');
                        return `${scopedSelector}${rules}`;
                    });
                styleEl.textContent = scopedCss;
                setTailwindLoaded(true);
            })
            .catch((err) => {
                console.error('Failed to load Tailwind CSS:', err);
                setError('Failed to load Tailwind CSS');
            });

        return () => {
            // Clean up on unmount
            if (styleEl && styleEl.parentNode) {
                styleEl.parentNode.removeChild(styleEl);
            }
        };
    }, [previewScopeClass]);

    // Process imports and prepare code for evaluation
    const processReactCode = useCallback((code: string): string => {
        if (!code) return '';

        // Replace imports with comments (they're already available in the sandbox)
        let processedCode = code
            .replace(/import\s+React\s*,\s*{\s*([^}]+)\s*}\s+from\s+['"]react['"]/g, (_, hooks) => {
                const hooksArray = hooks.split(',').map((h: string) => h.trim());
                return `// React and ${hooksArray.join(', ')} are already available`;
            })
            .replace(/import\s+React\s+from\s+['"]react['"]/g, '// React is already available')
            .replace(/import\s+{\s*([^}]+)\s*}\s+from\s+['"]react['"]/g, (_, hooks) => {
                const hooksArray = hooks.split(',').map((h: string) => h.trim());
                return `// ${hooksArray.join(', ')} are already available`;
            })
            .replace(/import\s+.*from\s+['"].*['"]/g, '// Import removed for preview');

        // Handle default exports
        if (processedCode.includes('export default')) {
            processedCode = processedCode.replace('export default', 'const __export_default__ =');
        } else if (processedCode.includes('module.exports')) {
            processedCode = processedCode.replace('module.exports', 'const __export_default__ =');
        }

        return processedCode;
    }, []);

    // Safe component creation with fallback
    const createSafeComponent = useCallback((Component: any): React.ComponentType => {
        if (typeof Component === 'function') {
            // Ensure display name is set
            if (Component.displayName === undefined && Component.name) {
                Component.displayName = Component.name;
            }
            return Component;
        }

        if (React.isValidElement(Component)) {
            const ElementWrapper = () => Component;
            ElementWrapper.displayName = 'ElementWrapper';
            return ElementWrapper;
        }

        const InvalidComponent = () => <div className="p-4 text-red-500">Invalid component type: {typeof Component}</div>;
        InvalidComponent.displayName = 'InvalidComponent';
        return InvalidComponent;
    }, []);

    // Compile and evaluate the component
    const compileComponent = useCallback(
        (code: string, id: string) => {
            try {
                const processedCode = processReactCode(code);

                const transformed = Babel.transform(processedCode, {
                    presets: ['react', 'env'],
                    filename: 'preview.jsx',
                }).code;

                setCompiledCode((prev) => `${prev}\n\n// Component ${id}\n${transformed}`);

                // Create a more robust sandbox environment
                const mockElement = {
                    addEventListener: () => {},
                    removeEventListener: () => {},
                    setAttribute: () => {},
                    getAttribute: () => null,
                    style: {},
                    classList: {
                        add: () => {},
                        remove: () => {},
                        toggle: () => {},
                        contains: () => false,
                    },
                };

                const sandboxWindow = {
                    addEventListener: () => {},
                    removeEventListener: () => {},
                    innerWidth: 1024,
                    innerHeight: 768,
                    location: { href: 'http://localhost', pathname: '/', search: '', hash: '' },
                    history: {
                        pushState: () => {},
                        replaceState: () => {},
                        back: () => {},
                        forward: () => {},
                    },
                    localStorage: {
                        getItem: () => null,
                        setItem: () => {},
                        removeItem: () => {},
                    },
                    sessionStorage: {
                        getItem: () => null,
                        setItem: () => {},
                        removeItem: () => {},
                    },
                    scrollTo: () => {},
                    scroll: () => {},
                    requestAnimationFrame: (callback: Function) => setTimeout(callback, 0),
                    cancelAnimationFrame: (id: number) => clearTimeout(id),
                };

                const sandboxDocument = {
                    addEventListener: () => {},
                    removeEventListener: () => {},
                    createElement: () => ({ ...mockElement }),
                    createTextNode: () => ({ nodeValue: '' }),
                    querySelector: () => ({ ...mockElement }),
                    querySelectorAll: () => [],
                    getElementById: () => ({ ...mockElement }),
                    getElementsByClassName: () => [],
                    getElementsByTagName: () => [],
                    body: { ...mockElement, appendChild: () => {}, removeChild: () => {} },
                    head: { ...mockElement, appendChild: () => {}, removeChild: () => {} },
                    documentElement: { ...mockElement },
                    createEvent: () => ({
                        initEvent: () => {},
                    }),
                };

                const sandbox = {
                    React,
                    useState: React.useState,
                    useEffect: React.useEffect,
                    useRef: React.useRef,
                    useMemo: React.useMemo,
                    useCallback: React.useCallback,
                    useContext: React.useContext,
                    useReducer: React.useReducer,
                    useLayoutEffect: React.useLayoutEffect,
                    useImperativeHandle: React.useImperativeHandle,
                    useDebugValue: React.useDebugValue,
                    exports: {},
                    module: { exports: {} },
                    console: {
                        ...console,
                        error: (msg: any) => {
                            console.error(`Component ${id}:`, msg);
                        },
                    },
                    setTimeout,
                    clearTimeout,
                    setInterval,
                    clearInterval,
                    window: sandboxWindow,
                    document: sandboxDocument,
                    global: sandboxWindow,
                    self: sandboxWindow,
                };

                const evalFunc = new Function(
                    ...Object.keys(sandbox),
                    `
                "use strict";
                try {
                    ${transformed};
                    
                    if (typeof __export_default__ !== 'undefined') {
                        return { component: __export_default__ };
                    }
                    
                    if (typeof exports?.default === 'function') return { component: exports.default };
                    if (typeof module?.exports?.default === 'function') return { component: module.exports.default };
                    if (typeof module?.exports === 'function') return { component: module.exports };
                    
                    const DefaultComponent = () => React.createElement('div', null, '');
                    DefaultComponent.displayName = 'EmptyComponent';
                    return { component: DefaultComponent };
                } catch (e) {
                    console.error('Evaluation error:', e);
                    const ErrorComponent = () => React.createElement('div', null, \`Error: \${e.message}\`);
                    ErrorComponent.displayName = 'ErrorComponent';
                    return { component: ErrorComponent };
                }
                `
                );

                const result = evalFunc.apply(sandbox, Object.values(sandbox));
                return createSafeComponent(result.component);
            } catch (err) {
                console.error('Compilation error:', err);
                setError(err instanceof Error ? err.message : 'Unknown compilation error');
                const ErrorComponent = () => <div className="p-4 text-red-500">Compilation failed</div>;
                ErrorComponent.displayName = 'CompilationError';
                return ErrorComponent;
            }
        },
        [processReactCode, createSafeComponent]
    );

    // Convert language 'react' to 'javascript' for compatibility
    const normalizeLanguage = useCallback((snippet: Snippet): string => {
        return snippet.language === 'react' ? 'javascript' : snippet.language;
    }, []);

    // Main effect to handle code changes
    useEffect(() => {
        if (isCompiling || !tailwindLoaded) return;

        const reactSnippets = snippets.filter((snippet) => {
            const normalizedLanguage = normalizeLanguage(snippet);
            const code = codeContent[snippet.id] || snippet.code || '';

            return ['javascript', 'jsx', 'tsx', 'typescript'].includes(normalizedLanguage) && code.trim().length > 0;
        });

        if (reactSnippets.length === 0) {
            const NoReactCodeFound = () => <div className="p-4 text-gray-500">No React code found</div>;
            NoReactCodeFound.displayName = 'NoReactCodeFound';

            setCompiledComponents((prev) => ({
                ...prev,
                default: NoReactCodeFound,
            }));
            return;
        }

        setIsCompiling(true);
        try {
            const newComponents: Record<string, React.ComponentType> = {};

            for (const snippet of reactSnippets) {
                const reactCode = codeContent[snippet.id] || snippet.code || '';

                if (!reactCode.trim()) continue;

                const component = compileComponent(reactCode, snippet.id);
                newComponents[snippet.id] = component;
            }

            setCompiledComponents(newComponents);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsCompiling(false);
        }
    }, [snippets, codeContent, isCompiling, compileComponent, normalizeLanguage, tailwindLoaded]);

    // Wrap each component renderer in a function that applies the scoped class
    const wrapComponent = useCallback((Component: React.ComponentType) => {
        const WrappedComponent = () => <Component />;
        WrappedComponent.displayName = 'WrappedComponent';
        return WrappedComponent;
    }, []);

    // Render the compiled components
    const renderPreview = useMemo(() => {
        if (!tailwindLoaded || isCompiling) {
            return <LoadingIndicator />;
        }

        if (error) {
            return <ErrorDisplay title="Compilation Error" message={error} />;
        }

        if (Object.keys(compiledComponents).length === 0) {
            const NoComponentsDisplay = () => <div className="p-4 text-gray-500">No components to display</div>;
            NoComponentsDisplay.displayName = 'NoComponentsDisplay';
            return <NoComponentsDisplay />;
        }

        try {
            // Custom CSS for the preview
            const customStyles = `
                .${previewScopeClass} {
                    /* Reset box sizing to content-box to prevent layout issues */
                    all: initial;
                    * {
                        box-sizing: border-box;
                    }
                    /* Override any conflicting global styles */
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    line-height: 1.5;
                    color: #333;
                }
                .${previewScopeClass} .react-content {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                .${previewScopeClass} .component-container {
                    width: 100%;
                }
                ${css}
            `;

            return (
                <div className={previewScopeClass} style={{ width: '100%', minHeight: '50px' }}>
                    <style>{customStyles}</style>
                    <div className="react-content">
                        {Object.entries(compiledComponents).map(([id, Component]) => (
                            <div key={id} className="component-container">
                                {showComponentTitles && <div className="component-title text-sm text-gray-500 mb-2">Component: {id}</div>}
                                <Component />
                            </div>
                        ))}
                    </div>
                    {showDebugInfo && (
                        <details className="mt-4 text-xs">
                            <summary className="cursor-pointer">Debug Info</summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">{compiledCode}</pre>
                        </details>
                    )}
                </div>
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown rendering error';
            return <ErrorDisplay title="Rendering Error" message={errorMessage} />;
        }
    }, [isCompiling, compiledComponents, error, previewScopeClass, css, compiledCode, showDebugInfo, showComponentTitles, tailwindLoaded]);

    return <div className="react-preview-wrapper">{renderPreview}</div>;
};

export default ReactPreview;
