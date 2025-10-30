'use client';
import { useMemo, useCallback } from 'react';

interface PreviewManagerProps {
  codeContent: Record<string, string>;
  lastValidCssContent: string;
  cssSnippetId: string;
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}

const PreviewManager = ({
  codeContent,
  lastValidCssContent,
  cssSnippetId,
  setRefreshKey
}: PreviewManagerProps) => {
  
  const enhancedCodeContent = useMemo(() => {
    const enhanced = { ...codeContent };
    if (cssSnippetId) {
      if (!enhanced[cssSnippetId] || enhanced[cssSnippetId].trim() === '') {
        enhanced[cssSnippetId] = lastValidCssContent;
      }
    }
    return enhanced;
  }, [codeContent, cssSnippetId, lastValidCssContent]);

  const refreshPreview = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, [setRefreshKey]);

  return {
    enhancedCodeContent,
    refreshPreview
  };
};

export default PreviewManager; 