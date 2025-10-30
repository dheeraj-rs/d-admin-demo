'use client';
import { useCallback, useRef } from 'react';
import { ToastRef, ESaveFormData } from '../../types';

interface SaveManagerProps {
  toastRef: React.RefObject<ToastRef | null>;
  setShowSaveModal: (show: boolean) => void;
  codeContent: Record<string, string>;
  setIsSaving: (saving: boolean) => void;
  element: any;
  id?: string;
  saveElementMutation: any;
  updateElementMutation: any;
  snippets: Array<{
    id: string;
    language: string;
    name: string;
    version: string;
    code: string;
  }>;
  queryClient: any;
}

const SaveManager = ({
  toastRef,
  setShowSaveModal,
  codeContent,
  setIsSaving,
  element,
  id,
  saveElementMutation,
  updateElementMutation,
  snippets,
  queryClient
}: SaveManagerProps) => {
  const isNavigating = useRef(false);
  
  const handleSave = useCallback(() => {
    const hasCode = Object.values(codeContent).some((code) => code.trim() !== '');
    if (!hasCode) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Please add some code before saving',
        life: 3000,
      });
      return;
    }
    setShowSaveModal(true);
  }, [codeContent, toastRef, setShowSaveModal]);

  const validateFormData = useCallback((formData: ESaveFormData): string | null => {
    if (!formData.title || formData.title.trim() === '') {
      return 'Title is required';
    }
    if (!formData.description || formData.description.trim() === '') {
      return 'Description is required';
    }
    if (!formData.componentType || formData.componentType.trim() === '') {
      return 'Component type is required';
    }
    if (!formData.complexity || formData.complexity.trim() === '') {
      return 'Complexity is required';
    }
    return null;
  }, []);

  const handleSaveSuccess = useCallback((data: any) => {
    toastRef.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Code element saved successfully!',
      life: 3000,
    });
    
    setShowSaveModal(false);
    queryClient.invalidateQueries({ queryKey: ['code-elements'] });
    return data;
  }, [queryClient, toastRef, setShowSaveModal]);

  const handleSaveError = useCallback((error: Error) => {
    console.error('Error saving code element:', error);
    toastRef.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Unknown error',
      life: 5000,
    });
  }, [toastRef]);

  const handleUpdateSuccess = useCallback((data: any) => {
    toastRef.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Code element updated successfully!',
      life: 3000,
    });
    setShowSaveModal(false);
    
    if (!isNavigating.current) {
      isNavigating.current = true;
      setTimeout(() => {
        window.history.go(-1);
      }, 1000);
    }
    return data;
  }, [toastRef, setShowSaveModal, isNavigating]);

  const handleConfirmSave = useCallback(async (formData: ESaveFormData) => {
    setIsSaving(true);
    try {
      const validationError = validateFormData(formData);
      if (validationError) {
        toastRef.current?.show({ severity: 'error', summary: 'Error', detail: validationError, life: 3000 });
        setIsSaving(false);
        return false;
      }

      const snippetsData = snippets.map((snippet) => ({
        language: snippet.language,
        version: snippet.version || '1.0.0',
        code: codeContent[snippet.id] || snippet.code,
      }));

      const filteredSnippets = snippetsData.filter((snippet) => snippet.code && snippet.code.trim() !== '');
      if (filteredSnippets.length === 0) {
        toastRef.current?.show({ severity: 'error', summary: 'Error', detail: 'No code content to save', life: 3000 });
        setIsSaving(false);
        return false;
      }

      const elementData = {
        elementId: id && element ? element.elementId : `${formData.componentType}-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        author: 'User',
        componentType: formData.componentType,
        complexity: formData.complexity,
        hashtags: formData.hashtags,
        snippets: filteredSnippets,
      };

      if (id) {
        // Update existing element
        await updateElementMutation.mutateAsync(
          { id, elementData },
          {
            onSuccess: handleUpdateSuccess,
            onError: handleSaveError,
          }
        );
      } else {
        // Create new element
        await saveElementMutation.mutateAsync(
          elementData,
          {
            onSuccess: handleSaveSuccess,
            onError: handleSaveError,
          }
        );
      }

      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [
    validateFormData, 
    snippets, 
    codeContent, 
    id, 
    element, 
    updateElementMutation, 
    saveElementMutation, 
    handleUpdateSuccess, 
    handleSaveSuccess, 
    handleSaveError, 
    toastRef, 
    setIsSaving
  ]);

  return {
    handleSave,
    handleConfirmSave,
    validateFormData
  };
};

export default SaveManager; 