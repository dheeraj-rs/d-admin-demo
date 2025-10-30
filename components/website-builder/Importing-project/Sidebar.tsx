'use client';

import { ProjectFileItem, ProjectType } from './project';

interface SidebarProps {
    projects: { [key: string]: ProjectFileItem[] };
    selectedProject: string | null;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onProjectSelect: (projectName: string) => void;
    onLoadTemplate: (type: ProjectType) => void;
}

export default function Sidebar({ projects, selectedProject, searchTerm, onSearchChange, onProjectSelect, onLoadTemplate }: SidebarProps) {
    const filteredProjects = Object.keys(projects).filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()));

    const templates = [
        { type: 'nextjs' as ProjectType, name: 'Next.js', desc: 'React framework' },
        { type: 'vite' as ProjectType, name: 'Vite', desc: 'Fast build tool' },
        { type: 'html' as ProjectType, name: 'HTML', desc: 'Static website' },
        { type: 'astro' as ProjectType, name: 'Astro', desc: 'Modern static' },
    ];

    return (
        <aside className="sidebar">
            <h2>Projects</h2>

            <input type="text" placeholder="Search projects..." className="search-box" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} />

            <div style={{ marginBottom: '2rem' }}>
                <h4>Your Projects</h4>
                {filteredProjects.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No projects found</p>
                ) : (
                    <div>
                        {filteredProjects.map((projectName) => (
                            <div
                                key={projectName}
                                className={`file-item ${selectedProject === projectName ? 'selected' : ''}`}
                                onClick={() => onProjectSelect(projectName)}
                                style={{ marginBottom: '0.5rem' }}
                            >
                                <div className="file-icon folder">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                        />
                                    </svg>
                                </div>
                                <span className="file-name" style={{ fontSize: '0.875rem' }}>
                                    {projectName.length > 20 ? `${projectName.substring(0, 20)}...` : projectName}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h4>Quick Templates</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Load pre-configured project templates</p>
                {templates.map((template) => (
                    <button
                        key={template.type}
                        className="btn btn-secondary"
                        style={{
                            width: '100%',
                            marginBottom: '0.5rem',
                            padding: '0.5rem',
                            textAlign: 'left',
                            justifyContent: 'flex-start',
                        }}
                        onClick={() => onLoadTemplate(template.type)}
                    >
                        <span style={{ fontWeight: '500' }}>{template.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{template.desc}</span>
                    </button>
                ))}
            </div>
        </aside>
    );
}
