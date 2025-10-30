import React from 'react';
import AnimatedLine from '../ui/bg-effects/AnimatedLine';

const getErrorIcon = (errorType?: string): string => {
    switch (errorType) {
        case 'json':
            return 'pi-code';
        case 'network':
            return 'pi-wifi';
        case 'auth':
            return 'pi-lock';
        default:
            return 'pi-exclamation-triangle';
    }
};

function DasboardError({ error }: { error: any }) {
    return (
        <div className="dashboard-error">
            <div className="error-content">
                <div className={`error-icon-wrapper ${error?.type || 'general'}`}>
                    <i className={`pi ${getErrorIcon(error?.type)}`}></i>
                </div>
                <h1 className="error-title">{error?.type === 'json' ? 'Data Format Error' : 'Dashboard Unavailable'}</h1>
                <p className="error-description">{error?.message}</p>
                <div className="error-actions">
                    <button className="retry-button" onClick={() => window.location.reload()}>
                        <i className="pi pi-refresh"></i>
                        Retry Loading
                    </button>
                </div>
                {error?.type === 'json' && (
                    <div className="error-details">
                        <p className="technical-info">Technical Info: SyntaxError - Unexpected end of JSON input</p>
                        <p className="help-text">If this error persists, please contact support</p>
                    </div>
                )}
            </div>
            <AnimatedLine />
        </div>
    );
}

export default DasboardError;
