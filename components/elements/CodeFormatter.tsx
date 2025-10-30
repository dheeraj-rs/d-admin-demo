'use client';
import { useRef, useCallback } from 'react';
import { ToastRef } from '../../types';

interface CodeFormatterProps {
  editorRef: React.RefObject<any>;
  toastRef: React.RefObject<ToastRef | null>;
  currentSnippet: {
    id: string;
    language: string;
    name: string;
    version: string;
    code: string;
  };
  selectedSnippetId: string;
  codeContent: Record<string, string>;
}

const CodeFormatter = ({ 
  editorRef, 
  toastRef, 
  currentSnippet, 
  selectedSnippetId, 
  codeContent 
}: CodeFormatterProps) => {
  
  const formatCode = useCallback(() => {
    if (!editorRef.current) return;
    const language = currentSnippet.language.toLowerCase();
    const currentCode = codeContent[selectedSnippetId] || '';
    if (!currentCode.trim()) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Nothing to Format',
        detail: 'Please add some code before formatting',
        life: 3000,
      });
      return;
    }

    try {
      const editor = editorRef.current;
      const originalCode = editor.getValue();
      const formatOptions = {
        tabSize: 2,
        insertSpaces: true,
        indentSize: 2,
        trimTrailingWhitespace: true,
        insertFinalNewline: true,
        trimFinalNewlines: true,
        maxEmptyLines: 1,
      };

      if (language === 'react') {
        const hasJsx = /<[a-zA-Z][\s\S]*?\/?>/.test(currentCode);
        if (hasJsx) {
          const model = editor.getModel();
          if (model && window.monaco) {
            window.monaco.editor.setModelLanguage(model, 'javascript');
            setTimeout(() => {
              editor.trigger('source', 'editor.action.formatDocument', {
                ...formatOptions,
                jsxBracketSameLine: false,
                jsxSingleQuote: false,
                bracketSpacing: true,
              });
              setTimeout(() => {
                const formattedContent = editor.getValue();
                const fixedContent = formattedContent.replace(/\n{3,}/g, '\n\n');
                if (fixedContent !== formattedContent) {
                  const position = editor.getPosition();
                  editor.setValue(fixedContent);
                  if (position) {
                    editor.setPosition(position);
                  }
                }
                if (originalCode !== fixedContent) {
                  toastRef.current?.show({
                    severity: 'success',
                    summary: 'Formatted',
                    detail: `React JSX code formatted successfully`,
                    life: 2000,
                  });
                } else {
                  toastRef.current?.show({
                    severity: 'info',
                    summary: 'Already Formatted',
                    detail: 'Code is already properly formatted',
                    life: 2000,
                  });
                }
              }, 100);
            }, 50);
            return;
          }
        }
      }
      if (['javascript', 'typescript', 'react'].includes(language)) {
        // JS/TS/React specific formatting
        Object.assign(formatOptions, {
          semicolons: true,
          singleQuotes: true,
          trailingCommas: 'es5',
          bracketSpacing: true,
          jsxBracketSameLine: false,
          arrowParens: 'always',
          preserveNewLines: true,
          maxPreserveNewLines: 1,
        });
      } else if (['html', 'xml'].includes(language)) {
        // HTML specific formatting
        Object.assign(formatOptions, {
          wrapLineLength: 100,
          indentInnerHtml: true,
          preserveNewLines: true,
          maxPreserveNewLines: 1,
          indentHandlebars: false,
          endWithNewline: true,
          extraLiners: 'head,body,/html',
        });
      } else if (['css', 'scss', 'less'].includes(language)) {
        // CSS/SCSS specific formatting
        Object.assign(formatOptions, {
          newlineBetweenRules: true,
          newlineBetweenSelectors: false,
          preserveNewLines: true,
          maxPreserveNewLines: 1,
        });
      }
      const formatAction = editor.getAction('editor.action.formatDocument');
      if (formatAction) {
        formatAction
          .run()
          .then(() => {
            const formattedContent = editor.getValue();
            const fixedContent = formattedContent.replace(/\n{3,}/g, '\n\n');
            if (fixedContent !== formattedContent) {
              const position = editor.getPosition();
              editor.setValue(fixedContent);
              if (position) {
                editor.setPosition(position);
              }
            }
            if (originalCode !== fixedContent) {
              toastRef.current?.show({
                severity: 'success',
                summary: 'Formatted',
                detail: `${currentSnippet.name} code formatted successfully`,
                life: 2000,
              });
            } else {
              toastRef.current?.show({
                severity: 'info',
                summary: 'Already Formatted',
                detail: 'Code is already properly formatted',
                life: 2000,
              });
            }
          })
          .catch((err: Error) => {
            console.error('Formatting error:', err);
            toastRef.current?.show({
              severity: 'error',
              summary: 'Error',
              detail: 'Could not format the code. Try again.',
              life: 3000,
            });
          });
      } else {
        const model = editor.getModel();
        if (model && window.monaco) {
          window.monaco.editor.setModelLanguage(model, getEditorLanguage(language));
          setTimeout(() => {
            editor.trigger('source', 'editor.action.formatDocument', formatOptions);
          }, 50);
        }
      }
    } catch (err) {
      console.error('Formatting error:', err);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Could not format the code. Try again.',
        life: 3000,
      });
    }
  }, [currentSnippet, selectedSnippetId, codeContent, toastRef, editorRef]);

  // Helper function to map snippet language to Monaco editor language
  const getEditorLanguage = (snippetLanguage: string) => {
    switch (snippetLanguage.toLowerCase()) {
      case 'react':
        return 'javascript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'javascript':
      case 'js':
        return 'javascript';
      case 'typescript':
      case 'ts':
        return 'typescript';
      default:
        return snippetLanguage;
    }
  };

  return { formatCode };
};

export default CodeFormatter;