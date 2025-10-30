'use client';

import * as React from 'react';
import { Plus, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { CategoryBar } from './category-bar';
import { DocumentCard } from './document-card';
import { DocumentEditorPage } from './document-editor-page';
import { CreateDocumentDialog } from './create-document-dialog';
import { AddCategoryDialog } from './add-category-dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import './editor-styles.css';

export type Category = {
    id: string;
    name: string;
    icon: string;
    color: string;
    count: number;
    created_at: string;
    updated_at: string;
};

export type Document = {
    id: string;
    title: string;
    content: string;
    category_id: string | null;
    created_at: string;
    updated_at: string;
    last_modified_by: string;
    background_color?: string;
    background_image?: string;
};

export default function DocumentManager() {
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [documents, setDocuments] = React.useState<Document[]>([]);
    const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
    const [selectedDocument, setSelectedDocument] = React.useState<Document | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showAddCategory, setShowAddCategory] = React.useState(false);
    const [showCreateDocument, setShowCreateDocument] = React.useState(false);

    const loadData = React.useCallback(async () => {
        try {
            setLoading(true);
            const [categoriesRes, documentsRes] = await Promise.all([
                fetch('/api/categories').then((res) => res.json()),
                fetch('/api/documents').then((res) => res.json()),
            ]);

            if (categoriesRes.error) throw new Error(categoriesRes.error);
            if (documentsRes.error) throw new Error(documentsRes.error);

            let cats = categoriesRes.data as Category[];
            const docs = documentsRes.data as Document[];

            // Ensure "All Documents" category always exists
            const allDocsCategory = cats.find(cat => cat.name === 'All Documents');
            if (!allDocsCategory) {
                cats = [
                    {
                        id: 'all-documents',
                        name: 'All Documents',
                        icon: 'Mail',
                        color: '#3B82F6',
                        count: docs.length,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    ...cats
                ];
            }

            setCategories(cats);
            setDocuments(docs);

            if (cats.length > 0 && !activeCategory) {
                setActiveCategory(cats[0].id);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [activeCategory]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreateDocument = async (title: string, categoryId: string, backgroundColor?: string, backgroundImage?: string) => {
        try {
            const response = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content: '',
                    category_id: categoryId,
                    background_color: backgroundColor,
                    background_image: backgroundImage,
                }),
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error);

            const newDoc = result.data as Document;
            setDocuments([newDoc, ...documents]);
            setShowCreateDocument(false);
            setSelectedDocument(newDoc);
            toast.success('Document created');
        } catch (error) {
            console.error('Error creating document:', error);
            toast.error('Failed to create document');
        }
    };

    const handleDeleteDocument = async (id: string) => {
        try {
            const response = await fetch(`/api/documents/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error);

            setDocuments(documents.filter((doc) => doc.id !== id));
            toast.success('Document deleted');
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error('Failed to delete document');
        }
    };

    const handleSaveDocument = async (title: string, content: string, categoryId: string, backgroundColor?: string, backgroundImage?: string) => {
        if (!selectedDocument) return;

        try {
            const response = await fetch(`/api/documents/${selectedDocument.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    category_id: categoryId,
                    background_color: backgroundColor,
                    background_image: backgroundImage,
                }),
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error);

            const updatedDoc = result.data as Document;
            setDocuments(
                documents.map((doc) =>
                    doc.id === selectedDocument.id ? updatedDoc : doc
                )
            );

            setSelectedDocument(updatedDoc);
            toast.success('Document saved');
        } catch (error) {
            console.error('Error saving document:', error);
            toast.error('Failed to save document');
        }
    };

    const handleAddCategory = async (name: string, icon: string, color: string) => {
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, icon, color }),
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error);

            setCategories([...categories, result.data as Category]);
            toast.success('Category created');
            setShowAddCategory(false);
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error('Failed to create category');
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        const category = categories.find(cat => cat.id === categoryId);
        if (!category) return;

        if (category.name === 'All Documents') {
            toast.error('Cannot delete "All Documents" category');
            return;
        }

        const confirmed = window.confirm(
            `Delete category "${category.name}"? All documents in this category will be moved to "All Documents".`
        );
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error);

            // Move documents from deleted category to "All Documents"
            const allDocsCategory = categories.find(cat => cat.name === 'All Documents');
            if (allDocsCategory) {
                const docsToMove = documents.filter(doc => doc.category_id === categoryId);
                for (const doc of docsToMove) {
                    await fetch(`/api/documents/${doc.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            category_id: allDocsCategory.id,
                        }),
                    });
                }

                // Update local state
                setDocuments(documents.map(doc =>
                    doc.category_id === categoryId
                        ? { ...doc, category_id: allDocsCategory.id }
                        : doc
                ));
            }

            setCategories(categories.filter(cat => cat.id !== categoryId));

            // Switch to "All Documents" if deleting active category
            if (activeCategory === categoryId) {
                const allDocs = categories.find(cat => cat.name === 'All Documents');
                if (allDocs) setActiveCategory(allDocs.id);
            }

            toast.success('Category deleted');
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
        }
    };

    const filteredDocuments = React.useMemo(() => {
        let filtered = documents;

        // Filter by category
        if (activeCategory) {
            const category = categories.find((cat) => cat.id === activeCategory);
            if (category?.name !== 'All Documents') {
                filtered = filtered.filter((doc) => doc.category_id === activeCategory);
            }
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (doc) =>
                    doc.title.toLowerCase().includes(query) ||
                    doc.content.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [documents, activeCategory, categories, searchQuery]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--surface-ground)' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary-color)' }} />
            </div>
        );
    }

    // Show full-page editor when a document is selected
    if (selectedDocument) {
        return (
            <DocumentEditorPage
                document={selectedDocument}
                categories={categories}
                onBack={() => setSelectedDocument(null)}
                onSave={handleSaveDocument}
            />
        );
    }

    return (
        <div className="h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--surface-ground)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex-1 flex flex-col overflow-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <CategoryBar
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    onAddCategory={() => setShowAddCategory(true)}
                    onDeleteCategory={handleDeleteCategory}
                />

                <div className="flex-1 overflow-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
                            <div className="flex-1 max-w-full sm:max-w-md">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                                    <Input
                                        type="text"
                                        placeholder="Search documents..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)', color: 'var(--text-color)' }}
                                        className="pl-10 placeholder:text-gray-500"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3">
                                <div className="text-sm text-gray-500">
                                    {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}
                                </div>
                                <Button onClick={() => setShowCreateDocument(true)} style={{ backgroundColor: 'var(--primary-color)', color: 'var(--primary-color-text)' }} className="text-sm sm:text-base hover:opacity-90">
                                    <Plus size={16} className="mr-2" />
                                    <span className="hidden sm:inline">Add Document</span>
                                    <span className="sm:hidden">Add</span>
                                </Button>
                            </div>
                        </div>

                        {filteredDocuments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-20 h-20 bg-[#141414] rounded-full flex items-center justify-center mb-4">
                                    <Plus size={32} className="text-gray-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-400 mb-2">
                                    {searchQuery ? 'No documents found' : 'No documents yet'}
                                </h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    {searchQuery ? 'Try adjusting your search' : 'Create your first document to get started'}
                                </p>
                                {!searchQuery && (
                                    <Button onClick={() => setShowCreateDocument(true)} style={{ backgroundColor: 'var(--primary-color)', color: 'var(--primary-color-text)' }} className="hover:opacity-90">
                                        <Plus size={16} className="mr-2" />
                                        Add Document
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                                {filteredDocuments.map((doc) => (
                                    <DocumentCard
                                        key={doc.id}
                                        document={doc}
                                        onClick={() => setSelectedDocument(doc)}
                                        onEdit={() => setSelectedDocument(doc)}
                                        onDelete={() => handleDeleteDocument(doc.id)}
                                        backgroundColor={doc.background_color}
                                        backgroundImage={doc.background_image}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showCreateDocument && (
                <CreateDocumentDialog
                    categories={categories}
                    defaultCategoryId={activeCategory}
                    onClose={() => setShowCreateDocument(false)}
                    onCreate={handleCreateDocument}
                />
            )}

            {showAddCategory && (
                <AddCategoryDialog
                    onClose={() => setShowAddCategory(false)}
                    onAdd={handleAddCategory}
                />
            )}
        </div>
    );
}
