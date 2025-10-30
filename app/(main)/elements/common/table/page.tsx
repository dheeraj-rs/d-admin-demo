'use client';
import ElementsListLayout from '../../../../../components/elements/ElementsListLayout';

const TablePage: React.FC = () => {
    return (
        <ElementsListLayout
            componentType="table"
            layout="grid"
            noDataMessage="No matching table elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default TablePage;
