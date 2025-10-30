'use client';
import ElementsListLayout from '../../../../../../components/elements/ElementsListLayout';

const ErrorPage: React.FC = () => {
    return (
        <ElementsListLayout
            componentType="auth-error"   
            noDataMessage="No matching error elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default ErrorPage;
