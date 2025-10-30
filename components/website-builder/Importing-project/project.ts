export interface ProjectFileItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
    extension?: string;
    children?: ProjectFileItem[];
    parentId?: string;
    saved?: boolean;
}

export type ProjectType = 'nextjs' | 'vite' | 'html' | 'astro';

export interface ProjectInfo {
    name: string;
    type: ProjectType;
    files: ProjectFileItem[];
    createdAt: Date;
    fileCount: number;
    folderCount: number;
}
