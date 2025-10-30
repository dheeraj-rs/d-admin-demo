'use client';

import { ProjectFileItem } from './project';

interface ProjectsListProps {
    projects: { [key: string]: ProjectFileItem[] };
    onProjectSelect: (projectName: string) => void;
    onExportProject: (projectName: string) => void;
}

export default function ProjectsList({ projects, onProjectSelect, onExportProject }: ProjectsListProps) {
    if (Object.keys(projects).length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                    </svg>
                </div>
                <h3>No Projects Yet</h3>
                <p>Import your first project folder to get started</p>
            </div>
        );
    }

    const getProjectStats = (files: ProjectFileItem[]) => {
        let fileCount = 0;
        let folderCount = 0;

        const countItems = (items: ProjectFileItem[]) => {
            items.forEach((item) => {
                if (item.type === 'file') {
                    fileCount++;
                } else if (item.type === 'folder') {
                    folderCount++;
                    if (item.children) {
                        countItems(item.children);
                    }
                }
            });
        };

        countItems(files);
        return { fileCount, folderCount };
    };

    const getProjectType = (projectName: string) => {
        if (projectName.includes('nextjs')) return 'Next.js';
        if (projectName.includes('vite')) return 'Vite';
        if (projectName.includes('html')) return 'HTML';
        if (projectName.includes('astro')) return 'Astro';
        return 'Unknown';
    };

    return (
        <div className="projects-list">
            <h2>Your Projects</h2>
            <div className="projects-grid">
                {Object.entries(projects).map(([projectName, files]) => {
                    const stats = getProjectStats(files);
                    const projectType = getProjectType(projectName);

                    return (
                        <div key={projectName} className="project-card fade-in">
                            <div className="project-header">
                                <div className="project-icon">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                        />
                                    </svg>
                                </div>
                                <div className="project-name">{projectName}</div>
                                <div className="project-type-badge">{projectType}</div>
                            </div>

                            <div className="project-stats">
                                <span>{stats.fileCount} files</span>
                                <span>{stats.folderCount} folders</span>
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-primary" onClick={() => onProjectSelect(projectName)} style={{ flex: 1 }}>
                                    View Files
                                </button>
                                <button
                                    className="btn export-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onExportProject(projectName);
                                    }}
                                >
                                    Export
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
