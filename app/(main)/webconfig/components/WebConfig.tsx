import React, { useCallback } from 'react';
import WebConfigCard from './WebConfigCard';
import WebConfigEditModal from './WebConfigEditModal';
import SpinningLoader from '../../../../components/sample/Loader/SpinningLoader';
import NoMatchingData from '../../../../components/sample/NoMatching/NoMatchingData';
import { PAYMENT_TYPES, WEBSITE_TECHNOLOGIES, WEBSITE_TYPES } from '../../../../lib/constants';
import { ToastType, WebConfigCardItems } from '../../../../types';
import { SnippetWebsite } from '../../../../types/website';

interface WebConfigCardsProps {
    websites?: SnippetWebsite[];
    isLoading?: boolean;
    handleResetFilters?: () => void;
    showToast?: (severity: ToastType, summary: string, detail?: string) => void;
    modalState?: { isVisible: boolean; type: string };
    setModalState?: React.Dispatch<React.SetStateAction<{ isVisible: boolean; type: string }>>;
    handleEdit?: (item: WebConfigCardItems) => void;
    handleDelete?: (id: string) => void;
    currentItem?: Partial<WebConfigCardItems>;
    setCurrentItem?: React.Dispatch<React.SetStateAction<Partial<WebConfigCardItems>>>;
    isEditing?: boolean;
    handleModalSubmit?: (e: React.FormEvent) => void;
    initialCategory?: string;
}

function WebConfig({
    websites = [],
    isLoading = false,
    handleResetFilters,
    showToast = () => {},
    modalState = { isVisible: false, type: '' },
    setModalState = () => {},
    handleEdit = () => {},
    handleDelete = () => {},
    currentItem = {},
    setCurrentItem = () => {},
    isEditing,
    handleModalSubmit = () => {},
    initialCategory = 'all',
}: WebConfigCardsProps) {
    const generateRandomFields = useCallback(() => {
        const typeValues = WEBSITE_TYPES.map((type) => type.value).filter((v) => v !== 'all');
        const categoryValues = PAYMENT_TYPES.map((cat) => cat.value);
        const techValues = WEBSITE_TECHNOLOGIES.map((tech) => tech.value);
        const randomType = typeValues[Math.floor(Math.random() * typeValues.length)];
        const randomCategory = categoryValues[Math.floor(Math.random() * categoryValues.length)];
        const randomTechnologies = techValues.sort(() => 0.5 - Math.random()).slice(0, 4);

        return {
            title: 'Flutter Cafe Admin & Client Web',
            name: 'Flutter Cafe Admin & Client Web',
            type: randomType,
            category: initialCategory === 'all' ? randomCategory : initialCategory,
            technologies: randomTechnologies,
            url: `https://example.com/product/${Math.random().toString(36).substr(2, 9)}`,
            framework: 'Flutter',
            price: initialCategory === 'free' ? 0 : 49,
            image: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&q=80&w=1000',
            rating: 4.8,
            downloads: 1234,
            description: 'Complete cafe management system with admin dashboard and client portal',
            features: ['Responsive Design', 'Dark Mode', 'Analytics', 'Inventory Management'],
            screenshots: [
                'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000',
            ],
            longDescription: 'A comprehensive cafe management system built with Flutter...',
            techStack: randomTechnologies,
            version: '2.1.0',
            author: 'TemplateHub',
            support: 'support@templatehub.com',
            fileSize: '24MB',
            timeToComplete: '2 hours',
            estimatedTime: '3 hours',
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        };
    }, [initialCategory]);

    const handleFillRandom = () => setCurrentItem(generateRandomFields());

    const validateItemData = (data: Partial<WebConfigCardItems>) => {
        const errors: string[] = [];
        const requiredFields: (keyof WebConfigCardItems)[] = [
            'name',
            'title',
            'url',
            'type',
            'category',
            'image',
            'description',
            'timeToComplete',
            'estimatedTime',
        ];

        requiredFields.forEach((field) => {
            if (!data[field]) errors.push(`${field} is required`);
        });

        const typeValues = WEBSITE_TYPES.map((type) => type.value).filter((v) => v !== 'all');
        if (data.type && !typeValues.includes(data.type)) {
            errors.push('Invalid website type');
        }

        const categoryValues = PAYMENT_TYPES.map((cat) => cat.value);
        if (data.category && !categoryValues.includes(data.category)) {
            errors.push('Invalid category');
        }

        if (data.category === 'free' && data.price !== 0) {
            errors.push('Price must be 0 for free category');
        }

        return { isValid: errors.length === 0, errors };
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const validation = validateItemData(currentItem);
        if (!validation.isValid) {
            showToast('error', 'Validation Error', validation.errors.join(', '));
            return;
        }

        handleModalSubmit(e);
    };

    return (
        <div className="webconfig__wrapper">
            <div className="compact-webconfig-grid">
                {websites.map((item, index) => (
                    <WebConfigCard key={index} item={item} handleEdit={handleEdit} handleDelete={handleDelete} />
                ))}
            </div>

            {isLoading && <SpinningLoader />}

            {!isLoading && websites.length === 0 && (
                <NoMatchingData message="No matching website found" suggestion="Try different keywords or browse all templates" onReset={handleResetFilters} />
            )}

            {modalState.isVisible && modalState.type === 'config-edit-modal' && (
                <WebConfigEditModal
                    isEditing={isEditing}
                    currentItem={currentItem}
                    setCurrentItem={setCurrentItem}
                    handleSubmit={handleFormSubmit}
                    handleFillRandom={handleFillRandom}
                    initialCategory={initialCategory}
                    onClose={() => {
                        setModalState({ isVisible: false, type: '' });
                    }}
                />
            )}
        </div>
    );
}

export default WebConfig;
