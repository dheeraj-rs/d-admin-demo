'use client';

import { ElementCodeEditorHeaderProps } from '../../types';

const ElementCodeEditorHeader = ({
    formatCode = () => {},
    copyToClipboard = () => {},
    copied = false,
    refreshPreview = () => {},
    onApply = () => {},
    isLoading = false,
    reloadData = () => {},
    componentName,
    resetCode = () => {},
}: ElementCodeEditorHeaderProps) => {
    return (
        <header>
            <div className="element-code-editor-header__wrapper">
                <div className="header-container">
                    <div className="header-items">
                        <div className="layout-actions">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.history.go(-1);
                                }}
                                title="Go back"
                            >
                                <i className="pi pi-chevron-left" />
                            </button>
                            <div className="component-title">
                                <span className="button-text">{componentName !== 'Add Element' ? 'Edit Element' : componentName}</span>
                            </div>
                        </div>
                        <div className="page-actions">
                            <button className="filters-reset" onClick={reloadData} title="Reload data from database">
                                <i className="pi pi-sync" />
                                <span className="button-text">Reload</span>
                            </button>
                            <button className="filters-reset" onClick={refreshPreview} title="Reset code to original">
                                <i className="pi pi-refresh" />
                                <span className="button-text">Preview</span>
                            </button>
                            {componentName !== 'Add Element' && (
                                <button className="filters-reset" onClick={resetCode} title="Reset code to original">
                                    <i className="pi pi-refresh" />
                                    <span className="button-text">Code</span>
                                </button>
                            )}
                            <button className="add-button" onClick={formatCode} title="Format code">
                                <i className="button-icon pi pi-align-left" />
                                <span className="button-text">Format</span>
                            </button>
                            <button className="add-button" onClick={onApply} title="Format code">
                                <i className="button-icon pi pi-save" />
                                <span className="button-text">{isLoading ? 'Saving...' : 'Save'}</span>
                            </button>
                            <button onClick={copyToClipboard} className="copy-button" title="Copy code to clipboard">
                                <i className="button-icon pi pi-copy" />
                                <span className="button-text">{copied ? 'Copied!' : 'Copy'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ElementCodeEditorHeader;
