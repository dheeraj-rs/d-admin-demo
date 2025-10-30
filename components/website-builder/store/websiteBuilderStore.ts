import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import { ProjectSettings as LibProjectSettings } from '../../../lib/types';

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

// Define SectionCodeProps interface based on its usage in SectionPreview.tsx
export interface SectionCodeProps {
    id: string;
    name: string;
    type: string;
    snippet: string;
    language: string;
    version: string;
    props: Record<string, any>;
}

// Extend the ProjectSettings interface from lib/types.ts and add other necessary properties
export interface ProjectSettings extends LibProjectSettings {
    _id?: string; // Assuming _id might come from the backend
    name: string;
    websiteType: string;
    paymentType: string;
    paymentAmount: number;
    publishedUrl?: string;
    author: string;
    version?: string;
    support?: string;
    thumbnail?: string;
    screenshots?: string[];
    features?: string[];
    technologies?: string[];
    snippet?: SectionCodeProps[]; // Use the corrected SectionCodeProps type for the snippet array
    longDescription?: string;
}

interface ComponentState {
    activeSection: SectionCodeProps | null;
    page1SectionCodes: SectionCodeProps[];
    history: {
        past: SectionCodeProps[][];
        future: SectionCodeProps[][];
    };
    isPropertiesPanelOpen?: boolean;
    isProjectFilesPanelOpen?: boolean;
    isPreviewMode?: boolean;
    viewportSize: ViewportSize;
    draggedSection: SectionCodeProps | null;
    isDragging: boolean;
    canUndo: boolean;
    canRedo: boolean;
    projectSettings: ProjectSettings;
    isSaveProject: boolean;
    isWebsitePreview: { isPreview: boolean; websiteId: string | null };
    selectedProjectFile?: string;
    isImportPanelOpen?: boolean; // Assuming this is needed based on recent changes

    setActiveSection: (snippet: SectionCodeProps | null) => void;
    addPage1SectionCodes: (snippet: SectionCodeProps) => void;
    setPage1SectionCodes: (snippets: SectionCodeProps[]) => void;
    moveSection: (id: string, direction: string) => void;
    duplicateSection: (id: string) => void;
    deleteSection: (id: string) => void;
    togglePropertiesPanel: (isOpen: boolean) => void;
    toggleProjectFilesPanel: (isOpen: boolean) => void;
    toggleImportPanel: (isOpen: boolean) => void;
    togglePreviewMode: () => void;
    setViewportSize: (size: ViewportSize) => void;
    setDraggedSection: (snippet: SectionCodeProps | null) => void;
    setIsDragging: (isDragging: boolean) => void;
    replaceSection: (snippet: SectionCodeProps, id: string) => void;
    setSelectedProjectFile: (file: string | undefined) => void;
    undo: () => void;
    redo: () => void;
    saveProject: () => void;
    canvasType: 'classic' | 'flow';
    nodes: Node[];
    edges: Edge[];
    setCanvasType: (type: 'classic' | 'flow') => void;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    updateComponentProps: (id: string, props: Record<string, any>) => void;
    setIsSaveProject: (isSaveProject: boolean) => void;
    setProjectSettings: (settings: Partial<ProjectSettings>) => void; // Allow partial updates
    setWebsitePreview: (isPreview: boolean, websiteId: string | null) => void;

    // Assuming these are no longer needed based on recent changes or refactoring
    // draggedComponent: any; // Remove or type correctly if used
    // pageComponents: any[]; // Remove or type correctly if used
    // draggedItemCode: string; // Remove or type correctly if used
    // draggedItemSnippets: any[]; // Remove or type correctly if used
}

const websiteBuilderStore = create<ComponentState>((set, get) => ({
    activeSection: null,
    page1SectionCodes: [],
    history: {
        past: [],
        future: [],
    },
    isPropertiesPanelOpen: false,
    isPreviewMode: false,
    isProjectFilesPanelOpen: false,
    viewportSize: 'desktop',
    draggedSection: null,
    isDragging: false,
    canUndo: false,
    canRedo: false,
    canvasType: 'classic',
    nodes: [],
    edges: [],
    // Initialize projectSettings with default values for all required fields
    projectSettings: {
        _id: '',
        name: '',
        websiteType: '',
        paymentType: '',
        paymentAmount: 0,
        publishedUrl: '',
        author: '',
        version: '',
        support: '',
        thumbnail: '',
        description: '',
        longDescription: '',
        features: [],
        screenshots: [],
        technologies: [],
        snippet: [],
        // Added missing properties from lib/types.ts with default values
        title: 'My Website', // Default title
        favicon: '', // Default favicon
        siteUrl: '', // Default site URL
        primaryColor: '#007bff', // Default primary color
        secondaryColor: '#6c757d', // Default secondary color
        fontFamily: 'sans-serif', // Default font family
    },
    isSaveProject: false,
    isWebsitePreview: { isPreview: false, websiteId: null },
    selectedProjectFile: '',
    isImportPanelOpen: false, // Assuming this is needed based on recent changes
    // Assuming these are no longer needed and can be removed
    // draggedComponent: null,
    // pageComponents: [],
    // draggedItemCode: '',
    // draggedItemSnippets: [],

    setActiveSection: (snippet) => {
        set(() => {
            return {
                activeSection: snippet,
                // isPropertiesPanelOpen: snippet !== null,
            };
        });
    },

    setPage1SectionCodes: (snippets) => {
        set((state) => ({
            page1SectionCodes: snippets,
            history: {
                past: [...state.history.past, state.page1SectionCodes],
                future: [],
            },
            canUndo: true,
            canRedo: false,
        }));
    },
    addPage1SectionCodes: (snippet) => {
        const { page1SectionCodes } = get();
        // Create a new section with a unique ID
        const newSectionCodes = {
            ...snippet,
            id: `${snippet.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        set((state) => ({
            history: {
                past: [...state.history.past, page1SectionCodes],
                future: [],
            },
            canUndo: true,
            canRedo: false,
            page1SectionCodes: [...page1SectionCodes, newSectionCodes],
            // Clear active section when adding a new one
            activeSection: null,
        }));
    },
    moveSection: (id, direction) => {
        const { page1SectionCodes } = get();
        const index = page1SectionCodes.findIndex((c) => c.id === id);
        if (index === -1) return;
        const newSection = [...page1SectionCodes];
        if (direction === 'up' && index > 0) {
            [newSection[index], newSection[index - 1]] = [newSection[index - 1], newSection[index]];
        } else if (direction === 'down' && index < page1SectionCodes.length - 1) {
            [newSection[index], newSection[index + 1]] = [newSection[index + 1], newSection[index]];
        } else {
            return;
        }
        set((state) => ({
            history: {
                past: [...state.history.past, page1SectionCodes],
                future: [],
            },
            canUndo: true,
            canRedo: false,
            page1SectionCodes: newSection,
        }));
    },
    duplicateSection: (id) => {
        const { page1SectionCodes } = get();
        const section = page1SectionCodes.find((c) => c.id === id);
        if (!section) return;
        const newId = Date.now().toString();
        const updateSection = {
            ...section,
            id: newId,
        };
        const index = page1SectionCodes.findIndex((c) => c.id === id);
        const newSection = [...page1SectionCodes.slice(0, index + 1), updateSection, ...page1SectionCodes.slice(index + 1)];
        set((state) => ({
            history: {
                past: [...state.history.past, page1SectionCodes],
                future: [],
            },
            canUndo: true,
            canRedo: false,
            page1SectionCodes: newSection,
            activeSection: section,
        }));
    },
    deleteSection: (id) => {
        const { page1SectionCodes, activeSection } = get();
        set((state) => ({
            history: {
                past: [...state.history.past, page1SectionCodes],
                future: [],
            },
            canUndo: true,
            canRedo: false,
            page1SectionCodes: page1SectionCodes.filter((c) => c.id !== id),
            activeSection: activeSection?.id === id ? null : activeSection,
        }));
    },
    togglePropertiesPanel: (isOpen) => {
        set((state) => ({
            isPropertiesPanelOpen: typeof isOpen === 'boolean' ? isOpen : !Boolean(state.isPropertiesPanelOpen),
        }));
    },
    togglePreviewMode: () => set((state) => ({ isPreviewMode: !state.isPreviewMode })),
    toggleProjectFilesPanel: (isOpen) => set({ isProjectFilesPanelOpen: isOpen }),
    toggleImportPanel: (isOpen) => set({ isImportPanelOpen: isOpen }),
    setWebsitePreview: (isPreview, websiteId) => set({ isWebsitePreview: { isPreview, websiteId } }),
    setViewportSize: (size) => set({ viewportSize: size }),
    setDraggedSection: (snippet) => set({ draggedSection: snippet }),
    setIsDragging: (isDragging) => set({ isDragging }),
    setSelectedProjectFile: (file) => set({ selectedProjectFile: file }),
    replaceSection: (snippet, id) => {
        const { page1SectionCodes } = get();
        const index = page1SectionCodes.findIndex((c) => c.id === id);
        if (index === -1) return;

        // Create new component with the original ID
        const newComponent = {
            ...snippet,
            id: id,
        };

        const newComponents = [...page1SectionCodes];
        newComponents[index] = newComponent;

        set({
            page1SectionCodes: newComponents,
            activeSection: newComponent,
            history: {
                past: [...get().history.past, page1SectionCodes],
                future: [],
            },
            canUndo: true,
            canRedo: false,
        });
    },
    undo: () => {
        const { history } = get();
        if (history.past.length === 0) return;
        const newPast = [...history.past];
        const previousState = newPast.pop();
        set((state) => ({
            page1SectionCodes: previousState || [],
            activeSection: null,
            history: {
                past: newPast,
                future: [state.page1SectionCodes, ...state.history.future],
            },
            canUndo: newPast.length > 0,
            canRedo: true,
        }));
    },
    redo: () => {
        const { history } = get();
        if (history.future.length === 0) return;
        const [nextState, ...newFuture] = history.future;
        set((state) => ({
            page1SectionCodes: nextState,
            activeSection: null,
            history: {
                past: [...state.history.past, state.page1SectionCodes],
                future: newFuture,
            },
            canUndo: true,
            canRedo: newFuture.length > 0,
        }));
    },
    saveProject: () => {
        const { page1SectionCodes } = get();
        try {
            const data = JSON.stringify({
                page1SectionCodes,
                version: '1.0',
            });
            localStorage.setItem('webcraft-project', data);
            alert('Project saved successfully');
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Failed to save project');
        }
    },
    setCanvasType: (canvasType) => set({ canvasType }),
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    updateComponentProps: (id, props) => {
        set((state) => ({
            page1SectionCodes: state.page1SectionCodes.map((section) => (section.id === id ? { ...section, props: { ...section.props, ...props } } : section)),
        }));
    },
    setIsSaveProject: (isSaveProject) => set({ isSaveProject }),
    setProjectSettings: (settings) =>
        set((state) => ({
            projectSettings: {
                ...state.projectSettings,
                ...settings,
            },
        })),
}));

export default websiteBuilderStore;
