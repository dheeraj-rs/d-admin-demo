'use client';
import ElementsListLayout from '../../../../../components/elements/ElementsListLayout';

const HeroPage: React.FC = () => {
    return (
        <ElementsListLayout
            componentType="hero"
            noDataMessage="No matching hero elements found"
            noDataSuggestion="Try different keywords or browse all templates"
        />
    );
};

export default HeroPage;
