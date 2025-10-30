'use client';
import ElementsListLayout from '../../../../../components/elements/ElementsListLayout';

const InputPage: React.FC = () => {
    return (
        <ElementsListLayout 
            componentType="input"
            layout="grid"
            noDataMessage="No matching input elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default InputPage;
