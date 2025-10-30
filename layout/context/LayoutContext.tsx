'use client';
import { ChildContainerProps, LayoutConfig, LayoutContextProps, LayoutState } from '../../types';
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
const LAYOUT_CONFIG_KEY = 'd-admin-layout-config';
const LAYOUT_STATE_KEY = 'd-admin-layout-state';

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
    ripple: false,
    inputStyle: 'outlined',
    menuMode: 'static',
    colorScheme: 'dark',
    theme: 'd-admin-dark',
    scale: 14,
    secretKey: '',
};

const DEFAULT_LAYOUT_STATE: LayoutState = {
    staticMenuDesktopInactive: false,
    staticConfigDesktopInactive: true,
    staticBottombarDesktopInactive: true,
    overlayMenuActive: false,
    overlayConfigActive: false,
    overlayBottombarActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    topbarAutoHide: false,
    staticMenuMobileActive: false,
    staticConfigMobileActive: false,
    staticBottombarMobileHide: false,
    menuHoverActive: false,
    sidebarAutoOverlayActive: true,
    searchSidebarItems: [],
    navbarStickyToggle: false,
    bottombarStickyToggle: true,
};

const saveToLocalStorage = <T,>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
    }
};

const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            localStorage.setItem(key, JSON.stringify(defaultValue));
            return defaultValue;
        }
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        try {
            localStorage.setItem(key, JSON.stringify(defaultValue));
        } catch (saveError) {
            console.error(`Error saving default ${key} to localStorage:`, saveError);
        }
        return defaultValue;
    }
};

export const LayoutContext = createContext({} as LayoutContextProps);

export const useLayout = (): LayoutContextProps => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};

export const LayoutProvider: React.FC<ChildContainerProps> = ({ children }) => {
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);
    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(DEFAULT_LAYOUT_CONFIG);
    const [layoutState, setLayoutState] = useState<LayoutState>(DEFAULT_LAYOUT_STATE);

    useEffect(() => {
        let storedConfig = getFromLocalStorage(LAYOUT_CONFIG_KEY, DEFAULT_LAYOUT_CONFIG);
        const storedState = getFromLocalStorage(LAYOUT_STATE_KEY, DEFAULT_LAYOUT_STATE);
        setLayoutConfig(storedConfig);
        setLayoutState(storedState);
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) return;
        saveToLocalStorage(LAYOUT_CONFIG_KEY, layoutConfig);
    }, [layoutConfig, isHydrated]);

    useEffect(() => {
        if (!isHydrated) return;
        saveToLocalStorage(LAYOUT_STATE_KEY, layoutState);
    }, [layoutState, isHydrated]);

    useEffect(() => {
        if (!isHydrated) return;

        if (layoutConfig.secretKey === 'drjsde') {
            setLayoutConfig(prev => ({ ...prev, secretKey: '' }));
            router.push('/owner-login');
        }
    }, [layoutConfig.secretKey, isHydrated, router]);

    const isOverlay = (): boolean => layoutConfig.menuMode === 'overlay';
    const isDesktop = (): boolean => typeof window !== 'undefined' && window.innerWidth > 991;

    const onMenuToggle = (): void => {
        // On mobile, always use staticMenuMobileActive regardless of menuMode
        if (!isDesktop()) {
            setLayoutState(prevState => ({
                ...prevState,
                staticMenuMobileActive: !prevState.staticMenuMobileActive
            }));
        } else if (isOverlay()) {
            setLayoutState(prevState => ({
                ...prevState,
                overlayMenuActive: !prevState.overlayMenuActive
            }));
        } else {
            setLayoutState(prevState => ({
                ...prevState,
                staticMenuDesktopInactive: !prevState.staticMenuDesktopInactive
            }));
        }
    };

    const onConfigToggle = (): void => {
        // On mobile, always use staticConfigMobileActive regardless of menuMode
        if (!isDesktop()) {
            setLayoutState(prevState => ({
                ...prevState,
                staticConfigMobileActive: !prevState.staticConfigMobileActive
            }));
        } else if (isOverlay()) {
            setLayoutState(prevState => ({
                ...prevState,
                overlayConfigActive: !prevState.overlayConfigActive
            }));
        } else {
            setLayoutState(prevState => ({
                ...prevState,
                staticConfigDesktopInactive: !prevState.staticConfigDesktopInactive
            }));
        }
    };

    const onBottombarToggle = (): void => {
        if (isOverlay()) {
            setLayoutState(prevState => ({
                ...prevState,
                overlayBottombarActive: !prevState.overlayBottombarActive
            }));
        } else if (isDesktop()) {
            setLayoutState(prevState => ({
                ...prevState,
                staticBottombarDesktopInactive: !prevState.staticBottombarDesktopInactive
            }));
        } else {
            setLayoutState(prevState => ({
                ...prevState,
                staticBottombarMobileHide: !prevState.staticBottombarMobileHide
            }));
        }
    };

    const onTopbarToggle = (): void => {
        setLayoutState(prevState => ({
            ...prevState,
            topbarAutoHide: !prevState.topbarAutoHide
        }));
    };

    const onNavbarStickyToggle = (): void => {
        setLayoutState(prevState => ({
            ...prevState,
            navbarStickyToggle: !prevState.navbarStickyToggle
        }));
    };

    const onBottombarStickyToggle = (): void => {
        setLayoutState(prevState => ({
            ...prevState,
            bottombarStickyToggle: !prevState.bottombarStickyToggle
        }));
    };

    const onSidebarAutoOverlayToggle = (): void => {
        setLayoutState(prevState => ({
            ...prevState,
            sidebarAutoOverlayActive: !prevState.sidebarAutoOverlayActive
        }));
    };

    const showProfileSidebar = (): void => {
        setLayoutState(prevState => ({
            ...prevState,
            profileSidebarVisible: !prevState.profileSidebarVisible
        }));
    };

    const value: LayoutContextProps = {
        layoutConfig,
        setLayoutConfig,
        layoutState,
        setLayoutState,
        onMenuToggle,
        showProfileSidebar,
        onConfigToggle,
        onBottombarToggle,
        onTopbarToggle,
        onSidebarAutoOverlayToggle,
        onNavbarStickyToggle,
        onBottombarStickyToggle,
    };

    return (
        <LayoutContext.Provider value={value}>
            {children}
        </LayoutContext.Provider>
    );
};