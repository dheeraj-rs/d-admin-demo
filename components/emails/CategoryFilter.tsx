'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface Category {
    name: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

interface CategoryFilterProps {
    categories: Category[];
    activeCategory: string;
    userRole: string;
    onCategoryChange: (category: string) => void;
    onAddEmail: () => void;
    getCategoryCount: (category: string) => number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
    categories,
    activeCategory,
    userRole,
    onCategoryChange,
    onAddEmail,
    getCategoryCount,
}) => {
    return (
        <div className="emails-page-categories">
            <div className="emails-categories-scroll">
                {categories.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.value;
                    const count = getCategoryCount(category.value);

                    return (
                        <button
                            key={category.value}
                            onClick={() => onCategoryChange(category.value)}
                            className={`category-btn ${isActive ? 'active' : ''}`}
                            style={{ '--category-color': category.color } as React.CSSProperties}
                        >
                            <Icon className="category-icon" />
                            <span className="category-name">{category.name}</span>
                            <span className="category-count">{count}</span>
                        </button>
                    );
                })}
            </div>
            {userRole === 'superadmin' && (
                <button
                    className="add-email-btn"
                    onClick={onAddEmail}
                    title="Add Email Account"
                >
                    <Plus className="icon" />
                    <span className="btn-text">Add Email</span>
                </button>
            )}
        </div>
    );
};
