'use client';

import * as React from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Category } from './DocumentManager';

interface CreateDocumentDialogProps {
    categories: Category[];
    defaultCategoryId: string | null;
    onClose: () => void;
    onCreate: (title: string, categoryId: string, backgroundColor?: string, backgroundImage?: string) => void;
}

export function CreateDocumentDialog({
    categories,
    defaultCategoryId,
    onClose,
    onCreate,
}: CreateDocumentDialogProps) {
    const [title, setTitle] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState<string>(
        defaultCategoryId || categories[0]?.id || ''
    );
    const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);
    const [selectedBackground, setSelectedBackground] = React.useState<string>('');
    const [backgroundImageUrl, setBackgroundImageUrl] = React.useState<string>('');

    // Predefined background options
    const backgroundOptions = [
        { id: 'default', label: 'Default', value: '' },
        { id: 'blue', label: 'Blue', value: 'bg-gradient-to-br from-blue-900/20 to-blue-950/10' },
        { id: 'purple', label: 'Purple', value: 'bg-gradient-to-br from-purple-900/20 to-purple-950/10' },
        { id: 'green', label: 'Green', value: 'bg-gradient-to-br from-green-900/20 to-green-950/10' },
        { id: 'orange', label: 'Orange', value: 'bg-gradient-to-br from-orange-900/20 to-orange-950/10' },
        { id: 'pink', label: 'Pink', value: 'bg-gradient-to-br from-pink-900/20 to-pink-950/10' },
        { id: 'teal', label: 'Teal', value: 'bg-gradient-to-br from-teal-900/20 to-teal-950/10' },
        { id: 'red', label: 'Red', value: 'bg-gradient-to-br from-red-900/20 to-red-950/10' },
    ];

    const handleCreate = () => {
        if (!title.trim()) {
            return;
        }
        onCreate(title.trim(), selectedCategory, selectedBackground, backgroundImageUrl || undefined);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && title.trim()) {
            handleCreate();
        }
    };

    // Filter out "All Documents" category
    const availableCategories = categories.filter(
        (cat) => cat.name !== 'All Documents'
    );

    const selectedCat = availableCategories.find((cat) => cat.id === selectedCategory);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0D0D0D] rounded-2xl border border-[#1A1A1A] w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#1A1A1A]">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">Create New Document</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white h-8 w-8 sm:h-10 sm:w-10"
                    >
                        <X size={20} />
                    </Button>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            Document Title
                        </label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter document title..."
                            className="bg-[#141414] border-[#1A1A1A] text-white placeholder:text-gray-500 focus:border-blue-500"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            Category
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                className="w-full px-4 py-3 bg-[#141414] border border-[#1A1A1A] rounded-lg text-left flex items-center justify-between hover:border-[#2A2A2A] transition-colors"
                            >
                                {selectedCat ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{selectedCat.icon}</span>
                                        <span className="text-white font-medium">{selectedCat.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-500">Select a category</span>
                                )}
                                <ChevronDown size={16} className="text-gray-400" />
                            </button>

                            {showCategoryDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowCategoryDropdown(false)}
                                    />
                                    <div className="absolute z-20 w-full mt-2 bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg shadow-2xl max-h-60 overflow-auto">
                                        {availableCategories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => {
                                                    setSelectedCategory(category.id);
                                                    setShowCategoryDropdown(false);
                                                }}
                                                className={`
                                                    w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1A1A1A] transition-colors text-left
                                                    ${selectedCategory === category.id ? 'bg-[#1A1A1A]' : ''}
                                                `}
                                            >
                                                <span className="text-xl">{category.icon}</span>
                                                <span className="text-white font-medium">{category.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            Card Background
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {backgroundOptions.map((bg) => (
                                <button
                                    key={bg.id}
                                    type="button"
                                    onClick={() => setSelectedBackground(bg.value)}
                                    className={`
                                        h-12 rounded-lg border-2 transition-all relative overflow-hidden
                                        ${selectedBackground === bg.value ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-[#1A1A1A] hover:border-[#2A2A2A]'}
                                        ${bg.value || 'bg-gradient-to-br from-[#111111] to-[#0A0A0A]'}
                                    `}
                                    title={bg.label}
                                >
                                    {selectedBackground === bg.value && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-4 h-4 bg-blue-500 rounded-full" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500">Choose a background color for your document card</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            Background Image URL (Optional)
                        </label>
                        <Input
                            value={backgroundImageUrl}
                            onChange={(e) => setBackgroundImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="bg-[#141414] border-[#1A1A1A] text-white placeholder:text-gray-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500">Image URL will override the selected color</p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-[#1A1A1A]">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-sm sm:text-base"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={!title.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        Create Document
                    </Button>
                </div>
            </div>
        </div>
    );
}
