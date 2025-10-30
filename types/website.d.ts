interface ListingItem {
    id: number;
    title: string;
    type: string;
    price: number;
    rating: number;
    downloads: string;
    image: string;
    isPremium: boolean;
}

interface FilterOption {
    label: string;
    value: string;
}

export interface WebsiteFiltersState {
    page: number;
    limit: number;
    search: string;
    websiteType: string;
    paymentType: string;
}

interface Website {
    id?: string | number;
    title: string;
    category?: string;
    framework: string;
    price?: number;
    image?: string;
    url?: string;
    rating?: number;
    downloads?: number;
    description: string;
    features?: string[];
    screenshots: string[];
    longDescription: string;
    techStack: string[];
    lastUpdate: string;
    version: string;
    author: string;
    support: string;
    fileSize: string;

}

interface WebsiteGridProps {
    websiteData: Website[];
    onSelect: (website: any) => void;
}

export interface WebsiteFiltersProps {
    filters: WebsiteFiltersState;
    onFilterChange: (newFilters: WebsiteFiltersState) => void;
    handleSubmit?: () => void;
    headerTitle?: string;
    typeOptions?: { label: string; value: string }[];
    technologiesOptions?: { label: string; value: string }[];
}

interface ModalState {
    isVisible: boolean;
    type: string;
    website?: Website;
}

interface ViewDetailsModalProps {
    show: boolean;
    onClose: () => void;
    viewDetails?: Website;
    onSelect?: (state: WebsiteSelectionState) => void;

}


interface WebsiteSelectionState {
    isVisible: boolean;
    type: 'view-details';
    website: Website;
}

interface WebsitesListProps {
    websites: Website;
    onSelect: (state: WebsiteSelectionState) => void;
    isLoading?: boolean;
}

interface WebsiteCardProps {
    template: Website;
    onSelect: (state: WebsiteSelectionState) => void;
}

export {
    ListingItem,
    FilterOption,
    WebsiteFiltersState,
    Website,
    ModalState,
    WebsiteGridProps,
    WebsiteFiltersProps,
    ViewDetailsModalProps,
    WebsitesListProps,
    WebsiteSelectionState,
    WebsiteCardProps,
};


// types/website.ts

export interface WebsiteSelectionState {
    id?: string;
    name: string;
    title: string;
    url: string;
    category: string;
    type: string;
    technologies: string[];
    description?: string;
    image?: string;
    createdAt?: string;
    updatedAt?: string;
    isActive?: boolean;
    isPremium?: boolean;
    isExclusive?: boolean;
    isNew?: boolean;
    isPopular?: boolean;
    isFree?: boolean;
    isFeatured?: boolean;
    isRecommended?: boolean;
    isLatest?: boolean;
    isTrending?: boolean;
    rating?: number;
    votes?: number;
    views?: number;
    downloads?: number;
    price?: number;
    discount?: number;
  }
  
  export interface WebConfigCardItems extends WebsiteSelectionState {}
  
  export interface FilterOption {
    label: string;
    value: string;
  }
  
  export interface WebsiteFiltersProps {
    filters: WebsiteFiltersState;
    onFilterChange: (newFilters: WebsiteFiltersState) => void;
    handleSubmit: () => void;
    typeOptions: FilterOption[];
    technologiesOptions: FilterOption[];
  }

export interface SnippetWebsite {
    _id: string;
    name: string;
    websiteType: string;
    paymentType: string;
    paymentAmount: number;
    publishedUrl: string;
    author: string;
    version: string;
    support: string;
    thumbnail: string;
    screenshots: string[];
    features: string[];
    technologies: string[];
    description: string;
    longDescription: string;
    viewsCount?: number;
    likesCount?: number;
    rating?: number;
    downloadCount?: number;
    snippet: Array<{
        id: string;
        name: string;
        type: string;
        snippet: string;
        language: string;
        version: string;
        props: any;
    }>;
}

const clearedFilters = {
    search: '',
    websiteType: '',
    paymentType: '',
    page: 1,
    limit: 10,
    category: { label: 'All', value: 'all' },
    type: { label: 'All', value: 'all' },
    tech: { label: 'All', value: 'all' }
};
