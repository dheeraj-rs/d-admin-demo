interface WebConfigCardItems {
    _id?: string;
    id?: string;
    name: string;
    title: string;
    url: string;
    type: string;
    category: string;
    technologies: string[];
    price: number;
    image: string;
    description: string;
    framework: string;
    rating: number;
    downloads: number;
    features: string[];
    screenshots: string[];
    longDescription: string;
    techStack: string[];
    version: string;
    author: string;
    support: string;
    fileSize: string;
    updatedAt: string;
    createdAt: string;
    timeToComplete?: string;
    estimatedTime?: string;
    lastUpdate?: string;
}

interface WebConfigCardProps {
    item: WebConfigListItems;
    handleDelete: (id: string) => void;
    handleEdit: (item: WebConfigListItems) => void;
}

interface WebConfigEditModalProps {
    isEditing?: boolean;
    currentItem: Partial<WebConfigCardItems>;
    setCurrentItem: React.Dispatch<React.SetStateAction<Partial<WebConfigCardItems>>>;
    handleSubmit: (e: React.FormEvent) => void;
    handleFillRandom: () => void;
    initialCategory: string;
    onClose: () => void;
}

export type { WebConfigCardItems, WebConfigCardProps, WebConfigEditModalProps };
