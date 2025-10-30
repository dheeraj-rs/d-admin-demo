'use client';

import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Link2,
    Image as ImageIcon,
    Table as TableIcon,
    Minus,
    Highlighter,
} from 'lucide-react';
import '../../../../styles/pages/documents/index.scss';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const [colorScheme, setColorScheme] = React.useState<string>('dark');

    // Detect color scheme from CSS variable, data attribute, or computed background
    React.useEffect(() => {
        const detectColorScheme = () => {
            const root = document.documentElement;

            // Method 1: Check data-theme attribute
            const dataTheme = root.getAttribute('data-theme');
            if (dataTheme) {
                if (dataTheme.includes('light')) {
                    setColorScheme('light');
                    return;
                } else if (dataTheme.includes('dark')) {
                    setColorScheme('dark');
                    return;
                }
            }

            // Method 2: Check computed background color
            const computedStyle = getComputedStyle(root);
            const bgColor = computedStyle.getPropertyValue('--surface-card').trim();

            // Method 3: Check if background is light or dark by parsing RGB
            if (bgColor) {
                // Try to determine if it's a light color
                const isLight = bgColor.includes('255') ||
                    bgColor.includes('fff') ||
                    bgColor.includes('white') ||
                    bgColor.includes('240') ||
                    bgColor.includes('250');

                setColorScheme(isLight ? 'light' : 'dark');
            }
        };

        detectColorScheme();

        // Listen for theme changes
        const observer = new MutationObserver(detectColorScheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme', 'class', 'style', 'data-color-scheme']
        });

        // Also listen for storage events (in case theme is changed in another tab)
        window.addEventListener('storage', detectColorScheme);

        return () => {
            observer.disconnect();
            window.removeEventListener('storage', detectColorScheme);
        };
    }, []);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
            }),
            Image,
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
        ],
        content,
        editorProps: {
            attributes: {
                class: 'editor-prose',
                'data-color-scheme': colorScheme,
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Update editor attributes when color scheme changes
    React.useEffect(() => {
        if (editor) {
            editor.view.dom.setAttribute('data-color-scheme', colorScheme);
        }
    }, [editor, colorScheme]);

    const addLink = React.useCallback(() => {
        if (!editor) return;

        const url = window.prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    }, [editor]);

    const addImage = React.useCallback(() => {
        if (!editor) return;

        const url = window.prompt('Enter image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const addTable = React.useCallback(() => {
        if (!editor) return;

        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="rich-text-editor">
            <div className="editor-toolbar">
                <div className="toolbar-content">
                    <div className="toolbar-group">
                        <button
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().undo()}
                            className="toolbar-button"
                            title="Undo"
                        >
                            <Undo />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().redo()}
                            className="toolbar-button"
                            title="Redo"
                        >
                            <Redo />
                        </button>
                    </div>

                    <div className="toolbar-group">
                        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`} title="Heading 1"><Heading1 /></button>
                        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`} title="Heading 2"><Heading2 /></button>
                        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`} title="Heading 3"><Heading3 /></button>
                    </div>

                    <div className="toolbar-group">
                        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`} title="Bold"><Bold /></button>
                        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`} title="Italic"><Italic /></button>
                        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`toolbar-button ${editor.isActive('underline') ? 'active' : ''}`} title="Underline"><UnderlineIcon /></button>
                        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`toolbar-button ${editor.isActive('strike') ? 'active' : ''}`} title="Strikethrough"><Strikethrough /></button>
                        <button onClick={() => editor.chain().focus().toggleCode().run()} className={`toolbar-button ${editor.isActive('code') ? 'active' : ''}`} title="Code"><Code /></button>
                        <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={`toolbar-button ${editor.isActive('highlight') ? 'active' : ''}`} title="Highlight"><Highlighter /></button>
                    </div>

                    <div className="toolbar-group">
                        <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`} title="Align Left"><AlignLeft /></button>
                        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`} title="Align Center"><AlignCenter /></button>
                        <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`} title="Align Right"><AlignRight /></button>
                        <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`toolbar-button ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`} title="Justify"><AlignJustify /></button>
                    </div>

                    <div className="toolbar-group">
                        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`} title="Bullet List"><List /></button>
                        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`} title="Numbered List"><ListOrdered /></button>
                        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`toolbar-button ${editor.isActive('blockquote') ? 'active' : ''}`} title="Quote"><Quote /></button>
                    </div>

                    <div className="toolbar-group">
                        <button onClick={addLink} className="toolbar-button" title="Insert Link"><Link2 /></button>
                        <button onClick={addImage} className="toolbar-button" title="Insert Image"><ImageIcon /></button>
                        <button onClick={addTable} className="toolbar-button" title="Insert Table"><TableIcon /></button>
                        <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="toolbar-button" title="Horizontal Rule"><Minus /></button>
                    </div>
                </div>
            </div>

            <div className="editor-content-wrapper">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
