'use client';

import * as React from 'react';
import { FileText, Edit, Trash2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Button } from '../../../../components/ui/button';
import { Document } from './DocumentManager';

interface DocumentCardProps {
    document: Document;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
    backgroundColor?: string;
    backgroundImage?: string;
}

export function DocumentCard({ document, onClick, onEdit, onDelete, backgroundColor, backgroundImage }: DocumentCardProps) {
    const [isHovered, setIsHovered] = React.useState(false);

    // Check if we have a valid background image URL
    const hasBackgroundImage = backgroundImage && backgroundImage.trim() !== '';

    // Generate gradient background based on document or use provided color
    const cardBg = backgroundColor || '';

    return (
        <div
            className={cn(
                'rounded-xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer group relative overflow-hidden',
                hasBackgroundImage ? '' : cardBg
            )}
            style={hasBackgroundImage ? {
                backgroundImage: `url("${backgroundImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                borderColor: isHovered ? 'var(--primary-color)' : 'var(--surface-border)',
            } : {
                backgroundColor: cardBg || 'var(--surface-card)',
                borderColor: isHovered ? 'var(--primary-color)' : 'var(--surface-border)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {/* Background Overlay for better text readability when using images */}
            {hasBackgroundImage && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50 pointer-events-none" />
            )}

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(159, 168, 218, 0.1)' }}>
                        <FileText size={18} className="sm:w-5 sm:h-5" style={{ color: 'var(--primary-color)' }} />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                        >
                            <Edit size={14} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                    <h3 className="font-medium text-sm sm:text-base truncate" style={{ color: 'var(--text-color)' }}>{document.title}</h3>
                    <p className="text-xs sm:text-sm truncate" style={{ color: 'var(--text-color-secondary)' }}>{document.last_modified_by}</p>
                </div>

                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--surface-border)', color: 'var(--text-color-secondary)' }}>
                    <span className="truncate">{new Date(document.updated_at).toLocaleDateString()}</span>
                    <span className="ml-2 flex-shrink-0">
                        {new Date(document.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );
}
