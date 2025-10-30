import { LayoutConfig } from './layout';

export interface ThemeContextType {
    layoutConfig: LayoutConfig;
    changeTheme: (theme: string, colorScheme: string) => void;
}

export interface ThemeCategoryProps {
    title: string;
    themes: Theme[];
}

export interface Theme {
    theme: string;
    colorScheme: 'light' | 'dark';
    name: string;
    primary: string;
    secondary: string;
    gradient: string;
}

export interface ThemeButtonProps extends Omit<Theme, 'gradient'> {}
