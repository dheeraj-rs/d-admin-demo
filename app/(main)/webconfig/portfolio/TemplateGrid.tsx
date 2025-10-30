'use client';

import React, { useState } from 'react';

interface Template {
    id: number;
    title: string;
    shortDescription: string;
    image: string;
    tags: string[];
    rating: number;
    downloads: number;
    price: string;
    isPremium: boolean;
    category: string;
    addedDate: string;
    description: string;
    description2: string;
    features: string[];
    specs: {
        [key: string]: string;
    };
    downloadUrl: string;
    previewUrl: string;
}
import { useRouter } from 'next/navigation';
import { Eye, Download, ShoppingCart, Star, X } from 'lucide-react';
import './styles.scss';
import Link from 'next/link';

export const templates = [
    {
        id: 1,
        title: 'Fully Animated Smooth Website',
        shortDescription: 'A modern, fully animated website template perfect for developers and businesses.',
        image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
        tags: ['HTML', 'CSS', 'JS', 'BOOTSTRAP'],
        rating: 5.0,
        downloads: 92,
        price: 'Free',
        isPremium: false,
        category: 'Latest',
        addedDate: 'May 14, 2025',
        description:
            'This latest template is perfect for developers and businesses looking to quickly launch a professional website. Built with modern technologies, it offers a responsive design that works perfectly on all devices.',
        description2:
            "The template comes with detailed documentation to help you get started and customize it to your needs. Whether you're a beginner or an experienced developer, you'll find this template easy to work with and adapt.",
        features: ['Fully Responsive Design', 'Easy Customization', 'Cross-Browser Compatible', 'Modern & Clean Design', 'SEO Optimized', 'Well Documented'],
        specs: {
            'File Size': '2.5 MB',
            Version: '1.0',
            Technology: 'HTML5, CSS3, JavaScript',
            'Browser Support': 'All Modern Browsers',
            Documentation: 'Included',
            Support: '6 Months',
        },
        downloadUrl: '/downloads/smooth-website.zip',
        previewUrl: 'https://smooth-website-demo.netlify.app',
    },
    {
        id: 2,
        title: 'Web Agency For Your Business',
        shortDescription: 'Professional web agency template designed for digital marketing agencies and creative studios.',
        image: 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=800',
        tags: ['HTML', 'CSS', 'JS', 'BOOTSTRAP'],
        rating: 5.0,
        downloads: 81,
        price: 'Free',
        isPremium: false,
        category: 'Business',
        addedDate: 'May 12, 2025',
        description:
            'Professional web agency template designed for digital marketing agencies and creative studios. Features modern design with smooth animations and interactive elements.',
        description2: 'Perfect for showcasing your agency services, portfolio, and team. Includes contact forms, service pages, and portfolio galleries.',
        features: ['Agency Portfolio Layout', 'Service Showcase', 'Team Member Profiles', 'Contact Forms', 'Responsive Design', 'Modern Animations'],
        specs: {
            'File Size': '3.2 MB',
            Version: '1.2',
            Technology: 'HTML5, CSS3, JavaScript, Bootstrap',
            'Browser Support': 'All Modern Browsers',
            Documentation: 'Included',
            Support: '6 Months',
        },
        downloadUrl: '/downloads/web-agency.zip',
        previewUrl: 'https://web-agency-demo.netlify.app',
    },
    {
        id: 3,
        title: 'Digital Web Agency',
        shortDescription: 'Premium digital agency template with advanced features and premium design elements.',
        image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
        tags: ['HTML', 'CSS', 'JS', 'BOOTSTRAP'],
        rating: 5.0,
        downloads: 149,
        price: '₹420',
        isPremium: true,
        category: 'Business',
        addedDate: 'May 10, 2025',
        description:
            'Premium digital agency template with advanced features and premium design elements. Perfect for established agencies looking for a professional online presence.',
        description2: 'Includes advanced portfolio galleries, client testimonials, pricing tables, and integrated contact systems.',
        features: ['Premium Design Elements', 'Advanced Portfolio Gallery', 'Client Testimonials', 'Pricing Tables', 'Blog Integration', 'Premium Support'],
        specs: {
            'File Size': '4.1 MB',
            Version: '2.0',
            Technology: 'HTML5, CSS3, JavaScript, Bootstrap',
            'Browser Support': 'All Modern Browsers',
            Documentation: 'Comprehensive Guide',
            Support: '12 Months Premium',
        },
        downloadUrl: '/downloads/digital-agency-premium.zip',
        previewUrl: 'https://digital-agency-demo.netlify.app',
    },
    {
        id: 4,
        title: 'Personal Portfolio',
        shortDescription: 'Clean and modern personal portfolio template perfect for developers, designers, and creative professionals.',
        image: 'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=800',
        tags: ['HTML', 'CSS', 'JS'],
        rating: 4.8,
        downloads: 67,
        price: 'Free',
        isPremium: false,
        category: 'Portfolio',
        addedDate: 'May 8, 2025',
        description: 'Clean and modern personal portfolio template perfect for developers, designers, and creative professionals.',
        description2: 'Showcase your skills, projects, and experience with this beautifully designed portfolio template.',
        features: ['Personal Branding', 'Project Showcase', 'Skills Section', 'Contact Integration', 'Blog Ready', 'Mobile Optimized'],
        specs: {
            'File Size': '1.8 MB',
            Version: '1.0',
            Technology: 'HTML5, CSS3, JavaScript',
            'Browser Support': 'All Modern Browsers',
            Documentation: 'Quick Start Guide',
            Support: '3 Months',
        },
        downloadUrl: '/downloads/personal-portfolio.zip',
        previewUrl: 'https://portfolio-demo.netlify.app',
    },
    {
        id: 5,
        title: 'Restaurant Landing Page',
        shortDescription: 'Delicious restaurant landing page template with menu showcase and reservation system.',
        image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800',
        tags: ['HTML', 'CSS', 'JS', 'BOOTSTRAP'],
        rating: 4.9,
        downloads: 234,
        price: '₹350',
        isPremium: true,
        category: 'Landing',
        addedDate: 'May 6, 2025',
        description: 'Delicious restaurant landing page template with menu showcase, reservation system, and beautiful food photography layouts.',
        description2: 'Perfect for restaurants, cafes, and food businesses looking to establish an appetizing online presence.',
        features: ['Menu Showcase', 'Reservation System', 'Food Gallery', 'Location Maps', 'Customer Reviews', 'Online Ordering Ready'],
        specs: {
            'File Size': '3.5 MB',
            Version: '1.5',
            Technology: 'HTML5, CSS3, JavaScript, Bootstrap',
            'Browser Support': 'All Modern Browsers',
            Documentation: 'Complete Setup Guide',
            Support: '9 Months',
        },
        downloadUrl: '/downloads/restaurant-landing.zip',
        previewUrl: 'https://restaurant-demo.netlify.app',
    },
    {
        id: 6,
        title: 'Modern Dashboard',
        shortDescription: 'Modern admin dashboard template with clean design and comprehensive UI components for web applications.',
        image: 'https://images.pexels.com/photos/574077/pexels-photo-574077.jpeg?auto=compress&cs=tinysrgb&w=800',
        tags: ['HTML', 'CSS', 'JS', 'BOOTSTRAP'],
        rating: 4.7,
        downloads: 123,
        price: 'Free',
        isPremium: false,
        category: 'Business',
        addedDate: 'May 4, 2025',
        description: 'Modern admin dashboard template with clean design and comprehensive UI components for web applications.',
        description2: 'Includes charts, tables, forms, and all essential dashboard components for building admin panels.',
        features: ['Admin Dashboard Layout', 'Data Visualization', 'Form Components', 'Table Management', 'User Management', 'Responsive Charts'],
        specs: {
            'File Size': '2.9 MB',
            Version: '1.3',
            Technology: 'HTML5, CSS3, JavaScript, Bootstrap',
            'Browser Support': 'All Modern Browsers',
            Documentation: 'Developer Guide',
            Support: '6 Months',
        },
        downloadUrl: '/downloads/modern-dashboard.zip',
        previewUrl: 'https://dashboard-demo.netlify.app',
    },
];

const TemplateGrid = () => {
    const [showModal, setShowModal] = useState(false);
    const [downloadingTemplate, setDownloadingTemplate] = useState(null);
    const router = useRouter();

    const handleCardClick = (templateId: string) => {
        router.push(`/template/${templateId}`);
    };

    const handleDownload = (e: React.MouseEvent, template: any) => {
        e.stopPropagation(); // Prevent card click

        // Navigate to template details page instead of direct download
        router.push(`/webconfig/portfolio/template`);
    };

    const handlePreview = (e: React.MouseEvent, template: any) => {
        e.stopPropagation(); // Prevent card click
        window.open(template.previewUrl, '_blank');
    };

    const closeModal = () => {
        setShowModal(false);
        setDownloadingTemplate(null);
    };

    const renderStars = (rating: number): React.JSX.Element[] => {
        return Array.from({ length: 5 }, (_, i: number) => (
            <span key={i} className={i < Math.floor(rating) ? 'starFilled' : 'starEmpty'}>
                <i className="pi pi-star-fill" />
            </span>
        ));
    };

    return (
        <div className="gridContainer__wrapper">
            <div className="gridContainer">
                {templates.map((template: Template) => (
                    <div key={template.id} className="portfolio_card">
                        {template.isPremium && <div className="premiumBadge">PREMIUM</div>}

                        <div className="imageContainer">
                            <img src={template.image} alt={template.title} className="cardImage" />
                        </div>

                        <div className="cardContent">
                            <div className="contentTop">
                                <h3 className="cardTitle">{template.title}</h3>
                                <p className="cardDescription">{template.shortDescription}</p>

                                {/* <div className="tagsContainer">
                                    {template.tags.slice(0, 4).map((tag: string, index: number) => (
                                        <span key={index} className="tag">
                                            {tag}
                                        </span>
                                    ))}
                                </div> */}
                            </div>

                            <div className="contentBottom">
                                {/* <div className="infoSection">
                                    <div className="leftInfo">
                                        <div className="rating">
                                            <div className="stars">{renderStars(template.rating)}</div>
                                            <span className="ratingText">({template.rating})</span>
                                        </div>
                                    </div>
                                    <div className="rightInfo">
                                        <div className="downloads">
                                            <i className="pi pi-download" /> {template.downloads}
                                        </div>
                                    </div>
                                </div> */}

                                <div className="bottomRow">
                                    {/* <div className="priceSection">
                                        {template.price === 'Free' ? (
                                            <span className="freePrice">Free</span>
                                        ) : (
                                            <span className="paidPrice">{template.price}</span>
                                        )}
                                    </div> */}
                                    <Link
                                        href={`/webconfig/portfolio/template/${template.id}`}
                                        className="viewActions"
                                        onClick={(e) => handleDownload(e, template)}
                                        type="button"
                                    >
                                        View <i className="pi pi-arrow-right arrow-icon" />
                                    </Link>

                                    {/* <div className="actions">
                                        <button className="previewBtn" onClick={(e) => handlePreview(e, template)} type="button">
                                            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                            Preview
                                        </button>

                                        {template.price === 'Free' ? (
                                            <button className="downloadBtn" onClick={(e) => handleDownload(e, template)} type="button">
                                                <i className="pi pi-info-circle" />
                                                Details
                                            </button>
                                        ) : (
                                            <button className="buyBtn" onClick={(e) => handleDownload(e, template)} type="button">
                                                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Buy Now
                                            </button>
                                        )}
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplateGrid;
