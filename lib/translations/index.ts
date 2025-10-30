import { Language } from '../i18n';
import { navigationTranslations } from './navigation';
import { menuTranslations } from './menu';
import { dashboardTranslations } from './dashboard';
import { aiWebsitesTranslations } from './ai-websites';
import { websitesTranslations } from './websites';
import { portfolioTranslations } from './portfolio';
import { softwareTranslations } from './software';
import { knowledgeTranslations } from './knowledge';
import { elementsTranslations } from './elements';
import { documentsTranslations } from './documents';
import { commonTranslations } from './common';
import { settingsTranslations } from './settings';
import { configTranslations } from './config';

export interface Translations {
    [key: string]: string;
}

const mergeTranslations = (language: Language): Translations => {
    return {
        ...navigationTranslations[language],
        ...menuTranslations[language],
        ...dashboardTranslations[language],
        ...aiWebsitesTranslations[language],
        ...websitesTranslations[language],
        ...portfolioTranslations[language],
        ...softwareTranslations[language],
        ...knowledgeTranslations[language],
        ...elementsTranslations[language],
        ...documentsTranslations[language],
        ...commonTranslations[language],
        ...settingsTranslations[language],
        ...configTranslations[language],
    };
};

export const translations: Record<Language, Translations> = {
    en: mergeTranslations('en'),
    hi: mergeTranslations('hi'),
};
