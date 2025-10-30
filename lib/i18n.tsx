'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from './translations';

// Language types
export type Language = 'en' | 'hi';

// Translation interface
export interface Translations {
    [key: string]: string;
}

// Language data interface
export interface LanguageData {
    code: Language;
    name: string;
    nativeName: string;
    flag: string;
}

// Available languages
export const AVAILABLE_LANGUAGES: LanguageData[] = [
    {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸'
    },
    {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिंदी',
        flag: '🇮🇳'
    }
];

// Language context interface
interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    availableLanguages: LanguageData[];
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language provider props
interface LanguageProviderProps {
    children: ReactNode;
}

// Language provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');

    // Load language from localStorage on mount
    useEffect(() => {
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage && AVAILABLE_LANGUAGES.some(lang => lang.code === savedLanguage)) {
            setLanguageState(savedLanguage);
        }
    }, []);

    // Keep HTML document language attribute in sync
    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    // Set language function
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    // Translation function
    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    const value: LanguageContextType = {
        language,
        setLanguage,
        t,
        availableLanguages: AVAILABLE_LANGUAGES,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// Hook to use language context
export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

// Utility function to get translation
export const getTranslation = (key: string, language: Language = 'en'): string => {
    return translations[language][key] || key;
}; 