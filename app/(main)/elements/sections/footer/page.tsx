"use client";
import ElementsListLayout from '../../../../../components/elements/ElementsListLayout';

const FooterPage: React.FC = () => {
    return (
        <ElementsListLayout
            componentType="footer"
            noDataMessage="No matching footer elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default FooterPage;