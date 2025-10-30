import React, { useState } from 'react';
interface ImageProps {
    src: string;
    alt: string;
    width?: string | number;
    height?: string | number;
    preview?: boolean;
    priority?:boolean;
    className?:string;
}

export const Image: React.FC<ImageProps> = ({ src, alt, width, preview, priority, className }) => {
    const [showPreview, setShowPreview] = useState(false);

    return (
        <div className="custom-image">
            <img src={src} alt={alt} style={{ width: width }} className={`custom-image__img ${className}`} onClick={() => preview && setShowPreview(true)} />

            {preview && showPreview && (
                <div className="custom-image__preview" onClick={() => setShowPreview(false)}>
                    <img src={src} alt={alt} />
                </div>
            )}
        </div>
    );
};
