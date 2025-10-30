import { FC } from 'react';
import '../../styles/elements/elements.scss';

interface PaginatorProps {
    first: number;
    rows: number;
    totalRecords: number;
    rowsPerPageOptions: number[];
    onPageChange: (event: { first: number; rows: number }) => void;
    className?: string;
}

export const Paginator: FC<PaginatorProps> = ({
    first,
    rows,
    totalRecords,
    rowsPerPageOptions,
    onPageChange,
    className
}) => {
    const pageCount = Math.ceil(totalRecords / rows);
    const currentPage = Math.floor(first / rows) + 1;
    const startRecord = first + 1;
    const endRecord = Math.min(first + rows, totalRecords);

    const handlePageClick = (page: number) => {
        const first = (page - 1) * rows;
        onPageChange({ first, rows });
    };

    const handleRowsChange = (newRows: number) => {
        onPageChange({ first: 0, rows: newRows });
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            pages.push(
                <button key={1} onClick={() => handlePageClick(1)}>1</button>
            );
            if (startPage > 2) {
                pages.push(<span key="ellipsis1" className="ellipsis">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageClick(i)}
                    className={currentPage === i ? 'active' : ''}
                >
                    {i}
                </button>
            );
        }

        if (endPage < pageCount) {
            if (endPage < pageCount - 1) {
                pages.push(<span key="ellipsis2" className="ellipsis">...</span>);
            }
            pages.push(
                <button key={pageCount} onClick={() => handlePageClick(pageCount)}>
                    {pageCount}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className={`paginator ${className || ''}`}>
            <div className="paginator-left">
                <select 
                    value={rows} 
                    onChange={(e) => handleRowsChange(Number(e.target.value))}
                    className="rows-select"
                >
                    {rowsPerPageOptions.map(option => (
                        <option key={option} value={option}>{option} per page</option>
                    ))}
                </select>
                <span className="record-info">
                    Showing {startRecord}-{endRecord} of {totalRecords} items
                </span>
            </div>

            <div className="paginator-right">
                <button 
                    className="prev-button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageClick(currentPage - 1)}
                >
                    Previous
                </button>
                <div className="page-numbers">
                    {renderPageNumbers()}
                </div>
                <button 
                    className="next-button"
                    disabled={currentPage === pageCount}
                    onClick={() => handlePageClick(currentPage + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}; 