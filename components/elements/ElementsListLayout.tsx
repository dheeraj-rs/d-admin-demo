'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback, useRef } from 'react';
import HtmlPreview from '../code-preview/HtmlPreview';
import ElementsListHeader, { FilterState } from './ElementsListHeader';
import Paginator from '../ui/paginator/Paginator';
import NoMatchingData from '../sample/NoMatching/NoMatchingData';
import SpinningLoader from '../sample/Loader/SpinningLoader';
import { ToastRef, ElementCodeEditorData } from '../../types';
import Toast from '../sample/Toast/Toast';
import { useGetAllElements, useDeleteElement } from '../../service/elementApi';

// Define strong types for all data structures
interface CodeSnippet {
    id?: string;
    language: string;
    version: string;
    code: string;
}

interface CodeElement {
    elementId: string;
    title: string;
    description: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    views: number;
    likes: number;
    snippets: CodeSnippet[];
    hashtags: string[];
    componentType: string;
    complexity: string;
}

interface PaginationState {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    rowsPerPageOptions: number[];
}

interface PaginatorEvent {
    first: number;
    rows: number;
}

interface ElementsListLayoutProps {
    componentType: string;
    noDataMessage?: string;
    noDataSuggestion?: string;
    layout?: string;
}

// Predefined constants
const DEFAULT_LIMIT = 20;
const ROWS_PER_PAGE_OPTIONS = [3, 20, 30, 50];
const COMPLEXITY_OPTIONS = [
    { label: 'All', value: '' },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
];

const ElementsListLayout: React.FC<ElementsListLayoutProps> = ({
    componentType,
    noDataMessage = 'No matching elements found',
    noDataSuggestion = 'Try different keywords or browse all templates',
    layout = 'list',
}) => {
    const [mounted, setMounted] = useState<boolean>(false);
    const [contentVisible, setContentVisible] = useState<boolean>(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [elementToDelete, setElementToDelete] = useState<ElementCodeEditorData | null>(null);
    const toastRef = useRef<ToastRef>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Pagination state with defaults
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        limit: DEFAULT_LIMIT,
        totalRecords: 0,
        totalPages: 0,
        rowsPerPageOptions: ROWS_PER_PAGE_OPTIONS,
    });

    // Filter state - removed componentType as it's fixed for this page
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        complexity: '',
        hashtags: '',
    });

    // Use the hook for fetching elements
    const { data, isLoading, isError, error, refetch } = useGetAllElements(pagination.page, pagination.limit, {
        componentType,
        search: filters.search,
        complexity: filters.complexity,
        hashtags: filters.hashtags,
    });

    // Set mounted state on component mount and add history state detection
    useEffect(() => {
        setMounted(true);

        // Function to handle page visibility changes
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                setContentVisible(false);
                refetch();
            }
        };

        // Function to handle popstate (when navigating with history)
        const handlePopState = () => {
            setContentVisible(false);
            refetch();
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('popstate', handlePopState);

        // Initial load - force a refresh when component mounts
        const initialLoadTimer = setTimeout(() => {
            refetch();
        }, 100);

        // Clean up
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('popstate', handlePopState);
            clearTimeout(initialLoadTimer);
        };
    }, [refetch]);

    // Add focus event listener to refetch data when page regains focus
    useEffect(() => {
        const handleFocus = () => {
            // Refetch data when the window regains focus
            setContentVisible(false);
            refetch();
        };

        // Add event listener for focus events
        window.addEventListener('focus', handleFocus);

        // Clean up the event listener on unmount
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [refetch]);

    // Update pagination when data changes
    useEffect(() => {
        if (data) {
            setPagination((prev) => ({
                ...prev,
                totalRecords: data.pagination.total,
                totalPages: data.pagination.pages,
            }));

            // Set content visible when data is loaded
            setContentVisible(true);
        }
    }, [data]);

    // Use the delete element hook
    const deleteElementMutation = useDeleteElement();

    // Handler for filter changes
    const handleFilterChange = (newFilters: FilterState): void => {
        // Remove componentType from incoming filters if it exists
        const { componentType: _, ...otherFilters } = newFilters;

        // Update the filters state immediately to show typing in the input
        setFilters(otherFilters);

        // Clear any existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set a new timer for the actual search API call
        debounceTimerRef.current = setTimeout(() => {
            setPagination((prev) => ({ ...prev, page: 1 }));
            setContentVisible(false);
            refetch();
        }, 500); // 500ms debounce delay
    };

    // Clean up the timer on component unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // Handler for pagination changes
    const handlePaginationChange = (event: PaginatorEvent): void => {
        const newPage = Math.floor(event.first / event.rows) + 1;

        setPagination((prev) => ({
            ...prev,
            page: newPage,
            limit: event.rows,
        }));

        setContentVisible(false);
    };

    // Add reload handler
    const handleReload = useCallback(() => {
        // Set loading state
        setContentVisible(false);

        // Use React Query's refetch function
        refetch()
            .then(() => {})
            .catch((err) => {});
    }, [refetch]);

    const handleResetFilter = () => {
        setFilters({
            search: '',
            complexity: '',
            hashtags: '',
        });
    };

    // Handle showing delete confirmation
    const handleDeleteClick = (element: ElementCodeEditorData, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setElementToDelete(element);
        setShowDeleteConfirm(true);
    };

    // Handle canceling delete
    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        setElementToDelete(null);
    };

    // Handle confirming delete
    const handleConfirmDelete = async () => {
        if (!elementToDelete) return;

        try {
            setIsDeleting(true);

            // Use the mutation hook
            await deleteElementMutation.mutateAsync(elementToDelete.elementId);

            // Show success message
            toastRef.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Element deleted successfully',
                life: 3000,
            });

            // Close the modal and reset states
            setShowDeleteConfirm(false);
            setElementToDelete(null);
        } catch (err) {
            console.error('Error deleting element:', err);
            toastRef.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: `Failed to delete: ${err instanceof Error ? err.message : 'Unknown error'}`,
                life: 5000,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Early return for non-mounted state
    if (!mounted) {
        return <SpinningLoader />;
    }

    // Handle error state
    if (isError) {
        return (
            <div className="children__fixed-h-wrapper">
                <div className="error-container">
                    <h3>Error loading content</h3>
                    <p>{error?.message || 'An unexpected error occurred'}</p>
                    <button className="retry-button" onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Process data safely
    const elements = data?.data || [];
    const showElements = contentVisible && elements.length > 0;

    // Format data for paginator
    const paginatorData = {
        first: (pagination.page - 1) * pagination.limit,
        rows: pagination.limit,
        totalRecords: pagination.totalRecords,
        rowsPerPageOptions: pagination.rowsPerPageOptions,
    };

    return (
        <div className="children__fixed-h-wrapper">
            <Toast ref={toastRef} />
            <ElementsListHeader
                filters={{
                    ...filters,
                }}
                onFilterChange={handleFilterChange}
                complexityOptions={COMPLEXITY_OPTIONS}
                onReload={handleReload}
            />

            <div className={`elements-list__wrapper ${showElements ? 'element-visible' : ''} ${layout === 'list' ? 'list' : 'grid'}`}>
                {elements.length > 0 &&
                    elements.map((item) => (
                        <div key={item.elementId} className="element-card">
                            <div className="element-preview">
                                <HtmlPreview
                                    snippets={item.snippets.map((s, i) => ({
                                        ...s,
                                        id: `${s.language}-${i}`,
                                    }))}
                                />
                                <div className="element-card-actions">
                                    <button className="element-delete-btn" onClick={(e) => handleDeleteClick(item, e)} title="Delete this element">
                                        <i className="pi pi-trash code-icon" />
                                    </button>
                                    <Link href={`/elements/${item.elementId}`} className="preview-link">
                                        <div className="get-code-overlay">
                                            <i className="pi pi-code" />
                                            <span className="get-code-text">Get Code</span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            {isLoading && <SpinningLoader />}

            {elements.length === 0 && !isLoading && <NoMatchingData message={noDataMessage} suggestion={noDataSuggestion} onReset={handleResetFilter} />}

            {elements.length > 0 && <Paginator pageData={paginatorData} onPageChange={handlePaginationChange} />}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && elementToDelete && (
                <div className="elements-list-delete-modal__wrapper">
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Confirm Delete</h2>
                            <button className="modal-close" onClick={handleCancelDelete} disabled={isDeleting}>
                                <i className="pi pi-times"></i>
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="warning-icon">
                                <i className="pi pi-exclamation-triangle"></i>
                            </div>
                            <p className="confirmation-text">
                                Are you sure you want to delete <strong>{elementToDelete.title}</strong>?
                            </p>
                            <p className="warning-text">This action cannot be undone and will permanently remove this code element.</p>

                            <div className="modal-actions">
                                <button className="cancel-button" onClick={handleCancelDelete} disabled={isDeleting}>
                                    Cancel
                                </button>
                                <button className="delete-button" onClick={handleConfirmDelete} disabled={isDeleting}>
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ElementsListLayout;
