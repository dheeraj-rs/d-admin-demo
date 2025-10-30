'use client';

import { useState, useEffect, useRef } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { ProjectFileItem } from '../../../../service/ProjectBuilder/ProjectStructure';

interface EditorProps {
    file: ProjectFileItem | null;
    onContentChange: (id: string, content: string) => void;
    onSave: (id: string) => void;
}

export default function Editor({ file, onContentChange, onSave }: EditorProps) {
    const [content, setContent] = useState('');
    const editorRef = useRef<any>(null);

    useEffect(() => {
        if (file) {
            setContent(file.content || '');
        }
    }, [file]);

    const handleContentChange = (newContent: string | undefined) => {
        if (newContent !== undefined) {
            setContent(newContent);
            if (file) {
                onContentChange(file.id, newContent);
            }
        }
    };

    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;

        // Add save shortcut (Ctrl+S / Cmd+S)
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            if (file) {
                onSave(file.id);
            }
        });

        // Configure editor options
        editor.updateOptions({
            fontSize: 14,
            lineHeight: 20,
            fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, "Courier New", monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: true,
            folding: true,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            guides: {
                bracketPairs: true,
                indentation: true,
            },
            padding: { top: 16, bottom: 16 },
            scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
                useShadows: false,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                verticalScrollbarSize: 14,
                horizontalScrollbarSize: 14,
            },
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            overviewRulerLanes: 0,
        });

        // Define and set custom dark theme
        monaco.editor.defineTheme('custom-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
                { token: 'keyword', foreground: '569CD6' },
                { token: 'string', foreground: 'CE9178' },
                { token: 'number', foreground: 'B5CEA8' },
                { token: 'type', foreground: '4EC9B0' },
                { token: 'class', foreground: '4EC9B0' },
                { token: 'function', foreground: 'DCDCAA' },
                { token: 'variable', foreground: '9CDCFE' },
                { token: 'constant', foreground: '4FC1FF' },
            ],
            colors: {
                'editor.background': '#1e1e1e',
                'editor.foreground': '#d4d4d4',
                'editorLineNumber.foreground': '#858585',
                'editorLineNumber.activeForeground': '#c6c6c6',
                'editor.selectionBackground': '#264f78',
                'editor.selectionHighlightBackground': '#add6ff26',
                'editorCursor.foreground': '#aeafad',
                'editor.findMatchBackground': '#515c6a',
                'editor.findMatchHighlightBackground': '#ea5c0055',
                'editor.linkedEditingBackground': '#f00',
            },
        });

        monaco.editor.setTheme('custom-dark');
    };

    const getLanguageFromExtension = (extension?: string): string => {
        switch (extension) {
            case 'tsx':
                return 'typescript';
            case 'jsx':
                return 'javascript';
            case 'ts':
                return 'typescript';
            case 'js':
                return 'javascript';
            case 'css':
                return 'css';
            case 'scss':
            case 'sass':
                return 'scss';
            case 'json':
                return 'json';
            case 'md':
                return 'markdown';
            case 'html':
                return 'html';
            case 'xml':
                return 'xml';
            case 'yaml':
            case 'yml':
                return 'yaml';
            case 'sql':
                return 'sql';
            case 'py':
                return 'python';
            case 'java':
                return 'java';
            case 'cpp':
            case 'cc':
            case 'cxx':
                return 'cpp';
            case 'c':
                return 'c';
            case 'cs':
                return 'csharp';
            case 'php':
                return 'php';
            case 'rb':
                return 'ruby';
            case 'go':
                return 'go';
            case 'rs':
                return 'rust';
            case 'swift':
                return 'swift';
            case 'kt':
                return 'kotlin';
            case 'dart':
                return 'dart';
            case 'sh':
            case 'bash':
                return 'shell';
            case 'dockerfile':
                return 'dockerfile';
            case 'gitignore':
                return 'plaintext';
            case 'svg':
                return 'xml';
            default:
                return 'plaintext';
        }
    };

    const getLanguageDisplayName = (extension?: string) => {
        switch (extension) {
            case 'tsx':
                return 'TypeScript React';
            case 'jsx':
                return 'JavaScript React';
            case 'ts':
                return 'TypeScript';
            case 'js':
                return 'JavaScript';
            case 'css':
                return 'CSS';
            case 'scss':
            case 'sass':
                return 'SCSS';
            case 'json':
                return 'JSON';
            case 'md':
                return 'Markdown';
            case 'html':
                return 'HTML';
            case 'xml':
                return 'XML';
            case 'yaml':
            case 'yml':
                return 'YAML';
            case 'sql':
                return 'SQL';
            case 'py':
                return 'Python';
            case 'java':
                return 'Java';
            case 'cpp':
            case 'cc':
            case 'cxx':
                return 'C++';
            case 'c':
                return 'C';
            case 'cs':
                return 'C#';
            case 'php':
                return 'PHP';
            case 'rb':
                return 'Ruby';
            case 'go':
                return 'Go';
            case 'rs':
                return 'Rust';
            case 'swift':
                return 'Swift';
            case 'kt':
                return 'Kotlin';
            case 'dart':
                return 'Dart';
            case 'sh':
            case 'bash':
                return 'Shell';
            case 'dockerfile':
                return 'Dockerfile';
            case 'gitignore':
                return 'Git Ignore';
            case 'svg':
                return 'SVG';
            default:
                return 'Plain Text';
        }
    };

    if (!file) {
        return (
            <div className="editor-container">
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '16px',
                        gap: '16px',
                    }}
                >
                    <div style={{ fontSize: '48px', opacity: 0.3 }}>📝</div>
                    <div>Select a file to start editing</div>
                    <div style={{ fontSize: '14px', opacity: 0.7 }}>Use Ctrl+S (Cmd+S) to save your changes</div>
                </div>
            </div>
        );
    }

    return (
        <div className="editor-container">
            <div className="editor-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="file-path">{file.name}</span>
                    {file.saved === false && (
                        <span
                            style={{
                                fontSize: '12px',
                                color: 'var(--warning-color)',
                                fontWeight: 'bold',
                            }}
                        >
                            ●
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{getLanguageDisplayName(file.extension)}</span>
                    <button className="btn btn-sm btn-primary" onClick={() => onSave(file.id)} disabled={file.saved !== false}>
                        Save
                    </button>
                </div>
            </div>

            <div className="editor" style={{ height: 'calc(100vh - 200px)' }}>
                <MonacoEditor
                    height="100%"
                    language={getLanguageFromExtension(file.extension)}
                    value={content}
                    onChange={handleContentChange}
                    onMount={handleEditorDidMount}
                    options={{
                        theme: 'vs-dark',
                        fontSize: 14,
                        lineHeight: 20,
                        fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, "Courier New", monospace',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                        detectIndentation: true,
                        folding: true,
                        lineNumbers: 'on',
                        renderWhitespace: 'selection',
                        bracketPairColorization: { enabled: true },
                        guides: {
                            bracketPairs: true,
                            indentation: true,
                        },
                        suggest: {
                            showKeywords: true,
                            showSnippets: true,
                            showFunctions: true,
                            showConstructors: true,
                            showFields: true,
                            showVariables: true,
                            showClasses: true,
                            showStructs: true,
                            showInterfaces: true,
                            showModules: true,
                            showProperties: true,
                            showEvents: true,
                            showOperators: true,
                            showUnits: true,
                            showValues: true,
                            showConstants: true,
                            showEnums: true,
                            showEnumMembers: true,
                            showColors: true,
                            showFiles: true,
                            showReferences: true,
                            showFolders: true,
                            showTypeParameters: true,
                            showUsers: true,
                            showIssues: true,
                        },
                        quickSuggestions: {
                            other: true,
                            comments: true,
                            strings: true,
                        },
                        parameterHints: {
                            enabled: true,
                        },
                        hover: {
                            enabled: true,
                        },
                        formatOnPaste: true,
                        formatOnType: true,
                    }}
                />
            </div>
        </div>
    );
}
