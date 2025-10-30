'use client';
import { useCallback, useMemo } from 'react';
import { ToastRef } from '../../types';

interface LanguageSelectorProps {
  snippets: Array<{
    id: string;
    language: string;
    name: string;
    version: string;
    code: string;
  }>;
  activeTabForOptions: string | null;
  setSnippets: React.Dispatch<React.SetStateAction<any[]>>;
  setCodeContent: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setSelectedSnippetId: (id: string) => void;
  toastRef: React.RefObject<ToastRef | null>;
  setShowLanguageSelector: (show: boolean) => void;
  setActiveTabForOptions: (id: string | null) => void;
  languageOptions: Array<{ value: string; label: string }>;
  onImmediateSave: () => void;
}

const LanguageSelector = ({
  snippets,
  activeTabForOptions,
  setSnippets,
  setCodeContent,
  setSelectedSnippetId,
  toastRef,
  setShowLanguageSelector,
  setActiveTabForOptions,
  languageOptions,
  onImmediateSave
}: LanguageSelectorProps) => {

  const availableLanguages = useMemo(() => {
    const usedLanguages = new Set(
      snippets.filter((snippet) => !activeTabForOptions || snippet.id !== activeTabForOptions).map((snippet) => snippet.language)
    );

    return languageOptions.filter((option) => !usedLanguages.has(option.value));
  }, [snippets, activeTabForOptions, languageOptions]);

  const handleLanguageSelection = useCallback((language: string) => {
    const isLanguageUsed = snippets.some((snippet) => snippet.language === language && (!activeTabForOptions || snippet.id !== activeTabForOptions));
    if (isLanguageUsed) {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: `${language.toUpperCase()} is already added. You cannot add the same language twice.`,
        life: 3000,
      });
      return;
    }
    const selectedOption = languageOptions.find((option) => option.value === language);
    if (!selectedOption) return;
    if (activeTabForOptions) {
      setShowLanguageSelector(false);
      setActiveTabForOptions(null);
      setTimeout(() => {
        const updatedSnippets = snippets.map((snippet) =>
          snippet.id === activeTabForOptions
            ? {
              ...snippet,
              name: selectedOption.label,
              language: language,
              version: '1.0.0',
            }
            : snippet
        );
        setSnippets(updatedSnippets);
        try { onImmediateSave(); } catch { }
      }, 0);
    } else {
      setShowLanguageSelector(false);
      setTimeout(() => {
        const timestamp = Date.now();
        const newId = `${language}-${timestamp}`;
        const newSnippet = {
          id: newId,
          language: language,
          name: selectedOption.label,
          version: '1.0.0',
          code: '',
        };
        setSnippets((prev) => [...prev, newSnippet]);
        setCodeContent((prev) => ({
          ...prev,
          [newId]: '',
        }));
        setTimeout(() => {
          setSelectedSnippetId(newId);
          try { onImmediateSave(); } catch { }
        }, 0);
      }, 0);
    }
  }, [
    snippets,
    activeTabForOptions,
    languageOptions,
    toastRef,
    setShowLanguageSelector,
    setActiveTabForOptions,
    setSnippets,
    setCodeContent,
    setSelectedSnippetId,
    onImmediateSave
  ]);

  return {
    handleLanguageSelection,
    availableLanguages
  };
};

export default LanguageSelector; 