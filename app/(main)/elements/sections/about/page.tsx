'use client';
import ElementsListLayout from '../../../../../components/elements/ElementsListLayout';

const HeaderPage: React.FC = () => {
    return (
        <ElementsListLayout
            componentType="about"
            noDataMessage="No matching about elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default HeaderPage;
