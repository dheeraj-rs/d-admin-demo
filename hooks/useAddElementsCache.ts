import { useEffect, useRef } from 'react';
import { usePageCache } from '../lib/pageCache';

export interface AddElementsCacheData {
    title: string;
    description: string;
    componentType: string;
    complexity: string;
    hashtags: string[];
    snippets: Array<{ id: string; language: string; name: string; version: string; code: string }>;
    selectedSnippetId: string;
    codeContent: Record<string, string>;
    previewMode: string;
    lastModified: number;
}

interface ValuesShape {
    title: string;
    description: string;
    componentType: string;
    complexity: string;
    hashtags: string[];
    snippets: Array<{ id: string; language: string; name: string; version: string; code: string }>;
    selectedSnippetId: string;
    codeContent: Record<string, string>;
    previewMode: string;
}

interface SettersShape {
    setTitle: (v: string) => void;
    setDescription: (v: string) => void;
    setComponentType: (v: string) => void;
    setComplexity: (v: string) => void;
    setHashtags: (v: string[]) => void;
    setSnippets: (v: ValuesShape['snippets']) => void;
    setSelectedSnippetId: (v: string) => void;
    setCodeContent: (v: Record<string, string>) => void;
    setPreviewMode: (v: string) => void;
}

export function useAddElementsCache(pageId: string, values: ValuesShape, setters: SettersShape) {
    const { setPageCache, getPageCache } = usePageCache();
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const lastHashRef = useRef<string>('');

    const getCurrentState = (): AddElementsCacheData => ({
        ...values,
        lastModified: Date.now(),
    });

    const saveToCache = (data: AddElementsCacheData) => {
        try {
            setPageCache(pageId, data, '1.0');
        } catch (e) {
            // no-op
        }
    };

    const loadFromCache = (): boolean => {
        const cached = getPageCache(pageId) as AddElementsCacheData | null;
        if (!cached) return false;

        setters.setTitle(cached.title);
        setters.setDescription(cached.description);
        setters.setComponentType(cached.componentType);
        setters.setComplexity(cached.complexity);
        setters.setHashtags(cached.hashtags || []);
        setters.setSnippets(cached.snippets || []);
        setters.setSelectedSnippetId(cached.selectedSnippetId || '');
        setters.setCodeContent(cached.codeContent || {});
        setters.setPreviewMode(cached.previewMode || 'html');
        return true;
    };

    const autoSave = () => {
        const data = getCurrentState();
        // Create a more detailed hash that includes actual code content
        const hash = JSON.stringify({
            t: data.title,
            d: data.description,
            c: data.componentType,
            x: data.complexity,
            h: data.hashtags,
            s: data.snippets.map((s) => [s.id, s.language, s.name, s.version]),
            a: data.selectedSnippetId,
            p: data.previewMode,
            // Include actual code content for each snippet
            cc: Object.keys(data.codeContent).map((key) => [key, data.codeContent[key]]),
        });
        if (hash === lastHashRef.current) return;
        lastHashRef.current = hash;
        saveToCache(data);
    };

    const debouncedSave = () => {
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = setTimeout(() => {
            autoSave();
        }, 100); // Reduced to 100ms for even faster response
    };

    const saveNow = () => {
        const data = getCurrentState();
        lastHashRef.current = '';
        saveToCache(data);
    };

    const hasCache = !!getPageCache(pageId);

    useEffect(() => {
        // Restore once on mount
        loadFromCache();
        const interval = setInterval(() => autoSave(), 300); // Even more frequent checks

        const onBeforeUnload = () => saveNow();
        const onVisibility = () => {
            if (document.visibilityState === 'hidden') saveNow();
        };
        const onPageHide = () => saveNow();
        const onBlur = () => saveNow();
        const onKeyUp = () => debouncedSave(); // Save on every keystroke
        window.addEventListener('beforeunload', onBeforeUnload);
        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('pagehide', onPageHide);
        window.addEventListener('blur', onBlur);
        document.addEventListener('keyup', onKeyUp);
        return () => {
            clearInterval(interval);
            if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
            window.removeEventListener('beforeunload', onBeforeUnload);
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('pagehide', onPageHide);
            window.removeEventListener('blur', onBlur);
            document.removeEventListener('keyup', onKeyUp);
        };
    }, []);

    // Save on unmount (client navigation)
    useEffect(() => {
        return () => {
            try {
                saveNow();
            } catch {}
        };
    }, []);

    // Trigger autosave when values change (cheap hash in effect)
    useEffect(() => {
        debouncedSave();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        values.title,
        values.description,
        values.componentType,
        values.complexity,
        JSON.stringify(values.hashtags),
        JSON.stringify(values.snippets.map((s) => [s.id, s.language, s.name, s.version])),
        values.selectedSnippetId,
        JSON.stringify(values.codeContent),
        values.previewMode,
    ]);

    return { hasCache, loadFromCache, saveNow, debouncedSave };
}
