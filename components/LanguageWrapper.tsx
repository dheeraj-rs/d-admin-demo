'use client';

import { useEffect } from 'react';
import { useLanguage } from '../lib/i18n';

interface LanguageWrapperProps {
    children: React.ReactNode;
}

export const LanguageWrapper: React.FC<LanguageWrapperProps> = ({ children }) => {
    const { language } = useLanguage();

    useEffect(() => {
        // Update the HTML lang attribute when language changes
        document.documentElement.lang = language;
    }, [language]);

    return <>{children}</>;
}; 