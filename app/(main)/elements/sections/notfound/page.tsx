"use client";
import ElementsListLayout from '../../../../../components/elements/ElementsListLayout';

const NotFoundPage: React.FC = () => {
    return (
        <ElementsListLayout
            componentType="notfound"
            noDataMessage="No matching notfound elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default NotFoundPage;