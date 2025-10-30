'use client';

import { useState, useCallback, useEffect, use } from 'react';
import { FiMenu, FiPlus, FiSave, FiDownload, FiTool, FiChevronLeft } from 'react-icons/fi';
import CreateItemModal from './components/CreateItemModal';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import websiteBuilderStore from '../../../components/website-builder/store/websiteBuilderStore';
import './globals.scss';
import { DEFAULT_ASTRO_FILES, DEFAULT_HTML_FILES, DEFAULT_NEXT_JS_FILES, DEFAULT_VITE_FILES, ProjectFileItem } from '../../../service/ProjectBuilder/ProjectStructure';

export default function FileManager() {
    const [files, setFiles] = useState<ProjectFileItem[]>(DEFAULT_NEXT_JS_FILES);
    const [selectedFile, setSelectedFile] = useState<ProjectFileItem | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [currentFolder, setCurrentFolder] = useState<string | null>(null);
    const [unsavedFiles, setUnsavedFiles] = useState<Set<string>>(new Set());

    const { page1SectionCodes, selectedProjectFile, toggleProjectFilesPanel, toggleImportPanel } = websiteBuilderStore();

    useEffect(() => {
        switch (selectedProjectFile) {
            case 'next':
                setFiles(DEFAULT_NEXT_JS_FILES);
                break;
            case 'astro':
                setFiles(DEFAULT_ASTRO_FILES);
                break;

            case 'html':
                setFiles(DEFAULT_HTML_FILES);
                break;

            case 'vite':
                setFiles(DEFAULT_VITE_FILES);
                break;
            case 'custom':
                toggleImportPanel(true);
                break;

            default:
                setFiles(DEFAULT_NEXT_JS_FILES);
                break;
        }
    }, [selectedProjectFile, toggleImportPanel]);

    const findFileById = useCallback(
        (id: string, items: ProjectFileItem[] = files): ProjectFileItem | null => {
            for (const item of items) {
                if (item.id === id) return item;
                if (item.children) {
                    const found = findFileById(id, item.children);
                    if (found) return found;
                }
            }
            return null;
        },
        [files]
    );

    const updateFileInTree = useCallback((items: ProjectFileItem[], id: string, updates: Partial<ProjectFileItem>): ProjectFileItem[] => {
        return items.map((item) => {
            if (item.id === id) {
                return { ...item, ...updates };
            }
            if (item.children) {
                return { ...item, children: updateFileInTree(item.children, id, updates) };
            }
            return item;
        });
    }, []);

    const addItemToTree = useCallback((items: ProjectFileItem[], newItem: ProjectFileItem, parentId?: string): ProjectFileItem[] => {
        if (!parentId) {
            return [...items, newItem];
        }

        return items.map((item) => {
            if (item.id === parentId && item.type === 'folder') {
                return {
                    ...item,
                    children: [...(item.children || []), newItem],
                };
            }
            if (item.children) {
                return { ...item, children: addItemToTree(item.children, newItem, parentId) };
            }
            return item;
        });
    }, []);

    const removeItemFromTree = useCallback((items: ProjectFileItem[], id: string): ProjectFileItem[] => {
        return items.filter((item) => {
            if (item.id === id) return false;
            if (item.children) {
                item.children = removeItemFromTree(item.children, id);
            }
            return true;
        });
    }, []);

    const updateFileContent = useCallback(
        (id: string, content: string) => {
            setFiles((prev) => updateFileInTree(prev, id, { content, saved: false }));
            setUnsavedFiles((prev) => new Set(prev).add(id));

            if (selectedFile?.id === id) {
                setSelectedFile((prev) => (prev ? { ...prev, content, saved: false } : null));
            }
        },
        [selectedFile, updateFileInTree]
    );

    const saveFile = useCallback(
        (id: string) => {
            setFiles((prev) => updateFileInTree(prev, id, { saved: true }));
            setUnsavedFiles((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });

            if (selectedFile?.id === id) {
                setSelectedFile((prev) => (prev ? { ...prev, saved: true } : null));
            }
        },
        [selectedFile, updateFileInTree]
    );

    const saveAllFiles = useCallback(() => {
        const updateAllSaved = (items: ProjectFileItem[]): ProjectFileItem[] => {
            return items.map((item) => ({
                ...item,
                saved: true,
                children: item.children ? updateAllSaved(item.children) : undefined,
            }));
        };

        setFiles(updateAllSaved);
        setUnsavedFiles(new Set());
        if (selectedFile) {
            setSelectedFile((prev) => (prev ? { ...prev, saved: true } : null));
        }
    }, [selectedFile]);

    const addNewItem = useCallback(
        (item: Omit<ProjectFileItem, 'id'>) => {
            const newItem: ProjectFileItem = {
                ...item,
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                saved: true, // NEW: Set to true for newly created items
            };

            setFiles((prev) => addItemToTree(prev, newItem, currentFolder || undefined));

            // NEW: Don't add to unsavedFiles since it's a new creation, not a content change
            // The file should only be marked as unsaved when its content is actually modified
        },
        [currentFolder, addItemToTree]
    );

    const deleteItem = useCallback(
        (id: string) => {
            setFiles((prev) => removeItemFromTree(prev, id));
            if (selectedFile?.id === id) {
                setSelectedFile(null);
            }
            setUnsavedFiles((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        },
        [selectedFile, removeItemFromTree]
    );

    const handleFileSelect = useCallback((file: ProjectFileItem) => {
        if (file.type === 'file') {
            setSelectedFile(file);
            if (window.innerWidth <= 768) {
                setMobileEditorOpen(true);
            }
        }
    }, []);

    const handleCreateNew = useCallback((parentId?: string) => {
        setCurrentFolder(parentId || null);
        setShowCreateModal(true);
    }, []);

    const toggleSidebar = useCallback(() => {
        setSidebarOpen((prev) => !prev);
    }, []);

    const downloadProject = useCallback(async () => {
        const zip = new JSZip();
        const addFilesToZip = (items: ProjectFileItem[], folder: JSZip = zip) => {
            items.forEach((item) => {
                if (item.type === 'file' && item.content !== undefined) {
                    folder.file(item.name, item.content);
                } else if (item.type === 'folder' && item.children) {
                    const subFolder = folder.folder(item.name);
                    if (subFolder) {
                        addFilesToZip(item.children, subFolder);
                    }
                }
            });
        };

        addFilesToZip(files);
        try {
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'my-nextjs-project.zip');
        } catch (error) {
            console.error('Error creating zip file:', error);
        }
    }, [files]);

    const getStats = useCallback((items: ProjectFileItem[]) => {
        let fileCount = 0;
        let folderCount = 0;

        const count = (items: ProjectFileItem[]) => {
            items.forEach((item) => {
                if (item.type === 'file') fileCount++;
                else if (item.type === 'folder') {
                    folderCount++;
                    if (item.children) count(item.children);
                }
            });
        };

        count(items);
        return { fileCount, folderCount };
    }, []);

    const updatePageWithComponents = useCallback(
        (components: ProjectFileItem[]) => {
            const componentImports = components
                .map((comp) => {
                    const name = comp.name.replace('.tsx', '');
                    return `import ${name} from '../../../components/${name}';`;
                })
                .join('\n');

            const componentUsage = components
                .map((comp) => {
                    const name = comp.name.replace('.tsx', '');
                    return `      <${name} />`;
                })
                .join('\n');

            const newContent = `import React from 'react';\n${componentImports}\n\nexport default function Home() {\n  return (\n    <main>\n${componentUsage}\n    </main>\n  );\n}`;

            setFiles((prev) => updateFileInTree(prev, 'page-tsx', { content: newContent, saved: false }));
            setUnsavedFiles((prev) => new Set(prev).add('page-tsx'));
        },
        [updateFileInTree]
    );

    const updateAstroPageWithComponents = useCallback((components: ProjectFileItem[]) => {
        const componentImports = components
            .map((comp) => {
                return `import ${comp.name.replace('.astro', '')} from "../components/${comp.name}";`;
            })
            .join('\n');

        const componentUsage = components
            .map((comp) => {
                const name = comp.name.replace('.astro', ''); // or .replace('.astro', '') if components are .astro
                return `<${name}
  class="fade-in seamless full-width"
  style="animation-delay: 0.1s"
/>`;
            })
            .join('\n');

        const newContent = `---
import Layout from "../layouts/Layout.astro";
${componentImports}
const title = "My Website";
const description = "";
---
<Layout title={title} description={description}>
  <main class="w-full min-h-screen seamless">
    <!-- Seamless Component Layout - No Gaps, Full Width -->
    <div class="component-container seamless">
${componentUsage}
    </div>
  </main>
</Layout>`;

        setFiles((prev) => {
            return prev.map((item) => {
                // Find the 'src' item
                if (item.id !== 'src') return item;

                // Update children of 'src'
                const updatedSrcChildren = (item.children || []).map((srcChild) => {
                    // Find the 'pages' item inside 'src'
                    if (srcChild.id !== 'pages') return srcChild;

                    // Update children of 'pages'
                    const updatedPagesChildren = (srcChild.children || []).map((pageChild) => {
                        // Find the 'index.astro' file inside 'pages'
                        if (pageChild.id !== 'index-astro' && pageChild.id !== 'index') return pageChild;

                        // Update the index.astro file
                        return {
                            ...pageChild,
                            content: newContent,
                            saved: false,
                        };
                    });

                    // Return updated pages object
                    return { ...srcChild, children: updatedPagesChildren };
                });

                // Return updated src object
                return { ...item, children: updatedSrcChildren };
            });
        });

        setUnsavedFiles((prev) => new Set(prev).add('index-astro'));
    }, []);

    const updateVitePageWithComponents = useCallback(
        (components: ProjectFileItem[]) => {
            const componentImports = components
                .map((comp) => {
                    const name = comp.name.replace('.vue', '').replace('.tsx', '').replace('.jsx', '');
                    // Handle both Vue and React components for Vite
                    if (comp.extension === 'vue') {
                        return `import ${name} from './components/${comp.name}';`;
                    } else {
                        return `import ${name} from './components/${comp.name}';`;
                    }
                })
                .join('\n');

            const componentUsage = components
                .map((comp) => {
                    const name = comp.name.replace('.vue', '').replace('.tsx', '').replace('.jsx', '');
                    if (comp.extension === 'vue') {
                        return `    <${name} />`;
                    } else {
                        return `      <${name} />`;
                    }
                })
                .join('\n');

            // Determine if it's a Vue or React project based on existing files
            const isVueProject = files.some((file) => file.name === 'package.json' && file.content?.includes('"vue"'));

            let newContent;

            if (isVueProject) {
                // Vue component structure
                newContent = `<template>
  <main class="app-main">
${componentUsage}
  </main>
</template>

<script setup>
${componentImports}
</script>

<style scoped>
.app-main {
  width: 100%;
  min-height: 100vh;
}
</style>`;
            } else {
                // React component structure
                newContent = `import React from 'react';
${componentImports}

function App() {
  return (
    <main className="app-main">
${componentUsage}
    </main>
  );
}

export default App;`;
            }

            // Update the main component file (App.vue for Vue, App.tsx/jsx for React)
            const targetFileId = isVueProject ? 'app-vue' : 'app-tsx';
            setFiles((prev) => updateFileInTree(prev, targetFileId, { content: newContent, saved: false }));
            setUnsavedFiles((prev) => new Set(prev).add(targetFileId));
        },
        [files, updateFileInTree]
    );

    // Function to convert HTML attributes to React-compatible format
    function htmlToReact(htmlString: string): string {
        let reactCode: string = htmlString;

        // Convert class to className
        reactCode = reactCode.replace(/\bclass=/g, 'className=');

        // Convert for to htmlFor
        reactCode = reactCode.replace(/\bfor=/g, 'htmlFor=');

        // Convert style attribute from string to object
        reactCode = reactCode.replace(/style="([^"]+)"/g, (match: string, styleContent: string): string => {
            const styleObject: string = styleContent
                .split(';')
                .filter((rule: string) => rule.trim())
                .map((rule: string): string | null => {
                    const colonIndex = rule.indexOf(':');
                    if (colonIndex === -1) return null;

                    const property = rule.substring(0, colonIndex).trim();
                    const value = rule.substring(colonIndex + 1).trim();

                    if (!property || !value) return null;

                    // Convert kebab-case to camelCase
                    const camelProperty: string = property.replace(/-([a-z])/g, (_: string, letter: string) => letter.toUpperCase());

                    // Handle different value types
                    let processedValue: string = value;

                    // Handle URL values - use backticks for URLs only
                    if (value.includes('url(')) {
                        processedValue = `\`${value}\``;
                    }
                    // Handle numeric values (pure numbers)
                    else if (!isNaN(Number(value)) && value.trim() !== '') {
                        processedValue = value;
                    }
                    // Handle string values - use single quotes for normal values
                    else {
                        processedValue = `'${value}'`;
                    }

                    return `${camelProperty}: ${processedValue}`;
                })
                .filter((rule: string | null): rule is string => rule !== null)
                .join(', ');

            return `style={{ ${styleObject} }}`;
        });

        // Convert self-closing tags
        const selfClosingTags: string[] = ['img', 'input', 'br', 'hr', 'meta', 'link'];
        selfClosingTags.forEach((tag: string) => {
            const regex: RegExp = new RegExp(`<${tag}([^>]*?)(?<!/)>`, 'gi');
            reactCode = reactCode.replace(regex, `<${tag}$1 />`);
        });

        // Convert common HTML attributes
        reactCode = reactCode.replace(/\btabindex=/g, 'tabIndex=');
        reactCode = reactCode.replace(/\breadonly=/g, 'readOnly=');
        reactCode = reactCode.replace(/\bmaxlength=/g, 'maxLength=');
        reactCode = reactCode.replace(/\bcontenteditable=/g, 'contentEditable=');
        reactCode = reactCode.replace(/\bautocomplete=/g, 'autoComplete=');
        reactCode = reactCode.replace(/\bautofocus=/g, 'autoFocus=');

        return reactCode.trim();
    }

    const htmlToAstro = (htmlString: string): string => {
        return (
            htmlString
                // Convert className back to class for Astro (since Astro uses HTML-like syntax)
                .replace(/className\s*=\s*"([^"]*)"/g, 'class="$1"')
                .replace(/className\s*=\s*'([^']*)'/g, "class='$1'")
                .replace(/className\s*=\s*\{([^}]*)\}/g, 'class={$1}')
                .replace(/\bclassName\b/g, 'class')

                // Convert React-style attributes back to HTML for Astro
                .replace(/htmlFor=/g, 'for=')

                // Convert camelCase SVG attributes back to kebab-case for Astro
                .replace(/strokeWidth=/g, 'stroke-width=')
                .replace(/strokeLinecap=/g, 'stroke-linecap=')
                .replace(/strokeLinejoin=/g, 'stroke-linejoin=')
                .replace(/strokeDasharray=/g, 'stroke-dasharray=')
                .replace(/strokeDashoffset=/g, 'stroke-dashoffset=')
                .replace(/fillRule=/g, 'fill-rule=')
                .replace(/clipRule=/g, 'clip-rule=')

                // Handle viewBox (keep camelCase as it's standard in SVG)
                .replace(/viewbox=/gi, 'viewBox=')

                // Convert self-closing React tags to proper HTML format
                .replace(
                    /(<(?:input|img|br|hr|meta|link|area|base|col|embed|source|track|wbr|path|circle|rect|line|polyline|polygon|ellipse)[^>]*)\s*\/>/g,
                    '$1>'
                )

                // Handle input elements specifically - ensure they don't have closing tags
                .replace(/(<input[^>]*)>\s*<\/input>/g, '$1>')

                // Clean up any double spaces that might have been created
                .replace(/\s+/g, ' ')
                .trim()
        );
    };

    // HTML to Vue converter
    const htmlToVue = (htmlString: string): string => {
        return (
            htmlString
                // Convert class to standard HTML class (Vue uses class, not className)
                .replace(/className\s*=\s*"([^"]*)"/g, 'class="$1"')
                .replace(/className\s*=\s*'([^']*)'/g, "class='$1'")

                // Convert React event handlers to Vue event handlers
                .replace(/onClick=/g, '@click=')
                .replace(/onChange=/g, '@change=')
                .replace(/onSubmit=/g, '@submit=')
                .replace(/onInput=/g, '@input=')

                // Convert htmlFor back to for
                .replace(/htmlFor=/g, 'for=')

                // Convert React style objects to Vue style binding
                .replace(/style=\{\{([^}]+)\}\}/g, ':style="{ $1 }"')

                // Handle self-closing tags (Vue is more flexible here)
                .replace(/(<(?:input|img|br|hr|meta|link|area|base|col|embed|source|track|wbr)[^>]*)\s*\/>/g, '$1 />')

                .trim()
        );
    };

    useEffect(() => {
        if (!page1SectionCodes?.length) return;

        switch (selectedProjectFile) {
            case 'next':
                setFiles((prevFiles) => {
                    const updatedFiles = prevFiles.map((item) => {
                        if (item.id !== 'components') return item;

                        const updatedChildren = [...(item.children || [])];

                        page1SectionCodes.forEach((code) => {
                            const componentName = code.name?.replace(/\s+/g, '').replace(/^./, (c) => c.toUpperCase());

                            // Convert HTML to React-compatible format
                            const convertedSnippet = htmlToReact(code.snippet);

                            const componentContent = `import React from 'react';

export default function ${componentName}() {
  return (
    ${convertedSnippet}
  );
}`;

                            const existingIndex = updatedChildren.findIndex((child) => child.id === code.id);

                            const newFile: ProjectFileItem = {
                                id: code.id,
                                name: `${componentName}.tsx`,
                                type: 'file' as const,
                                content: componentContent,
                                extension: 'tsx',
                                parentId: 'components',
                                saved: true, // Set to true for generated components
                            };

                            if (existingIndex >= 0) {
                                updatedChildren[existingIndex] = newFile;
                            } else {
                                updatedChildren.push(newFile);
                            }
                        });

                        return { ...item, children: updatedChildren };
                    });
                    const componentFiles =
                        updatedFiles.find((f) => f.id === 'components')?.children?.filter((c) => c.type === 'file' && c.extension === 'tsx') || [];
                    if (componentFiles.length > 0) {
                        updatePageWithComponents(componentFiles);
                    }
                    return updatedFiles;
                });
                break;

            case 'astro':
                setFiles((prevFiles) => {
                    const updatedFiles = prevFiles.map((item) => {
                        if (item.id !== 'src') return item;

                        const updatedSrcChildren = (item.children || []).map((srcChild) => {
                            if (srcChild.id !== 'components') return srcChild;

                            const updatedComponentChildren = [...(srcChild.children || [])];

                            page1SectionCodes.forEach((code) => {
                                const componentName = code.name?.replace(/\s+/g, '').replace(/^./, (c) => c.toUpperCase());
                                let codeSnippet = code.snippet;
                                // Comprehensive HTML to Astro converter function
                                interface HtmlStringProcessor {
                                    (htmlString: string): string;
                                }

                                // Apply the HTML to Astro conversion
                                codeSnippet = htmlToAstro(codeSnippet);

                                // Additional Astro-specific processing
                                const processAstroSnippet = (snippet: string): string => {
                                    // Add Astro-specific class handling if needed
                                    let processed = snippet;

                                    // If the component should accept dynamic classes, modify class attributes
                                    // Example: class="static-classes" becomes class={`static-classes ${className}`}
                                    if (processed.includes('class=')) {
                                        // This is optional - only if you want dynamic class support
                                        // processed = processed.replace(/class="([^"]*)"/, 'class={`$1 ${className}`}');
                                    }

                                    return processed;
                                };

                                codeSnippet = processAstroSnippet(codeSnippet);

                                // Astro component content with proper structure
                                const componentContent = `---
// Component props interface
export interface Props {
    class?: string;
    style?: string;
    [key: string]: any; // Allow additional props
}

const { 
    class: className = "", 
    style = "",
    ...rest 
} = Astro.props;
---

${codeSnippet}

<style>
/* Component-specific styles can go here */
</style>`;

                                const existingIndex = updatedComponentChildren.findIndex((child) => child.id === code.id);
                                const newFile: ProjectFileItem = {
                                    id: code.id,
                                    name: `${componentName}.astro`,
                                    type: 'file' as const,
                                    content: componentContent,
                                    extension: 'astro',
                                    parentId: 'components',
                                    saved: true, // Set to true for generated components
                                };

                                if (existingIndex !== -1) {
                                    updatedComponentChildren[existingIndex] = newFile;
                                } else {
                                    updatedComponentChildren.push(newFile);
                                }
                            });

                            return { ...srcChild, children: updatedComponentChildren };
                        });

                        return { ...item, children: updatedSrcChildren };
                    });

                    // Find component files in the nested structure: src > components > files
                    const srcItem = updatedFiles.find((f) => f.id === 'src');
                    const componentsItem = srcItem?.children?.find((c) => c.id === 'components');
                    const componentFiles = componentsItem?.children?.filter((c) => c.type === 'file' && c.extension === 'astro') || [];

                    if (componentFiles.length > 0) {
                        updateAstroPageWithComponents(componentFiles);
                    }

                    return updatedFiles;
                });
                break;

            // Updated HTML case with Tailwind CSS support

            case 'html':
                setFiles((prevFiles) => {
                    const updatedFiles = prevFiles.map((item) => {
                        // Update index.html with components and Tailwind CSS
                        if (item.id === 'index-html' && item.type === 'file') {
                            const convertedComponents = page1SectionCodes
                                .map((code) => {
                                    const componentName = code.name?.replace(/\s+/g, '').replace(/^./, (c) => c.toUpperCase());
                                    // Don't convert Tailwind classes - keep them as they are
                                    const convertedSnippet = code.snippet
                                        // Only convert React-specific attributes, keep Tailwind classes
                                        .replace(/className=/g, 'class=')
                                        .replace(/htmlFor=/g, 'for=')
                                        // Fix self-closing tags for HTML
                                        .replace(/(<(?:input|img|br|hr|meta|link|area|base|col|embed|source|track|wbr)[^>]*)\s*\/>/g, '$1>')
                                        // Remove JSX expressions but keep the content structure
                                        .replace(/\{[^}]*\}/g, '""')
                                        .trim();

                                    return `    <!-- ${componentName} Component -->
    <section id="${componentName.toLowerCase()}-section" class="component-section">
${convertedSnippet}
    </section>`;
                                })
                                .join('\n\n');

                            // Create HTML with Tailwind CSS CDN
                            const updatedHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://unpkg.com/tailwindcss-cdn@3.4.0/tailwindcss.js"></script>
    <link rel="stylesheet" href="./styles.css">
</head>
<body class="bg-gray-50 min-h-screen">
    <main class="main-container w-full min-h-screen">
${convertedComponents}
    </main>

    <!-- JavaScript -->
    <script src="./js/main.js"></script>
</body>
</html>`;

                            return {
                                ...item,
                                content: updatedHtmlContent,
                                saved: false,
                            };
                        }

                        // Update the CSS file to complement Tailwind
                        if (item.id === 'styles' && item.type === 'folder' && item.children) {
                            const updatedStylesChildren = item.children.map((styleChild) => {
                                if (styleChild.id === 'main-css' && styleChild.type === 'file') {
                                    const componentStyles = page1SectionCodes
                                        .map((code) => {
                                            const componentName = code.name?.replace(/\s+/g, '').replace(/^./, (c) => c.toUpperCase());
                                            return `
/* ${componentName} Component Custom Styles */
#${componentName.toLowerCase()}-section {
    /* Add any custom styles that can't be achieved with Tailwind */
}`;
                                        })
                                        .join('\n');

                                    const updatedCssContent = `




${componentStyles}

`;

                                    return {
                                        ...styleChild,
                                        content: updatedCssContent,
                                        saved: false,
                                    };
                                }
                                return styleChild;
                            });

                            return { ...item, children: updatedStylesChildren };
                        }

                        // Update JavaScript to work with Tailwind classes
                        if (item.id === 'js' && item.type === 'folder' && item.children) {
                            const updatedJsChildren = item.children.map((jsChild) => {
                                if (jsChild.id === 'main-js' && jsChild.type === 'file') {
                                    const componentScripts = page1SectionCodes
                                        .map((code) => {
                                            const componentName = code.name?.replace(/\s+/g, '').replace(/^./, (c) => c.toUpperCase());
                                            return `
// ${componentName} Component JavaScript
function init${componentName}() {
    const ${componentName.toLowerCase()}Section = document.getElementById('${componentName.toLowerCase()}-section');
    if (${componentName.toLowerCase()}Section) {
        console.log('${componentName} component initialized');
        
        // Add Tailwind-enhanced interactions
        addTailwindInteractions(${componentName.toLowerCase()}Section);
        
        // Handle form submissions
        const forms = ${componentName.toLowerCase()}Section.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                
                // Add loading state with Tailwind classes
                if (submitBtn) {
                    setTailwindLoadingState(submitBtn, true);
                    
                    // Simulate form submission
                    setTimeout(() => {
                        setTailwindLoadingState(submitBtn, false);
                        showTailwindNotification('Form submitted successfully!', 'success');
                    }, 2000);
                }
                
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                console.log('${componentName} form submitted:', data);
            });
        });
        
        // Enhanced button interactions
        const buttons = ${componentName.toLowerCase()}Section.querySelectorAll('button:not([type="submit"])');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                // Add ripple effect
                addRippleEffect(this);
                console.log('${componentName} button clicked:', this.textContent);
            });
        });

        // Enhanced input interactions
        const inputs = ${componentName.toLowerCase()}Section.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
            });
            
            input.addEventListener('blur', function() {
                this.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
            });
            
            input.addEventListener('change', function(e) {
                console.log('${componentName} input changed:', this.name, this.value);
            });
        });
    }
}`;
                                        })
                                        .join('\n');

                                    const updatedJsContent = `// JavaScript for HTML project with Tailwind CSS support

document.addEventListener('DOMContentLoaded', function() {    
    // Initialize Tailwind-enhanced features
    initTailwindFeatures();
    
    // Initialize all components
${page1SectionCodes
                                            .map((code) => {
                                                const componentName = code.name?.replace(/\s+/g, '').replace(/^./, (c) => c.toUpperCase());
                                                return `    init${componentName}();`;
                                            })
                                            .join('\n')}
    
    // Initialize global functionality
    setupGlobalFeatures();
});

${componentScripts}

// Tailwind-specific helper functions
function initTailwindFeatures() {
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                entry.target.style.animationDelay = '0.1s';
            }
        });
    }, observerOptions);
    
    // Observe all component sections
    document.querySelectorAll('.component-section').forEach(section => {
        observer.observe(section);
    });
}

function addTailwindInteractions(container) {
    // Add hover effects to interactive elements
    const interactiveElements = container.querySelectorAll('button, .btn, [role="button"], .card, .hover\\:shadow-lg');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            if (this.classList.contains('hover:shadow-lg')) {
                this.classList.add('shadow-lg');
            }
            if (this.classList.contains('hover:scale-105')) {
                this.classList.add('scale-105');
            }
        });
        
        el.addEventListener('mouseleave', function() {
            this.classList.remove('shadow-lg', 'scale-105');
        });
    });
}

function setTailwindLoadingState(element, loading) {
    if (loading) {
        element.dataset.originalText = element.textContent;
        element.dataset.originalClasses = element.className;
        
        // Add loading classes
        element.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
        element.innerHTML = \`
            <div class="flex items-center justify-center">
                <div class="spinner w-4 h-4 border-2 border-gray-300 border-t-current rounded-full animate-spin mr-2"></div>
                Loading...
            </div>
        \`;
        element.disabled = true;
    } else {
        element.textContent = element.dataset.originalText || element.textContent;
        element.className = element.dataset.originalClasses || element.className;
        element.disabled = false;
        delete element.dataset.originalText;
        delete element.dataset.originalClasses;
    }
}

function addRippleEffect(button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = \`
        position: absolute;
        width: \${size}px;
        height: \${size}px;
        left: \${x}px;
        top: \${y}px;
        background: rgba(255, 255, 255, 0.4);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    \`;
    
    if (!button.style.position) button.style.position = 'relative';
    if (!button.style.overflow) button.style.overflow = 'hidden';
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Global helper functions
function setupGlobalFeatures() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add Tailwind classes to forms for better styling
    document.querySelectorAll('form').forEach(form => {
        if (!form.classList.contains('space-y-4')) {
            form.classList.add('space-y-4');
        }
        
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                setTailwindLoadingState(submitBtn, true);
            }
        });
    });

    // Enhance inputs with Tailwind classes
    document.querySelectorAll('input, textarea, select').forEach(input => {
        if (!input.classList.contains('form-input')) {
            input.classList.add(
                'w-full', 'px-3', 'py-2', 'border', 'border-gray-300', 
                'rounded-md', 'focus:outline-none', 'focus:ring-2', 
                'focus:ring-blue-500', 'focus:border-blue-500', 'transition-colors'
            );
        }
    });

    // Enhance buttons with Tailwind classes
    document.querySelectorAll('button').forEach(button => {
        if (!button.classList.contains('btn-styled')) {
            button.classList.add('btn-hover', 'btn-styled');
            
            // Add default button styles if no color classes present
            if (!button.className.includes('bg-')) {
                button.classList.add(
                    'bg-blue-500', 'hover:bg-blue-600', 'text-white', 
                    'px-4', 'py-2', 'rounded-md', 'font-medium', 
                    'transition-all', 'duration-200'
                );
            }
        }
    });
}

// Enhanced notification system with Tailwind
function showTailwindNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    const typeClasses = {
        success: 'bg-green-500 border-green-600',
        error: 'bg-red-500 border-red-600',
        warning: 'bg-yellow-500 border-yellow-600',
        info: 'bg-blue-500 border-blue-600'
    };
    
    const classes = typeClasses[type] || typeClasses.info;
    
    notification.className = \`
        notification fixed top-4 right-4 \${classes} text-white 
        px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full 
        transition-transform duration-300 max-w-sm border-l-4
        flex items-center justify-between
    \`;
    
    notification.innerHTML = \`
        <div class="flex items-center">
            <span class="mr-3">\${getNotificationIcon(type)}</span>
            <span class="font-medium">\${message}</span>
        </div>
        <button class="ml-4 text-white hover:text-gray-200 font-bold text-lg leading-none" onclick="this.parentElement.remove()">×</button>
    \`;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// CSS animation keyframes for ripple effect
const style = document.createElement('style');
style.textContent = \`
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
\`;
document.head.appendChild(style);

// Export functions for global use
window.projectUtils = {
    showTailwindNotification,
    setTailwindLoadingState,
    addRippleEffect
};`;

                                    return {
                                        ...jsChild,
                                        content: updatedJsContent,
                                        saved: false,
                                    };
                                }
                                return jsChild;
                            });

                            return { ...item, children: updatedJsChildren };
                        }

                        return item;
                    });

                    // Mark the updated files as having unsaved changes
                    setUnsavedFiles((prev) => {
                        const newSet = new Set(prev);
                        newSet.add('index-html');
                        newSet.add('main-css');
                        newSet.add('main-js');
                        return newSet;
                    });

                    return updatedFiles;
                });
                break;

            case 'vite':
                setFiles((prevFiles) => {
                    const updatedFiles = prevFiles.map((item) => {
                        if (item.id !== 'src') return item;

                        const updatedSrcChildren = (item.children || []).map((srcChild) => {
                            if (srcChild.id !== 'components') return srcChild;

                            const updatedComponentChildren = [...(srcChild.children || [])];

                            page1SectionCodes.forEach((code) => {
                                const componentName = code.name?.replace(/\s+/g, '').replace(/^./, (c) => c.toUpperCase());

                                // Determine if this is a Vue or React Vite project
                                const isVueProject = prevFiles.some((file) => file.name === 'package.json' && file.content?.includes('"vue"'));

                                let componentContent;
                                let fileExtension;

                                if (isVueProject) {
                                    // Convert to Vue component
                                    const convertedSnippet = htmlToVue(code.snippet);
                                    fileExtension = 'vue';

                                    componentContent = `<template>
  <div class="${componentName.toLowerCase()}-component">
${convertedSnippet}
  </div>
</template>

<script setup>
// Component logic here
import { ref, onMounted } from 'vue';

// Example reactive data
// const data = ref(null);

onMounted(() => {
  console.log('${componentName} component mounted');
});
</script>

<style scoped>
.${componentName.toLowerCase()}-component {
  /* Component-specific styles */
}
</style>`;
                                } else {
                                    // Convert to React component
                                    const convertedSnippet = htmlToReact(code.snippet);
                                    fileExtension = 'tsx';

                                    componentContent = `import React from 'react';

interface ${componentName}Props {
  className?: string;
  [key: string]: any;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className = '', ...props }) => {
  return (
    <div className={\`${componentName.toLowerCase()}-component \${className}\`} {...props}>
${convertedSnippet}
    </div>
  );
};

export default ${componentName};`;
                                }

                                const existingIndex = updatedComponentChildren.findIndex((child) => child.id === code.id);
                                const newFile: ProjectFileItem = {
                                    id: code.id,
                                    name: `${componentName}.${fileExtension}`,
                                    type: 'file' as const,
                                    content: componentContent,
                                    extension: fileExtension,
                                    parentId: 'components',
                                    saved: true,
                                };

                                if (existingIndex !== -1) {
                                    updatedComponentChildren[existingIndex] = newFile;
                                } else {
                                    updatedComponentChildren.push(newFile);
                                }
                            });

                            return { ...srcChild, children: updatedComponentChildren };
                        });

                        return { ...item, children: updatedSrcChildren };
                    });

                    // Find component files and update main file
                    const srcItem = updatedFiles.find((f) => f.id === 'src');
                    const componentsItem = srcItem?.children?.find((c) => c.id === 'components');
                    const componentFiles =
                        componentsItem?.children?.filter(
                            (c) => c.type === 'file' && (c.extension === 'vue' || c.extension === 'tsx' || c.extension === 'jsx')
                        ) || [];

                    if (componentFiles.length > 0) {
                        updateVitePageWithComponents(componentFiles);
                    }

                    return updatedFiles;
                });
                break;

            default:
                break;
        }
    }, [page1SectionCodes, updatePageWithComponents, updateAstroPageWithComponents, selectedProjectFile, updateVitePageWithComponents]);

    const stats = getStats(files);

    return (
        <div className="file-manager__wrapper">
            <div className="file-manager">
                <div className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
                    <div className="sidebar-header">
                        <h2>Project Files</h2>
                        <button className="btn btn-primary" onClick={() => handleCreateNew()}>
                            <FiPlus />
                        </button>
                        <button className="btn btn-secondary mobile_menu_icon" onClick={toggleSidebar}>
                            <FiMenu />
                        </button>
                    </div>

                    <div className="sidebar-content">
                        <FileTree
                            files={files}
                            selectedFile={selectedFile}
                            onFileSelect={handleFileSelect}
                            onCreateNew={handleCreateNew}
                            onDelete={deleteItem}
                            onRename={(id, newName) => {
                                // Rename should automatically save - no need for save button
                                setFiles((prev) => updateFileInTree(prev, id, { name: newName, saved: true }));
                                // Remove from unsavedFiles if it was there
                                setUnsavedFiles((prev) => {
                                    const newSet = new Set(prev);
                                    newSet.delete(id);
                                    return newSet;
                                });

                                // Update selectedFile if it's the renamed file
                                if (selectedFile?.id === id) {
                                    setSelectedFile((prev) => (prev ? { ...prev, name: newName, saved: true } : null));
                                }
                            }}
                        />
                    </div>
                </div>

                <div
                    className={`main-content ${sidebarOpen ? 'mobile-editor-active' : ''}`}
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1650&q=80')` }}
                >
                    <div className="toolbar_container">
                        <div className="toolbar_left">
                            <button className="btn btn-secondary" onClick={toggleSidebar}>
                                <FiMenu />
                            </button>
                            <button className="btn btn-secondary" disabled={unsavedFiles.size === 0} onClick={saveAllFiles}>
                                <FiSave />
                                <span>Save All</span>
                            </button>
                            <button className="btn btn-secondary" onClick={downloadProject}>
                                <FiDownload />
                                <span>Download</span>
                            </button>
                        </div>
                        <button className="btn btn-secondary" onClick={() => toggleProjectFilesPanel(false)}>
                            <i className="pi pi-times" />
                        </button>
                    </div>

                    <Editor file={selectedFile} onContentChange={updateFileContent} onSave={saveFile} />
                </div>
            </div>
            <div className="status-bar">
                <div>{selectedFile ? `Editing: ${selectedFile.name}${selectedFile.saved === false ? ' (unsaved)' : ''}` : 'No file selected'}</div>
                <div>
                    {stats.folderCount} folders, {stats.fileCount} files
                    {unsavedFiles.size > 0 && ` • ${unsavedFiles.size} unsaved`}
                </div>
            </div>

            {showCreateModal && (
                <CreateItemModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={(item) => {
                        addNewItem(item);
                        setShowCreateModal(false);
                    }}
                />
            )}
        </div>
    );
}
