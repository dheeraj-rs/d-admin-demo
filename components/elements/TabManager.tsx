'use client';
import { useRef, useCallback } from 'react';
import { ToastRef } from '../../types';

interface TabManagerProps {
  snippets: Array<{
    id: string;
    language: string;
    name: string;
    version: string;
    code: string;
  }>;
  selectedSnippetId: string;
  setSelectedSnippetId: (id: string) => void;
  setSnippets: React.Dispatch<React.SetStateAction<any[]>>;
  setCodeContent: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  codeContent: Record<string, string>;
  toastRef: React.RefObject<ToastRef | null>;
  setPreviewMode: (mode: string) => void;
  getEditorLanguage: (language: string) => string;
  setShowTabOptionsModal: (show: boolean) => void;
  setActiveTabForOptions: (id: string | null) => void;
  setTabOptionsPosition: (position: { top: number; left: number }) => void;
  setLanguageSelectorPosition: (position: { top: number; left: number }) => void;
  setShowLanguageSelector: (show: boolean) => void;
  editorRef: React.RefObject<any>;
  onImmediateSave: () => void;
}

const TabManager = ({
  snippets,
  selectedSnippetId,
  setSelectedSnippetId,
  setSnippets,
  setCodeContent,
  codeContent,
  toastRef,
  setPreviewMode,
  getEditorLanguage,
  setShowTabOptionsModal,
  setActiveTabForOptions,
  setTabOptionsPosition,
  setLanguageSelectorPosition,
  setShowLanguageSelector,
  editorRef,
  onImmediateSave
}: TabManagerProps) => {

  const handleTabChange = useCallback(
    (id: string) => {
      if (id === selectedSnippetId) return;
      setSelectedSnippetId(id);
      const selectedSnippet = snippets.find((snippet) => snippet.id === id);
      if (selectedSnippet) {
        if (selectedSnippet.language.toLowerCase() === 'react') {
          setPreviewMode('react');
        } else {
          setPreviewMode('html');
        }
        const monaco = (window as any).monaco;
        if (editorRef.current && monaco) {
          setTimeout(() => {
            const model = editorRef.current.getModel();
            if (model) {
              const language = getEditorLanguage(selectedSnippet.language);
              monaco.editor.setModelLanguage(model, language);
            }
          }, 0);
        }
      }
      // Save immediately when switching tabs
      try { onImmediateSave(); } catch { }
    },
    [snippets, selectedSnippetId, getEditorLanguage, setSelectedSnippetId, setPreviewMode, editorRef, onImmediateSave]
  );

  const handleAddLanguage = (event: React.MouseEvent) => {
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const targetRect = target.getBoundingClientRect();
    setLanguageSelectorPosition({
      top: targetRect.bottom,
      left: targetRect.left,
    });
    setShowLanguageSelector(true);
  };

  const handleTabOptions = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const targetRect = target.getBoundingClientRect();
    setActiveTabForOptions(id);
    setTabOptionsPosition({
      top: targetRect.bottom,
      left: targetRect.left,
    });
    setShowTabOptionsModal(true);
  };

  const handleRemoveTab = (id: string) => {
    if (snippets.length <= 1) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'You cannot remove the last tab',
        life: 3000,
      });
      return;
    }
    let newSelectedId = selectedSnippetId;
    if (selectedSnippetId === id) {
      const currentIndex = snippets.findIndex((snippet) => snippet.id === id);
      const newIndex = Math.max(0, currentIndex - 1);
      newSelectedId = snippets[newIndex === currentIndex ? 0 : newIndex].id;
    }
    const newSnippets = snippets.filter((snippet) => snippet.id !== id);
    if (newSelectedId !== selectedSnippetId) {
      setSelectedSnippetId(newSelectedId);
    }
    setTimeout(() => {
      const newCodeContent = { ...codeContent };
      delete newCodeContent[id];
      setSnippets(newSnippets);
      setCodeContent(newCodeContent);
      setShowTabOptionsModal(false);
      try { onImmediateSave(); } catch { }
    }, 0);
  };

  const handleEditTab = (id: string) => {
    const tabToEdit = snippets.find((snippet) => snippet.id === id);
    if (tabToEdit) {
      setActiveTabForOptions(id);
      const tabElement = document.getElementById(`tab-${id}`);
      if (tabElement) {
        const rect = tabElement.getBoundingClientRect();
        setLanguageSelectorPosition({
          top: rect.bottom,
          left: rect.left,
        });
      }
      setShowLanguageSelector(true);
      setShowTabOptionsModal(false);
    }
  };

  return {
    handleTabChange,
    handleAddLanguage,
    handleTabOptions,
    handleRemoveTab,
    handleEditTab
  };
};

export default TabManager; 