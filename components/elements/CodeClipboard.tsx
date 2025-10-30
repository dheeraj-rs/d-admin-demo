'use client';
import { useCallback } from 'react';
import { ToastRef } from '../../types';

interface CodeClipboardProps {
  toastRef: React.RefObject<ToastRef | null>;
  codeContent: Record<string, string>;
  selectedSnippetId: string;
  setCopied: (value: boolean) => void;
}

const CodeClipboard = ({
  toastRef,
  codeContent,
  selectedSnippetId,
  setCopied
}: CodeClipboardProps) => {
  
  const copyToClipboard = useCallback(async () => {
    const currentCode = codeContent[selectedSnippetId] || '';
    if (!currentCode.trim()) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Nothing to copy. Please add some code first.',
        life: 3000,
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      toastRef.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Code copied to clipboard!',
        life: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to copy code to clipboard',
        life: 3000,
      });
    }
  }, [codeContent, selectedSnippetId, toastRef, setCopied]);

  return { copyToClipboard };
};

export default CodeClipboard;