import { useEffect, useRef } from 'react';
import { usePageCache, pageCacheUtils } from '../lib/pageCache';
import websiteBuilderStore from '../components/website-builder/store/websiteBuilderStore';

interface WebsiteBuilderCacheData {
    // Canvas state
    canvasType: 'classic' | 'flow';
    nodes: any[];
    edges: any[];

    // Section codes
    page1SectionCodes: any[];
    activeSection: any;

    // UI state and panels
    isPropertiesPanelOpen: boolean;
    isProjectFilesPanelOpen: boolean;
    isPreviewMode: boolean;
    isImportPanelOpen: boolean;
    viewportSize: 'mobile' | 'tablet' | 'desktop';

    // Project settings and metadata
    projectSettings: any;
    isSaveProject: boolean;
    isWebsitePreview: { isPreview: boolean; websiteId: string | null };
    selectedProjectFile: string;

    // Drag and drop state
    draggedSection: any;
    isDragging: boolean;

    // History and undo/redo
    history: {
        past: any[][];
        future: any[][];
    };
    canUndo: boolean;
    canRedo: boolean;

    // Timestamp for cache validation
    lastModified: number;
}

export const useWebsiteBuilderCache = (pageId: string) => {
    const { setPageCache, getPageCache, clearPageCache } = usePageCache();
    const store = websiteBuilderStore();
    const lastSaveRef = useRef<number>(0);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const lastStateHashRef = useRef<string>('');

    // Get current state from store
    const getCurrentState = (): WebsiteBuilderCacheData => ({
        // Canvas state
        canvasType: store.canvasType,
        nodes: store.nodes,
        edges: store.edges,

        // Section codes
        page1SectionCodes: store.page1SectionCodes,
        activeSection: store.activeSection,

        // UI state and panels
        isPropertiesPanelOpen: store.isPropertiesPanelOpen || false,
        isProjectFilesPanelOpen: store.isProjectFilesPanelOpen || false,
        isPreviewMode: store.isPreviewMode || false,
        isImportPanelOpen: store.isImportPanelOpen || false,
        viewportSize: store.viewportSize,

        // Project settings and metadata
        projectSettings: store.projectSettings,
        isSaveProject: store.isSaveProject || false,
        isWebsitePreview: store.isWebsitePreview || { isPreview: false, websiteId: null },
        selectedProjectFile: store.selectedProjectFile || '',

        // Drag and drop state
        draggedSection: store.draggedSection || null,
        isDragging: store.isDragging || false,

        // History and undo/redo
        history: store.history || { past: [], future: [] },
        canUndo: store.canUndo || false,
        canRedo: store.canRedo || false,

        // Timestamp
        lastModified: Date.now(),
    });

    // Save state to cache
    const saveToCache = (data: WebsiteBuilderCacheData) => {
        try {
            setPageCache(pageId, data, '1.0');
            lastSaveRef.current = Date.now();

            if (process.env.NODE_ENV === 'development') {
                console.log(`[WebsiteBuilderCache] Saved state for ${pageId}`, {
                    sections: data.page1SectionCodes.length,
                    nodes: data.nodes.length,
                    edges: data.edges.length,
                    timestamp: new Date(data.lastModified).toLocaleTimeString(),
                });
            }
        } catch (error) {
            console.error('[WebsiteBuilderCache] Error saving to cache:', error);
        }
    };

    // Load state from cache
    const loadFromCache = (): boolean => {
        try {
            const cached = getPageCache(pageId);
            if (!cached) return false;

            const data = cached as WebsiteBuilderCacheData;

            // Restore canvas state
            store.setCanvasType(data.canvasType);
            store.setNodes(data.nodes);
            store.setEdges(data.edges);

            // Restore section codes
            store.setPage1SectionCodes(data.page1SectionCodes);
            if (data.activeSection) {
                store.setActiveSection(data.activeSection);
            }

            // Restore UI state and panels
            store.setViewportSize(data.viewportSize);
            if (data.isPropertiesPanelOpen !== undefined) {
                store.togglePropertiesPanel(data.isPropertiesPanelOpen);
            }
            if (data.isProjectFilesPanelOpen !== undefined) {
                store.toggleProjectFilesPanel(data.isProjectFilesPanelOpen);
            }
            if (data.isImportPanelOpen !== undefined) {
                store.toggleImportPanel(data.isImportPanelOpen);
            }

            // Restore project settings and metadata
            store.setProjectSettings(data.projectSettings);
            store.setIsSaveProject(data.isSaveProject || false);
            if (data.isWebsitePreview) {
                store.setWebsitePreview(data.isWebsitePreview.isPreview || false, data.isWebsitePreview.websiteId || null);
            }
            store.setSelectedProjectFile(data.selectedProjectFile);

            // Restore drag and drop state
            store.setDraggedSection(data.draggedSection || null);
            store.setIsDragging(data.isDragging || false);

            // Restore history and undo/redo state
            if (data.history) {
                // Note: History restoration might need special handling
                // For now, we'll just log it
                if (process.env.NODE_ENV === 'development') {
                    console.log('[WebsiteBuilderCache] Restored history:', data.history);
                    console.log('[WebsiteBuilderCache] Undo/Redo state:', { canUndo: data.canUndo, canRedo: data.canRedo });
                }
            }

            if (process.env.NODE_ENV === 'development') {
                console.log(`[WebsiteBuilderCache] Restored state for ${pageId}`, {
                    sections: data.page1SectionCodes.length,
                    nodes: data.nodes.length,
                    edges: data.edges.length,
                    lastModified: new Date(data.lastModified).toLocaleTimeString(),
                });
            }

            return true;
        } catch (error) {
            console.error('[WebsiteBuilderCache] Error loading from cache:', error);
            return false;
        }
    };

    // Auto-save with debouncing
    const autoSave = () => {
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = setTimeout(() => {
            const currentState = getCurrentState();
            // Compute a comprehensive hash for change detection
            const hash = JSON.stringify({
                s: currentState.page1SectionCodes.map((s) => s.id),
                n: currentState.nodes.length,
                e: currentState.edges.length,
                c: currentState.canvasType,
                v: currentState.viewportSize,
                p: currentState.projectSettings,
                a: currentState.activeSection?.id,
                d: currentState.draggedSection?.id,
                i: currentState.isDragging || false,
                h: currentState.history?.past?.length || 0,
                u: currentState.canUndo || false,
                r: currentState.canRedo || false,
            });
            if (hash === lastStateHashRef.current) {
                return; // no meaningful changes
            }
            lastStateHashRef.current = hash;
            saveToCache(currentState);
        }, 2000); // 2 second delay
    };

    // Manual save
    const manualSave = () => {
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }
        const currentState = getCurrentState();
        saveToCache(currentState);
    };

    // Clear cache for this page
    const clearCache = () => {
        clearPageCache(pageId);
        lastSaveRef.current = 0;

        if (process.env.NODE_ENV === 'development') {
            console.log(`[WebsiteBuilderCache] Cleared cache for ${pageId}`);
        }
    };

    // Check if cache is fresh (less than 5 minutes old)
    const isCacheFresh = (): boolean => {
        const cached = getPageCache(pageId);
        if (!cached) return false;

        const data = cached as WebsiteBuilderCacheData;
        const fiveMinutes = 5 * 60 * 1000;
        return Date.now() - data.lastModified < fiveMinutes;
    };

    // Initialize cache on mount
    useEffect(() => {
        // Try to load from cache first
        const restored = loadFromCache();

        if (restored) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[WebsiteBuilderCache] Successfully restored state for ${pageId}`);
            }
        } else {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[WebsiteBuilderCache] No cached state found for ${pageId}, starting fresh`);
            }
        }

        // Set up auto-save for important state changes using comprehensive polling + hash
        const interval = setInterval(() => {
            const currentState = getCurrentState();
            const hash = JSON.stringify({
                s: currentState.page1SectionCodes.map((s) => s.id),
                n: currentState.nodes.length,
                e: currentState.edges.length,
                c: currentState.canvasType,
                v: currentState.viewportSize,
                p: currentState.projectSettings,
                a: currentState.activeSection?.id,
                d: currentState.draggedSection?.id,
                i: currentState.isDragging || false,
                h: currentState.history?.past?.length || 0,
                u: currentState.canUndo || false,
                r: currentState.canRedo || false,
            });
            if (hash !== lastStateHashRef.current) {
                autoSave();
            }
        }, 2000); // Check every 2 seconds

        return () => {
            clearInterval(interval);
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [pageId]);

    // Save on unmount
    useEffect(() => {
        return () => {
            // Save current state before unmounting
            const currentState = getCurrentState();
            saveToCache(currentState);
        };
    }, []);

    return {
        saveToCache,
        loadFromCache,
        autoSave,
        manualSave,
        clearCache,
        isCacheFresh,
        getCurrentState,
        lastSaved: lastSaveRef.current,
    };
};
