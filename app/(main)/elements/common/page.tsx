'use client';
import ElementsListLayout from '../../../../components/elements/ElementsListLayout';

const CommonPage: React.FC = () => {
    return (
        <ElementsListLayout
            componentType="common"
            layout="grid"
            noDataMessage="No matching common elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default CommonPage;
