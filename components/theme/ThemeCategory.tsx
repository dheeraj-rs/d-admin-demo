'use client';

import { ThemeButton } from './ThemeButton';
import { useLanguage } from '../../lib/i18n';
import { Theme, ThemeCategoryProps } from '../../types/theme';
import { memo } from 'react';

export const ThemeCategory = memo(({ title, themes }: { title: string; themes: Theme[] }) => {
    const { t } = useLanguage();

    return (
        <div className="theme-category">
            <h6>{title}</h6>
            <div className="theme-grid">
                {themes.map((theme: Theme) => (
                    <ThemeButton key={theme.theme} {...theme} />
                ))}
            </div>
        </div>
    );
});

ThemeCategory.displayName = 'ThemeCategory';
