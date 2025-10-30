import { UseEventListener, UseEventListenerProps } from '../types/hooks';
import { useEffect, useRef } from 'react';

export const useEventListener = ({ type, listener, options = {} }: UseEventListenerProps): UseEventListener => {
    const savedListener = useRef(listener);

    useEffect(() => {
        savedListener.current = listener;
    }, [listener]);

    const bind = (node?: HTMLElement) => {
        const targetNode = node || document;
        targetNode.addEventListener(type, savedListener.current, options);
    };

    const unbind = () => {
        document.removeEventListener(type, savedListener.current);
    };

    return [bind, unbind];
};

export const useUnmountEffect = (fn: () => void) => {
    useEffect(() => {
        return () => {
            fn();
        };
    }, [fn]);
};

// Export the useAuth hook
export { useAuth } from './useAuth';

// Export the useMenuItems hook
export { useMenuItems } from './useMenuItems';
