import { useLanguage } from '../lib/i18n';
import { AppMenuItem } from '../types';

// Function to translate menu items recursively
const translateMenuItem = (item: AppMenuItem, t: (key: string) => string): AppMenuItem => {
    const translatedItem = { ...item };

    // Translate the label
    if (item.label) {
        const translationKey = `menu.${item.label.toLowerCase().replace(/\s+/g, '.')}`;
        translatedItem.label = t(translationKey) || item.label;
    }

    // Translate the description
    if (item.description) {
        const translationKey = `menu.description.${item.label?.toLowerCase().replace(/\s+/g, '.')}`;
        translatedItem.description = t(translationKey) || item.description;
    }

    // Recursively translate child items
    if (item.items && item.items.length > 0) {
        translatedItem.items = item.items.map((childItem) => translateMenuItem(childItem, t));
    }

    return translatedItem;
};

export const useTranslatedMenuItems = (originalItems: AppMenuItem[]): AppMenuItem[] => {
    const { t } = useLanguage();

    return originalItems.map((item) => translateMenuItem(item, t));
};
