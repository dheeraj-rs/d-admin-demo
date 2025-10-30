'use client';
import { useState, useMemo, useCallback, useContext, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { LayoutContext } from '../../layout/context/LayoutContext';
import HtmlPreview from '../code-preview/HtmlPreview';
import ReactPreview from '../code-preview/ReactPreview';
import Toast from '../sample/Toast/Toast';
import { ToastRef } from '../../types';
import { useQueryClient } from '@tanstack/react-query';
import ElementCodeSaveModal from './SaveModal';
import ElementCodeEditorHeader from './ElementCodeEditorHeader';
import { useGetElement, useSaveElement, useUpdateElement } from '../../service/elementApi';
import CodeFormatter from './CodeFormatter';
import CodeClipboard from './CodeClipboard';
import TabManager from './TabManager';
import LanguageSelector from './LanguageSelector';
import PreviewManager from './PreviewManager';
import SaveManager from './SaveManager';
import EditorManager from './EditorManager';
import { useAddElementsCache } from '../../hooks/useAddElementsCache';
import LanguageSelectorModal from './LanguageSelectorModal';
import TabOptionsModal from './TabOptionsModal';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable';

function ElementCodeEditor({ id }: { id?: string }) {
    const { layoutConfig } = useContext(LayoutContext);
    const queryClient = useQueryClient();
    const toastRef = useRef<ToastRef>(null);
    const editorRef = useRef<any>(null);

    const {
        data: element,
        isLoading,
        error,
    } = useGetElement(id, {
        staleTime: 60000,
        refetchOnWindowFocus: false,
    });
    const saveElementMutation = useSaveElement();
    const updateElementMutation = useUpdateElement();

    const defaultSnippets = useMemo(
        () => [
            {
                id: 'html-0',
                language: 'html',
                name: 'HTML',
                version: '1.0.0',
                code: ``,
            },
            {
                id: 'css-0',
                language: 'css',
                name: 'CSS',
                version: '1.0.0',
                code: ``,
            },
        ],
        []
    );

    const languageOptions = useMemo(
        () => [
            { value: 'html', label: 'HTML' },
            { value: 'css', label: 'CSS' },
            { value: 'javascript', label: 'JavaScript' },
            { value: 'react', label: 'React' },
            { value: 'typescript', label: 'TypeScript' },
        ],
        []
    );

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [componentType, setComponentType] = useState('');
    const [complexity, setComplexity] = useState('beginner');
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showTabOptionsModal, setShowTabOptionsModal] = useState(false);
    const [showLanguageSelector, setShowLanguageSelector] = useState(false);
    const [activeTabForOptions, setActiveTabForOptions] = useState<string | null>(null);
    const [snippets, setSnippets] = useState(defaultSnippets);
    const [selectedSnippetId, setSelectedSnippetId] = useState(defaultSnippets[0].id);
    const [codeContent, setCodeContent] = useState<Record<string, string>>(() => {
        const initialContent: Record<string, string> = {};
        defaultSnippets.forEach((snippet) => {
            initialContent[snippet.id] = snippet.code;
        });
        return initialContent;
    });
    const [lastValidCssContent, setLastValidCssContent] = useState<string>('');
    const [previewMode, setPreviewMode] = useState('html');
    const [copied, setCopied] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [tabOptionsPosition, setTabOptionsPosition] = useState({ top: 0, left: 0 });
    const [languageSelectorPosition, setLanguageSelectorPosition] = useState({ top: 0, left: 0 });

    // Refs
    const tabOptionsRef = useRef<HTMLDivElement>(null);
    const languageSelectorRef = useRef<HTMLDivElement>(null);

    // Add error handling
    useEffect(() => {
        if (error) {
            toastRef.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error instanceof Error ? error.message : 'Unknown error',
                life: 5000,
            });
        }
    }, [error]);

    // Add success callback as a separate effect


    // Map snippet language to Monaco editor language
    const getEditorLanguage = useCallback((snippetLanguage: string) => {
        switch (snippetLanguage.toLowerCase()) {
            case 'react':
                return 'javascript';
            case 'html':
                return 'html';
            case 'css':
                return 'css';
            case 'javascript':
            case 'js':
                return 'javascript';
            case 'typescript':
            case 'ts':
                return 'typescript';
            default:
                return snippetLanguage;
        }
    }, []);

    // Get current snippet based on selectedSnippetId
    const currentSnippet = useMemo(() => {
        return (
            snippets.find((snippet) => snippet.id === selectedSnippetId) || {
                id: '',
                language: 'html',
                name: 'HTML',
                version: '1.0.0',
                code: '',
            }
        );
    }, [snippets, selectedSnippetId]);

    // Use the extracted components
    const { formatCode } = CodeFormatter({
        editorRef,
        toastRef,
        currentSnippet,
        selectedSnippetId,
        codeContent,
    });

    const { copyToClipboard } = CodeClipboard({
        toastRef,
        codeContent,
        selectedSnippetId,
        setCopied,
    });



    // Find CSS snippet ID
    const cssSnippetId = useMemo(() => {
        return snippets.find((snippet) => snippet.language === 'css')?.id || '';
    }, [snippets]);

    const { enhancedCodeContent, refreshPreview } = PreviewManager({
        codeContent,
        lastValidCssContent,
        cssSnippetId,
        setRefreshKey,
    });

    const { handleSave, handleConfirmSave } = SaveManager({
        toastRef,
        setShowSaveModal,
        codeContent,
        setIsSaving,
        element,
        id,
        saveElementMutation,
        updateElementMutation,
        snippets,
        queryClient,
    });

    const {
        handleEditorDidMount,
        handleCodeChange,
        editorValue,
        resetCode: resetCodeFunc,
    } = EditorManager({
        editorRef,
        selectedSnippetId,
        codeContent,
        setCodeContent,
        cssSnippetId,
        setLastValidCssContent,
        getEditorLanguage,
    });

    // Page cache for Add Elements editor
    const cachePageId = useMemo(() => (id ? `add-elements-${id}` : 'add-elements'), [id]);
    const { hasCache, saveNow, debouncedSave } = useAddElementsCache(
        cachePageId,
        {
            title,
            description,
            componentType,
            complexity,
            hashtags,
            snippets,
            selectedSnippetId,
            codeContent,
            previewMode,
        },
        {
            setTitle,
            setDescription,
            setComponentType,
            setComplexity,
            setHashtags,
            setSnippets,
            setSelectedSnippetId,
            setCodeContent,
            setPreviewMode,
        }
    );

    const immediateSave = useCallback(() => {
        try { saveNow(); } catch { }
    }, [saveNow]);

    const { handleTabChange, handleAddLanguage, handleTabOptions, handleRemoveTab, handleEditTab } = TabManager({
        snippets,
        selectedSnippetId,
        setSelectedSnippetId,
        setSnippets,
        setCodeContent,
        codeContent,
        toastRef,
        setPreviewMode,
        getEditorLanguage,
        setShowTabOptionsModal,
        setActiveTabForOptions,
        setTabOptionsPosition,
        setLanguageSelectorPosition,
        setShowLanguageSelector,
        editorRef,
        onImmediateSave: immediateSave,
    });

    const { handleLanguageSelection, availableLanguages } = LanguageSelector({
        snippets,
        activeTabForOptions,
        setSnippets,
        setCodeContent,
        setSelectedSnippetId,
        toastRef,
        setShowLanguageSelector,
        setActiveTabForOptions,
        languageOptions,
        onImmediateSave: immediateSave,
    });

    // Save on snippet switch to avoid losing in-flight typing
    useEffect(() => {
        saveNow();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSnippetId]);

    // Save on every keystroke in the editor
    useEffect(() => {
        const handleKeyUp = () => {
            debouncedSave();
        };
        const handleInput = () => {
            debouncedSave();
        };

        document.addEventListener('keyup', handleKeyUp);
        document.addEventListener('input', handleInput);
        return () => {
            document.removeEventListener('keyup', handleKeyUp);
            document.removeEventListener('input', handleInput);
        };
    }, [debouncedSave]);

    // Save on every code change to prevent losing typing
    useEffect(() => {
        debouncedSave();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [codeContent]);

    // Save immediately when switching tabs to preserve content
    useEffect(() => {
        saveNow();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSnippetId]);

    // If cache exists, do NOT overwrite local state with fetched data
    useEffect(() => {
        if (!element) return;
        if (hasCache) {
            // If we have cache, ensure the editor is properly initialized with cached content
            setTimeout(() => {
                if (editorRef.current) {
                    const content = codeContent[selectedSnippetId] || '';
                    editorRef.current.setValue(content);
                }
            }, 100);
            return;
        }

        // Initialize state with fetched data
        setTitle(element.title);
        setDescription(element.description);
        setComponentType(element.componentType);
        setComplexity(element.complexity);
        setHashtags(element.hashtags || []);

        // Process snippets
        const processedSnippets = element.snippets.map((snippet, index) => ({
            ...snippet,
            id: `${snippet.language}-${index}`,
            name: snippet.language.charAt(0).toUpperCase() + snippet.language.slice(1),
        }));

        setSnippets(processedSnippets);

        // Initialize code content
        const initialContent = processedSnippets.reduce((acc: Record<string, string>, snippet) => {
            if (snippet.id) {
                acc[snippet.id] = snippet.code;
            }
            return acc;
        }, {} as Record<string, string>);

        setCodeContent(initialContent);

        // Set first snippet as selected
        if (processedSnippets.length > 0) {
            setSelectedSnippetId(processedSnippets[0].id);
        }
    }, [element, hasCache, selectedSnippetId, codeContent]);

    // Update lastValidCssContent whenever CSS content changes and is not empty
    useEffect(() => {
        if (cssSnippetId && codeContent[cssSnippetId] && codeContent[cssSnippetId].trim() !== '') {
            setLastValidCssContent(codeContent[cssSnippetId]);
        }
    }, [cssSnippetId, codeContent]);

    // Close tab options modal when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (tabOptionsRef.current && !tabOptionsRef.current.contains(event.target as Node)) {
                setShowTabOptionsModal(false);
            }
            if (languageSelectorRef.current && !languageSelectorRef.current.contains(event.target as Node)) {
                setShowLanguageSelector(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Get editor language from current snippet
    const editorLanguage = useMemo(() => getEditorLanguage(currentSnippet.language), [currentSnippet, getEditorLanguage]);

    // Make sure to preserve editor content when selected tab changes
    useEffect(() => {
        if (selectedSnippetId) {
            setCodeContent((prev) => {
                // Only update if the selectedSnippetId doesn't exist in the current state
                if (!prev[selectedSnippetId]) {
                    return {
                        ...prev,
                        [selectedSnippetId]: '',
                    };
                }
                return prev;
            });
        }
    }, [selectedSnippetId]);

    useEffect(() => {
        if (!showSaveModal) {
            setIsSaving(false);
        }
    }, [showSaveModal]);

    const currentFormData = useMemo(
        () => ({
            title: id ? title || element?.title || '' : title,
            description: id ? description || element?.description || '' : description,
            hashtags: id ? hashtags || element?.hashtags || [] : hashtags,
            componentType: id ? componentType || element?.componentType || '' : componentType,
            complexity: id ? complexity || element?.complexity || 'beginner' : complexity,
        }),
        [title, description, hashtags, componentType, complexity, id, element]
    );

    useEffect(() => {
        if (snippets.length > 0 && !snippets.find((snippet) => snippet.id === selectedSnippetId)) {
            setSelectedSnippetId(snippets[0].id);
        }
    }, [snippets, selectedSnippetId]);

    useEffect(() => {
        const initialSnippet = snippets.find((snippet) => snippet.id === selectedSnippetId);
        if (initialSnippet) {
            if (initialSnippet.language.toLowerCase() === 'react') {
                setPreviewMode('react');
            } else {
                setPreviewMode('html');
            }
        }
    }, [snippets, selectedSnippetId]);

    const reloadData = useCallback(() => {
        if (id) {
            // In edit mode, refetch data using the query client
            queryClient.invalidateQueries({ queryKey: ['code-element', id] });

            // Inform user
            toastRef.current?.show({
                severity: 'success',
                summary: 'Data Reloaded',
                detail: 'Latest data has been loaded from the server',
                life: 3000,
            });
        } else {
            // In create mode, clear data
            setCodeContent(() => {
                const initialContent: Record<string, string> = {};
                defaultSnippets.forEach((snippet) => {
                    initialContent[snippet.id] = snippet.code;
                });
                return initialContent;
            });
            setSnippets(defaultSnippets);
            setSelectedSnippetId(defaultSnippets[0].id);
            setTitle('');
            setDescription('');
            setComponentType('');
            setComplexity('beginner');
            setHashtags([]);

            // Inform user
            toastRef.current?.show({
                severity: 'info',
                summary: 'Form Cleared',
                detail: 'Form has been reset to default state',
                life: 3000,
            });
        }
    }, [id, defaultSnippets, toastRef, queryClient]);

    const resetCode = useCallback(() => {
        resetCodeFunc(element, snippets, selectedSnippetId, cssSnippetId);
    }, [resetCodeFunc, element, snippets, selectedSnippetId, cssSnippetId]);

    return (
        <div className="children__fixed-h-wrapper">
            <ElementCodeEditorHeader
                formatCode={formatCode}
                copyToClipboard={copyToClipboard}
                copied={copied}
                refreshPreview={refreshPreview}
                onApply={handleSave}
                isLoading={isSaving || updateElementMutation.isPending || saveElementMutation.isPending}
                reloadData={reloadData}
                resetCode={resetCode}
                componentName={id ? element?.title || 'Loading...' : 'Add Element'}
            />

            {isLoading && id ? (
                <div className="flex justify-center items-center h-full">
                    <div className="spinner"></div>
                </div>
            ) : error ? (
                <div className="flex justify-center items-center h-full">
                    <div className="error-message">{error.message}</div>
                </div>
            ) : (
                <div className="element-code-editor__wrapper">
                    <ResizablePanelGroup>
                        <ResizablePanel minSize={25} defaultSize={40} className="preview-panel">
                            {previewMode === 'html' && <HtmlPreview snippets={snippets} codeContent={enhancedCodeContent} refreshKey={refreshKey} />}
                            {previewMode === 'react' && <ReactPreview snippets={snippets} codeContent={enhancedCodeContent} refreshKey={refreshKey} />}
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel minSize={40} defaultSize={60} className="editor-panel">
                            <div className="tabs-container">
                                <div className="language-tabs">
                                    {snippets.map((snippet) => (
                                        <div
                                            key={snippet.id}
                                            id={`tab-${snippet.id}`}
                                            className={`tab-item ${selectedSnippetId === snippet.id ? 'active' : ''}`}
                                        >
                                            <button className="language-tab" onClick={() => handleTabChange(snippet.id)}>
                                                {snippet.name}
                                            </button>
                                            <button className="tab-close-btn" onClick={(e) => handleTabOptions(snippet.id, e)}>
                                                <i className="pi pi-ellipsis-v" />
                                            </button>
                                        </div>
                                    ))}
                                    <button className="add-language-btn" onClick={handleAddLanguage}>
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="code-editor-container" style={{ height: '100%', minHeight: '300px' }}>
                                <Editor
                                    key={`code-editor-${selectedSnippetId}`}
                                    language={editorLanguage}
                                    value={editorValue}
                                    theme={layoutConfig.colorScheme === 'dark' ? 'vs-dark' : 'light'}
                                    onChange={handleCodeChange}
                                    onMount={handleEditorDidMount}
                                    options={{
                                        minimap: { enabled: false },
                                        lineNumbers: 'on',
                                        roundedSelection: false,
                                        scrollBeyondLastLine: false,
                                        readOnly: false,
                                        automaticLayout: true,
                                        tabSize: 2,
                                        wordWrap: 'on',
                                        bracketPairColorization: { enabled: true },
                                        fontSize: 14,
                                        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                                        fixedOverflowWidgets: true,
                                        renderWhitespace: 'selection',
                                        scrollbar: {
                                            vertical: 'visible',
                                            horizontal: 'visible',
                                            useShadows: false,
                                        },
                                    }}
                                    loading={<div className="editor-loading">Loading editor...</div>}
                                />
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            )}

            <LanguageSelectorModal
                isVisible={showLanguageSelector}
                position={languageSelectorPosition}
                modalRef={languageSelectorRef}
                isEditing={!!activeTabForOptions}
                availableLanguages={availableLanguages}
                onSelectLanguage={handleLanguageSelection}
            />

            <TabOptionsModal
                isVisible={showTabOptionsModal}
                position={tabOptionsPosition}
                modalRef={tabOptionsRef}
                activeTabId={activeTabForOptions}
                onEditTab={handleEditTab}
                onRemoveTab={handleRemoveTab}
            />

            <ElementCodeSaveModal
                key="code-save-modal"
                isVisible={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                onSave={handleConfirmSave}
                isLoading={isSaving || updateElementMutation.isPending || saveElementMutation.isPending}
                initialData={currentFormData}
            />
            <Toast ref={toastRef} />
        </div>
    );
}

export default ElementCodeEditor;
