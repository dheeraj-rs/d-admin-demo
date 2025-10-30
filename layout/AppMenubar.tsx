import { menuItems } from '../public/demo/data/menuItems';
import { AppMenuItem, LayoutContextProps } from '../types';
import React, { RefObject, useContext, useRef, useState, useEffect } from 'react';
import AppMenuitem from './AppMenuitem';
import AppMenuSearch from './AppMenuSearch';
import { LayoutContext } from './context/LayoutContext';
import { MenuProvider } from './context/MenuContext';
import { useMenuItems } from '../hooks/useMenuItems';
import { useTranslatedMenuItems } from '../hooks/useTranslatedMenuItems';

const AppMenubar = ({ menubarRef }: { menubarRef: React.RefObject<HTMLDivElement> }) => {
    const searchRef = useRef<HTMLDivElement>(null);
    const { layoutState } = useContext(LayoutContext as unknown as React.Context<LayoutContextProps>);
    const filteredMenuItems = useMenuItems();
    const [isClient, setIsClient] = useState(false);

    // Ensure we're on the client side to prevent hydration mismatch
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Use filtered menu items if available and client-side, otherwise fall back to search results or original menu
    const originalItems: AppMenuItem[] = layoutState?.searchSidebarItems?.length
        ? layoutState.searchSidebarItems
        : (isClient && filteredMenuItems.length > 0)
            ? filteredMenuItems
            : menuItems;

    // Translate the menu items
    const items = useTranslatedMenuItems(originalItems);

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {items.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
                <AppMenuSearch searchRef={searchRef as unknown as RefObject<HTMLDivElement>} menubarRef={menubarRef as unknown as RefObject<HTMLDivElement>} />
            </ul>
        </MenuProvider>
    );
};

export default AppMenubar;
