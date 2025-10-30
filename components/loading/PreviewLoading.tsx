// LoadingSpinner.jsx
import React from 'react';
import './PreviewLoading.scss';

const PreviewLoading = () => {
    return (
        <div className="spinner-container">
            <div className="spinner-wrapper">
                <div className="spinner-circle"></div>
                <div className="spinner-overlay"></div>
            </div>
        </div>
    );
};

export default PreviewLoading;
