'use client';
import dynamic from 'next/dynamic';
const Maintenance = dynamic(() => import('../../../../components/error-pages/maintenance'), {
    ssr: false,
});
export default function MaintenancePage() {
    return <Maintenance />;
}

// 'use client';
// import React, { useRef, useState, useEffect } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import WebConfigHeader from '../components/WebConfigHeader';
// import WebConfigCards from '../components/WebConfig';
// import Paginator from '../../../../components/ui/paginator/Paginator';
// import Toast from '../../../../components/sample/Toast/Toast';
// import { WebsiteFiltersState } from '../../../../types/website';
// import { ToastRef, ToastType, WebConfigCardItems } from '../../../../types';
// import '../../../../styles/pages/webconfig/index.scss';
// import { webService } from '../../../../service/WebService';

// const WebConfigPaid = () => {
//     const [currentWebsite, setCurrentWebsite] = useState<Partial<WebConfigCardItems>>({});
//     const [isEditing, setIsEditing] = useState(false);
//     const [editingId, setEditingId] = useState<string | null>(null);
//     const [modalState, setModalState] = useState({ isVisible: false, type: '' });
//     const queryClient = useQueryClient();
//     const toastRef = useRef<ToastRef>(null);
    
//     // Pagination state
//     const [pagination, setPagination] = useState({
//         page: 1,
//         limit: 20,
//         totalRecords: 0,
//         totalPages: 0,
//         rowsPerPageOptions: [10, 20, 30, 50],
//     });
    
//     // Enhanced filters state with type and technologies
//     const [filters, setFilters] = useState<WebsiteFiltersState>({
//         search: '',
//         category: { label: 'All', value: 'all' },
//         type: { label: 'All', value: 'all' },
//         tech: { label: 'All', value: 'all' },
//     });

//     // Define the expected response type
//     interface WebsitesResponse {
//         items: WebConfigCardItems[];
//         pagination?: {
//             total: number;
//             page: number;
//             limit: number;
//             pages: number;
//         };
//     }

//     // Fetch filter options (types and technologies)
//     const { data: filterOptions } = useQuery({
//         queryKey: ['filterOptions'],
//         queryFn: () => webService.getFilterOptions(),
//         staleTime: 10 * 60 * 1000, // Cache for 10 minutes
//     });

//     // Fetch websites with pagination and all filters using getCategoryWebsites
//     const {
//         data: websitesData,
//         isLoading,
//         error,
//     } = useQuery<WebsitesResponse>({
//         queryKey: [
//             'websites', 
//             'paid',
//             pagination.page, 
//             pagination.limit, 
//             filters.search, 
//             filters.type.value,
//             filters.tech.value
//         ],
//         queryFn: () => webService.getCategoryWebsites(
//             'paid',
//             pagination.page, 
//             pagination.limit, 
//             {
//                 type: filters.type.value !== 'all' ? filters.type.value : undefined,
//                 technologies: filters.tech.value !== 'all' ? filters.tech.value : undefined,
//                 search: filters.search || undefined
//             }
//         ),
//         staleTime: 5 * 60 * 1000,
//     });

//     // Update pagination when data changes
//     useEffect(() => {
//         if (websitesData?.pagination) {
//             setPagination(prev => ({
//                 ...prev,
//                 totalRecords: websitesData.pagination?.total || 0,
//                 totalPages: websitesData.pagination?.pages || 0
//             }));
//         }
//     }, [websitesData]);

//     const displayNotification = (severity: ToastType, summary: string, detail?: string) => {
//         toastRef.current?.show({ severity, summary, detail, life: 3000 });
//     };

//     const createWebsiteMutation = useMutation({
//         mutationFn: webService.createWebsite,
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['websites'] });
//             displayNotification('success', 'Success', 'Website added successfully');
//             resetWebsiteForm();
//             setModalState({ isVisible: false, type: '' });
//         },
//         onError: (error: Error) => {
//             displayNotification('error', 'Error', error.message || 'Failed to add website');
//         },
//     });

//     const updateWebsiteMutation = useMutation({
//         mutationFn: (data: { id: string; website: Partial<WebConfigCardItems> }) => webService.updateWebsite(data.id, data.website),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['websites'] });
//             displayNotification('success', 'Success', 'Website updated successfully');
//             resetWebsiteForm();
//             setModalState({ isVisible: false, type: '' });
//         },
//         onError: (error: Error) => {
//             displayNotification('error', 'Error', error.message || 'Failed to update website');
//         },
//     });

//     const deleteWebsiteMutation = useMutation({
//         mutationFn: webService.deleteWebsite,
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['websites'] });
//             displayNotification('success', 'Success', 'Website deleted successfully');
//         },
//         onError: (error: Error) => {
//             displayNotification('error', 'Error', error.message || 'Failed to delete website');
//         },
//     });

//     const resetWebsiteForm = () => {
//         setCurrentWebsite({});
//         setIsEditing(false);
//         setEditingId(null);
//     };

//     const openAddWebsiteModal = () => {
//         resetWebsiteForm();
//         // Set default category to 'free' for new items
//         setCurrentWebsite({ category: 'paid' });
//         setModalState({ isVisible: true, type: 'config-edit-modal' });
//     };

//     const openEditWebsiteModal = (item: WebConfigCardItems) => {
//         setCurrentWebsite(item);
//         setIsEditing(true);
//         setEditingId(item.id || null);
//         setModalState({ isVisible: true, type: 'config-edit-modal' });
//     };

//     const handleWebsiteDelete = (id: string) => {
//         deleteWebsiteMutation.mutate(id);
//     };

//     const handleResetFilter = () => {
//         // Keep "free" as the default category when resetting filters
//         setFilters({
//             search: '',
//             category: { label: 'All', value: 'all' },
//             type: { label: 'All', value: 'all' },
//             tech: { label: 'All', value: 'all' },
//         });
//     };

//     const handlePaginationChange = (event: { first: number; rows: number }) => {
//         // Convert from first/rows to page/limit format
//         const newPage = Math.floor(event.first / event.rows) + 1;
        
//         setPagination(prev => ({
//             ...prev,
//             page: newPage,
//             limit: event.rows
//         }));
//     };

//     const handleWebsiteSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
        
//         // Ensure the category is set to 'free'
//         const websiteData = {
//             ...currentWebsite,
//             category: 'paid'
//         };
        
//         if (isEditing && editingId) {
//             updateWebsiteMutation.mutate({ id: editingId, website: websiteData });
//         } else {
//             createWebsiteMutation.mutate(websiteData as WebConfigCardItems);
//         }
//     };

//     const handleFilterChange = (newFilters: WebsiteFiltersState) => {
//         // Reset to page 1 when filters change
//         setPagination(prev => ({
//             ...prev,
//             page: 1
//         }));
        
//         setFilters(newFilters);
//     };

//     // Convert pagination for Paginator component
//     const paginatorData = {
//         first: (pagination.page - 1) * pagination.limit,
//         rows: pagination.limit,
//         totalRecords: pagination.totalRecords,
//         rowsPerPageOptions: pagination.rowsPerPageOptions
//     };

//     // Prepare filter options for the header component
//     const typeOptions = filterOptions?.typeOptions?.map((type: { label: string, value: string }) => ({
//         label: type.label,
//         value: type.value
//     })) || [];
    
//     const techOptions = filterOptions?.techOptions?.map((tech: { label: string, value: string }) => ({
//         label: tech.label,
//         value: tech.value
//     })) || [];

//     // Ensure we have an "All" option at the beginning of each filter list
//     const typeFilterOptions = [{ label: 'All', value: 'all' }, ...typeOptions];
//     const techFilterOptions = [{ label: 'All', value: 'all' }, ...techOptions];

//     // Safely get items with fallback to empty array
//     const items = websitesData?.items || [];

//     return (
//         <div className="children__wrapper">
//             <WebConfigHeader 
//                 filters={filters} 
//                 onFilterChange={handleFilterChange} 
//                 handleSubmit={openAddWebsiteModal}
//                 typeOptions={typeFilterOptions}
//                 technologiesOptions={techFilterOptions}
//             />
//             <WebConfigCards
//                 websites={items}
//                 modalState={modalState}
//                 isEditing={isEditing}
//                 isLoading={isLoading}
//                 currentItem={currentWebsite}
//                 initialCategory="paid"
//                 setModalState={setModalState}
//                 showToast={displayNotification}
//                 handleEdit={openEditWebsiteModal}
//                 handleDelete={handleWebsiteDelete}
//                 setCurrentItem={setCurrentWebsite}
//                 handleModalSubmit={handleWebsiteSubmit}
//                 handleResetFilters={handleResetFilter}
//             />
//             <Toast ref={toastRef} />
//             {!isLoading && items.length > 0 && (
//                 <Paginator 
//                     pageData={paginatorData}
//                     onPageChange={handlePaginationChange} 
//                 />
//             )}
//         </div>
//     );
// };

// export default WebConfigPaid;