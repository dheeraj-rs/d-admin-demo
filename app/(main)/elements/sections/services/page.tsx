'use client';
import ElementsListLayout from '../../../../../components/elements/ElementsListLayout';

const HeaderPage: React.FC = () => {
    return (
        <ElementsListLayout
            componentType="services"
            noDataMessage="No matching services elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default HeaderPage;
