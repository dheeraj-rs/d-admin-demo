import { ViewDetailsModalProps } from '../../types/website';
import { ChevronLeft, ChevronRight, Download, Eye, Settings, Star, X } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';

function WebsitesListViewDetailsModal({ show, onClose, viewDetails }: ViewDetailsModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [userRating, setUserRating] = useState<{ [key: string]: number }>({});
    const [isVisible, setIsVisible] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle modal visibility with animation
    useEffect(() => {
        if (show) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            // Animation time before fully hiding
            const timer = setTimeout(() => {
                setIsVisible(false);
                document.body.style.overflow = ''; // Restore scrolling
            }, 300);
            return () => {
                clearTimeout(timer);
                document.body.style.overflow = '';
            };
        }
    }, [show]);

    // Reset scroll position when modal opens
    useEffect(() => {
        if (show && modalRef.current) {
            const contentElement = modalRef.current.querySelector('.main-content');
            if (contentElement) {
                contentElement.scrollTop = 0;
            }
        }
    }, [show, viewDetails]);

    const formatDownloads = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    };

    const closeModal = () => {
        onClose();
        // Reset to first image when closing
        setCurrentImageIndex(0);
    };

    const nextImage = () => {
        if (viewDetails && viewDetails.screenshots.length > 1) {
            setCurrentImageIndex((prev) => (prev === viewDetails.screenshots.length - 1 ? 0 : prev + 1));
        }
    };

    const previousImage = () => {
        if (viewDetails && viewDetails.screenshots.length > 1) {
            setCurrentImageIndex((prev) => (prev === 0 ? viewDetails.screenshots.length - 1 : prev - 1));
        }
    };

    const handleRating = (templateId: string | number, rating: number) => {
        setUserRating((prev) => ({
            ...prev,
            [templateId]: rating,
        }));
    };

    if (!viewDetails || !isVisible) return null;

    return (
        <div className="websites__modal" onClick={handleModalClick} ref={modalRef}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="title">{viewDetails.title}</h2>
                    <button onClick={closeModal} className="close-btn" title="Close">
                        <X />
                    </button>
                </div>
                
                <div className="modal-body">
                    <div className="main-content">
                        <div className="carousel-container">
                            <img 
                                src={viewDetails.screenshots[currentImageIndex]} 
                                alt={`Screenshot ${currentImageIndex + 1}`} 
                                loading="lazy" 
                            />
                            
                            {viewDetails.screenshots.length > 1 && (
                                <>
                                    <button className="carousel-btn prev" onClick={previousImage}>
                                        <ChevronLeft />
                                    </button>
                                    <button className="carousel-btn next" onClick={nextImage}>
                                        <ChevronRight />
                                    </button>
                                    <div className="carousel-controls">
                                        {viewDetails.screenshots.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`dot ${currentImageIndex === index ? 'active' : ''}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="details-section">
                            <div className="detail-block">
                                <h3 className="detail-title">Description</h3>
                                <p className="sub-title">{viewDetails.longDescription}</p>
                            </div>
                            
                            {viewDetails.features && viewDetails.features.length > 0 && (
                                <div className="detail-block">
                                    <h3 className="detail-title">Key Features</h3>
                                    <ul className="features-list">
                                        {viewDetails.features.map((feature, index) => (
                                            <li className="sub-title" key={index}>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {viewDetails.techStack && viewDetails.techStack.length > 0 && (
                                <div className="detail-block">
                                    <h3 className="detail-title">Tech Stack</h3>
                                    <div className="tech-stack">
                                        {viewDetails.techStack.map((tech, index) => (
                                            <span key={index} className="tech-item sub-title">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="detail-block">
                                <h3 className="detail-title">Additional Details</h3>
                                <div className="details-list">
                                    <div className="detail-item">
                                        <span className="label">Version</span>
                                        <span className="value">{viewDetails.version}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">File Size</span>
                                        <span className="value">{viewDetails.fileSize}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Support</span>
                                        <span className="value">{viewDetails.support}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Downloads</span>
                                        <span className="value">{formatDownloads(viewDetails.downloads || 0)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Rating</span>
                                        <span className="value">{(viewDetails.rating || 0).toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-sidebar">
                        <div className="sidebar-content">
                            <div className="price-section">
                                <div className="price">
                                    <span className="amount">${viewDetails.price || '0'}</span>
                                    <span className="label">one-time payment</span>
                                </div>
                            </div>

                            <div className="rating-section">
                                <div className="rating-display">
                                    {[...Array(5)].map((_, index) => {
                                        const starValue = index + 1;
                                        const currentRating = userRating[viewDetails.id || ''] || viewDetails.rating || 0;
                                        return (
                                            <Star
                                                key={index}
                                                className={`star-icon ${starValue <= currentRating ? 'filled' : ''}`}
                                                onClick={() => handleRating(viewDetails.id || '', starValue)}
                                            />
                                        );
                                    })}
                                    <span className="rating-value">
                                        {(userRating[viewDetails.id || ''] || viewDetails.rating || 0).toFixed(1)}
                                    </span>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button className="secondary-btn">
                                    <Eye className="icon" />
                                    Preview Website
                                </button>
                                <Link href={`/websites/customize?id=${viewDetails.id}`}>
                                    <button className="secondary-btn">
                                        <Settings className="icon" />
                                        Customize Template
                                    </button>
                                </Link>
                                <button className="primary-btn">
                                    <Download className="icon" />
                                    Download Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WebsitesListViewDetailsModal;