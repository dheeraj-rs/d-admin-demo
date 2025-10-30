import * as React from 'react';
import { classNames } from '../../lib/utils';

interface DialogProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const DialogContext = React.createContext<{
    open: boolean;
    setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => { } });

export function Dialog({ children, open: controlledOpen, onOpenChange }: DialogProps) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    return (
        <DialogContext.Provider value={{ open, setOpen }}>
            {children}
        </DialogContext.Provider>
    );
}

export const DialogTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DialogContext);

    return (
        <button
            ref={ref}
            onClick={(e) => {
                setOpen(true);
                onClick?.(e);
            }}
            {...props}
        >
            {children}
        </button>
    );
});
DialogTrigger.displayName = 'DialogTrigger';

export const DialogOverlay = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={classNames('fixed inset-0 z-50 bg-black/80 backdrop-blur-sm', className)}
        {...props}
    />
));
DialogOverlay.displayName = 'DialogOverlay';

export const DialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(DialogContext);

    React.useEffect(() => {
        if (!open) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open, setOpen]);

    if (!open) return null;

    return (
        <>
            <DialogOverlay onClick={() => setOpen(false)} />
            <div
                ref={ref}
                className={classNames(
                    'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-800 bg-[#0D0D0D] p-6 shadow-lg rounded-lg',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </>
    );
});
DialogContent.displayName = 'DialogContent';

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={classNames('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={classNames('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

export const DialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2 ref={ref} className={classNames('text-lg font-semibold leading-none tracking-tight text-white', className)} {...props} />
));
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p ref={ref} className={classNames('text-sm text-gray-400', className)} {...props} />
));
DialogDescription.displayName = 'DialogDescription';

export const DialogClose = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DialogContext);

    return (
        <button
            ref={ref}
            onClick={(e) => {
                setOpen(false);
                onClick?.(e);
            }}
            {...props}
        >
            {children}
        </button>
    );
});
DialogClose.displayName = 'DialogClose';

export const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
