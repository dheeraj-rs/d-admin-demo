import { ProjectSettings } from '../../lib/types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ComponentInstance {
    id: string;
    name: string;
    type: string;
    snippet: string;
    language: string;
}

export async function exportViteProject(components: ComponentInstance[], settings: ProjectSettings): Promise<void> {
    const zip = new JSZip();

    // 1. Add base project files
    addBaseFiles(zip, settings);

    // 2. Add components
    addComponents(zip, components);

    // 3. Add src files
    addSrcFiles(zip, components, settings);

    // Generate and download
    const zipContent = await zip.generateAsync({ type: 'blob' });
    saveAs(zipContent, `${settings.title.toLowerCase().replace(/\s+/g, '-')}-vite.zip`);
}

function addBaseFiles(zip: JSZip, settings: ProjectSettings) {
    // Essential config files
    zip.file(
        'package.json',
        JSON.stringify(
            {
                name: settings.title.toLowerCase().replace(/\s+/g, '-'),
                private: true,
                version: '0.1.0',
                type: 'module',
                scripts: {
                    dev: 'vite',
                    build: 'vite build',
                    preview: 'vite preview',
                    lint: 'eslint . --ext ts,tsx',
                },
                dependencies: {
                    react: '^18.2.0',
                    'react-dom': '^18.2.0',
                },
                devDependencies: {
                    '@types/react': '^18.2.0',
                    '@types/react-dom': '^18.2.0',
                    '@vitejs/plugin-react': '^4.0.0',
                    autoprefixer: '^10.4.0',
                    eslint: '^8.0.0',
                    postcss: '^8.4.0',
                    tailwindcss: '^3.0.0',
                    typescript: '^5.0.0',
                    vite: '^5.0.0',
                },
            },
            null,
            2
        )
    );

    zip.file(
        'vite.config.ts',
        `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    }
  }
})`
    );

    // Fixed: Use .cjs extension for PostCSS and Tailwind configs
    zip.file(
        'tailwind.config.cjs',
        `module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
    );

    zip.file(
        'postcss.config.cjs',
        `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
    );

    zip.file(
        'tsconfig.json',
        JSON.stringify(
            {
                compilerOptions: {
                    target: 'ES2020',
                    lib: ['ES2020', 'DOM', 'DOM.Iterable'],
                    module: 'ESNext',
                    moduleResolution: 'bundler',
                    strict: true,
                    jsx: 'react-jsx',
                    baseUrl: '.',
                    paths: {
                        '../../*': ['./src/*'],
                    },
                },
                include: ['src'],
            },
            null,
            2
        )
    );

    // Add gitignore
    zip.file(
        '.gitignore',
        `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Dependencies
node_modules
dist
dist-ssr
*.local

# Build outputs
build/
.vite/

# Editor directories and files
.vscode/
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env
.env.local
.env.production
.env.development

# TypeScript
*.tsbuildinfo

# Testing
coverage/
.nyc_output/

# OS generated files
Thumbs.db
`
    );

    // Index.html
    zip.file(
        'index.html',
        `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${settings.title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
    );

    // Add Vite SVG icon
    zip.file(
        'public/vite.svg',
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>`
    );
}

function addComponents(zip: JSZip, components: ComponentInstance[]) {
    const componentsDir = zip.folder('src')?.folder('components');

    components.forEach((component) => {
        const componentName = sanitizeName(component.name || component.id);
        componentsDir?.file(`${componentName}.tsx`, generateComponent(component));
    });

    // Components index file
    componentsDir?.file(
        'index.ts',
        components.map((c) => `export { default as ${sanitizeName(c.name || c.id)} } from './${sanitizeName(c.name || c.id)}';`).join('\n')
    );
}

function generateComponent(component: ComponentInstance): string {
    const name = sanitizeName(component.name || component.id);
    
    // Convert HTML snippet to JSX while preserving ALL ORIGINAL IDs exactly as they are
    let jsxContent = convertHtmlToJsx(component.snippet, component.id);
    
    return `import React from 'react';

interface ${name}Props {
  className?: string;
}

const ${name}: React.FC<${name}Props> = ({ className = '' }) => {
  return (
    ${jsxContent}
  );
};

export default ${name};`;
}

function convertHtmlToJsx(htmlSnippet: string, componentId: string): string {
    // Clean and convert HTML to JSX - PRESERVE ALL ORIGINAL IDs
    let jsxContent = htmlSnippet
        .replace(/class=/g, 'className=')
        .replace(/for=/g, 'htmlFor=')
        .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
        .replace(/stroke-width=/g, 'strokeWidth=')
        .replace(/fill-rule=/g, 'fillRule=')
        .replace(/clip-rule=/g, 'clipRule=')
        .replace(/stroke-linecap=/g, 'strokeLinecap=')
        .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
        .trim();

    // DO NOT MODIFY ANY EXISTING IDs - Keep them exactly as they are in the original snippet
    // Only handle className merging if needed
    if (jsxContent.includes('className=')) {
        // Find the first className and make it support additional classes
        const firstClassMatch = jsxContent.match(/className="([^"]*)"/);
        if (firstClassMatch) {
            const existingClasses = firstClassMatch[1];
            jsxContent = jsxContent.replace(
                firstClassMatch[0],
                `className={\`${existingClasses} \${className}\`.trim()}`
            );
        }
    } else {
        // Add className support to the root element only if no className exists
        const rootElementMatch = jsxContent.match(/^<(\w+)([^>]*?)(\/?>)/);
        if (rootElementMatch && !rootElementMatch[2].includes('className')) {
            const tagName = rootElementMatch[1];
            const attributes = rootElementMatch[2];
            const closing = rootElementMatch[3];
            jsxContent = jsxContent.replace(
                rootElementMatch[0],
                `<${tagName}${attributes} className={className}${closing}`
            );
        }
    }

    return jsxContent;
}

function sanitizeName(name: string): string {
    return name
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .map((w) => w[0]?.toUpperCase() + w.slice(1))
        .join('')
        .replace(/^\d/, 'Component$&'); // Ensure it doesn't start with a number
}

function addSrcFiles(zip: JSZip, components: ComponentInstance[], settings: ProjectSettings) {
    const srcDir = zip.folder('src');

    // Main entry point
    srcDir?.file(
        'main.tsx',
        `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`
    );

    // App component with proper component rendering - preserving original snippet IDs
    srcDir?.file(
        'App.tsx',
        `import React from 'react';
${components.map((c) => `import ${sanitizeName(c.name || c.id)} from './components/${sanitizeName(c.name || c.id)}';`).join('\n')}

export default function App() {
  return (
    <div className="min-h-screen">
      {/* Each component preserves its original snippet IDs exactly as they were */}
${components.map((c) => `      <${sanitizeName(c.name || c.id)} key="${c.id}" />`).join('\n')}
    </div>
  );
}`
    );

    // Global styles
    srcDir?.file(
        'index.css',
        `@tailwind base;
@tailwind components;
@tailwind utilities;

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
`
    );
}