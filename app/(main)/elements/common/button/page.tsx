'use client';
import ElementsListLayout from '../../../../../components/elements/ElementsListLayout';

const ButtonPage: React.FC = () => {
    return (
        <ElementsListLayout
            componentType="button"
            layout="grid"
            noDataMessage="No matching button elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default ButtonPage;
