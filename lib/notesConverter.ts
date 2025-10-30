import mongoose from 'mongoose';

export interface INoteItem {
    id: string;
    key: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Convert old string format notes to new structured array format
 * @param notes - Can be string (old format) or array (new format)
 * @returns Array of structured note items
 */
export function convertNotesToArray(notes: any): INoteItem[] {
    // If already an array, return as is
    if (Array.isArray(notes)) {
        return notes;
    }

    // If empty or undefined, return empty array
    if (!notes || notes === '') {
        return [];
    }

    // If string, convert to array
    if (typeof notes === 'string') {
        const noteItems: INoteItem[] = [];
        const lines = notes.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            const colonIndex = trimmedLine.indexOf(':');
            if (colonIndex > 0) {
                const key = trimmedLine.substring(0, colonIndex).trim();
                const value = trimmedLine.substring(colonIndex + 1).trim();

                noteItems.push({
                    id: new mongoose.Types.ObjectId().toString(),
                    key: key,
                    value: value,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            } else {
                // If no colon, treat whole line as a note
                noteItems.push({
                    id: new mongoose.Types.ObjectId().toString(),
                    key: 'Note',
                    value: trimmedLine,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }

        return noteItems;
    }

    return [];
}

/**
 * Convert structured array notes to string format (for backward compatibility)
 * @param notes - Array of note items
 * @returns String representation
 */
export function convertNotesToString(notes: INoteItem[]): string {
    if (!Array.isArray(notes) || notes.length === 0) {
        return '';
    }

    return notes.map(note => `${note.key}: ${note.value}`).join('\n');
}
