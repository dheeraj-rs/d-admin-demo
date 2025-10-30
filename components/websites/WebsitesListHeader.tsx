import { useState, useContext, useRef, useEffect } from 'react';
import { LayoutContext } from '../../layout/context/LayoutContext';
import { WebsiteFiltersProps } from '../../types/website';

export default function WebsitesListHeader({ filters, onFilterChange }: WebsiteFiltersProps) {
    const [isResetting, setIsResetting] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const { layoutState, onNavbarStickyToggle } = useContext(LayoutContext);
    const [tempFilters, setTempFilters] = useState({ ...filters });
    const filterRef = useRef<HTMLDivElement>(null);

    const categoryOptions = [
        { label: 'All', value: 'all' },
        { label: 'Free', value: 'free' },
        { label: 'Paid', value: 'paid' },
        { label: 'Premium', value: 'premium' },
    ];

    const typeOptions = [
        { label: 'All', value: 'all' },
        { label: 'Static', value: 'static' },
        { label: 'Dynamic', value: 'dynamic' },
        { label: 'E-commerce', value: 'ecommerce' },
        { label: 'Blog', value: 'blog' },
        { label: 'Dashboard', value: 'dashboard' },
        { label: 'Portfolio', value: 'portfolio' },
        { label: 'Landing Page', value: 'landing-page' },
        { label: 'Admin Panel', value: 'admin-panel' },
    ];

    const techOptions = [
        { label: 'All', value: 'all' },
        { label: 'React', value: 'react' },
        { label: 'Next.js', value: 'next' },
        { label: 'HTML', value: 'html' },
        { label: 'CSS', value: 'css' },
        { label: 'SCSS', value: 'scss' },
        { label: 'Tailwind CSS', value: 'tailwind' },
        { label: 'TypeScript', value: 'typescript' },
        { label: 'Node.js', value: 'nodejs' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const filterButton = document.querySelector('.filter-button');
            if (filterButton && filterButton.contains(event.target as Node)) {
                return;
            }
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
                setTempFilters({ ...filters });
            }
        };
        if (isFilterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterOpen, filters]);

    const handleClearFilters = () => {
        setIsResetting(true);
        const clearedFilters = {
            search: '',
            page: 1,
            limit: 10,
            websiteType: '',
            paymentType: ''
        };
        setTempFilters(clearedFilters);
        onFilterChange(clearedFilters);

        setTimeout(() => {
            setIsResetting(false);
        }, 500);
    };

    const handleApplyFilters = () => {
        onFilterChange(tempFilters);
        setIsFilterOpen(false);
    };

    const handleCategoryChange = (option: { label: string; value: string }) => {
        setTempFilters({ ...tempFilters, paymentType: option.value });
    };

    const handleTypeChange = (option: { label: string; value: string }) => {
        setTempFilters({ ...tempFilters, websiteType: option.value });
    };

    const handleTechChange = (option: { label: string; value: string }) => {
        setTempFilters({ ...tempFilters, websiteType: option.value });
    };

    const handleFilterOpen = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFilterOpen(!isFilterOpen);
        if (!isFilterOpen) {
            setTempFilters({ ...filters });
        }
    };

    const isAnyFilterActive = () => {
        return filters.websiteType !== '' || filters.paymentType !== '';
    };

    const handleResetFilters = () => {
        setIsResetting(true);
        onFilterChange({
            search: '',
            page: 1,
            limit: 10,
            websiteType: '',
            paymentType: ''
        });

        setTimeout(() => {
            setIsResetting(false);
        }, 500);
    };

    return (
        <header className={layoutState.navbarStickyToggle ? 'navbar__wrapper' : ''}>
            <div className="websites__header">
                <div className="header-container">
                    <div className="header-items">
                        <button onClick={onNavbarStickyToggle}>
                            <span className="toggle-icon">
                                {layoutState.navbarStickyToggle ? <i className="pi pi-lock" /> : <i className="pi pi-lock-open" />}
                            </span>
                        </button>
                        <div className="search-input">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={filters.search}
                                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                            />

                            {!filters.search && (
                                <button className="clear-search">
                                    <i className="pi pi-search" />
                                </button>
                            )}

                            {filters.search && (
                                <button className="clear-search" onClick={() => onFilterChange({ ...filters, search: '' })}>
                                    <i className="pi pi-times" />
                                </button>
                            )}
                        </div>
                        <button className={`filter-button ${isAnyFilterActive() ? 'active' : ''}`} onClick={handleFilterOpen}>
                            <i className="pi pi-filter" />
                        </button>

                        <button className={`filters-reset ${isResetting ? 'rotating' : ''}`} onClick={handleResetFilters} title="Reset all filters">
                            <i className="pi pi-refresh" />
                        </button>
                    </div>

                    <div className="filter-dropdown" ref={filterRef}>
                        <div className={`dropdown-content ${isFilterOpen ? 'active' : ''}`}>
                            <div className="filter-group">
                                <h3>Category</h3>
                                <div className="options">
                                    {categoryOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            className={tempFilters.paymentType === option.value ? 'active' : ''}
                                            onClick={() => handleCategoryChange(option)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-group">
                                <h3>Type</h3>
                                <div className="options">
                                    {typeOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            className={tempFilters.websiteType === option.value ? 'active' : ''}
                                            onClick={() => handleTypeChange(option)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-group">
                                <h3>Technology</h3>
                                <div className="options">
                                    {techOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            className={tempFilters.websiteType === option.value ? 'active' : ''}
                                            onClick={() => handleTechChange(option)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-actions">
                                <button className="clear" onClick={handleClearFilters}>
                                    Clear All
                                </button>
                                <button className="apply" onClick={handleApplyFilters}>
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
