'use client';
import ElementsListLayout from '../../../../../components/elements/ElementsListLayout';

const HeaderPage: React.FC = () => {
    return (
        <ElementsListLayout
            componentType="header"
            noDataMessage="No matching header elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default HeaderPage;
