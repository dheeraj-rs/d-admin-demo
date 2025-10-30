type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    severity: 'success' | 'error' | 'info' | 'warning' | 'warn';
    summary: string;
    detail?: string;
    life?: number;
}

interface ToastRef {
    show: (message: ToastMessage) => void;
    clear: () => void;
}

interface PaginatorProps {
    pageData: {
        first: number;
        rows: number;
        totalRecords: number;
        rowsPerPageOptions?: number[];
    };
    onPageChange: (event: { first: number; rows: number }) => void;
    className?: string;
}

export type { ToastType ,ToastProps,ToastRef,PaginatorProps};
