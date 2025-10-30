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

// Clean Next.js export implementation
export async function exportNextJsProject(components: ComponentInstance[], settings: ProjectSettings): Promise<void> {
    const zip = new JSZip();

    // Create project structure
    addProjectFiles(zip, settings);

    // Create components from snippets
    addComponentFiles(zip, components);

    // Create app directory and pages
    addAppPages(zip, components, settings);

    // Generate and download the zip file
    const zipContent = await zip.generateAsync({ type: 'blob' });
    saveAs(zipContent, `${settings.title.toLowerCase().replace(/\s+/g, '-')}-nextjs.zip`);
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

# Start production server
npm run start
\`\`\`

This project was built with Next.js and uses dynamic components generated from snippets.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Server Components & Client Components
  `
    );

    // Add package.json with latest versions
    zip.file(
        'package.json',
        JSON.stringify(
            {
                name: settings.title.toLowerCase().replace(/\s+/g, '-'),
                version: '0.1.0',
                private: true,
                scripts: {
                    dev: 'next dev',
                    build: 'next build',
                    start: 'next start',
                    lint: 'next lint',
                    'type-check': 'tsc --noEmit',
                },
                dependencies: {
                    next: '^15.1.0',
                    react: '^19.0.0',
                    'react-dom': '^19.0.0',
                },
                devDependencies: {
                    '@types/node': '^22.0.0',
                    '@types/react': '^19.0.0',
                    '@types/react-dom': '^19.0.0',
                    autoprefixer: '^10.4.20',
                    postcss: '^8.4.49',
                    tailwindcss: '^3.4.15',
                    typescript: '^5.7.2',
                    eslint: '^9.0.0',
                    'eslint-config-next': '^15.1.0',
                },
            },
            null,
            2
        )
    );

    // Add Next.js config with latest features
    zip.file(
        'next.config.js',
        `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
`
    );

    // Add TypeScript config with latest settings
    zip.file(
        'tsconfig.json',
        JSON.stringify(
            {
                compilerOptions: {
                    lib: ['dom', 'dom.iterable', 'esnext'],
                    allowJs: true,
                    skipLibCheck: true,
                    strict: true,
                    noEmit: true,
                    esModuleInterop: true,
                    module: 'esnext',
                    moduleResolution: 'bundler',
                    resolveJsonModule: true,
                    isolatedModules: true,
                    jsx: 'preserve',
                    incremental: true,
                    plugins: [{ name: 'next' }],
                    paths: { '../../*': ['./*'] },
                    target: 'ES2022',
                    forceConsistentCasingInFileNames: true,
                    noUncheckedIndexedAccess: true,
                    exactOptionalPropertyTypes: true,
                },
                include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
                exclude: ['node_modules'],
            },
            null,
            2
        )
    );

    // Add PostCSS config
    zip.file(
        'postcss.config.mjs',
        `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
`
    );

    // Add Tailwind config with latest features
    zip.file(
        'tailwind.config.ts',
        `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary-color)',
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-color)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
          950: 'var(--primary-950)',
        },
        secondary: {
          DEFAULT: 'var(--secondary-color)',
          50: 'var(--secondary-50)',
          100: 'var(--secondary-100)',
          200: 'var(--secondary-200)',
          300: 'var(--secondary-300)',
          400: 'var(--secondary-400)',
          500: 'var(--secondary-color)',
          600: 'var(--secondary-600)',
          700: 'var(--secondary-700)',
          800: 'var(--secondary-800)',
          900: 'var(--secondary-900)',
          950: 'var(--secondary-950)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
`
    );

    // Add ESLint config
    zip.file(
        '.eslintrc.json',
        JSON.stringify(
            {
                extends: ['next/core-web-vitals'],
                parser: '@typescript-eslint/parser',
                parserOptions: {
                    ecmaVersion: 'latest',
                    sourceType: 'module',
                },
                rules: {
                    '@typescript-eslint/no-unused-vars': 'warn',
                    '@typescript-eslint/no-explicit-any': 'warn',
                },
            },
            null,
            2
        )
    );

    // Add gitignore
    zip.file(
        '.gitignore',
        `# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo
`
    );

    // Add environment template
    zip.file(
        '.env.example',
        `# Environment variables
NEXT_PUBLIC_APP_NAME="${settings.title}"
NEXT_PUBLIC_APP_DESCRIPTION="${settings.description}"

# Add your environment variables here
# DATABASE_URL=
# API_KEY=
`
    );

    // Add setup scripts
    zip.file(
        'setup.sh',
        `#!/bin/bash
echo "🚀 Setting up the Next.js project..."
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed successfully!"
echo "🎉 Setup complete! You can now run:"
echo "   npm run dev     - Start development server"
echo "   npm run build   - Build for production"
echo "   npm run lint    - Run ESLint"
`
    );

    zip.file(
        'setup.bat',
        `@echo off
echo 🚀 Setting up the Next.js project...
echo 📦 Installing dependencies...
call npm install
echo ✅ Dependencies installed successfully!
echo 🎉 Setup complete! You can now run:
echo    npm run dev     - Start development server
echo    npm run build   - Build for production
echo    npm run lint    - Run ESLint
pause
`
    );
}

function addComponentFiles(zip: JSZip, components: ComponentInstance[]) {
    const componentsDir = zip.folder('components');

    // Generate each component based on its snippet
    components.forEach((component) => {
        const componentCode = generateComponentFromSnippet(component);
        if (componentsDir) {
            // Use component name with proper casing for filename
            const componentFileName = sanitizeComponentName(component.name || component.id);
            componentsDir.file(`${componentFileName}.tsx`, componentCode);
        }
    });

    // Add index file for easier imports
    if (componentsDir) {
        const indexContent = components
            .map((component) => {
                const componentName = sanitizeComponentName(component.name || component.id);
                return `export { default as ${componentName} } from './${componentName}';`;
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

function generateComponentFromSnippet(component: ComponentInstance): string {
    const componentName = sanitizeComponentName(component.name || component.id);

    // Convert HTML snippet to React JSX
    const jsxContent = convertHtmlToJsx(component.snippet);

    // Determine if component needs to be client-side
    const needsClientComponent =
        component.snippet.includes('onClick') ||
        component.snippet.includes('onSubmit') ||
        component.snippet.includes('useState') ||
        component.snippet.includes('useEffect');

    const clientDirective = needsClientComponent ? "'use client';\n\n" : '';

    return `${clientDirective}import React from 'react';

interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

/**
 * ${component.name || componentName}
 * Type: ${component.type}
 * Version: ${component.version}
 * Generated from snippet
 */
export default function ${componentName}({ className = '', children, ...props }: ${componentName}Props) {
  return (
    <div className={\`w-full \${className}\`} {...props}>
      ${jsxContent}
      {children}
    </div>
  );
}
`;
}

function convertHtmlToJsx(htmlSnippet: string): string {
    // Basic HTML to JSX conversion with proper typing
    let jsx = htmlSnippet;

    // Handle common HTML to JSX conversions
    jsx = jsx.replace(/class=/g, 'className=');
    jsx = jsx.replace(/for=/g, 'htmlFor=');
    jsx = jsx.replace(/<!--(.*?)-->/g, '{/* $1 */}'); // Convert HTML comments to JSX comments

    // Handle self-closing tags (add closing slash if missing)
    jsx = jsx.replace(/<(img|input|br|hr|meta|link)([^>]*?)(?<!\/)\s*>/gi, '<$1$2 />');

    // Ensure full width for components by adding/modifying width classes
    jsx = jsx.replace(/className="([^"]*?)"/g, (match, classes) => {
        const classArray = classes.split(' ').filter(Boolean);

        // Remove any existing width classes
        const filteredClasses = classArray.filter((cls: string) => !cls.startsWith('w-') && !cls.startsWith('max-w-') && !cls.startsWith('min-w-'));

        // Add full width class
        filteredClasses.unshift('w-full');

        return `className="${filteredClasses.join(' ')}"`;
    });

    // If no className found, add one with full width
    if (!jsx.includes('className=')) {
        jsx = jsx.replace(/(<[^>]+?)(\s*>)/g, '$1 className="w-full"$2');
    }

    // Handle style attribute with proper typing
    jsx = jsx.replace(/style="([^"]*?)"/g, (match: string, styleString: string) => {
        try {
            const styleObj: Record<string, string> = styleString
                .split(';')
                .filter((style: string) => style.trim())
                .reduce((acc: Record<string, string>, style: string) => {
                    const [property, value] = style.split(':').map((s: string) => s.trim());
                    if (property && value) {
                        // Convert kebab-case to camelCase
                        const camelProperty = property.replace(/-([a-z])/g, (g: string) => g[1].toUpperCase());
                        acc[camelProperty] = value;
                    }
                    return acc;
                }, {});

            // Ensure width: 100% for full width
            styleObj.width = '100%';

            return `style={${JSON.stringify(styleObj)}}`;
        } catch (error) {
            // If parsing fails, return original with width added
            console.warn('Failed to parse style attribute:', error);
            return `style={{ width: '100%', ...${match.slice(7, -1)} }}`;
        }
    });

    // Handle boolean attributes
    jsx = jsx.replace(
        /\s(checked|selected|disabled|readonly|multiple|autoplay|controls|loop|muted|open|required)\s*(?:=\s*['"]\1['"]|\s*(?=[>\s]))/gi,
        ' $1={true}'
    );

    return jsx;
}

function addAppPages(zip: JSZip, components: ComponentInstance[], settings: ProjectSettings) {
    const appDir = zip.folder('app');

    // Create global.css with modern CSS features and NO GAPS
    if (appDir) {
        appDir.file(
            'globals.css',
            `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --primary-color: ${settings.primaryColor || '#3b82f6'};
    --secondary-color: ${settings.secondaryColor || '#10b981'};
    
    /* Primary color scale */
    --primary-50: #eff6ff;
    --primary-100: #dbeafe;
    --primary-200: #bfdbfe;
    --primary-300: #93c5fd;
    --primary-400: #60a5fa;
    --primary-500: var(--primary-color);
    --primary-600: #2563eb;
    --primary-700: #1d4ed8;
    --primary-800: #1e40af;
    --primary-900: #1e3a8a;
    --primary-950: #172554;
    
    /* Secondary color scale */
    --secondary-50: #f0fdf4;
    --secondary-100: #dcfce7;
    --secondary-200: #bbf7d0;
    --secondary-300: #86efac;
    --secondary-400: #4ade80;
    --secondary-500: var(--secondary-color);
    --secondary-600: #059669;
    --secondary-700: #047857;
    --secondary-800: #065f46;
    --secondary-900: #064e3b;
    --secondary-950: #022c22;
    
    --font-inter: 'Inter', system-ui, sans-serif;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: var(--font-inter);
    font-feature-settings: 'cv11', 'ss01';
    font-variation-settings: 'opsz' 32;
    line-height: 1.5;
  }
}

@layer components {
  .component-container {
    @apply w-full;
    display: block;
    margin: 0;
    padding: 0;
  }
  
  .component-wrapper {
    @apply w-full;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    gap: 0;
  }

  .full-width-component {
    @apply w-full;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    display: block;
  }
  
  .seamless-layout {
    margin: 0 !important;
    padding: 0 !important;
    gap: 0 !important;
    border: none !important;
  }
}

@layer utilities {
  .no-gaps {
    margin: 0 !important;
    padding: 0 !important;
    gap: 0 !important;
  }
  
  .full-width {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  .seamless {
    @apply no-gaps full-width;
    border: none !important;
    outline: none !important;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
`
        );

        // Create layout.tsx with latest Next.js features
        appDir.file(
            'layout.tsx',
            `import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: {
    default: '${settings.title}',
    template: '%s | ${settings.title}',
  },
  description: '${settings.description}',
  keywords: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
  authors: [{ name: 'Generated by Component Builder' }],
  creator: 'Component Builder',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: '${settings.title}',
    description: '${settings.description}',
    siteName: '${settings.title}',
  },
  twitter: {
    card: 'summary_large_image',
    title: '${settings.title}',
    description: '${settings.description}',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={\`\${inter.className} seamless\`}>
        <div className="min-h-screen w-full seamless">
          {children}
        </div>
      </body>
    </html>
  );
}
`
        );

        // Create page.tsx with NO GAPS and FULL WIDTH
        appDir.file('page.tsx', generatePageContent(components, settings));

        // Create loading.tsx
        appDir.file(
            'loading.tsx',
            `export default function Loading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
    </div>
  );
}
`
        );

        // Create error.tsx
        appDir.file(
            'error.tsx',
            `'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
`
        );

        // Create not-found.tsx
        appDir.file(
            'not-found.tsx',
            `import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Found</h2>
        <p className="text-gray-600 mb-6">Could not find requested resource</p>
        <Link
          href="/"
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
`
        );
    }
}

function generatePageContent(components: ComponentInstance[], settings: ProjectSettings): string {
    // Generate imports for all components
    const imports = components
        .map((component) => {
            const componentName = sanitizeComponentName(component.name || component.id);
            return `import ${componentName} from '../../components/${componentName}';`;
        })
        .join('\n');

    // Generate component usage with NO GAPS and FULL WIDTH
    const componentUsage = components
        .map((component, index) => {
            const componentName = sanitizeComponentName(component.name || component.id);
            return `      <${componentName} 
        key="${component.id}"
        className="full-width-component seamless animate-fade-in"
      />`;
        })
        .join('\n');

    return `import React from 'react';
import type { Metadata } from 'next';
${imports}

export const metadata: Metadata = {
  title: 'Home',
  description: '${settings.description}',
};

/**
 * Homepage built with dynamic components
 * Generated from: ${components.length} component(s)
 * Built with Next.js 15 App Router
 * Optimized for seamless, full-width layout
 */
export default function Home() {
  return (
    <main className="w-full min-h-screen seamless">
      {/* Seamless Component Layout - No Gaps, Full Width */}
      <div className="component-wrapper seamless">
${componentUsage}
      </div>
    </main>
  );
}

/*
Component Details:
${components.map((comp) => `- ${comp.name} (${comp.type}): ${comp.id}`).join('\n')}

Layout Features:
- No gaps between components
- Full-width responsive design
- Seamless component connection
- Optimized for modern browsers

Generated with:
- Next.js 15 (App Router)
- React 19
- TypeScript 5.7
- Tailwind CSS 3.4
- Modern ESLint configuration
*/
`;
}
