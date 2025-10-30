import { Metadata } from 'next';

interface GenerateMetadataProps {
    title?: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    ogImage?: string;
    ogType?:
        | 'website'
        | 'article'
        | 'book'
        | 'profile'
        | 'music.song'
        | 'music.album'
        | 'music.playlist'
        | 'music.radio_station'
        | 'video.movie'
        | 'video.episode'
        | 'video.tv_show'
        | 'video.other';
    noIndex?: boolean;
    noFollow?: boolean;
    structuredData?: object;
}

export function generateMetadata({
    title = 'D-Admin - Website Builder & Management Platform',
    description = 'Professional website builder and management platform. Create, deploy, and manage websites with advanced features, templates, and analytics.',
    keywords = 'website builder, web development, website management, templates, portfolio, SEO, analytics',
    canonical,
    ogImage = '/images/og-image.jpg',
    ogType = 'website',
    noIndex = false,
    noFollow = false,
    structuredData,
}: GenerateMetadataProps): Metadata {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://d-admin.com';
    const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl;

    return {
        title,
        description,
        keywords,
        robots: {
            index: !noIndex,
            follow: !noFollow,
            googleBot: {
                index: !noIndex,
                follow: !noFollow,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        authors: [{ name: 'D-Admin' }],
        creator: 'D-Admin',
        publisher: 'D-Admin',
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        metadataBase: new URL(baseUrl),
        alternates: {
            canonical: fullCanonical,
        },
        openGraph: {
            title,
            description,
            url: fullCanonical,
            siteName: 'D-Admin',
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: 'en_US',
            type: ogType,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
            creator: '@dadmin',
            site: '@dadmin',
        },
        other: {
            'theme-color': '#3B82F6',
            'msapplication-TileColor': '#3B82F6',
            'apple-mobile-web-app-capable': 'yes',
            'apple-mobile-web-app-status-bar-style': 'default',
            'apple-mobile-web-app-title': 'D-Admin',
        },
    };
}

export function generateStructuredData(type: string, data: any) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://d-admin.com';

    const structuredDataMap = {
        organization: {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'D-Admin',
            url: baseUrl,
            logo: `${baseUrl}/images/logo.png`,
            description: 'Professional website builder and management platform',
            sameAs: ['https://twitter.com/dadmin', 'https://linkedin.com/company/d-admin'],
        },
        website: {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'D-Admin',
            url: baseUrl,
            description: 'Professional website builder and management platform',
            potentialAction: {
                '@type': 'SearchAction',
                target: `${baseUrl}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
            },
        },
        software: {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'D-Admin',
            applicationCategory: 'WebApplication',
            operatingSystem: 'Web Browser',
            url: baseUrl,
            description: 'Professional website builder and management platform',
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
            },
        },
        breadcrumb: (items: Array<{ name: string; url: string }>) => ({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: `${baseUrl}${item.url}`,
            })),
        }),
        article: (articleData: any) => ({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: articleData.title,
            description: articleData.description,
            image: articleData.image,
            author: {
                '@type': 'Organization',
                name: 'D-Admin',
            },
            publisher: {
                '@type': 'Organization',
                name: 'D-Admin',
                logo: {
                    '@type': 'ImageObject',
                    url: `${baseUrl}/images/logo.png`,
                },
            },
            datePublished: articleData.publishedAt,
            dateModified: articleData.updatedAt,
        }),
    };

    return structuredDataMap[type as keyof typeof structuredDataMap] || data;
}
