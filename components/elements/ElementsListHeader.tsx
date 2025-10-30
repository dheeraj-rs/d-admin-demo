import { useState, useContext, useRef, useEffect } from 'react';
import { LayoutContext } from '../../layout/context/LayoutContext';
import Link from 'next/link';

// Improved type definitions
export interface FilterState {
    search: string;
    componentType?: string;
    complexity: string;
    hashtags: string;
}

interface ComplexityOption {
    label: string;
    value: string;
}

interface ElementsHeaderProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    complexityOptions: ComplexityOption[];
    onReload?: () => void;
}

export default function ElementsListHeader({ filters, onFilterChange, complexityOptions, onReload }: ElementsHeaderProps) {
    // State management
    const [isResetting, setIsResetting] = useState<boolean>(false);
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
    const [tempFilters, setTempFilters] = useState<FilterState>({ ...filters });
    const [isReloading, setIsReloading] = useState<boolean>(false);

    // Refs and context
    const filterRef = useRef<HTMLDivElement>(null);
    const { layoutState, onNavbarStickyToggle } = useContext(LayoutContext);

    // Handle outside clicks for filter dropdown
    useEffect(() => {
        if (!isFilterOpen) return;

        const handleClickOutside = (event: MouseEvent): void => {
            const filterButton = document.querySelector('.filter-button');

            // If clicking the filter button, do nothing (handled by click handler)
            if (filterButton?.contains(event.target as Node)) {
                return;
            }

            // If clicking outside the filter dropdown, close it
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
                setTempFilters({ ...filters });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isFilterOpen, filters]);

    // Helper function to check if any filters are active
    const isAnyFilterActive = (): boolean => {
        return Boolean(filters.componentType) || Boolean(filters.complexity) || Boolean(filters.hashtags);
    };

    // Reset all filters with animation
    const handleResetFilters = (): void => {
        setIsResetting(true);

        const clearedFilters: FilterState = {
            search: '',
            componentType: filters.componentType, // Preserve componentType
            complexity: '',
            hashtags: '',
        };

        onFilterChange(clearedFilters);

        setTimeout(() => setIsResetting(false), 500);
    };

    // Handle reload data with animation
    const handleReloadData = (): void => {
        if (!onReload) return;
        
        setIsReloading(true);
        onReload();
        
        // Reset reloading state after animation
        setTimeout(() => setIsReloading(false), 500);
    };

    // Clear filters within dropdown
    const handleClearFilters = (): void => {
        setIsResetting(true);

        const clearedFilters: FilterState = {
            search: '',
            componentType: filters.componentType, // Preserve componentType
            complexity: '',
            hashtags: '',
        };

        setTempFilters(clearedFilters);
        onFilterChange(clearedFilters);

        setTimeout(() => setIsResetting(false), 500);
    };

    // Apply temporary filters
    const handleApplyFilters = (): void => {
        onFilterChange(tempFilters);
        setIsFilterOpen(false);
    };

    // Update complexity in temporary filters
    const handleComplexityChange = (value: string): void => {
        setTempFilters({ ...tempFilters, complexity: value });
    };

    // Toggle filter dropdown
    const handleFilterOpen = (e: React.MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();

        const newState = !isFilterOpen;
        setIsFilterOpen(newState);

        if (newState) {
            setTempFilters({ ...filters });
        }
    };

    // Clear search input
    const handleClearSearch = (): void => {
        onFilterChange({ ...filters, search: '' });
    };

    // Go back in history
    const handleGoBack = (e: React.MouseEvent): void => {
        e.preventDefault();
        window.history.go(-1);
    };

    return (
        <header className={layoutState?.navbarStickyToggle ? 'navbar__wrapper' : ''}>
            <div className="elements-list-header__wrapper">
                <div className="header-container">
                    <div className="header-items">
                        {/* Back button */}
                        <button onClick={handleGoBack} title="Go back">
                            <i className="pi pi-chevron-left" />
                        </button>

                        {/* Search input */}
                        <div className="search-input">
                            <input
                                type="text"
                                placeholder="Search code elements..."
                                value={filters.search}
                                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                            />

                            {!filters.search ? (
                                <button className="clear-search">
                                    <i className="pi pi-search" />
                                </button>
                            ) : (
                                <button className="clear-search" onClick={handleClearSearch}>
                                    <i className="pi pi-times" />
                                </button>
                            )}
                        </div>

                        {/* Filter button */}
                        <button className={`filter-button ${isAnyFilterActive() ? 'active' : ''}`} onClick={handleFilterOpen}>
                            <i className="pi pi-filter" />
                        </button>

                        {/* Toggle sticky navbar */}
                        <button onClick={onNavbarStickyToggle}>
                            <span className="toggle-icon">
                                {layoutState?.navbarStickyToggle ? <i className="pi pi-lock" /> : <i className="pi pi-lock-open" />}
                            </span>
                        </button>

                        {/* Reload data button */}
                        <button 
                            className={`filters-reload ${isReloading ? 'rotating' : ''}`} 
                            onClick={handleReloadData} 
                            title="Reload data"
                            disabled={!onReload}
                        >
                            <i className="pi pi-sync" />
                        </button>

                        {/* Reset filters */}
                        <button className={`filters-reset ${isResetting ? 'rotating' : ''}`} onClick={handleResetFilters} title="Reset all filters">
                            <i className="pi pi-refresh" />
                        </button>

                        {/* Add new button */}

                        <Link href="/add-elements">
                            <button className="add-button">
                                <i className="button-icon pi pi-plus-circle" />
                                <span className="button-text">Add New</span>
                            </button>
                        </Link>
                    </div>

                    {/* Filter dropdown */}
                    <div className="filter-dropdown" ref={filterRef}>
                        <div className={`dropdown-content ${isFilterOpen ? 'active' : ''}`}>
                            {/* Complexity filter group */}
                            <div className="filter-group">
                                <h3>Complexity</h3>
                                <div className="options">
                                    {complexityOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            className={tempFilters.complexity === option.value ? 'active' : ''}
                                            onClick={() => handleComplexityChange(option.value)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filter actions */}
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
