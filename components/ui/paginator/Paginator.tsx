import { FC, useContext } from 'react';
import { LayoutContext } from '../../../layout/context/LayoutContext';
import { PaginatorProps } from '../../../types';

const Paginator: FC<PaginatorProps> = ({ pageData, onPageChange, className }) => {
    const pageCount = Math.ceil(pageData.totalRecords / pageData.rows);
    const currentPage = Math.floor(pageData.first / pageData.rows) + 1;
    const startRecord = pageData.first + 1;
    const endRecord = Math.min(pageData.first + pageData.rows, pageData.totalRecords);
    const MAX_VISIBLE_PAGES = 5;

    const { layoutState, onBottombarStickyToggle } = useContext(LayoutContext);

    const handlePageClick = (page: number) => {
        const first = (page - 1) * pageData.rows;
        onPageChange({ first, rows: pageData.rows });
    };

    const handleRowsChange = (newRows: number) => {
        onPageChange({ first: 0, rows: newRows });
    };

    const renderPageNumbers = () => {
        const pages = [];

        if (pageCount <= MAX_VISIBLE_PAGES) {
            for (let i = 1; i <= pageCount; i++) {
                pages.push(
                    <button key={i} onClick={() => handlePageClick(i)} className={`page-number ${currentPage === i ? 'active' : ''}`}>
                        {i}
                    </button>
                );
            }
        } else {
            let numberedButtons = 3;

            pages.push(
                <button key={1} onClick={() => handlePageClick(1)} className={`page-number ${currentPage === 1 ? 'active' : ''}`}>
                    1
                </button>
            );

            if (currentPage > 3) {
                pages.push(
                    <button key="leftEllipsis" onClick={() => handlePageClick(Math.max(1, currentPage - 5))} className="ellipsis px-2">
                        ...
                    </button>
                );
            }

            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(pageCount - 1, startPage + numberedButtons - 1);

            if (endPage === pageCount - 1) {
                startPage = Math.max(2, endPage - numberedButtons + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                if (i !== 1 && i !== pageCount) {
                    pages.push(
                        <button key={i} onClick={() => handlePageClick(i)} className={`page-number ${currentPage === i ? 'active' : ''}`}>
                            {i}
                        </button>
                    );
                }
            }

            if (currentPage < pageCount - 2) {
                pages.push(
                    <button key="rightEllipsis" onClick={() => handlePageClick(Math.min(pageCount, currentPage + 5))} className="ellipsis px-2">
                        ...
                    </button>
                );
            }

            pages.push(
                <button key={pageCount} onClick={() => handlePageClick(pageCount)} className={`page-number ${currentPage === pageCount ? 'active' : ''}`}>
                    {pageCount}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className={`${className || ''} ${layoutState.bottombarStickyToggle ? 'bottombar__wrapper' : ''}`}>
            <div className="paginator___wrapper">
                <div className="pagination-container">
                    <div className="per-page">
                        <select value={pageData.rows} onChange={(e) => handleRowsChange(Number(e.target.value))} className="rows-select">
                            {pageData.rowsPerPageOptions?.map((option) => (
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
                            Showing {startRecord}-{endRecord} of {pageData.totalRecords} items
                        </div>
                    </div>

                    <div className="pages">
                        <button className="nav-button" disabled={currentPage === 1} onClick={() => handlePageClick(currentPage - 1)}>
                            <i className="pi pi-chevron-left" />
                            <span className="button-text">Previous</span>
                        </button>

                        <div className="page-numbers">{renderPageNumbers()}</div>

                        <button className="nav-button" disabled={currentPage === pageCount} onClick={() => handlePageClick(currentPage + 1)}>
                            <span className="button-text">Next</span>
                            <i className="pi pi-chevron-right" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Paginator;
