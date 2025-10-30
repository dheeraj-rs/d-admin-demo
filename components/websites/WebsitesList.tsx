import React, { useMemo } from 'react';
import { Star, Download, Eye, Link2, Settings } from 'lucide-react';
import Link from 'next/link';
import { ModalState } from '../../types/website';
import { WebConfigCardItems } from '../../types';

interface WebsiteListProps {
    websites: WebConfigCardItems[];
    onSelect: (modalState: ModalState) => void;
}

// Update WebsiteCardProps to use WebConfigCardItems
interface UpdatedWebsiteCardProps {
    template: WebConfigCardItems;
    onSelect: (modalState: ModalState) => void;
}

const formatDownloads = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

// Update the component to use the new props interface
const WebsiteCard: React.FC<UpdatedWebsiteCardProps> = ({ template, onSelect }) => {
    const features = useMemo(() => template.features?.slice(0, 4) || [], [template.features]);

    return (
        <>
            <div className="image-container">
                <img src={template.image || '/placeholder-image.jpg'} alt={template.title || 'Website template'} loading="lazy" />
                <div className="overlay">
                    <div className="content">
                        <div className="description-container">
                            <p className="description">{template.description || 'No description available'}</p>
                            <div className="features-grid">
                                {features.map((feature: string, index: number) => (
                                    <div key={`${template.id}-feature-${index}`} className="feature">
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() =>
                                onSelect({
                                    isVisible: true,
                                    type: 'view-details',
                                    website: { ...template, lastUpdate: template.lastUpdate || new Date().toISOString() },
                                })
                            }
                            className="view-details-btn"
                        >
                            <span className="btn-content">
                                <Eye className="icon" />
                                View Details
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="content">
                <h3 className="title">{template.title}</h3>
                <div className="meta">
                    <span className="type">{template.category || 'Unknown'}</span>
                    <span className="price">{typeof template.price === 'number' ? `$${template.price}` : '$0'}</span>
                </div>
                <div className="stats">
                    <div className="rating">
                        <Star size={16} className="rating-star" />
                        <span>{(template.rating || 0).toFixed(1)}</span>
                        <Download size={16} className="download-icon" />
                        <span>{formatDownloads(template.downloads || 0)}</span>
                    </div>
                    <div className="actions">
                        <Link href={template.url || '#'} className="preview-btn">
                            <Link2 size={16} />
                        </Link>
                        <button className="download-btn">
                            <Download size={16} />
                        </button>
                        {template.category === 'premium' && (
                            <Link href="/webconfig/jsonweb" className="customize-btn">
                                <Settings size={16} />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const WebsitesList: React.FC<WebsiteListProps> = ({ websites = [], onSelect = () => {} }) => {
    const validWebsites = useMemo(() => (Array.isArray(websites) ? websites : []), [websites]);

    return (
        <div>
            <div className="websites__container">
                <div className="websites-grid">
                    {validWebsites.map((template: WebConfigCardItems, index: number) => (
                        <div key={template.id || `website-${index}`} className="web-card">
                            <WebsiteCard template={template} onSelect={onSelect} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WebsitesList;
