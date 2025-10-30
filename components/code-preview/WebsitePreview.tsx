import React, { useState } from 'react';

interface ComponentObject {
    id: string;
    name: string;
    type: string;
    language: string;
    version: string;
    props: Record<string, string | number | boolean>;
    snippet: string;
    styles?: string;
    script?: string;
}

interface HtmlPreviewProps {
    components?: ComponentObject[];
    component?: ComponentObject;
    refreshKey?: number;
    previewScope?: string;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center h-full mt-3">
        <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
    </div>
);

const WebsitePreview: React.FC<HtmlPreviewProps> = ({
    components = [],
    component,
    previewScope = 'editor-preview-content'
}) => {
    console.log('component :', component);
    console.log(' :', component);
    const [isCompiling, setIsCompiling] = useState(false);
    const [compiledCss, setCompiledCss] = useState<string>('');
    const [jsError, setJsError] = useState<string | null>(null);

    const componentsToProcess = React.useMemo(() => {
        if (component) {
            return [component];
        }
        return components;
    }, [component, components]);

    const componentId = React.useMemo(() => {
        return component?.id || components.map(c => c.id).join('-');
    }, [component?.id, components]);

    const removeFixedClasses = React.useCallback((content: string): string => {
        const isSingleItemPreview = Boolean(component) || components.length === 1;
        if (!isSingleItemPreview) {
            return content;
        }
        content = content.replace(
            /class\s*=\s*["']([^"']*)["']/g,
            (match, classString) => {
                const updatedClasses = classString
                    .split(/\s+/)
                    .filter((cls: string) => cls !== 'fixed')
                    .join(' ');
                return `class="${updatedClasses}"`;
            }
        );
        content = content.replace(
            /className\s*=\s*["']([^"']*)["']/g,
            (match, classString) => {
                const updatedClasses = classString
                    .split(/\s+/)
                    .filter((cls: string) => cls !== 'fixed')
                    .join(' ');
                return `className="${updatedClasses}"`;
            }
        );
        content = content.replace(
            /class\s*=\s*\{[^}]*`([^`]*)`[^}]*\}/g,
            (match, templateString) => {
                const updatedTemplate = templateString
                    .split(/\s+/)
                    .filter((cls: string) => cls !== 'fixed')
                    .join(' ');
                return match.replace(templateString, updatedTemplate);
            }
        );
        content = content.replace(/\bposition\s*:\s*fixed\s*;?/gi, 'position: relative;');
        return content;
    }, [components.length, component]);

    const processSnippetWithProps = React.useCallback((snippet: string, props: Record<string, string | number | boolean>): string => {
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

    const containsFixedClasses = React.useCallback((content: string): boolean => {
        const fixedClassPatterns = [
            /\bfixed\b/,
            /class\s*=\s*["'][^"']*\bfixed\b[^"']*["']/,
            /className\s*=\s*["'][^"']*\bfixed\b[^"']*["']/,
            /class\s*=\s*\{[^}]*\bfixed\b[^}]*\}/,
            /className\s*=\s*\{[^}]*\bfixed\b[^}]*\}/
        ];
        return fixedClassPatterns.some(pattern => pattern.test(content));
    }, []);

    const compileSassToCSS = React.useCallback((sassCode: string): string => {
        try {
            let css = sassCode;
            css = css.replace(/(\.[a-zA-Z-_]+)\s*\{([^{}]*&[^{}]*)\}/g, (match, selector, content) => {
                let result = '';
                const lines = content.split('\n');
                const mainStyles: string[] = [];
                const nestedRules: string[] = [];
                lines.forEach((line: string) => {
                    line = line.trim();
                    if (line.includes('&')) {
                        const parts = line.split('{');
                        if (parts.length >= 2) {
                            const nestedSelector = parts[0].replace('&', '').trim();
                            const nestedStyle = parts[1].replace('}', '').trim();
                            nestedRules.push(`${selector}${nestedSelector} { ${nestedStyle} }`);
                        }
                    } else if (line && !line.includes('{') && !line.includes('}')) {
                        mainStyles.push(line);
                    }
                });
                if (mainStyles.length > 0) {
                    result += `${selector} {\n  ${mainStyles.join('\n  ')}\n}\n`;
                }
                result += nestedRules.join('\n') + '\n';
                return result;
            });
            return css;
        } catch (error) {
            console.warn('SASS compilation failed, using as CSS:', error);
            return sassCode;
        }
    }, []);

    const compileTypeScriptToJS = React.useCallback((tsCode: string): string => {
        try {
            let js = tsCode;
            js = js.replace(/interface\s+\w+\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, '');
            js = js.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
            js = js.replace(/(\w+)\s*:\s*[a-zA-Z<>\[\]|&\s_{}.,]+(?=\s*[,)=])/g, '$1');
            js = js.replace(/\)\s*:\s*[a-zA-Z<>\[\]|&\s_{}.,]+(?=\s*[{=>;])/g, ')');
            js = js.replace(/(let|const|var)\s+(\w+)\s*:\s*[a-zA-Z<>\[\]|&\s_{}.,]+\s*=/g, '$1 $2 =');
            js = js.replace(/\s+as\s+[a-zA-Z<>\[\]|&\s_{}.,]+/g, '');
            js = js.replace(/<[a-zA-Z<>\[\]|&\s_{}.,]*>/g, '');
            js = js.replace(/\?\s*:/g, ':');
            js = js.replace(/:\s*\w+\s*\|[^=;,)}\]]+/g, '');
            return js;
        } catch (error) {
            console.warn('TypeScript compilation failed, using as JavaScript:', error);
            return tsCode;
        }
    }, []);

    const convertReactToHTML = React.useCallback(
        (reactCode: string, props: Record<string, string | number | boolean>): string => {
            try {
                let processed = processSnippetWithProps(reactCode, props);
                if (processed.includes('return (') || processed.includes('return<') || processed.includes('=>(') || processed.includes('=><')) {
                    const jsxMatch =
                        processed.match(/return\s*\(([^]*?)\)/m) ||
                        processed.match(/return\s*(<[^]*?)/m) ||
                        processed.match(/=>\s*\(([^]*?)\)/m) ||
                        processed.match(/=>\s*(<[^]*?)/m);
                    if (jsxMatch) {
                        processed = jsxMatch[1] || jsxMatch[0];
                    }
                }
                processed = processed
                    .replace(/className=/g, 'class=')
                    .replace(/htmlFor=/g, 'for=')
                    .replace(/onClick=/g, 'onclick=')
                    .replace(/onChange=/g, 'onchange=')
                    .replace(/<React\.Fragment>/g, '')
                    .replace(/<\/React\.Fragment>/g, '')
                    .replace(/<>/g, '')
                    .replace(/<\/>/g, '');
                return processed;
            } catch (error) {
                console.warn('React to HTML conversion failed:', error);
                return reactCode;
            }
        },
        [processSnippetWithProps]
    );

    const processContent = React.useCallback(
        (component: ComponentObject) => {
            const { snippet, styles, script, language, props = {} } = component;
            let processedHTML = '';
            let processedCSS = '';
            let processedJS = '';
            if (snippet) {
                const lowerLang = (language || '').toLowerCase();
                let snippetContent = snippet.trim();
                snippetContent = removeFixedClasses(snippetContent);
                if (
                    lowerLang === 'react' ||
                    lowerLang === 'jsx' ||
                    lowerLang === 'tsx' ||
                    snippetContent.includes('React') ||
                    snippetContent.includes('jsx') ||
                    snippetContent.includes('return (') ||
                    snippetContent.includes('=>(')
                ) {
                    processedHTML = convertReactToHTML(snippetContent, props);
                } else {
                    processedHTML = processSnippetWithProps(snippetContent, props);
                }
                processedHTML = processedHTML.replace(/className=/g, 'class=');
            }
            if (styles) {
                let stylesContent = styles.trim();
                stylesContent = removeFixedClasses(stylesContent);
                if (stylesContent.includes('&') || stylesContent.includes('$') || stylesContent.includes('@mixin') || stylesContent.includes('@include')) {
                    processedCSS = compileSassToCSS(stylesContent);
                } else {
                    processedCSS = stylesContent;
                }
            }

            // Process script
            if (script) {
                const scriptContent = script.trim();
                if (
                    scriptContent.includes(': ') &&
                    (scriptContent.includes('interface') || scriptContent.includes('type ') || (scriptContent.includes('<') && scriptContent.includes('>')))
                ) {
                    processedJS = compileTypeScriptToJS(scriptContent);
                } else {
                    processedJS = scriptContent;
                }
            }

            return {
                html: processedHTML,
                css: processedCSS,
                js: processedJS,
            };
        },
        [processSnippetWithProps, convertReactToHTML, compileSassToCSS, compileTypeScriptToJS, removeFixedClasses]
    );

    const combinedContent = React.useMemo(() => {
        let combinedHtml = '';
        let combinedCss = '';
        let combinedJs = '';
        const hasFixedPositioning = componentsToProcess.some((c) => {
            const allContent = `${c.snippet || ''} ${c.styles || ''}`;
            return containsFixedClasses(allContent) || /position\s*:\s*fixed/.test(allContent);
        });
        componentsToProcess.forEach((componentItem) => {
            const processed = processContent(componentItem);
            if (processed.html) {
                combinedHtml += processed.html + '\n';
            }
            if (processed.css) {
                combinedCss += processed.css + '\n';
            }
            if (processed.js) {
                const elementIdMatches = processed.js.match(/getElementById\(['"`]([^'"`]+)['"`]\)/g);
                const elementIds = elementIdMatches ? elementIdMatches.map(match => {
                    const idMatch = match.match(/getElementById\(['"`]([^'"`]+)['"`]\)/);
                    return idMatch ? idMatch[1] : null;
                }).filter(Boolean) : [];
                const hasGlobalFunctions =
                    processed.js.includes('function ') &&
                    (processed.html.includes('onclick=') || processed.html.includes('onchange=') || processed.html.includes('oninput='));
                let wrappedScript = '';
                if (hasGlobalFunctions) {
                    wrappedScript = `
                        try {
                            // Component ${componentItem.name} script - Global scope for HTML handlers
                            function executeScript_${componentItem.id.replace(/[^a-zA-Z0-9]/g, '_')}() {
                                ${processed.js}
                            }
                            
                            function waitForElements_${componentItem.id.replace(/[^a-zA-Z0-9]/g, '_')}() {
                                ${elementIds.length > 0 ? `
                                const requiredIds = ${JSON.stringify(elementIds)};
                                const missingElements = requiredIds.filter(id => !document.getElementById(id));
                                
                                if (missingElements.length === 0) {
                                    executeScript_${componentItem.id.replace(/[^a-zA-Z0-9]/g, '_')}();
                                } else {
                                    setTimeout(waitForElements_${componentItem.id.replace(/[^a-zA-Z0-9]/g, '_')}, 50);
                                }
                                ` : `
                                executeScript_${componentItem.id.replace(/[^a-zA-Z0-9]/g, '_')}();
                                `}
                            }
                            setTimeout(waitForElements_${componentItem.id.replace(/[^a-zA-Z0-9]/g, '_')}, 100);
                        } catch(e) {
                            console.error('Error in component "${componentItem.name}" script:', e);
                            console.error('Script content:', ${JSON.stringify(processed.js)});
                        }
                    `;
                } else {
                    wrappedScript = `
                        try {
                            // Component ${componentItem.name} script - Contained scope
                            (function(window, document) {
                                function executeScript() {
                                    ${processed.js}
                                }
                                function waitForElements() {
                                    ${elementIds.length > 0 ? `
                                    const requiredIds = ${JSON.stringify(elementIds)};
                                    const missingElements = requiredIds.filter(id => !document.getElementById(id));
                                    
                                    if (missingElements.length === 0) {
                                        executeScript();
                                    } else {
                                        setTimeout(waitForElements, 50);
                                    }
                                    ` : `
                                    executeScript();
                                    `}
                                }
                                setTimeout(waitForElements, 100);
                            })(window, document);
                        } catch(e) {
                            console.error('Error in component "${componentItem.name}" script:', e);
                            console.error('Script content:', ${JSON.stringify(processed.js)});
                        }
                    `;
                }
                combinedJs += wrappedScript + '\n';
            }
        });

        // Minimal responsive utilities for dynamic HTML (no CDN, scoped)
        const generateMinimalTailwindCss = (html: string): string => {
            const classRegex = /class\s*=\s*["']([^"']+)["']/g;
            const tokens = new Set<string>();
            let match: RegExpExecArray | null;
            while ((match = classRegex.exec(html)) !== null) {
                match[1].split(/\s+/).forEach((t) => tokens.add(t));
            }
            const esc = (c: string) => c.replace(/:/g, '\\:').replace(/\//g, '\\/');
            const scope = `.${previewScope}-content`;
            const lines: string[] = [];
            // Base display/positioning commonly used
            const baseMap: Record<string, string> = {
                'hidden': 'display: none !important;',
                'flex': 'display: flex !important;',
                'inline-flex': 'display: inline-flex !important;',
                'block': 'display: block !important;',
                'grid': 'display: grid !important;',
                'items-center': 'align-items: center !important;',
                'justify-between': 'justify-content: space-between !important;',
                'justify-center': 'justify-content: center !important;',
            };
            Object.entries(baseMap).forEach(([cls, css]) => {
                if (tokens.has(cls)) lines.push(`${scope} .${esc(cls)} { ${css} }`);
            });
            // Spacing utilities used in nav examples
            const spaceMap: Record<string, string> = {
                'space-x-6': '1.5rem',
                'space-x-8': '2rem',
            };
            Object.entries(spaceMap).forEach(([cls, gap]) => {
                if (tokens.has(cls)) {
                    lines.push(`${scope} .${esc(cls)} > :not([hidden]) ~ :not([hidden]) { margin-left: ${gap} !important; }`);
                }
            });
            // Responsive display utilities
            const breakpoints: Record<string, number> = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 };
            const responsiveUtils = ['flex', 'inline-flex', 'block', 'grid', 'hidden'];
            Object.entries(breakpoints).forEach(([bp, min]) => {
                const respLines: string[] = [];
                responsiveUtils.forEach((u) => {
                    const token = `${bp}:${u}`;
                    if (tokens.has(token)) {
                        const value = u === 'hidden' ? 'none' : u.replace('inline-', 'inline-');
                        const display = u === 'hidden' ? 'none' : (u === 'grid' ? 'grid' : (u === 'inline-flex' ? 'inline-flex' : (u === 'block' ? 'block' : 'flex')));
                        respLines.push(`${scope} .${esc(token)} { display: ${display} !important; }`);
                    }
                });
                // spacing responsive (e.g., lg:space-x-8)
                Object.entries(spaceMap).forEach(([cls, gap]) => {
                    const token = `${bp}:${cls}`;
                    if (tokens.has(token)) {
                        respLines.push(`${scope} .${esc(token)} > :not([hidden]) ~ :not([hidden]) { margin-left: ${gap} !important; }`);
                    }
                });
                if (respLines.length > 0) {
                    lines.push(`@media (min-width: ${min}px) { ${respLines.join(' ')} }`);
                }
            });
            // Peer checked minimal support for mobile menu toggles
            if (html.includes('peer-checked:')) {
                lines.push(`${scope} .peer:checked ~ .peer-checked\\:opacity-100 { opacity: 1 !important; }`);
                lines.push(`${scope} .peer:checked ~ .peer-checked\\:visible { visibility: visible !important; }`);
                lines.push(`${scope} .peer:checked ~ .peer-checked\\:translate-y-0 { transform: translateY(0) !important; }`);
            }
            // Backdrop blur utility (commonly used for header)
            if (tokens.has('backdrop-blur-lg')) {
                lines.push(`${scope} .backdrop-blur-lg { -webkit-backdrop-filter: blur(16px) !important; backdrop-filter: blur(16px) !important; }`);
            }
            return lines.join('\n');
        };

        const minimalCss = generateMinimalTailwindCss(combinedHtml);
        const previewFixCSS = `
                .${previewScope}-content {
                    position: relative;
                    overflow-x: auto;
                    min-height: auto;
                    height: auto;
                }
                /* Ensure components display at natural height */
                .${previewScope}-content > * {
                    margin-bottom: 1rem;
                }
                /* Remove excessive spacing for multiple components */
                .${previewScope}-content > *:last-child {
                    margin-bottom: 0;
                }
                ${hasFixedPositioning ? `
                /* Keep fixed navbars visible within the preview area */
                .${previewScope}-content .fixed.top-0,
                .${previewScope}-content nav.fixed,
                .${previewScope}-content header.fixed {
                    position: sticky !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    width: 100% !important;
                    z-index: 50 !important;
                    -webkit-backdrop-filter: blur(16px);
                    backdrop-filter: blur(16px);
                }
                
                /* Bottom fixed elements */
                .${previewScope}-content .fixed.bottom-0 {
                    position: sticky !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    width: 100% !important;
                    z-index: 50 !important;
                }
                ` : ''}
                ${minimalCss}
        `;
        combinedCss = previewFixCSS + '\n' + combinedCss;
        return {
            html: combinedHtml.trim(),
            css: combinedCss.trim(),
            js: combinedJs.trim(),
            hasJs: !!combinedJs.trim(),
            hasCss: !!combinedCss.trim(),
            hasFixedPositioning,
        };
    }, [componentsToProcess, processContent, previewScope, containsFixedClasses]);

    // Check if single component has fixed positioning
    const showFixedIndicator = React.useMemo(() => {
        if (componentsToProcess.length !== 1) return false;
        const singleComponent = componentsToProcess[0];
        const allContent = `${singleComponent.snippet || ''} ${singleComponent.styles || ''}`;
        return containsFixedClasses(allContent);
    }, [componentsToProcess, containsFixedClasses]);

    React.useEffect(() => {
        if (componentsToProcess.length > 0) {
            setIsCompiling(true);
            // Simulate compilation time
            const timer = setTimeout(() => {
                setIsCompiling(false);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setIsCompiling(false);
        }
    }, [componentId, componentsToProcess.length]);

    // No extra scoped preview styles; rely on global Tailwind in the app

    React.useEffect(() => {
        if (combinedContent.hasCss) {
            setCompiledCss(combinedContent.css);
        } else {
            setCompiledCss('');
        }
    }, [combinedContent.css, combinedContent.hasCss]);

    React.useEffect(() => {
        if (combinedContent.hasJs && combinedContent.html) {
            const executeJsTimer = setTimeout(() => {
                try {
                    setJsError(null);
                    const htmlContainer = document.getElementById('html-preview-container');
                    if (htmlContainer) {
                        const existingScripts = htmlContainer.querySelectorAll('script[data-component-script]');
                        existingScripts.forEach((script) => script.remove());
                        const scriptElement = document.createElement('script');
                        scriptElement.type = 'text/javascript';
                        scriptElement.setAttribute('data-component-script', 'true');
                        scriptElement.textContent = combinedContent.js;
                        scriptElement.onerror = (error) => {
                            console.error('Script execution failed:', error);
                            setJsError(`Script execution failed: ${error}`);
                        };
                        const originalErrorHandler = window.onerror;
                        window.onerror = (message, source, lineno, colno, error) => {
                            if (source && (source.includes('data-component-script') || source.includes('VM'))) {
                                console.error('Component script runtime error:', message);
                                setJsError(`Runtime error: ${message}`);
                                return true;
                            }
                            return originalErrorHandler ? originalErrorHandler(message, source, lineno, colno, error) : false;
                        };
                        htmlContainer.appendChild(scriptElement);
                        console.log('Script injected successfully');
                    }
                } catch (error) {
                    console.error('JavaScript execution error:', error);
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    setJsError(errorMessage);
                }
            }, 300);
            return () => clearTimeout(executeJsTimer);
        } else {
            setJsError(null);
        }
    }, [combinedContent.js, combinedContent.hasJs, combinedContent.html, componentId]);

    if (isCompiling && componentsToProcess.length > 0) {
        return <LoadingIndicator />;
    }

    if (componentsToProcess.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <div className="text-gray-400 text-lg mb-2">📋</div>
                    <p className="text-gray-500">No component to preview</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Pass a component object or components array to see the preview
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`html-preview ${previewScope}`} style={{ position: 'relative' }}>
            {compiledCss && <style dangerouslySetInnerHTML={{ __html: compiledCss }} />}

            {/* Fixed Position Indicator - Only show for single component with fixed positioning */}
            {showFixedIndicator && (
                <div
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        zIndex: 1000,
                        boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)'
                    }}
                    title="Fixed positioning removed for preview"
                />
            )}

            <div
                id="html-preview-container"
                className={`html-content ${previewScope}-content`}
            >
                <div
                    className="preview-viewport"
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: 'max-content',
                        minHeight: '100%',
                        overflow: 'auto',
                        transform: 'translateZ(0)',
                    }}
                    dangerouslySetInnerHTML={{ __html: combinedContent.html }}
                />
            </div>

            {jsError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                    <strong className="text-red-700">JavaScript Runtime Error:</strong>
                    <div className="text-red-600 text-sm mt-1">{jsError}</div>
                </div>
            )}

        </div>
    );
};

export default WebsitePreview;