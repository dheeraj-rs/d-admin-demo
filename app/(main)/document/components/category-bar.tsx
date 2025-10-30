'use client';

import * as React from 'react';
import { Mail, User, Gamepad2, HardDrive, TestTube, Briefcase, Crown, Plus, X } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Button } from '../../../../components/ui/button';
import { Category } from './DocumentManager';

const iconMap: Record<string, React.ElementType> = {
    Mail,
    User,
    Gamepad2,
    HardDrive,
    TestTube,
    Briefcase,
    Crown,
};

interface CategoryBarProps {
    categories: Category[];
    activeCategory: string | null;
    onCategoryChange: (categoryId: string) => void;
    onAddCategory: () => void;
    onDeleteCategory: (categoryId: string) => void;
}

export function CategoryBar({ categories, activeCategory, onCategoryChange, onAddCategory, onDeleteCategory }: CategoryBarProps) {
    return (
        <div className="flex items-center gap-3 px-6 py-4 border-b overflow-x-auto" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-section)' }}>
            {categories.map((category) => {
                const Icon = iconMap[category.icon] || Mail;
                const isActive = activeCategory === category.id;
                const canDelete = category.name !== 'All Documents';

                return (
                    <div key={category.id} className="relative group/category">
                        <button
                            onClick={() => onCategoryChange(category.id)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap border'
                            )}
                            style={isActive ? {
                                backgroundColor: `${category.color}20`,
                                borderColor: `${category.color}40`,
                                color: category.color,
                            } : {
                                backgroundColor: 'var(--surface-card)',
                                color: 'var(--text-color-secondary)',
                                borderColor: 'transparent'
                            }}
                        >
                            <Icon size={16} style={isActive ? { color: category.color } : undefined} />
                            <span>{category.name}</span>
                            <span
                                className="px-2 py-0.5 rounded-full text-xs"
                                style={isActive ? {
                                    backgroundColor: `${category.color}30`,
                                    color: category.color,
                                } : {
                                    backgroundColor: 'var(--surface-hover)',
                                    color: 'var(--text-color-secondary)'
                                }}
                            >
                                {category.count}
                            </span>
                            {/* delete button */}
                            {canDelete && (
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteCategory(category.id);
                                    }}
                                    className="ml-1 opacity-0 group-hover/category:opacity-100 transition-opacity cursor-pointer hover:text-red-400"
                                    title="Delete category"
                                >
                                    <X size={12} />
                                </span>
                            )}
                        </button>
                    </div>
                );
            })}
            <Button
                onClick={onAddCategory}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-[#1A1A1A] ml-2"
            >
                <Plus size={16} className="mr-2" />
                Add Category
            </Button>
        </div>
    );
}
