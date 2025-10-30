declare global {
    interface Window {
        monaco?: {
            editor: {
                getEditors: () => any[];
                setModelLanguage: (model: any, language: string) => void;
            };
        };
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    renderButton: (element: HTMLElement, config: any) => void;
                    prompt: () => void;
                };
            };
        };
    }
}

interface ElementCodeEditorData {
    _id: string;
    elementId: string;
    title: string;
    description: string;
    componentType: string;
    complexity: string;
    hashtags: string[];
    snippets: Array<{
        _id: any;
        language: string;
        version: string;
        code: string;
        id?: string;
        name?: string;
    }>;
}

interface Snippet {
    id: string;
    language: string;
    version: string;
    name: string;
    code: string;
}

interface SnippetData {
    language: string;
    version: string;
    code: string;
}

interface ESaveData {
    elementId: string;
    title: string;
    description: string;
    author: string;
    componentType: string;
    complexity: string;
    hashtags: string[];
    snippets: SnippetData[];
}

interface ECodeEditorPreviewProps {
    snippets: Snippet[];
    refreshKey: number;
    codeContent: Record<string, string>;
}

interface ElementCodeEditorHeaderProps {
    formatCode: () => void;
    copyToClipboard: () => void;
    copied: boolean;
    refreshPreview: () => void;
    onApply: () => void;
    isLoading: boolean;
    reloadData: () => void;
    componentName?: string;
    resetCode?: () => void;
}

interface ESaveModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (data: SaveFormData) => Promise<boolean | void> | boolean | void;
    isLoading: boolean;
    initialData?: SaveFormData;
}

interface ESaveFormData {
    title: string;
    description: string;
    hashtags: string[];
    componentType: string;
    complexity: string;
}

export type { ElementCodeEditorData,ECodeEditorPreviewProps, ElementCodeEditorHeaderProps, ESaveData,ESaveFormData,ESaveModalProps };
