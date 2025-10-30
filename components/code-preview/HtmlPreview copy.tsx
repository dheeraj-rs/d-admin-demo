import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { getPreviewStyles } from './styles';
import './HtmlPreview.scss';

interface Snippet {
    _id?: string | undefined;
    language: string;
    code: string;
    version?: string;
    id?: string;
    name?: string;
}

interface HtmlPreviewProps {
    snippets?: Snippet[];
    codeContent?: Record<string, string>;
    refreshKey?: number;
    enableTailwind?: boolean;
    tailwindVersion?: string;
    htmlString?: string | undefined;
    cssString?: string;
    jsString?: string;
    previewScope?: string;
}

const LoadingIndicator: React.FC = () => (
    <div className="html-preview-loading">
        <div className="html-preview-loading-content">
            <div className="html-preview-loading-spinner"></div>
        </div>
    </div>
);

const HtmlPreview: React.FC<HtmlPreviewProps> = ({
    snippets = [],
    codeContent = {},
    refreshKey = 0,
    enableTailwind = true,
    htmlString,
    cssString,
    jsString,
    previewScope,
}) => {
    const [isCompiling, setIsCompiling] = useState(false);
    const [htmlPreviewKey, setHtmlPreviewKey] = useState(0);
    const [compiledCss, setCompiledCss] = useState<string>('');
    const [cssCompileError, setCssCompileError] = useState<string | null>(null);
    const [jsError, setJsError] = useState<string | null>(null);
    const [tailwindLoaded, setTailwindLoaded] = useState(false);
    const [iframeContent, setIframeContent] = useState<string>('');
    const [iframeHeight, setIframeHeight] = useState<number>(600);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const prevCodeContent = useRef<Record<string, string>>({});
    const prevCompiledCss = useRef<string>('');
    const prevStringContent = useRef<{ html?: string; css?: string; js?: string }>({});

    const getSnippetCode = useCallback(
        (snippet: Snippet): string => {
            const snippetId = snippet?.id;
            if (snippetId && codeContent[snippetId] !== undefined) {
                return codeContent[snippetId];
            }
            return snippet.code;
        },
        [codeContent]
    );

    const previewScopeClass = useMemo(() => {
        if (previewScope) return previewScope;
        if (htmlString || cssString || jsString) return `editor-preview-content`;
        return `editor-preview-snippets`;
    }, [previewScope, cssString, htmlString, jsString]);

    useEffect(() => {
        setJsError(null);
        setCssCompileError(null);
        setIsCompiling(true);
        setHtmlPreviewKey((prev) => prev + 1);
        const timer = setTimeout(() => setIsCompiling(false), 500);
        return () => clearTimeout(timer);
    }, [refreshKey]);

    // Load Tailwind CSS via CDN with proper link tag
    useEffect(() => {
        if (!enableTailwind) {
            setTailwindLoaded(true);
            return;
        }

        const linkId = `tailwind-css-${previewScopeClass}`;
        const existingLink = document.getElementById(linkId);

        if (existingLink) {
            setTailwindLoaded(true);
            return;
        }

        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css`;

        link.onload = () => {
            setTailwindLoaded(true);
        };

        link.onerror = () => {
            console.warn('Failed to load Tailwind CSS, continuing without it');
            setTailwindLoaded(true);
        };

        document.head.appendChild(link);

        // Cleanup function
        return () => {
            const linkToRemove = document.getElementById(linkId);
            if (linkToRemove && linkToRemove.parentNode) {
                linkToRemove.parentNode.removeChild(linkToRemove);
            }
        };
    }, [previewScopeClass, enableTailwind]);

    useEffect(() => {
        const stringContentChanged =
            prevStringContent.current.html !== htmlString || prevStringContent.current.css !== cssString || prevStringContent.current.js !== jsString;

        const hasContentChanged = snippets.some((snippet) => {
            const snippetId = snippet.id || snippet.language;
            const prevContent = prevCodeContent.current[snippetId] || '';
            const currentContent = getSnippetCode(snippet);
            return prevContent !== currentContent;
        });

        if (hasContentChanged || stringContentChanged) {
            setHtmlPreviewKey((prev) => prev + 1);
            snippets.forEach((snippet) => {
                const snippetId = snippet.id || snippet.language;
                prevCodeContent.current[snippetId] = getSnippetCode(snippet);
            });
            prevStringContent.current = {
                html: htmlString,
                css: cssString,
                js: jsString,
            };
        }
    }, [snippets, codeContent, getSnippetCode, htmlString, cssString, jsString]);

    const fixMalformedCSS = (cssCode: string): string => {
        let fixedCss = cssCode;
        let openBraces = 0;
        let closeBraces = 0;
        for (const char of cssCode) {
            if (char === '{') openBraces++;
            if (char === '}') closeBraces++;
        }
        if (openBraces > closeBraces) {
            fixedCss += '}'.repeat(openBraces - closeBraces);
        }
        return fixedCss;
    };

    useEffect(() => {
        const cssSnippet = snippets.find((s) => s.language === 'css');
        const cssSource = cssString || (cssSnippet ? getSnippetCode(cssSnippet) : '');

        if (!cssSource.trim()) {
            if (prevCompiledCss.current) {
                setCompiledCss(prevCompiledCss.current);
            }
            return;
        }

        setIsCompiling(true);
        setCssCompileError(null);

        const processStyles = async () => {
            try {
                const fixedCss = fixMalformedCSS(cssSource);
                setCompiledCss(fixedCss);
                prevCompiledCss.current = fixedCss;
            } catch (error) {
                setCssCompileError(error instanceof Error ? error.message : 'CSS compilation error');
            } finally {
                setIsCompiling(false);
            }
        };

        processStyles();
    }, [snippets, codeContent, getSnippetCode, cssString]);

    const htmlPreviewData = useMemo(() => {
        const htmlSnippet = snippets.find((s) => s.language === 'html');
        const jsSnippet = snippets.find((s) => s.language === 'javascript');
        let html = htmlString || (htmlSnippet ? getSnippetCode(htmlSnippet) : '');
        const js = jsString || (jsSnippet ? getSnippetCode(jsSnippet) : '');

        // Convert className to class for HTML rendering
        html = html.replace(/className=/g, 'class=');

        // Debug logging
        console.log('HtmlPreview - HTML Content:', html);
        console.log('HtmlPreview - CSS Content:', compiledCss);
        console.log('HtmlPreview - JS Content:', js);

        return {
            html,
            js,
            hasJs: !!js,
        };
    }, [snippets, getSnippetCode, htmlString, jsString, compiledCss]);

    // Generate iframe content with auto-height functionality
    useEffect(() => {
        if (!tailwindLoaded && enableTailwind) return;

        const tailwindCDN = enableTailwind 
            ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">'
            : '';

        const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    ${tailwindCDN}
    <style>
        /* Reset and base styles */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.5;
            color: #333;
            background: white;
        }
        
        /* Ensure content displays properly */
        .preview-container {
            width: 100%;
            min-height: 100vh;
            background: white;
        }
        
        /* Ensure all content is visible */
        nav, header, section, div, main {
            display: block;
            width: 100%;
        }
        
        /* Fix navbar display */
        nav {
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 2rem;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            width: 100%;
        }
        
        /* Ensure hero sections display properly */
        .hero, [class*="hero"], [class*="Hero"], section {
            display: block;
            width: 100%;
            min-height: auto;
        }
        
        /* Custom CSS */
        ${compiledCss}
        
        /* Preview-specific styles */
        ${getPreviewStyles(previewScopeClass, String(htmlPreviewKey), enableTailwind)}
    </style>
</head>
<body>
    <div class="preview-container">
        ${htmlPreviewData.html}
    </div>
    
    ${htmlPreviewData.hasJs ? `
    <script>
        try {
            ${htmlPreviewData.js}
        } catch(e) {
            console.error('JavaScript Error:', e.message);
            window.parent.postMessage({
                type: 'js-error',
                error: e.message
            }, '*');
        }
    </script>
    ` : ''}
    
    <script>
        // Auto-height functionality with better content detection
        function updateHeight() {
            const body = document.body;
            const html = document.documentElement;
            const container = document.querySelector('.preview-container');
            
            // Get the actual content height
            let contentHeight = 0;
            
            if (container) {
                contentHeight = Math.max(
                    container.scrollHeight,
                    container.offsetHeight,
                    container.clientHeight
                );
            }
            
            // Fallback to body height if container height is too small
            const bodyHeight = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight
            );
            
            const finalHeight = Math.max(contentHeight, bodyHeight, 600);
            
            window.parent.postMessage({
                type: 'height-update',
                height: finalHeight
            }, '*');
        }
        
        // Update height on load
        window.addEventListener('load', () => {
            setTimeout(updateHeight, 100);
        });
        
        // Update height when content changes
        const observer = new MutationObserver(() => {
            setTimeout(updateHeight, 50);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        // Initial height update
        setTimeout(updateHeight, 200);
        
        // Additional height updates for dynamic content
        setTimeout(updateHeight, 500);
        setTimeout(updateHeight, 1000);
    </script>
</body>
</html>`;

        setIframeContent(fullHtml);
    }, [htmlPreviewData, compiledCss, tailwindLoaded, enableTailwind, previewScopeClass, htmlPreviewKey]);

    // Handle iframe messages and height updates
    useEffect(() => {
        const handleIframeMessage = (event: MessageEvent) => {
            if (event.data.type === 'js-error') {
                setJsError(event.data.error);
            } else if (event.data.type === 'height-update') {
                setIframeHeight(event.data.height);
            }
        };

        const handleIframeLoad = () => {
            if (iframeRef.current) {
                try {
                    setJsError(null);
                    // Trigger height update after load
                    setTimeout(() => {
                        if (iframeRef.current?.contentWindow) {
                            iframeRef.current.contentWindow.postMessage({ type: 'request-height' }, '*');
                        }
                    }, 200);
                } catch (error) {
                    console.error('Error handling iframe load:', error);
                }
            }
        };

        window.addEventListener('message', handleIframeMessage);
        
        const iframe = iframeRef.current;
        if (iframe) {
            iframe.addEventListener('load', handleIframeLoad);
        }

        return () => {
            window.removeEventListener('message', handleIframeMessage);
            if (iframe) {
                iframe.removeEventListener('load', handleIframeLoad);
            }
        };
    }, []);

    if (isCompiling || (enableTailwind && !tailwindLoaded)) {
        return <LoadingIndicator />;
    }

    return (
        <div className={`html-preview ${previewScopeClass}`} key={htmlPreviewKey}>
            {/* CSS Error Display */}
            {cssCompileError && (
                <div className="html-preview-css-error">
                    <strong>CSS Error:</strong>
                    <pre className="html-preview-error-pre">{cssCompileError}</pre>
                </div>
            )}

            {/* Iframe Container with Auto-Height */}
            <div className="html-preview-iframe-container">
                <iframe
                    ref={iframeRef}
                    srcDoc={iframeContent}
                    className="html-preview-iframe"
                    title="HTML Preview"
                    sandbox="allow-scripts allow-same-origin"
                    style={{ height: `${iframeHeight}px` }}
                    onLoad={() => {
                        setJsError(null);
                    }}
                    onError={() => {
                        console.error('Iframe failed to load, showing fallback content');
                    }}
                />
                
                {/* Fallback content display if iframe fails */}
                {!iframeContent && (
                    <div className="html-preview-fallback">
                        <div 
                            className="html-preview-fallback-content"
                            dangerouslySetInnerHTML={{ __html: htmlPreviewData.html }}
                        />
                        {compiledCss && <style dangerouslySetInnerHTML={{ __html: compiledCss }} />}
                    </div>
                )}
            </div>

            {/* JavaScript Error Display */}
            {jsError && (
                <div className="html-preview-js-error">
                    <strong>JavaScript Error:</strong>
                    <div className="html-preview-error-message">{jsError}</div>
                </div>
            )}
        </div>
    );
};

export default React.memo(HtmlPreview);
