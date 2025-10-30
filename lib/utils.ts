import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function classNames(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Alias for classNames, commonly used in shadcn/ui components
export const cn = classNames;

// Date formatting utility
export function dateFormat(date: Date | string, format: string = 'default'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) {
        return 'Invalid Date';
    }
    
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };
    
    if (format === 'long') {
        options.month = 'long';
        options.hour = '2-digit';
        options.minute = '2-digit';
    } else if (format === 'short') {
        options.month = 'numeric';
    }
    
    return d.toLocaleDateString('en-US', options);
}
