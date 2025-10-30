import React, { Dispatch, HTMLAttributeAnchorTarget, MutableRefObject, ReactNode, SetStateAction } from 'react';

/* CSSTransition Types */
interface CSSTransitionProps {
    in: boolean;
    timeout: {
        enter: number;
        exit: number;
    };
    classNames: string;
    children: React.ReactElement;
    onEnter?: () => void;
    onExit?: () => void;
}

// New file for theme types
type ColorTheme = {
    title: string;
    name: string;
    primary: string;
    secondary: string;
    text: string;
    accent: string;
    gradient: string;
    theme: string;
    colorScheme: 'light' | 'dark';
};

/* Breadcrumb Types */
interface AppBreadcrumbProps {
    className?: string;
}

interface Breadcrumb {
    labels?: string[];
    to?: string;
}

interface BreadcrumbItem {
    label: string;
    to?: string;
    items?: BreadcrumbItem[];
}

/* Context Types */
type LayoutState = {
    topbarAutoHide: boolean;
    staticMenuDesktopInactive: boolean;
    staticConfigDesktopInactive: boolean;
    staticBottombarDesktopInactive: boolean;
    overlayMenuActive: boolean;
    overlayConfigActive: boolean;
    overlayBottombarActive: boolean;
    profileSidebarVisible: boolean;
    configSidebarVisible: boolean;
    staticMenuMobileActive: boolean;
    staticConfigMobileActive: boolean;
    staticBottombarMobileHide: boolean;
    menuHoverActive: boolean;
    sidebarAutoOverlayActive: boolean;
    searchSidebarItems: [];
    navbarStickyToggle: boolean;
    bottombarStickyToggle: boolean;
};

type LayoutConfig = {
    ripple: boolean;
    inputStyle: string;
    menuMode: string;
    colorScheme: string;
    theme: string;
    scale: number;
    secretKey: string;
};

interface LayoutContextProps {
    layoutConfig: LayoutConfig;
    setLayoutConfig: Dispatch<SetStateAction<LayoutConfig>>;
    layoutState: LayoutState;
    setLayoutState: Dispatch<SetStateAction<LayoutState>>;
    onMenuToggle: () => void;
    onConfigToggle: () => void;
    showProfileSidebar: () => void;
    onBottombarToggle: () => void;
    onTopbarToggle: () => void;
    onSidebarAutoOverlayToggle: () => void;
    onNavbarStickyToggle: () => void;
    onBottombarStickyToggle: () => void;
}

interface MenuContextProps {
    activeMenu: string;
    setActiveMenu: Dispatch<SetStateAction<string>>;
}

/* AppConfig Types */
interface AppConfigProps {
    simple?: boolean;
}

/* AppTopbar Types */
type NodeRef = MutableRefObject<ReactNode>;

interface AppTopbarRef {
    topbarElement?: HTMLDivElement | null;
    menubutton?: HTMLButtonElement | null;
    toolbarbutton?: HTMLButtonElement | null;
    topbarmenu?: HTMLDivElement | null;
    topbarmenubutton?: HTMLButtonElement | null;
}

/* AppMenu Types */
type CommandProps = {
    originalEvent: React.MouseEvent<HTMLAnchorElement, MouseEvent>;
    item: MenuModelItem;
};

interface MenuProps {
    model: MenuModel[];
}

interface MenuModel {
    label: string;
    icon?: string;
    items?: MenuModel[];
    to?: string;
    url?: string;
    target?: HTMLAttributeAnchorTarget;
    seperator?: boolean;
}

interface AppMenuItem extends MenuModel {
    items?: AppMenuItem[];
    badge?: 'UPDATED' | 'NEW';
    badgeClass?: string;
    class?: string;
    preventExact?: boolean;
    visible?: boolean;
    disabled?: boolean;
    replaceUrl?: boolean;
    description?: string;
    keywords?: string[];
    command?: ({ originalEvent, item }: CommandProps) => void;
}

interface AppMenuItemProps {
    item?: AppMenuItem;
    parentKey?: string;
    index?: number;
    root?: boolean;
    className?: string;
}

/* Search Types */
interface SearchableItem {
    label: string;
    items?: SearchableItem[];
    [key: string]: any;
}

interface SearchConfig {
    searchKeys?: string[];
    maxResults: number;
    minSearchLength: number;
    fuzzySearch?: boolean;
    searchMode?: 'simple' | 'advanced';
}

interface AppSearchProps<T extends SearchableItem> {
    searchRef: React.RefObject<HTMLDivElement>;
    menubarRef: React.RefObject<HTMLDivElement>;
    type?: 'menu' | 'pageContent';
    items?: T[];
    onSearchResults?: (results: T[]) => void;
    searchConfig?: Partial<SearchConfig>;
    placeholder?: string;
}

export type {
    LayoutConfig,
    CommandProps,
    LayoutState,
    LayoutContextProps,
    MenuContextProps,
    AppConfigProps,
    AppTopbarRef,
    AppMenuItem,
    AppMenuItemProps,
    SearchableItem,
    SearchConfig,
    AppSearchProps,
    CSSTransitionProps,
    ColorTheme,
    AppBreadcrumbProps,
    Breadcrumb,
    BreadcrumbItem,
    NodeRef,
    MenuProps,
    MenuModel,
};
