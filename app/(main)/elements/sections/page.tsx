"use client";
import ElementsListLayout from '../../../../components/elements/ElementsListLayout';

const SectionsPage: React.FC = () => {
    return (
        <ElementsListLayout
            componentType="sections"
            noDataMessage="No matching sections elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default SectionsPage;