'use client';
import ElementsListLayout from '../../../../../components/elements/ElementsListLayout';

const HeaderPage: React.FC = () => {
    return (
        <ElementsListLayout
            componentType="contact"
            noDataMessage="No matching Contact elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default HeaderPage;
