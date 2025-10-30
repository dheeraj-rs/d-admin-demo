"use client";
import ElementsListLayout from '../../../../../../components/elements/ElementsListLayout';

const LoginPage: React.FC = () => {
    return (
        <ElementsListLayout
            componentType="auth-login"
            noDataMessage="No matching login elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default LoginPage;