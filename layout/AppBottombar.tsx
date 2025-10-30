import React, { useState, useRef } from 'react';
import { mobileMenuItems } from '../public/demo/data/menuItems';
import { useTranslatedMenuItems } from '../hooks/useTranslatedMenuItems';
import Link from 'next/link';

const AppBottombar = () => {
    const [activeIndex, setActiveIndex] = useState(2);
    const scrollContainerRef = useRef(null);

    // Get translated mobile menu items
    const translatedMobileMenuItems = useTranslatedMenuItems(mobileMenuItems);

    // Vibration function
    const vibrate = () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(30); // Short vibration
        }
    };

    // Handle item click
    const handleItemClick = (index: number) => {
        setActiveIndex(index);
        vibrate();
    };
    return (
        <React.Fragment>
            <div className="layout-bottombar-desktop" />
            <div className="layout-bottombar-mobile">
                <div ref={scrollContainerRef} className="navigation-scroll-container">
                    {translatedMobileMenuItems.map((item, index) => (
                        <Link
                            href={item.to || '/'}
                            key={index}
                            className={`navigation-item ${activeIndex === index ? 'active' : ''}`}
                            onClick={() => handleItemClick(index)}
                        >
                            <div className="icon-wrapper">
                                <i className={item.icon} />
                                <span>{item.label}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="layout-bottombar-mask" />
        </React.Fragment>
    );
};

export default AppBottombar;
