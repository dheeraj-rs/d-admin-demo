'use client';
import ElementsListLayout from '../../../../../../components/elements/ElementsListLayout';

const AccessPage: React.FC = () => {
    return (
        <ElementsListLayout
            componentType="auth-access"
            noDataMessage="No matching access elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default AccessPage;
