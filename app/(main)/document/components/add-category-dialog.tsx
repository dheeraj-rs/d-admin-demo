'use client';

import * as React from 'react';
import { X, Mail, User, Gamepad2, HardDrive, TestTube, Briefcase, Crown } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { cn } from '../../../../lib/utils';

const iconOptions = [
    { name: 'Mail', Icon: Mail },
    { name: 'User', Icon: User },
    { name: 'Gamepad2', Icon: Gamepad2 },
    { name: 'HardDrive', Icon: HardDrive },
    { name: 'TestTube', Icon: TestTube },
    { name: 'Briefcase', Icon: Briefcase },
    { name: 'Crown', Icon: Crown },
];

const colorOptions = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
];

interface AddCategoryDialogProps {
    onClose: () => void;
    onAdd: (name: string, icon: string, color: string) => void;
}

export function AddCategoryDialog({ onClose, onAdd }: AddCategoryDialogProps) {
    const [name, setName] = React.useState('');
    const [selectedIcon, setSelectedIcon] = React.useState('Mail');
    const [selectedColor, setSelectedColor] = React.useState('#3B82F6');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onAdd(name.trim(), selectedIcon, selectedColor);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0D0D0D] rounded-2xl border border-[#1A1A1A] w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-[#1A1A1A]">
                    <h2 className="text-xl font-semibold text-white">Add Category</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Category Name</label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter category name"
                            className="bg-[#141414] border-[#1A1A1A] text-white placeholder:text-gray-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Icon</label>
                        <div className="grid grid-cols-7 gap-2">
                            {iconOptions.map(({ name: iconName, Icon }) => (
                                <button
                                    key={iconName}
                                    type="button"
                                    onClick={() => setSelectedIcon(iconName)}
                                    className={cn(
                                        'p-3 rounded-lg border transition-all duration-200',
                                        selectedIcon === iconName
                                            ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                                            : 'bg-[#141414] border-[#1A1A1A] text-gray-400 hover:border-[#2A2A2A] hover:text-gray-300'
                                    )}
                                >
                                    <Icon size={20} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Color</label>
                        <div className="grid grid-cols-7 gap-2">
                            {colorOptions.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={cn(
                                        'w-10 h-10 rounded-lg border-2 transition-all duration-200',
                                        selectedColor === color
                                            ? 'border-white scale-110'
                                            : 'border-transparent hover:scale-105'
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 text-gray-400 hover:text-white hover:bg-[#1A1A1A]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Add Category
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
