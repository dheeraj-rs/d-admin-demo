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

// const LoadingIndicator: React.FC = () => (
//     <div className="html-preview-loading">
//         <div className="html-preview-loading-content">
//             <div className="html-preview-loading-spinner"></div>
//         </div>
//     </div>
// );

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center h-full mt-3">
        <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
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

        return {
            html,
            js,
            hasJs: !!js,
        };
    }, [snippets, getSnippetCode, htmlString, jsString]);

    useEffect(() => {
        if (htmlPreviewData.hasJs && !isCompiling && tailwindLoaded) {
            setJsError(null);
            const executeJsTimer = setTimeout(() => {
                try {
                    const htmlContainer = document.getElementById('html-preview-container');
                    if (!htmlContainer) return;

                    const previewViewport = htmlContainer.querySelector('.preview-viewport');
                    if (!previewViewport) return;

                    const executeScript = new Function(
                        'container',
                        `try {
                            ${htmlPreviewData.js}
                            return null;
                        } catch(e) {
                            return e.message;
                        }`
                    );
                    const errorResult = executeScript(previewViewport);
                    if (errorResult) {
                        setJsError(errorResult);
                    }
                } catch (error) {
                    setJsError(error instanceof Error ? error.message : 'Unknown JavaScript error');
                }
            }, 100);
            return () => clearTimeout(executeJsTimer);
        }
    }, [htmlPreviewData, isCompiling, tailwindLoaded]);

    if (isCompiling || (enableTailwind && !tailwindLoaded)) {
        return <LoadingIndicator />;
    }

    return (
        <div className={`html-preview ${previewScopeClass}`} key={htmlPreviewKey}>
            {compiledCss && <style dangerouslySetInnerHTML={{ __html: compiledCss }} />}
            <style dangerouslySetInnerHTML={{ __html: getPreviewStyles(previewScopeClass, String(htmlPreviewKey), enableTailwind) }} />
            {cssCompileError && (
                <div className="html-preview-css-error">
                    <strong>CSS Error:</strong>
                    <pre className="html-preview-error-pre">{cssCompileError}</pre>
                </div>
            )}
            <div
                id="html-preview-container"
                className={`html-content ${previewScopeClass}-content`}
                style={{
                    position: 'relative',
                    isolation: 'isolate',
                    transform: 'translateZ(0)',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
            >
                <div
                    className="preview-viewport"
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: 'max-content',
                        overflow: 'auto',
                        transform: 'translateZ(0)',
                    }}
                    dangerouslySetInnerHTML={{ __html: htmlPreviewData.html }}
                />
            </div>
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
