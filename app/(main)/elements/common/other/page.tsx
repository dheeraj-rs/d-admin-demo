'use client';
import ElementsListLayout from '../../../../../components/elements/ElementsListLayout';

const OtherPage: React.FC = () => {
    return (
        <ElementsListLayout
            componentType="other"
            layout="grid"
            noDataMessage="No matching other elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default OtherPage;
