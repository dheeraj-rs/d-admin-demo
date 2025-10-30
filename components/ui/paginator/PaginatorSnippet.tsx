import { FC, useContext } from 'react';
import { LayoutContext } from '../../../layout/context/LayoutContext';
interface PaginationData {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    currentItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
}

interface PaginatorProps {
    pageData: PaginationData;
    onPageChange: (data: { page: number; itemsPerPage: number }) => void;
    className?: string;
    rowsPerPageOptions?: number[]; 
}

const PaginatorSnippet: FC<PaginatorProps> = ({ 
    pageData, 
    onPageChange, 
    className, 
    rowsPerPageOptions = [5, 10, 25, 50, 100]
}) => {
    const { currentPage, currentItems, totalPages, totalItems, itemsPerPage } = pageData;
    
    // Use currentItems to calculate the actual range being displayed
    const startRecord = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endRecord = totalItems > 0 ? startRecord + currentItems - 1 : 0;
    
    const MAX_VISIBLE_PAGES = 5;

    const { layoutState, onBottombarStickyToggle } = useContext(LayoutContext);

    const handlePageClick = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange({ page, itemsPerPage });
        }
    };

    const handleRowsChange = (newItemsPerPage: number) => {
        onPageChange({ page: 1, itemsPerPage: newItemsPerPage });
    };

    const renderPageNumbers = () => {
        const pages = [];

        if (totalPages <= MAX_VISIBLE_PAGES) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <button 
                        key={i} 
                        onClick={() => handlePageClick(i)} 
                        className={`page-number ${currentPage === i ? 'active' : ''}`}
                    >
                        {i}
                    </button>
                );
            }
        } else {
            let numberedButtons = 3;
            pages.push(
                <button 
                    key={1} 
                    onClick={() => handlePageClick(1)} 
                    className={`page-number ${currentPage === 1 ? 'active' : ''}`}
                >
                    1
                </button>
            );
            if (currentPage > 3) {
                pages.push(
                    <button 
                        key="leftEllipsis" 
                        onClick={() => handlePageClick(Math.max(1, currentPage - 5))} 
                        className="ellipsis px-2"
                    >
                        ...
                    </button>
                );
            }
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, startPage + numberedButtons - 1);
            if (endPage === totalPages - 1) {
                startPage = Math.max(2, endPage - numberedButtons + 1);
            }
            for (let i = startPage; i <= endPage; i++) {
                if (i !== 1 && i !== totalPages) {
                    pages.push(
                        <button 
                            key={i} 
                            onClick={() => handlePageClick(i)} 
                            className={`page-number ${currentPage === i ? 'active' : ''}`}
                        >
                            {i}
                        </button>
                    );
                }
            }
            if (currentPage < totalPages - 2) {
                pages.push(
                    <button 
                        key="rightEllipsis" 
                        onClick={() => handlePageClick(Math.min(totalPages, currentPage + 5))} 
                        className="ellipsis px-2"
                    >
                        ...
                    </button>
                );
            }
            if (totalPages > 1) {
                pages.push(
                    <button 
                        key={totalPages} 
                        onClick={() => handlePageClick(totalPages)} 
                        className={`page-number ${currentPage === totalPages ? 'active' : ''}`}
                    >
                        {totalPages}
                    </button>
                );
            }
        }
        return pages;
    };

    return (
        <div className={`${className || ''} ${layoutState.bottombarStickyToggle ? 'bottombar__wrapper' : ''}`}>
            <div className="paginator___wrapper">
                <div className="pagination-container">
                    <div className="per-page">
                        <select 
                            value={itemsPerPage} 
                            onChange={(e) => handleRowsChange(Number(e.target.value))} 
                            className="rows-select"
                        >
                            {rowsPerPageOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option} per page
                                </option>
                            ))}
                        </select>
                        <button
                            className="sticky-button"
                            onClick={onBottombarStickyToggle}
                            title={layoutState.bottombarStickyToggle ? 'Unlock paginator' : 'Lock paginator'}
                        >
                            <span className="toggle-icon">
                                {layoutState.bottombarStickyToggle ? <i className="pi pi-lock" /> : <i className="pi pi-lock-open" />}
                            </span>
                        </button>
                        <div className="info">
                            {totalItems > 0 ? (
                                <>Showing {startRecord}-{endRecord} of {totalItems} items</>
                            ) : (
                                <>No items found</>
                            )}
                        </div>
                    </div>

                    <div className="pages">
                        <button 
                            className="nav-button" 
                            disabled={!pageData.hasPrevPage || currentPage === 1} 
                            onClick={() => handlePageClick(currentPage - 1)}
                        >
                            <i className="pi pi-chevron-left" />
                            <span className="button-text">Previous</span>
                        </button>

                        <div className="page-numbers">{renderPageNumbers()}</div>

                        <button 
                            className="nav-button" 
                            disabled={!pageData.hasNextPage || currentPage === totalPages} 
                            onClick={() => handlePageClick(currentPage + 1)}
                        >
                            <span className="button-text">Next</span>
                            <i className="pi pi-chevron-right" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaginatorSnippet;