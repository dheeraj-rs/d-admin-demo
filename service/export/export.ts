'use client';

export interface BaseComponentProps {
    id: string;
    name: string; // remove the optional "?"
    type: string;
    snippet: string;
    language: string;
    version: string;
}

import { ComponentInstance, ProjectSettings } from '../../lib/types';
import { exportAstroProject } from './export-astro';
import { exportViteProject } from './export-vite';
import { exportNextJsProject } from './export-next';
import { exportHtmlProject } from './export-html';

export async function exportProject(
    format: 'next' | 'astro' | 'html' | 'vite' | 'custom',
    components: BaseComponentProps[],
    settings: ProjectSettings
): Promise<void> {
    switch (format) {
        case 'next':
            await exportNextJsProject(components, settings);
            break;
        case 'astro':
            await exportAstroProject(components, settings);
            break;
        case 'html':
            await exportHtmlProject(components, settings);
            break;
        case 'vite':
            await exportViteProject(components, settings);
            break;
        case 'custom':
            break;

        default:
            throw new Error(`Unsupported export format: ${format}`);
    }
}
