import Head from 'next/head';

interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    ogImage?: string;
    ogType?: string;
    twitterCard?: string;
    structuredData?: object;
    noIndex?: boolean;
    noFollow?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
    title = 'D-Admin - Website Builder & Management Platform',
    description = 'Professional website builder and management platform. Create, deploy, and manage websites with advanced features, templates, and analytics.',
    keywords = 'website builder, web development, website management, templates, portfolio, SEO, analytics',
    canonical,
    ogImage = '/images/og-image.jpg',
    ogType = 'website',
    twitterCard = 'summary_large_image',
    structuredData,
    noIndex = false,
    noFollow = false,
}) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://d-admin.com';
    const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl;

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="robots" content={`${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}`} />
            <meta name="author" content="D-Admin" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            {/* Canonical URL */}
            <link rel="canonical" href={fullCanonical} />

            {/* Open Graph Meta Tags */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={fullCanonical} />
            <meta property="og:image" content={`${baseUrl}${ogImage}`} />
            <meta property="og:site_name" content="D-Admin" />
            <meta property="og:locale" content="en_US" />

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={`${baseUrl}${ogImage}`} />
            <meta name="twitter:site" content="@dadmin" />

            {/* Additional SEO Meta Tags */}
            <meta name="theme-color" content="#3B82F6" />
            <meta name="msapplication-TileColor" content="#3B82F6" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="D-Admin" />

            {/* Preconnect to external domains for performance */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

            {/* Structured Data */}
            {structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
            )}

            {/* Default Structured Data for Organization */}
            {!structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            "name": "D-Admin",
                            "url": baseUrl,
                            "logo": `${baseUrl}/images/logo.png`,
                            "description": description,
                            "sameAs": [
                                "https://twitter.com/dadmin",
                                "https://linkedin.com/company/d-admin"
                            ]
                        }),
                    }}
                />
            )}
        </Head>
    );
};

export default SEOHead; 