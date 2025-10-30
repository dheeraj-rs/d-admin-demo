import * as React from 'react';
import { classNames } from '../../lib/utils';

interface DropdownMenuProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<{
    open: boolean;
    setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => { } });

export function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    return (
        <DropdownMenuContext.Provider value={{ open, setOpen }}>
            {children}
        </DropdownMenuContext.Provider>
    );
}

export const DropdownMenuTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, onClick, asChild, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownMenuContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setOpen(true);
        onClick?.(e);
    };

    if (asChild && React.isValidElement(children)) {
        const childElement = children as React.ReactElement<any>;
        return React.cloneElement(childElement, {
            onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                handleClick(e);
                childElement.props.onClick?.(e);
            },
            ref,
        });
    }

    return (
        <button
            ref={ref}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export const DropdownMenuContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'center' | 'end' }
>(({ className, children, align = 'end', ...props }, ref) => {
    const { open, setOpen } = React.useContext(DropdownMenuContext);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, setOpen]);

    if (!open) return null;

    const alignStyles = {
        start: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        end: 'right-0',
    };

    return (
        <div
            ref={contentRef}
            className={classNames(
                'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-800 bg-[#1A1A1A] p-1 text-white shadow-lg mt-2',
                alignStyles[align],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownMenuContext);

    return (
        <div
            ref={ref}
            className={classNames(
                'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-800 focus:bg-gray-800',
                className
            )}
            onClick={(e) => {
                onClick?.(e);
                setOpen(false);
            }}
            {...props}
        >
            {children}
        </div>
    );
});
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={classNames('-mx-1 my-1 h-px bg-gray-800', className)} {...props} />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export const DropdownMenuLabel = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={classNames('px-2 py-1.5 text-sm font-semibold text-gray-400', className)} {...props} />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

// Placeholder exports for compatibility
export const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DropdownMenuSubContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DropdownMenuSubTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DropdownMenuCheckboxItem = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DropdownMenuRadioItem = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DropdownMenuShortcut = ({ children }: { children: React.ReactNode }) => <>{children}</>;
