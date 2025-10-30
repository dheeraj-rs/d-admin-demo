'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { LayoutConfig } from '../../types/layout';
import { ThemeContextType } from '../../types/theme';
import { ThemeManager } from '../../lib/theme-manager';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
    layoutConfig: LayoutConfig;
    setLayoutConfig: (updater: (prevState: LayoutConfig) => LayoutConfig) => void;
}

export const ThemeProvider = ({
    children,
    layoutConfig,
    setLayoutConfig,
}: ThemeProviderProps) => {
    const changeTheme = useCallback((newTheme: string, newColorScheme: string) => {
        if (typeof window === 'undefined') return;
        
        ThemeManager.changeTheme?.(layoutConfig.theme, newTheme, 'theme-css', () => {
            setLayoutConfig((prevState) => ({
                ...prevState,
                theme: newTheme,
                colorScheme: newColorScheme,
            }));
        });
    }, [layoutConfig.theme, setLayoutConfig]);

    const contextValue = {
        layoutConfig,
        changeTheme,
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
