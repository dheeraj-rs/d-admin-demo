import '../styles/layout/layout.scss';
import '../styles/components/index.scss';
import './globals.css';
import { generateMetadata } from '../lib/metadata';
import { Metadata } from 'next';
import AppProviders from '../components/providers/AppProviders';
import PreferencesProvider from '../components/providers/PreferencesProvider';

interface RootLayoutProps {
  children: React.ReactNode;
}

// Generate metadata for the root layout
export const metadata: Metadata = generateMetadata({
  title: 'D-Admin - Website Builder & Management Platform',
  description: 'Professional website builder and management platform. Create, deploy, and manage websites with advanced features, templates, and analytics.',
  keywords: 'website builder, web development, website management, templates, portfolio, SEO, analytics, drag and drop, responsive design',
  canonical: '/',
  ogType: 'website',
});

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link id="theme-css" href={`/themes/d-admin-dark/theme.css`} rel="stylesheet" />

        {/* Preload critical resources */}
        <link rel="preload" href="/themes/d-admin-dark/theme.css" as="style" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        {/* Favicon and app icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <AppProviders>
          <PreferencesProvider>
            {children}
          </PreferencesProvider>
        </AppProviders>
      </body>
    </html>
  );
}
