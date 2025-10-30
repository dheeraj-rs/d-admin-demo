'use client';
import React, { useRef, useState } from 'react';
import WebConfigHeader from '../components/WebConfigHeader';
import WebConfig from '../components/WebConfig';
import Toast from '../../../../components/sample/Toast/Toast';
import { WebsiteFiltersState } from '../../../../types/website';
import { ToastRef, WebConfigCardItems } from '../../../../types';
import '../../../../styles/pages/webconfig/index.scss';
import { useGetWebsites } from '../../../../service/SnippetService';
import PaginatorSnippet from '../../../../components/ui/paginator/PaginatorSnippet';
import HtmlWebsitePreview from '../../../../components/code-preview/HtmlWebsitePreview';
import websiteBuilderStore from '../../../../components/website-builder/store/websiteBuilderStore';

const INITIAL_FILTERS: WebsiteFiltersState = {
    page: 1,
    limit: 20,
    search: '',
    websiteType: '',
    paymentType: '',
};

const SnippetWebsitePage = () => {
    const [filters, setFilters] = useState<WebsiteFiltersState>({
        page: 1,
        limit: 5,
        search: '',
        websiteType: '',
        paymentType: '',
    });

    const { data, isLoading } = useGetWebsites(filters);
    const [currentWebsite, setCurrentWebsite] = useState<Partial<WebConfigCardItems>>({});
    const [modalState, setModalState] = useState({ isVisible: false, type: '' });
    const toastRef = useRef<ToastRef>(null);
    const { isWebsitePreview, setWebsitePreview } = websiteBuilderStore();

    const handleFilterChange = (newFilters: WebsiteFiltersState) => {
        setFilters((prev) => ({
            ...prev,
            search: newFilters.search || '',
            websiteType: newFilters.websiteType || '',
            paymentType: newFilters.paymentType || '',
            page: 1,
        }));
    };

    const handlePagination = (newFilters: { page: number; itemsPerPage: number }) => {
        setFilters((prev) => ({
            ...prev,
            page: newFilters?.page,
            limit: newFilters?.itemsPerPage || 1,
        }));
    };

    function getSnippetArray(viewId: string) {
        const targetObject = data?.data?.find((item) => item._id === viewId);
        return targetObject ? targetObject.snippet : [];
    }

    return (
        <div className="children__wrapper">
            {!isWebsitePreview?.isPreview && <WebConfigHeader filters={filters} onFilterChange={handleFilterChange} />}
            {!isWebsitePreview?.isPreview ? (
                <WebConfig
                    websites={data?.data || []}
                    modalState={modalState}
                    isEditing={isLoading}
                    isLoading={isLoading}
                    currentItem={currentWebsite}
                    initialCategory="free"
                    setModalState={setModalState}
                    setCurrentItem={setCurrentWebsite}
                />
            ) : (
                <div className="webconfig__wrapper">
                    <HtmlWebsitePreview
                        sections={isWebsitePreview?.websiteId ? getSnippetArray(isWebsitePreview.websiteId) : []}
                        onClose={() => setWebsitePreview(false, '')}
                    />
                </div>
            )}

            <Toast ref={toastRef} />
            {!isLoading && data?.pagination && !isWebsitePreview?.isPreview && <PaginatorSnippet pageData={data.pagination} onPageChange={handlePagination} />}
        </div>
    );
};

export default SnippetWebsitePage;
