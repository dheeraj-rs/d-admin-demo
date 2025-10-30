import { AppMenuItem } from '../../../types';

export const mobileMenuItems = [
    // Home
    { icon: 'pi pi-fw pi-home', label: 'Dashboard', to: '/' },
    
    // Website
    { icon: 'pi pi-fw pi-plus', label: 'Website Builder', to: '/website-builder' },
    { icon: 'pi pi-fw pi-globe', label: 'Websites', to: '/websites' },
    { icon: 'pi pi-fw pi-server', label: 'Website Config', to: '/webconfig' },
    
    // Elements - Add Elements
    { icon: 'pi pi-fw pi-plus', label: 'Add Elements', to: '/add-elements' },
    
    // Elements - Common
    { icon: 'pi pi-fw pi-id-card', label: 'Form Layout', to: '/elements/common/formlayout' },
    { icon: 'pi pi-fw pi-mobile', label: 'Button', to: '/elements/common/button' },
    { icon: 'pi pi-fw pi-id-card', label: 'Card', to: '/elements/common/card' },
    { icon: 'pi pi-fw pi-check-square', label: 'Input', to: '/elements/common/input' },
    { icon: 'pi pi-fw pi-table', label: 'Table', to: '/elements/common/table' },
    { icon: 'pi pi-fw pi-ellipsis-h', label: 'Other', to: '/elements/common/other' },
    
    // Elements - Sections
    { icon: 'pi pi-fw pi-sitemap', label: 'Header', to: '/elements/sections/header' },
    { icon: 'pi pi-fw pi-sitemap', label: 'Hero', to: '/elements/sections/hero' },
    { icon: 'pi pi-fw pi-sitemap', label: 'Footer', to: '/elements/sections/footer' },
    
    // Elements - Sections - Auth
    { icon: 'pi pi-fw pi-sign-in', label: 'Login', to: '/elements/sections/auth/login' },
    { icon: 'pi pi-fw pi-times-circle', label: 'Error', to: '/elements/sections/auth/error' },
    { icon: 'pi pi-fw pi-lock', label: 'Access Denied', to: '/elements/sections/auth/access' },
    
    // Elements - Sections - Not Found
    { icon: 'pi pi-fw pi-exclamation-circle', label: 'Not Found', to: '/elements/sections/notfound' },
    
    // Utils
    { icon: 'pi pi-fw pi-eye', label: 'Icons', to: '/utils/icons' },
    { icon: 'pi pi-fw pi-desktop', label: 'Flex', to: '/utils/flex' },
    { icon: 'pi pi-fw pi pi-hashtag', label: 'Shadow', to: '/utils/box-shadow' },
    { icon: 'pi pi-fw pi pi-palette', label: 'Color Palettes', to: '/utils/color-palettes' },
    
    // Messages
    { icon: 'pi pi-fw pi-bell', label: 'Messages', to: '/messages' },
    
    // Emails
    { icon: 'pi pi-fw pi-envelope', label: 'Emails', to: '/emails' },
    
    // AI Websites
    { icon: 'pi pi-fw pi-sparkles', label: 'AI Websites', to: '/ai-websites' },
    
    // Software
    { icon: 'pi pi-fw pi-comment', label: 'Chat Bot', to: '/software/chatbot' },
    { icon: 'pi pi-fw pi-eraser', label: 'Icon Maker', to: '/software/iconmaker' },
    
    // Document
    { icon: 'pi pi-fw pi-file-edit', label: 'Documentation', to: '/document' },
    { icon: 'pi pi-fw pi-exclamation-circle', label: 'Private knowledge', to: '/knowledge' },
];

export const menuItems: AppMenuItem[] = [
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/', description: 'Dashboard for your project', keywords: ['dashboard', 'project'] }],
    },
    {
        label: 'Website',
        items: [
            { label: 'Website Builder', icon: 'pi pi-fw pi-plus', to: '/website-builder', description: 'Add new website for your project', keywords: ['add', 'website', 'project'] },
            { label: 'Websites', icon: 'pi pi-fw pi-globe', to: '/websites', description: 'Websites for your project', keywords: ['websites', 'project'] },
            {
                label: 'Website Config',
                icon: 'pi pi-fw pi-server',
                to: '/webconfig',
                description: 'Website config for your project',
                keywords: ['website', 'config', 'project'],
            },
        ],
    },

    {
        label: 'Elements',
        items: [
            {
                label: 'Add Elements',
                icon: 'pi pi-fw pi-plus',
                to: '/add-elements',
                description: 'Add new code element',
                keywords: ['add', 'code', 'element', 'create'],
            },
            {
                label: 'Common',
                icon: 'pi pi-fw pi-th-large',
                items: [
                    {
                        label: 'Form Layout',
                        icon: 'pi pi-fw pi-id-card',
                        to: '/elements/common/formlayout',
                        description: 'Form layout for your project',
                        keywords: ['form', 'layout', 'project'],
                    },
                    {
                        label: 'Button',
                        icon: 'pi pi-fw pi-mobile',
                        to: '/elements/common/button',
                        class: 'rotated-icon',
                        description: 'Button for your project',
                        keywords: ['button', 'project'],
                    },
                    {
                        label: 'Card',
                        icon: 'pi pi-fw pi-id-card',
                        to: '/elements/common/card',
                        description: 'Card for your project',
                        keywords: ['card', 'project'],
                    },
                    {
                        label: 'Input',
                        icon: 'pi pi-fw pi-check-square',
                        to: '/elements/common/input',
                        description: 'Input for your project',
                        keywords: ['input', 'project'],
                    },

                    {
                        label: 'Table',
                        icon: 'pi pi-fw pi-table',
                        to: '/elements/common/table',
                        description: 'Table for your project',
                        keywords: ['table', 'project'],
                    },
                    {
                        label: 'Other',
                        icon: 'pi pi-fw pi-ellipsis-h',
                        to: '/elements/common/other',
                        description: 'Other for your project',
                        keywords: ['other', 'project'],
                    },
                    
                ],
            },
            {
                label: 'Sections',
                icon: 'pi pi-fw pi-table',
                items: [
                    {
                        label: 'Header',
                        icon: 'pi pi-fw pi-sitemap',
                        to: '/elements/sections/header',
                        description: 'Header for your project',
                        keywords: ['header', 'project'],
                    },
                    {
                        label: 'Hero',
                        icon: 'pi pi-fw pi-sitemap',
                        to: '/elements/sections/hero',
                        description: 'Hero for your project',
                        keywords: ['hero', 'project'],
                    },
                    {
                        label: 'Footer',
                        icon: 'pi pi-fw pi-sitemap',
                        to: '/elements/sections/footer',
                        description: 'Footer for your project',
                        keywords: ['footer', 'project'],
                    },
                    {
                        label: 'Auth',
                        icon: 'pi pi-fw pi-user',
                        items: [
                            {
                                label: 'Login',
                                icon: 'pi pi-fw pi-sign-in',
                                to: '/elements/sections/auth/login',
                                description: 'Login page for your project',
                                keywords: ['login', 'page', 'project'],
                            },
                            {
                                label: 'Error',
                                icon: 'pi pi-fw pi-times-circle',
                                to: '/elements/sections/auth/error',
                                description: 'Error page for your project',
                                keywords: ['error', 'page', 'project'],
                            },
                            {
                                label: 'Access Denied',
                                icon: 'pi pi-fw pi-lock',
                                to: '/elements/sections/auth/access',
                                description: 'Access denied page for your project',
                                keywords: ['access', 'denied', 'page', 'project'],
                            },
                        ],
                    },
                    {
                        label: 'Not Found',
                        icon: 'pi pi-fw pi-exclamation-circle',
                        to: '/elements/sections/notfound',
                        description: 'Not found page for your project',
                        keywords: ['not found', 'page', 'project'],
                    },
                ],
            },
        ],
    },
    {
        label: 'Utils',
        items: [
            { label: 'Icons', icon: 'pi pi-fw pi-eye', to: '/utils/icons', description: 'Icons for your project', keywords: ['icons', 'project'] },
            {
                label: 'Flex',
                icon: 'pi pi-fw pi-desktop',
                to: '/utils/flex',
                description: 'Flexbox layout for your project',
                keywords: ['flex', 'layout', 'project'],
                //  url: 'https://dheerajrs.com/',
                // target: '_blank',
            },
            { icon: 'pi pi-fw pi-hashtag', label: 'Shadow', to: '/utils/box-shadow' },
            { icon: 'pi pi-fw pi-palette', label: 'Color Palettes', to: '/utils/color-palettes' },
        ],
    },
    {
        label: 'Tools',
        items: [
            {
                label: 'Messages',
                icon: 'pi pi-fw pi-bell',
                to: '/messages',
                description: 'View and manage system messages and notifications',
                keywords: ['messages', 'notifications', 'alerts', 'inbox'],
            },
            {
                label: 'Emails',
                icon: 'pi pi-fw pi-envelope',
                to: '/emails',
                description: 'Email templates and management for your project',
                keywords: ['email', 'templates', 'management', 'mail'],
            },
            {
                label: 'AI Websites',
                icon: 'pi pi-fw pi-sparkles',
                to: '/ai-websites',
                description: 'Browse and access AI websites URLs collection',
                keywords: ['ai', 'artificial intelligence', 'websites', 'urls', 'links', 'collection', 'directory'],
            },
        ],
    },
    {
        label: 'Software',
        items: [
            {
                label: 'Chat Bot',
                icon: 'pi pi-fw pi-comment',
                to: '/software/chatbot',
                description: 'Chat bot for your project',
                keywords: ['chat', 'bot', 'project'],
            },
            {
                label: 'Icon Maker',
                icon: 'pi pi-fw pi-eraser',
                to: '/software/iconmaker',
                description: 'Create icons for your project',
                keywords: ['icon', 'maker', 'project'],
            },
        ],
    },

    {
        label: 'Document',
        items: [
            {
                label: 'Documentation',
                icon: 'pi pi-fw pi-file-edit',
                to: '/document',
                description: 'Documentation for the project',
                keywords: ['documentation', 'project', 'help'],
            },
            {
                label: 'Private knowledge',
                to: '/knowledge',
                icon: 'pi pi-fw pi-exclamation-circle',
                description: 'Private knowledge for the project',
                keywords: ['knowledge', 'private', 'project'],
            },
        ],
    },
];

export const projects = [
    {
        id: 1,
        title: '3D Solar System Planets to Explore',
        des: 'Explore the wonders of our solar system with this captivating 3D simulation of the planets using Three.js.',
        img: '/p1.svg',
        iconLists: ['/re.svg', '/tail.svg', '/ts.svg', '/three.svg', '/fm.svg'],
        link: '/ui.earth.com',
    },
    {
        id: 2,
        title: 'Yoom - Video Conferencing App',
        des: 'Simplify your video conferencing experience with Yoom. Seamlessly connect with colleagues and friends.',
        img: '/p2.svg',
        iconLists: ['/next.svg', '/tail.svg', '/ts.svg', '/stream.svg', '/c.svg'],
        link: '/ui.yoom.com',
    },
    {
        id: 3,
        title: 'AI Image SaaS - Canva Application',
        des: 'A REAL Software-as-a-Service app with AI features and a payments and credits system using the latest tech stack.',
        img: '/p3.svg',
        iconLists: ['/re.svg', '/tail.svg', '/ts.svg', '/three.svg', '/c.svg'],
        link: '/ui.aiimg.com',
    },
    {
        id: 4,
        title: 'Animated Apple Iphone 3D Website',
        des: 'Recreated the Apple iPhone 15 Pro website, combining GSAP animations and Three.js 3D effects..',
        img: '/p4.svg',
        iconLists: ['/next.svg', '/tail.svg', '/ts.svg', '/three.svg', '/gsap.svg'],
        link: '/ui.apple.com',
    },
];

export const websiteCategories = [
    {
        id: 1,
        type: 'live',
        title: 'Live Websites',
        description: 'Currently active and running websites',
        icon: 'pi pi-globe',
        count: 24,
        color: 'blue',
        status: 'active',
        url: '/webconfig/live',
    },
    {
        id: 2,
        type: 'templates',
        title: 'Templates',
        description: 'Ready-to-use website templates',
        icon: 'pi pi-file',
        count: 50,
        color: 'purple',
        status: 'active',
        url: '/webconfig/templates',
    },
    {
        id: 3,
        type: 'paid',
        title: 'Paid Websites',
        description: 'Premium website solutions',
        icon: 'pi pi-dollar',
        count: 15,
        color: 'green',
        status: 'active',
        url: '/webconfig/paid',
    },
    {
        id: 4,
        type: 'free',
        title: 'Free Websites',
        description: 'Free website options',
        icon: 'pi pi-gift',
        count: 10,
        color: 'orange',
        status: 'active',
        url: '/webconfig/free',
    },
    {
        id: 5,
        type: 'premium',
        title: 'Premium Websites',
        description: 'High-end website solutions',
        icon: 'pi pi-star',
        count: 8,
        color: 'yellow',
        status: 'active',
        url: '/webconfig/premium',
    },
    {
        id: 6,
        type: 'snippet',
        title: 'Snippet Websites',
        description: 'Customer created websites',
        icon: 'pi pi-users',
        count: 30,
        color: 'cyan',
        status: 'active',
        url: '/webconfig/snippet',
    },
    {
        id: 7,
        type: 'personal',
        title: 'My Personal Websites',
        description: 'Personal websites for users',
        icon: 'pi pi-user',
        count: 30,
        color: 'cyan',
        status: 'active',
        url: '/webconfig/personal',
    },
];
