type UseEventListener = [(node?: HTMLElement) => void, () => void];

interface UseEventListenerProps {
    type: keyof WindowEventMap;
    listener: (event: Event) => void;
    options?: AddEventListenerOptions;
}

export type { UseEventListener, UseEventListenerProps };