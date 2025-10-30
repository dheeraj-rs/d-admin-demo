'use client';
import ElementsListLayout from '../../../../../components/elements/ElementsListLayout';

const CardPage: React.FC = () => {
    return (
        <ElementsListLayout 
            componentType="card"
            layout="grid"
            noDataMessage="No matching card elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default CardPage; 