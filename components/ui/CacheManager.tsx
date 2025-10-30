'use client';

import React, { useState } from 'react';
import { usePageCache } from '../../lib/pageCache';
import { usePageCacheContext } from '../providers/PageCacheProvider';
import { Button } from './Button/Button';
import '../../styles/components/cache-manager.scss';

interface CacheManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CacheManager: React.FC<CacheManagerProps> = ({ isOpen, onClose }) => {
    const { getCacheInfo, clearAllCache, clearExpiredCache } = usePageCache();
    const { currentPageId, clearCurrentPageCache } = usePageCacheContext();
    const [isClearing, setIsClearing] = useState(false);

    if (!isOpen) return null;

    const cacheInfo = getCacheInfo();

    const handleClearAll = async () => {
        if (confirm('Are you sure you want to clear all cached pages? This action cannot be undone.')) {
            setIsClearing(true);
            try {
                clearAllCache();
                // Small delay to show the action
                await new Promise(resolve => setTimeout(resolve, 500));
            } finally {
                setIsClearing(false);
            }
        }
    };

    const handleClearExpired = async () => {
        setIsClearing(true);
        try {
            clearExpiredCache();
            // Small delay to show the action
            await new Promise(resolve => setTimeout(resolve, 500));
        } finally {
            setIsClearing(false);
        }
    };

    const handleClearCurrent = () => {
        if (confirm('Are you sure you want to clear the cache for the current page?')) {
            clearCurrentPageCache();
        }
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatTimestamp = (timestamp: number | null): string => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="cache-modal">
            <div className="cache-modal__container">
                <div className="cache-modal__header">
                    <h2 className="cache-modal__title">Page Cache Manager</h2>
                    <button onClick={onClose} className="cache-modal__close" aria-label="Close">
                        ×
                    </button>
                </div>

                <div className="cache-modal__stats">
                    <div className="cache-stat-card cache-stat-card--blue">
                        <div className="cache-stat-card__value">{cacheInfo.totalPages}</div>
                        <div className="cache-stat-card__label">Cached Pages</div>
                    </div>
                    <div className="cache-stat-card cache-stat-card--green">
                        <div className="cache-stat-card__value">{formatBytes(cacheInfo.totalSize)}</div>
                        <div className="cache-stat-card__label">Total Size</div>
                    </div>
                    <div className="cache-stat-card cache-stat-card--yellow">
                        <div className="cache-stat-card__value">{cacheInfo.oldestEntry ? formatTimestamp(cacheInfo.oldestEntry) : 'N/A'}</div>
                        <div className="cache-stat-card__label">Oldest Entry</div>
                    </div>
                    <div className="cache-stat-card cache-stat-card--purple">
                        <div className="cache-stat-card__value">{cacheInfo.newestEntry ? formatTimestamp(cacheInfo.newestEntry) : 'N/A'}</div>
                        <div className="cache-stat-card__label">Newest Entry</div>
                    </div>
                </div>

                <div className="cache-section">
                    <h3 className="cache-section__title">Current Page</h3>
                    <div className="cache-section__text"><strong>Page ID:</strong> {currentPageId}</div>
                    <Button onClick={handleClearCurrent} outlined size="small" className="cache-section__danger-outline">
                        Clear Current Page Cache
                    </Button>
                </div>

                <div className="cache-actions">
                    <Button onClick={handleClearExpired} disabled={isClearing} outlined className="cache-actions__button">
                        {isClearing ? 'Clearing...' : 'Clear Expired Cache'}
                    </Button>
                    <Button onClick={handleClearAll} disabled={isClearing} severity="danger" className="cache-actions__button">
                        {isClearing ? 'Clearing...' : 'Clear All Cache'}
                    </Button>
                </div>

                <div className="cache-info">
                    <h3 className="cache-info__title">About Page Caching</h3>
                    <div className="cache-info__list">
                        <p>• Page caching automatically saves your work and settings when switching between pages</p>
                        <p>• Cached data expires after 24 hours to prevent storage issues</p>
                        <p>• Website builder pages cache all your sections, canvas settings, and UI preferences</p>
                        <p>• You can manually clear cache for specific pages or all pages at once</p>
                    </div>
                </div>

                <div className="cache-modal__footer">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
};
