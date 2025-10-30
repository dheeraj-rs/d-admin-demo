'use client';
import ElementsListLayout from '../../../../../components/elements/ElementsListLayout';

const FormLayoutPage: React.FC = () => {    
    return (
        <ElementsListLayout 
            componentType="form"
            layout="grid"
            noDataMessage="No matching form elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default FormLayoutPage;
