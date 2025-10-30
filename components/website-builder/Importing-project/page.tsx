'use client';

import { useState, useRef } from 'react';
import JSZip from 'jszip';
import { ProjectFileItem, ProjectType } from './project';
import ImportArea from './ImportArea';
import ProjectTypeModal from './ProjectTypeModal';
import ProjectsList from './ProjectsList';
import FileTree from './FileTree';
import Sidebar from './Sidebar';
import { DEFAULT_NEXT_JS_FILES } from '../../../service/ProjectBuilder/ProjectStructure';
import './importer.css';
import websiteBuilderStore from '../store/websiteBuilderStore';

export default function FolderImporter() {
    const [projects, setProjects] = useState<{ [key: string]: ProjectFileItem[] }>({});
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<ProjectFileItem | null>(null);
    const [showProjectTypeModal, setShowProjectTypeModal] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);
    const [pendingZipFiles, setPendingZipFiles] = useState<File[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessingZip, setIsProcessingZip] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const zipInputRef = useRef<HTMLInputElement>(null);

    const { toggleProjectFilesPanel } = websiteBuilderStore();

    // Enhanced function to handle both regular files and zip extraction
    const buildFileStructure = async (files: FileList): Promise<ProjectFileItem[]> => {
        const fileMap = new Map<string, ProjectFileItem>();
        const rootItems: ProjectFileItem[] = [];

        // Convert FileList to array and sort by path
        const fileArray = Array.from(files).sort((a, b) => a.webkitRelativePath.localeCompare(b.webkitRelativePath));

        for (const file of fileArray) {
            const path = file.webkitRelativePath;
            const pathParts = path.split('/');

            // Skip the root folder name (first part)
            const relativeParts = pathParts.slice(1);

            if (relativeParts.length === 0) continue;

            let currentPath = '';
            let currentParent: ProjectFileItem[] = rootItems;

            // Create folder structure
            for (let i = 0; i < relativeParts.length - 1; i++) {
                const folderName = relativeParts[i];
                currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

                let folder = fileMap.get(currentPath);
                if (!folder) {
                    folder = {
                        id: `folder-${currentPath}-${Date.now()}`,
                        name: folderName,
                        type: 'folder',
                        children: [],
                        saved: true,
                    };
                    fileMap.set(currentPath, folder);
                    currentParent.push(folder);
                }
                currentParent = folder.children!;
            }

            // Add the file
            const fileName = relativeParts[relativeParts.length - 1];
            const fullPath = relativeParts.join('/');

            try {
                const content = await readFileAsText(file);
                const fileItem: ProjectFileItem = {
                    id: `file-${fullPath}-${Date.now()}`,
                    name: fileName,
                    type: 'file',
                    content: content,
                    extension: fileName.split('.').pop(),
                    saved: true,
                };

                currentParent.push(fileItem);
            } catch (error) {
                console.error(`Error reading file ${fileName}:`, error);
                // Add file without content if reading fails
                const fileItem: ProjectFileItem = {
                    id: `file-${fullPath}-${Date.now()}`,
                    name: fileName,
                    type: 'file',
                    content: 'Error reading file content',
                    extension: fileName.split('.').pop(),
                    saved: true,
                };
                currentParent.push(fileItem);
            }
        }

        return rootItems;
    };

    // New function to build file structure from extracted zip contents
    const buildFileStructureFromZip = async (zipFiles: { [key: string]: JSZip.JSZipObject }): Promise<ProjectFileItem[]> => {
        const fileMap = new Map<string, ProjectFileItem>();
        const rootItems: ProjectFileItem[] = [];

        // Sort paths for consistent structure building
        const sortedPaths = Object.keys(zipFiles).sort();

        for (const fullPath of sortedPaths) {
            const zipObject = zipFiles[fullPath];

            // Skip directories (they end with /)
            if (fullPath.endsWith('/')) continue;

            const pathParts = fullPath.split('/');
            const fileName = pathParts[pathParts.length - 1];

            // Skip empty file names
            if (!fileName) continue;

            let currentPath = '';
            let currentParent: ProjectFileItem[] = rootItems;

            // Create folder structure
            for (let i = 0; i < pathParts.length - 1; i++) {
                const folderName = pathParts[i];
                currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

                let folder = fileMap.get(currentPath);
                if (!folder) {
                    folder = {
                        id: `folder-${currentPath}-${Date.now()}-${Math.random()}`,
                        name: folderName,
                        type: 'folder',
                        children: [],
                        saved: true,
                    };
                    fileMap.set(currentPath, folder);
                    currentParent.push(folder);
                }
                currentParent = folder.children!;
            }

            // Add the file
            try {
                const content = await readZipFileAsText(zipObject, fileName);
                const fileItem: ProjectFileItem = {
                    id: `file-${fullPath}-${Date.now()}-${Math.random()}`,
                    name: fileName,
                    type: 'file',
                    content: content,
                    extension: fileName.split('.').pop(),
                    saved: true,
                };

                currentParent.push(fileItem);
            } catch (error) {
                console.error(`Error reading zip file ${fileName}:`, error);
                // Add file without content if reading fails
                const fileItem: ProjectFileItem = {
                    id: `file-${fullPath}-${Date.now()}-${Math.random()}`,
                    name: fileName,
                    type: 'file',
                    content: 'Error reading file content',
                    extension: fileName.split('.').pop(),
                    saved: true,
                };
                currentParent.push(fileItem);
            }
        }

        return rootItems;
    };

    // Helper function to read zip file content as text
    const readZipFileAsText = async (zipObject: JSZip.JSZipObject, fileName: string): Promise<string> => {
        try {
            // Check if it's a text file based on extension
            const textExtensions = [
                '.js',
                '.jsx',
                '.ts',
                '.tsx',
                '.css',
                '.html',
                '.json',
                '.md',
                '.txt',
                '.yml',
                '.yaml',
                '.xml',
                '.svg',
                '.vue',
                '.py',
                '.java',
                '.c',
                '.cpp',
                '.php',
                '.rb',
                '.go',
                '.rs',
                '.sh',
            ];
            const isTextFile =
                textExtensions.some((ext) => fileName.toLowerCase().endsWith(ext)) ||
                fileName.toLowerCase().includes('readme') ||
                fileName.toLowerCase().includes('license') ||
                fileName.toLowerCase().includes('dockerfile') ||
                !fileName.includes('.');

            if (isTextFile) {
                return await zipObject.async('text');
            } else {
                return `[Binary file: ${fileName}]`;
            }
        } catch (error) {
            console.error(`Error reading zip file ${fileName}:`, error);
            return `[Error reading file: ${fileName}]`;
        }
    };

    // Enhanced function to handle both folder and zip imports
    const handleFilesImport = async (files: FileList | null, zipFiles: File[], projectType: ProjectType) => {
        try {
            setIsProcessingZip(true);
            let fileStructure: ProjectFileItem[] = [];

            if (files && files.length > 0) {
                // Handle regular folder import
                fileStructure = await buildFileStructure(files);
            } else if (zipFiles.length > 0) {
                // Handle zip file import
                const allZipContents: { [key: string]: JSZip.JSZipObject } = {};

                for (const zipFile of zipFiles) {
                    const zip = new JSZip();
                    const zipContents = await zip.loadAsync(zipFile);

                    // Merge all zip contents
                    zipContents.forEach((relativePath, file) => {
                        allZipContents[relativePath] = file;
                    });
                }

                fileStructure = await buildFileStructureFromZip(allZipContents);
            }

            const projectName = `${projectType}-project-${Date.now()}`;

            setProjects((prev) => ({
                ...prev,
                [projectName]: fileStructure,
            }));

            setSelectedProject(projectName);
            setShowProjectTypeModal(false);
            setPendingFiles(null);
            setPendingZipFiles([]);
        } catch (error) {
            console.error('Error importing files:', error);
            alert('Error importing files. Please try again.');
        } finally {
            setIsProcessingZip(false);
        }
    };

    const readFileAsText = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve((e.target?.result as string) || '');
            reader.onerror = reject;

            // Handle different file types
            if (
                file.type.startsWith('text/') ||
                file.name.endsWith('.js') ||
                file.name.endsWith('.jsx') ||
                file.name.endsWith('.ts') ||
                file.name.endsWith('.tsx') ||
                file.name.endsWith('.css') ||
                file.name.endsWith('.html') ||
                file.name.endsWith('.json') ||
                file.name.endsWith('.md') ||
                file.name.endsWith('.txt') ||
                file.name.endsWith('.yml') ||
                file.name.endsWith('.yaml') ||
                file.name.endsWith('.xml') ||
                file.name.endsWith('.svg')
            ) {
                reader.readAsText(file);
            } else {
                // For binary files, just resolve with a placeholder
                resolve(`[Binary file: ${file.name}]`);
            }
        });
    };

    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // New function to handle zip import
    const handleZipImportClick = () => {
        if (zipInputRef.current) {
            zipInputRef.current.click();
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setPendingFiles(files);
            setPendingZipFiles([]);
            setShowProjectTypeModal(true);
        }
    };

    // New function to handle zip file input
    const handleZipInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const zipFiles = Array.from(files).filter((file) => file.name.toLowerCase().endsWith('.zip'));

            if (zipFiles.length > 0) {
                setPendingZipFiles(zipFiles);
                setPendingFiles(null);
                setShowProjectTypeModal(true);
            } else {
                alert('Please select valid .zip files');
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);

        // Check if dropped files are zip files
        const zipFiles = files.filter((file) => file.name.toLowerCase().endsWith('.zip'));

        if (zipFiles.length > 0) {
            setPendingZipFiles(zipFiles);
            setPendingFiles(null);
            setShowProjectTypeModal(true);
            return;
        }

        // Handle folder drop (existing logic)
        const items = e.dataTransfer.items;

        if (items) {
            const folderFiles: File[] = [];
            const promises: Promise<void>[] = [];

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === 'file') {
                    const entry = item.webkitGetAsEntry();
                    if (entry) {
                        promises.push(traverseFileTree(entry, '', folderFiles));
                    }
                }
            }

            Promise.all(promises).then(() => {
                if (folderFiles.length > 0) {
                    // Create a FileList-like object
                    const fileList = createFileList(folderFiles);
                    setPendingFiles(fileList);
                    setPendingZipFiles([]);
                    setShowProjectTypeModal(true);
                }
            });
        }
    };

    const traverseFileTree = (item: any, path: string, files: File[]): Promise<void> => {
        return new Promise((resolve) => {
            if (item.isFile) {
                item.file((file: File) => {
                    // Add webkitRelativePath property
                    Object.defineProperty(file, 'webkitRelativePath', {
                        value: path + file.name,
                        writable: false,
                    });
                    files.push(file);
                    resolve();
                });
            } else if (item.isDirectory) {
                const dirReader = item.createReader();
                dirReader.readEntries((entries: any[]) => {
                    const promises = entries.map((entry) => traverseFileTree(entry, path + item.name + '/', files));
                    Promise.all(promises).then(() => resolve());
                });
            } else {
                resolve();
            }
        });
    };

    const createFileList = (files: File[]): FileList => {
        const fileList = {
            length: files.length,
            item: (index: number) => files[index] || null,
            [Symbol.iterator]: function* () {
                for (const file of files) {
                    yield file;
                }
            },
        };

        // Add indexed properties
        files.forEach((file, index) => {
            (fileList as any)[index] = file;
        });

        return fileList as FileList;
    };

    const loadTemplate = (projectType: ProjectType) => {
        const projectName = `${projectType}-template-${Date.now()}`;
        let templateFiles: ProjectFileItem[] = [];

        switch (projectType) {
            case 'nextjs':
                templateFiles = [...DEFAULT_NEXT_JS_FILES];
                break;
            case 'vite':
                templateFiles = createViteTemplate();
                break;
            case 'html':
                templateFiles = createHtmlTemplate();
                break;
            case 'astro':
                templateFiles = createAstroTemplate();
                break;
        }

        setProjects((prev) => ({
            ...prev,
            [projectName]: templateFiles,
        }));

        setSelectedProject(projectName);
    };

    const createViteTemplate = (): ProjectFileItem[] => [
        {
            id: 'vite-package-json',
            name: 'package.json',
            type: 'file',
            extension: 'json',
            content: JSON.stringify(
                {
                    name: 'vite-project',
                    private: true,
                    version: '0.0.0',
                    type: 'module',
                    scripts: {
                        dev: 'vite',
                        build: 'vite build',
                        preview: 'vite preview',
                    },
                    dependencies: {
                        react: '^18.2.0',
                        'react-dom': '^18.2.0',
                    },
                    devDependencies: {
                        vite: '^5.0.0',
                        '@vitejs/plugin-react': '^4.2.0',
                    },
                },
                null,
                2
            ),
            saved: true,
        },
        {
            id: 'vite-config',
            name: 'vite.config.js',
            type: 'file',
            extension: 'js',
            content:
                'import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({\n  plugins: [react()],\n});',
            saved: true,
        },
    ];

    const createHtmlTemplate = (): ProjectFileItem[] => [
        {
            id: 'html-index',
            name: 'index.html',
            type: 'file',
            extension: 'html',
            content:
                '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>HTML Project</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <h1>Hello World</h1>\n    <script src="script.js"></script>\n</body>\n</html>',
            saved: true,
        },
        {
            id: 'html-style',
            name: 'style.css',
            type: 'file',
            extension: 'css',
            content:
                'body {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f0f0f0;\n}\n\nh1 {\n    color: #333;\n    text-align: center;\n}',
            saved: true,
        },
    ];

    const createAstroTemplate = (): ProjectFileItem[] => [
        {
            id: 'astro-package-json',
            name: 'package.json',
            type: 'file',
            extension: 'json',
            content: JSON.stringify(
                {
                    name: 'astro-project',
                    type: 'module',
                    version: '0.0.1',
                    scripts: {
                        dev: 'astro dev',
                        start: 'astro dev',
                        build: 'astro build',
                        preview: 'astro preview',
                    },
                    dependencies: {
                        astro: '^4.0.0',
                    },
                },
                null,
                2
            ),
            saved: true,
        },
        {
            id: 'astro-config',
            name: 'astro.config.mjs',
            type: 'file',
            extension: 'mjs',
            content: 'import { defineConfig } from "astro/config";\n\nexport default defineConfig({});',
            saved: true,
        },
    ];

    const saveProjectStructure = (projectName: string) => {
        const project = projects[projectName];
        console.log('project :', project);
        if (!project) return;

        // const dataStr = JSON.stringify(project, null, 2);
        // const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        // const exportFileDefaultName = `${projectName}-structure.json`;

        // const linkElement = document.createElement('a');
        // linkElement.setAttribute('href', dataUri);
        // linkElement.setAttribute('download', exportFileDefaultName);
        // linkElement.click();
    };

    return (
        <div className="app-container__wrapper">
            <main className="main-content">
                <button className="btn btn-secondary" onClick={() => toggleProjectFilesPanel(false)}>
                    <i className="pi pi-times" />
                </button>
                <div className="header">
                    <h1>Folder Import Manager</h1>
                    <p>Import and organize your project folders with intelligent structure recognition</p>
                </div>

                {!selectedProject ? (
                    <>
                        <div className="import-section">
                            <ImportArea
                                onImportClick={handleImportClick}
                                onZipImportClick={handleZipImportClick}
                                onDrop={handleDrop}
                                isProcessingZip={isProcessingZip}
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                // @ts-ignore
                                webkitdirectory="true"
                                style={{ display: 'none' }}
                                onChange={handleFileInputChange}
                                // {...({} as any)}
                            />
                            <input ref={zipInputRef} type="file" multiple accept=".zip" style={{ display: 'none' }} onChange={handleZipInputChange} />
                        </div>

                        <ProjectsList projects={projects} onProjectSelect={setSelectedProject} onExportProject={saveProjectStructure} />
                    </>
                ) : (
                    <FileTree
                        files={projects[selectedProject] || []}
                        selectedFile={selectedFile}
                        onFileSelect={setSelectedFile}
                        projectName={selectedProject}
                        onBack={() => setSelectedProject(null)}
                        onSaveProject={() => saveProjectStructure(selectedProject)}
                    />
                )}

                {showProjectTypeModal && (
                    <ProjectTypeModal
                        onSelectType={(type) => {
                            handleFilesImport(pendingFiles, pendingZipFiles, type);
                        }}
                        onClose={() => {
                            setShowProjectTypeModal(false);
                            setPendingFiles(null);
                            setPendingZipFiles([]);
                        }}
                    />
                )}
            </main>
        </div>
    );
}
