'use client';
import { useState, useEffect, useRef } from 'react';
import './globals.scss';

interface CodePreviewProps {
    code: string;
}

const CodePreview = ({ code }: CodePreviewProps) => {
    const [iframeContent, setIframeContent] = useState('');
    const [iframeHeight, setIframeHeight] = useState(50);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const uniqueId = useRef(`iframe-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        // Convert React className to HTML class attribute
        const htmlCode = code?.replace(/className=/g, 'class=');

        // Create minimal HTML structure with reset styles
        const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body>
${htmlCode}
</body>
</html>`;

        setIframeContent(fullHtml);
    }, [code]);

    // Listen for resize messages from iframe with unique ID matching
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'resize' && event.data.iframeId === uniqueId.current && iframeRef.current) {
                const newHeight = event.data.height;
                setIframeHeight(newHeight);
                iframeRef.current.style.height = `${newHeight}px`;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div className="preview-item">
            <div className="preview-content">
                <div className="preview-render">
                    {iframeContent ? (
                        <iframe
                            ref={iframeRef}
                            srcDoc={iframeContent}
                            title="Component Preview"
                            style={{
                                width: '100%',
                                border: 'none',
                                minHeight: '50px',
                                height: `${iframeHeight}px`,
                                backgroundColor: 'transparent',
                            }}
                        />
                    ) : (
                        <div className="loading">Loading preview...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodePreview;
