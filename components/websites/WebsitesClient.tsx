'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import WebsiteListHeader from './WebsitesListHeader';
import WebsiteList from './WebsitesList';
import { ModalState, WebsiteFiltersState } from '../../types/website';
import SpinningLoader from '../sample/Loader/SpinningLoader';
import ViewDetailsModal from './WebsitesListViewDetailsModal';
import { webService } from '../../service/WebService';
import NoMatchingData from '../sample/NoMatching/NoMatchingData';
import '../../styles/pages/websites/index.scss';
import '../../styles/layout/layout.scss';
import Paginator from '../ui/paginator/Paginator';

interface WebsitesClientProps {
    initialData?: any;
}

const INITIAL_FILTERS: WebsiteFiltersState = {
    page: 1,
    limit: 20,
    search: '',
    websiteType: '',
    paymentType: '',
};

export default function WebsitesClient({ initialData }: WebsitesClientProps) {
    const [filters, setFilters] = useState<WebsiteFiltersState>(INITIAL_FILTERS);
    const [isModalOpen, setIsModalOpen] = useState<ModalState>({ isVisible: false, type: '' });
    const [pagination, setPagination] = useState({
        first: 0,
        rows: 20,
        page: 1,
        totalRecords: 0,
        rowsPerPageOptions: [20, 30, 40, 50],
    });

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['websites', pagination.page, pagination.rows, filters.search, filters.websiteType, filters.paymentType],
        queryFn: () =>
            webService.getPaginatedWebsites(pagination.page, pagination.rows, {
                search: filters.search,
                type: filters.websiteType,
                technologies: filters.paymentType,
            }),
        staleTime: 5 * 60 * 1000,
        initialData: initialData,
    });

    useEffect(() => {
        if (data?.pagination) {
            setPagination((prev) => ({
                ...prev,
                totalRecords: data?.pagination?.total || 0,
            }));
        }
    }, [data]);

    const onPageChange = (event: { first: number; rows: number }) => {
        const newPage = Math.floor(event.first / event.rows) + 1;
        setPagination((prev) => ({
            ...prev,
            first: event.first,
            rows: event.rows,
            page: newPage,
        }));
    };

    const resetFilters = () => {
        setFilters(INITIAL_FILTERS);
        setPagination((prev) => ({
            ...prev,
            page: 1,
            first: 0,
        }));
    };

    const handleFilterChange = (newFilters: WebsiteFiltersState) => {
        setPagination((prev) => ({ ...prev, page: 1, first: 0 }));
        setFilters(newFilters);
    };

    const paginatorData = {
        first: (pagination.page - 1) * pagination.rows,
        rows: pagination.rows,
        totalRecords: pagination.totalRecords,
        rowsPerPageOptions: pagination.rowsPerPageOptions,
    };

    const typeFilterOptions: { label: string; value: string }[] = [];
    const techFilterOptions: { label: string; value: string }[] = [];
    const items = data?.items || [];

    return (
        <div className="children__wrapper">
            <div className="websites__wrapper">
                <WebsiteListHeader
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    typeOptions={typeFilterOptions}
                    technologiesOptions={techFilterOptions}
                />
                {isLoading ? (
                    <SpinningLoader />
                ) : items.length > 0 ? (
                    <WebsiteList
                        websites={items}
                        onSelect={(state) => setIsModalOpen({ isVisible: state.isVisible, type: state.type, website: state.website })}
                    />
                ) : (
                    <NoMatchingData />
                )}

                {isModalOpen.isVisible && isModalOpen.type === 'view-details' && isModalOpen.website && (
                    <ViewDetailsModal
                        show={isModalOpen.isVisible}
                        onClose={() => setIsModalOpen({ isVisible: false, type: '' })}
                        viewDetails={isModalOpen.website}
                    />
                )}

                {!isLoading && items.length > 0 && data?.pagination && <Paginator pageData={paginatorData} onPageChange={onPageChange} />}
            </div>
        </div>
    );
}
