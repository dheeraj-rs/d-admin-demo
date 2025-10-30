import { FC, useEffect, useState, useCallback } from 'react';

// Static variable to track currently open dropdown
let activeDropdownId: string | null = null;

// Add global click listener once
if (typeof window !== 'undefined') {
    const handleGlobalClick = (e: MouseEvent) => {
        if (!(e.target as HTMLElement).closest('.custom-dropdown')) {
            activeDropdownId = null;
            window.dispatchEvent(new CustomEvent('dropdownClose'));
        }
    };
    
    document.removeEventListener('click', handleGlobalClick);
    document.addEventListener('click', handleGlobalClick);
}

export interface DropdownChangeEvent {
    originalEvent: React.MouseEvent;
    value: any;
}

interface DropdownProps {
    id: string;
    value: any;
    options: Array<{ [key: string]: any }>;
    onChange: (e: { originalEvent: React.MouseEvent; value: any }) => void;
    optionLabel?: string;
    placeholder?: string;
    className?: string;
    itemTemplate?: (option: any) => React.ReactNode;
    showClear?: boolean;
    filter?: boolean;
    mainLabel?: string;
}

export const Dropdown: FC<DropdownProps> = ({
    id,
    value,
    options,
    onChange,
    optionLabel = 'label',
    placeholder,
    className,
    itemTemplate,
    showClear = false,
    filter = false,
    mainLabel = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filterValue, setFilterValue] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);

    // Update filtered options when options or value changes
    useEffect(() => {
        const filtered = options.filter(option => 
            !value || option[optionLabel] !== value[optionLabel]
        );
        setFilteredOptions(filtered);
    }, [options, value, optionLabel]);

    // Handle dropdown close event
    useEffect(() => {
        const handleDropdownClose = () => isOpen && setIsOpen(false);
        window.addEventListener('dropdownClose', handleDropdownClose);
        return () => window.removeEventListener('dropdownClose', handleDropdownClose);
    }, [isOpen]);

    // Handlers
    const handleFilter = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const searchText = e.target.value.toLowerCase();
        setFilterValue(e.target.value);
        
        const filtered = options.filter(option => 
            option[optionLabel].toLowerCase().includes(searchText) && 
            (!value || option[optionLabel] !== value[optionLabel])
        );
        setFilteredOptions(filtered);
    }, [options, value, optionLabel]);

    const toggleDropdown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isOpen) {
            setIsOpen(false);
            activeDropdownId = null;
        } else {
            if (activeDropdownId && activeDropdownId !== id) {
                window.dispatchEvent(new CustomEvent('dropdownClose'));
            }
            activeDropdownId = id;
            setIsOpen(true);
        }
    };

    const handleOptionClick = (event: React.MouseEvent, option: any) => {
        onChange({ originalEvent: event, value: option });
        setIsOpen(false);
        activeDropdownId = null;
        setFilterValue('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange({ originalEvent: e, value: null });
        setIsOpen(false);
        activeDropdownId = null;
    };

    return (
        <div className={`custom-dropdown ${className || ''}`}>
            <div className="dropdown-header" onClick={toggleDropdown}>
                <span>{mainLabel} {value ? value[optionLabel] : placeholder}</span>
                {showClear && value && (
                    <span className="clear-icon" onClick={handleClear}>×</span>
                )}
                <span className="arrow">▼</span>
            </div>
            {isOpen && (
                <div className="dropdown-panel">
                    {filter && (
                        <div className="dropdown-filter">
                            <input 
                                type="text"
                                value={filterValue}
                                onChange={handleFilter}
                                placeholder="Search..."
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                    )}
                    <ul className="dropdown-list">
                        {filteredOptions.map((option, index) => (
                            <li
                                key={index}
                                onClick={e => handleOptionClick(e, option)}
                            >
                                {itemTemplate ? itemTemplate(option) : option[optionLabel]}
                            </li>
                        ))}
                        {filteredOptions.length === 0 && (
                            <li className="dropdown-empty-message">No results found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};
