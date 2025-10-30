import { ProjectSettings } from '../../lib/types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Updated ComponentInstance interface to match new structure
interface ComponentInstance {
    id: string;
    name: string;
    type: string;
    snippet: string;
    language: string;
    version: string;
}

// Clean Astro export implementation
export async function exportAstroProject(components: ComponentInstance[], settings: ProjectSettings): Promise<void> {
    const zip = new JSZip();

    // Create project structure
    addProjectFiles(zip, settings);

    // Create components from snippets
    addComponentFiles(zip, components);

    // Create pages and layouts
    addAstroPages(zip, components, settings);

    // Generate and download the zip file
    const zipContent = await zip.generateAsync({ type: 'blob' });
    saveAs(zipContent, `${settings.title.toLowerCase().replace(/\s+/g, '-')}-astro.zip`);
}

function addProjectFiles(zip: JSZip, settings: ProjectSettings) {
    // Add README
    zip.file(
        'README.md',
        `# ${settings.title}

${settings.description}

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to various platforms
npm run deploy
\`\`\`

This project was built with Astro and uses dynamic components generated from snippets.

## Tech Stack

- Astro 5.x (Latest)
- TypeScript
- Tailwind CSS
- View Transitions API
- Server-Side Rendering
- Static Site Generation
- Component Islands Architecture

## Features

- 🚀 Fast builds with optimized bundling
- 🎨 Seamless component integration
- 📱 Mobile-first responsive design
- ⚡ Zero-JS by default, Interactive Islands when needed
- 🔄 Smooth page transitions
- 🎯 SEO optimized
- 📦 Component-driven architecture
  `
    );

    // Add package.json with corrected versions
    zip.file(
        'package.json',
        JSON.stringify(
          {
            "name": settings.title.toLowerCase().replace(/\s+/g, '-'),
            "type": "module",
            "version": "0.0.1",
            "scripts": {
              "dev": "astro dev",
              "build": "astro build",
              "preview": "astro preview",
              "astro": "astro"
            },
            "dependencies": {
              "@tailwindcss/vite": "^4.1.8",
              "astro": "^5.8.0",
              "tailwindcss": "^4.1.8"
            }
          },
            null,
            2
        )
    );

    // Add Astro config with latest features
    zip.file(
        'astro.config.mjs',
        `// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  }
});
`
    );

    // Add TypeScript config optimized for Astro
    zip.file(
        'tsconfig.json',
        JSON.stringify(
          {
            "extends": "astro/tsconfigs/strict",
            "include": [".astro/types.d.ts", "**/*"],
            "exclude": ["dist"]
          },
            null,
            2
        )
    );

    // Add ESLint config for Astro
    zip.file(
        '.eslintrc.cjs',
        `/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:astro/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'astro/no-conflict-set-directives': 'error',
    'astro/no-unused-define-vars-in-style': 'error',
  },
  overrides: [
    {
      files: ['*.astro'],
      parser: 'astro-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
    },
  ],
};
`
    );

    // Add gitignore
    zip.file(
        '.gitignore',
        `# build output
dist/

# generated types
.astro/

# dependencies
node_modules/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# environment variables
.env
.env.production

# macOS-specific files
.DS_Store

# jetbrains setting folder
.idea/
`
    );

    // Add environment template
    zip.file(
        '.env.example',
        `# Environment variables for ${settings.title}
PUBLIC_SITE_NAME="${settings.title}"
PUBLIC_SITE_DESCRIPTION="${settings.description}"
PUBLIC_SITE_URL="https://your-site.com"

# Add your environment variables here
# API_KEY=
# DATABASE_URL=
# PRIVATE_KEY=
`
    );

    // Add VS Code settings for better Astro development
    const vscodeDir = zip.folder('.vscode');
    if (vscodeDir) {
        vscodeDir.file(
            'settings.json',
            JSON.stringify(
                {
                    'typescript.preferences.includePackageJsonAutoImports': 'off',
                    'typescript.suggest.autoImports': false,
                    'astro.typescript.allowArbitraryAttributes': true,
                    'editor.formatOnSave': true,
                    'editor.codeActionsOnSave': {
                        'source.fixAll.eslint': true,
                    },
                    'files.associations': {
                        '*.astro': 'astro',
                    },
                    'emmet.includeLanguages': {
                        astro: 'html',
                    },
                },
                null,
                2
            )
        );

        vscodeDir.file(
            'extensions.json',
            JSON.stringify(
                {
                    recommendations: ['astro-build.astro-vscode', 'bradlc.vscode-tailwindcss', 'esbenp.prettier-vscode', 'dbaeumer.vscode-eslint'],
                },
                null,
                2
            )
        );
    }
}

function addComponentFiles(zip: JSZip, components: ComponentInstance[]) {
    const srcDir = zip.folder('src');
    const componentsDir = srcDir?.folder('components');

    // Generate each component as Astro component
    components.forEach((component) => {
        const componentCode = generateAstroComponentFromSnippet(component);
        if (componentsDir) {
            const componentFileName = sanitizeComponentName(component.name || component.id);
            componentsDir.file(`${componentFileName}.astro`, componentCode);
        }
    });

    // Add component index for easier imports
    if (componentsDir) {
        const indexContent = components
            .map((component) => {
                const componentName = sanitizeComponentName(component.name || component.id);
                return `export { default as ${componentName} } from './${componentName}.astro';`;
            })
            .join('\n');

        componentsDir.file(
            'index.ts',
            `// Auto-generated component exports
${indexContent}
`
        );
    }
}

function sanitizeComponentName(name: string): string {
    // Convert to PascalCase and remove special characters
    return (
        name
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
            .split(/\s+/) // Split by spaces
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // PascalCase
            .join('') || 'Component'
    ); // Fallback if empty
}

function generateAstroComponentFromSnippet(component: ComponentInstance): string {
    const componentName = sanitizeComponentName(component.name || component.id);

    // Convert HTML snippet to Astro-compatible format
    const astroContent = convertHtmlToAstro(component.snippet);

    // Determine if component needs client-side hydration
    const needsClientHydration =
        component.snippet.includes('onClick') ||
        component.snippet.includes('onSubmit') ||
        component.snippet.includes('addEventListener') ||
        component.snippet.includes('interactive');

    const clientDirective = needsClientHydration ? ' client:load' : '';

    return `---
// ${component.name || componentName}
// Type: ${component.type}
// Version: ${component.version}
// Generated from snippet

export interface Props {
  class?: string;
  [key: string]: any;
}

const { class: className = '', ...props } = Astro.props;
---

<div 
  class:list={["w-full seamless-component", className]}
  {...props}${clientDirective}
>
${astroContent}
</div>

<style>
  .seamless-component {
    margin: 0;
    padding: 0;
    width: 100%;
    max-width: 100%;
    display: block;
  }
  
  .seamless-component > * {
    width: 100%;
    max-width: 100%;
  }
</style>
`;
}

function convertHtmlToAstro(htmlSnippet: string): string {
    let astro = htmlSnippet.trim();

    // Step 1: Convert className to class (React/JSX to HTML/Astro)
    astro = astro.replace(/className=/g, 'class=');

    // Step 2: Handle self-closing tags properly for Astro
    astro = astro.replace(/<(img|input|br|hr|meta|link|area|base|col|embed|source|track|wbr)([^>]*?)(?<!\/)\s*>/gi, '<$1$2 />');

    // Step 3: Convert HTML comments to Astro comments
    astro = astro.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

    // Step 4: Remove any malformed class attributes on closing tags
    astro = astro.replace(/<\/([^>]+)\s+class="[^"]*">/g, '</$1>');

    // Step 5: Clean up any duplicate class attributes
    astro = astro.replace(/(\s+class="[^"]*")\s+class="[^"]*"/g, '$1');

    // Step 6: Handle onclick, onChange etc. events for Astro
    astro = astro.replace(/onClick=/g, 'onclick=');
    astro = astro.replace(/onChange=/g, 'onchange=');
    astro = astro.replace(/onSubmit=/g, 'onsubmit=');
    astro = astro.replace(/onFocus=/g, 'onfocus=');
    astro = astro.replace(/onBlur=/g, 'onblur=');

    // Step 7: Fix any JavaScript expressions in attributes for Astro
    astro = astro.replace(/\{([^}]+)\}/g, (match, expression) => {
        // Keep simple expressions, but ensure they're valid for Astro
        if (expression.includes('this.') || expression.includes('useState') || expression.includes('useEffect')) {
            // Remove React-specific code
            return '""';
        }
        return match;
    });

    // Step 8: Ensure proper indentation for Astro template
    const lines = astro.split('\n');
    const indentedLines = lines.map(line => {
        if (line.trim()) {
            return `  ${line}`;
        }
        return line;
    });

    return indentedLines.join('\n');
}

function addAstroPages(zip: JSZip, components: ComponentInstance[], settings: ProjectSettings) {
    const srcDir = zip.folder('src');

    // Create styles directory with global CSS
    const stylesDir = srcDir?.folder('styles');
    if (stylesDir) {
        stylesDir.file(
            'global.css',
            `@import "tailwindcss";

/* Global styles for seamless components */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  scroll-behavior: smooth;
}

* {
  box-sizing: border-box;
}

.seamless {
  margin: 0;
  padding: 0;
  width: 100%;
}
`
        );
    }

    // Create layouts directory
    const layoutsDir = srcDir?.folder('layouts');
    if (layoutsDir) {
        layoutsDir.file(
            'Layout.astro',
            `---
import "../styles/global.css";

export interface Props {
  title?: string;
  description?: string;
}

const { 
  title = "${settings.title}",
  description = "${settings.description}"
} = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="generator" content={Astro.generator} />
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:site_name" content="${settings.title}" />
    <title>{title}</title>
  </head>
  <body class="seamless">
    <slot />
  </body>
</html>

<style>
  html,
  body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }
</style>
`
        );
    }

    // Create pages directory
    const pagesDir = srcDir?.folder('pages');
    if (pagesDir) {
        // Create index page
        pagesDir.file('index.astro', generateAstroIndexPage(components, settings));

        // Create 404 page
        pagesDir.file(
            '404.astro',
            `---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Page Not Found - ${settings.title}">
  <main class="min-h-screen w-full flex items-center justify-center px-4">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
      <p class="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
      <a 
        href="/" 
        class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Home
      </a>
    </div>
  </main>
</Layout>
`
        );
    }

    // Add public directory with basic assets
    const publicDir = zip.folder('public');
    if (publicDir) {
        // Add basic favicon (SVG)
        publicDir.file(
            'favicon.svg',
            `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="${settings.primaryColor || '#3b82f6'}"/>
  <path d="M8 8h16v16H8z" fill="white" opacity="0.9"/>
</svg>`
        );

        // Add robots.txt
        publicDir.file(
            'robots.txt',
            `User-agent: *
Allow: /

Sitemap: https://your-site.com/sitemap-index.xml
`
        );
    }
}

function generateAstroIndexPage(components: ComponentInstance[], settings: ProjectSettings): string {
    // Generate imports for all components
    const imports = components
        .map((component) => {
            const componentName = sanitizeComponentName(component.name || component.id);
            return `import ${componentName} from '../components/${componentName}.astro';`;
        })
        .join('\n');

    // Generate component usage with seamless layout
    const componentUsage = components
        .map((component, index) => {
            const componentName = sanitizeComponentName(component.name || component.id);
            return `    <${componentName} 
      class="fade-in seamless full-width" 
      style="animation-delay: ${index * 0.1}s"
    />`;
        })
        .join('\n');

    return `---
// Homepage built with dynamic Astro components
// Generated from: ${components.length} component(s)
// Built with Astro 5.x - Islands Architecture

import Layout from '../layouts/Layout.astro';
${imports}

// Page metadata
const title = '${settings.title}';
const description = '${settings.description}';
---

<Layout title={title} description={description}>
  <main class="w-full min-h-screen seamless">
    <!-- Seamless Component Layout - No Gaps, Full Width -->
    <div class="component-container seamless">
${componentUsage}
    </div>
  </main>
</Layout>

<style>
  /* Component-specific styles */
  .component-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0;
    padding: 0;
    gap: 0;
  }
  
  .component-container > * {
    width: 100%;
    max-width: 100%;
    flex-shrink: 0;
  }
  
  /* Smooth animations */
  .fade-in {
    opacity: 0;
    animation: fadeIn 0.6s ease-out forwards;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Ensure seamless connection between components */
  @media (min-width: 768px) {
    .component-container {
      min-height: 100vh;
    }
  }
</style>

<!--
Component Details:
${components.map((comp) => `- ${comp.name} (${comp.type}): ${comp.id}`).join('\n')}

Project Features:
- Astro 5.x Islands Architecture
- Zero-JS by default, interactive when needed
- SEO optimized with meta tags
- View Transitions API support
- Responsive design system
- Component-driven development
- Fast builds and optimal performance

Generated with:
- Astro 5.x (Latest)
- TypeScript 5.7
- Tailwind CSS 3.4
- Modern build optimization
- Component Islands pattern
-->
`;
}