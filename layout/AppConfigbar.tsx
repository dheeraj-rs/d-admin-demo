'use client';
import Slider from '../components/sample/Slider/Slider';
import { ThemeManager } from '../lib/theme-manager';
import { classNames } from '../lib/utils';
import { useContext, useEffect, useRef, useState } from 'react';
import { AppConfigProps, LayoutConfig, LayoutState } from '../types/layout';
import { LayoutContext } from './context/LayoutContext';
import Link from 'next/link';
import { useLanguage } from '../lib/i18n';

const AppConfigbar = (props: AppConfigProps) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const menubuttonRef = useRef<HTMLButtonElement>(null);
    const { t } = useLanguage();

    const [scales] = useState([11, 12, 13, 14, 15]);
    const {
        layoutConfig,
        setLayoutConfig,
        setLayoutState,
        layoutState,
        onSidebarAutoOverlayToggle,
        onMenuToggle,
        onConfigToggle,
        onBottombarToggle,
        onTopbarToggle,
    } = useContext(LayoutContext);

    useEffect(() => {
        setLayoutState((prevState: LayoutState) => ({
            ...prevState,
            configSidebarVisible: true,
        }));
    }, [setLayoutState]);

    const changeRipple = (e: { value: boolean }) => {
        ThemeManager.ripple = e.value;
        setLayoutConfig((prevState: LayoutConfig) => ({
            ...prevState,
            ripple: e.value,
        }));
    };

    const changeMenuMode = (e: { value: string }) => {
        setLayoutConfig((prevState: LayoutConfig) => ({
            ...prevState,
            menuMode: e.value,
        }));
    };

    const changeTheme = (theme: string, colorScheme: string) => {
        ThemeManager.changeTheme?.(layoutConfig.theme, theme, 'theme-css', () => {
            setLayoutConfig((prevState: LayoutConfig) => ({
                ...prevState,
                theme,
                colorScheme,
            }));
        });
    };

    useEffect(() => {
        document.documentElement.style.fontSize = layoutConfig.scale + 'px';
    }, [layoutConfig.scale]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);

            document.body.style.overflow = 'hidden';
            document.documentElement.style.background = 'var(--bg-color)';
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);

            document.body.style.overflow = '';
            document.documentElement.style.background = '';
        }
    };

    const ThemeButton = ({
        theme,
        colorScheme,
        name,
        primary,
        secondary,
    }: {
        theme: string;
        colorScheme: 'light' | 'dark';
        name: string;
        primary: string;
        secondary: string;
    }) => (
        <div
            key={`${name}-${colorScheme}`}
            onClick={() => changeTheme(theme, colorScheme)}
            className={classNames('theme-selector__grid-item', {
                selected: layoutConfig.theme === theme,
            })}
            style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
            }}
            role="button"
            aria-label={`${name} theme`}
        >
            <div className="theme-selector__grid-item-content">
                <div className="theme-selector__grid-item-content-top">
                    <div className={`color-dot ${colorScheme}`} />
                    {layoutConfig.theme === theme && <i className="pi pi-check selected-icon" />}
                </div>
                <div className="theme-selector__grid-item-content-bottom">
                    <p>{name}</p>
                </div>
            </div>
        </div>
    );

    const ThemeCategory = ({
        title,
        themes,
    }: {
        title: string;
        themes: Array<{
            theme: string;
            colorScheme: 'light' | 'dark';
            name: string;
            primary: string;
            secondary: string;
            gradient: string;
        }>;
    }) => (
        <div className="theme-category">
            <h6>{title}</h6>
            <div className="theme-grid">
                {themes.map((theme) => (
                    <ThemeButton key={theme.theme} {...theme} />
                ))}
            </div>
        </div>
    );

    return (
        <div className="layout-config-container">
            <div className="scale-control">
                <div className="scale-header">
                    <h5>{t('config.scale')}</h5>
                    <span className="scale-value">{layoutConfig.scale}px</span>
                </div>
                <div className="slider-container">
                    <Slider
                        value={layoutConfig.scale}
                        onChange={(e) => {
                            setLayoutConfig((prevState: LayoutConfig) => ({
                                ...prevState,
                                scale: e.value as number,
                            }));
                        }}
                        min={scales[0]}
                        max={scales[scales.length - 1]}
                        step={1}
                    />
                    <div className="scale-markers">
                        {scales.map((scale) => (
                            <div
                                key={scale}
                                className={classNames('marker', {
                                    active: scale === layoutConfig.scale,
                                })}
                                onClick={() => {
                                    setLayoutConfig((prevState: LayoutConfig) => ({
                                        ...prevState,
                                        scale: scale,
                                    }));
                                }}
                            >
                                <span className="dot"></span>
                                <span className="label">{scale}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <h5 className="config-title">{t('config.menuType')}</h5>
            <div className="menu-type-selector">
                <button
                    className={`menu-type-btn ${layoutConfig.menuMode === 'static' ? 'active' : ''}`}
                    onClick={() => changeMenuMode({ value: 'static' })}
                    title={t('config.static')}
                >
                    <i className="pi pi-lock" />
                    <span>{t('config.static')}</span>
                </button>
                <button
                    className={`menu-type-btn ${layoutConfig.menuMode === 'overlay' ? 'active' : ''}`}
                    onClick={() => changeMenuMode({ value: 'overlay' })}
                    title={t('config.overlay')}
                >
                    <i className="pi pi-bars" />
                    <span>{t('config.overlay')}</span>
                </button>
            </div>

            {layoutConfig.menuMode === 'static' && (
                <>
                    <h5 className="config-title">{t('config.menuMode')}</h5>
                    <div className="menu-mode-selector">
                        <button
                            className={classNames('mode-button', {
                                active: !layoutState.sidebarAutoOverlayActive,
                            })}
                            onClick={() => onSidebarAutoOverlayToggle()}
                        >
                            <i className="pi pi-arrows-alt" />
                            <span>{t('config.default')}</span>
                        </button>
                        <button
                            className={classNames('mode-button', {
                                active: layoutState.sidebarAutoOverlayActive,
                            })}
                            onClick={() => onSidebarAutoOverlayToggle()}
                        >
                            <i className="pi pi-sync" />
                            <span>{t('config.auto')}</span>
                        </button>
                    </div>
                </>
            )}

            <h5 className="config-title">{t('config.tabConfig')}</h5>
            <div className="config-tab-toggle">
                <button ref={menubuttonRef} type="button" className="p-link toggle-button" onClick={onMenuToggle}>
                    <svg viewBox="0 0 32 32" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <title>open-panel-left</title>
                        <path
                            d="M28,4H4A2,2,0,0,0,2,6V26a2,2,0,0,0,2,2H28a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4ZM28,26H12V6H28Z"
                            fill="currentColor"
                        ></path>
                        <path
                            d="M4,6h6V26H4Z"
                            fill={layoutState.staticMenuDesktopInactive === false && layoutConfig.menuMode === 'static' ? 'transparent' : ''}
                        ></path>
                    </svg>
                    <span>{t('config.menu')}</span>
                </button>
                <button ref={menubuttonRef} type="button" className="p-link toggle-button" onClick={onTopbarToggle}>
                    <svg viewBox="0 0 32 32" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <title>open-panel-top</title>
                        <path d="M28,4H4A2,2,0,0,0,2,6V26a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4ZM28,26H4V14H28Z" fill="currentColor"></path>
                        <path d="M4,6h24v6H4Z" fill={layoutState.topbarAutoHide === false ? 'currentColor' : ''}></path>
                    </svg>
                    <span>{t('config.header')}</span>
                </button>
                <button ref={menubuttonRef} type="button" className="p-link toggle-button" onClick={onBottombarToggle}>
                    <svg viewBox="0 0 32 32" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <title>open-panel-bottom</title>
                        <path d="M28,4H4A2,2,0,0,0,2,6V26a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4ZM28,18H4V6H28Z" fill="currentColor"></path>
                        <path d="M4,20h24v6H4Z" fill={layoutState.staticBottombarDesktopInactive === false ? 'currentColor' : ''}></path>
                    </svg>
                    <span>{t('config.footer')}</span>
                </button>
                <button ref={menubuttonRef} type="button" className="p-link toggle-button" onClick={onConfigToggle}>
                    <svg viewBox="0 0 32 32" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <title>open-panel-right</title>
                        <path d="M28,4H4A2,2,0,0,0,2,6V26a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4ZM20,26H4V6H20Z" fill="currentColor"></path>
                        <path
                            d="M22,6h6V26H22Z"
                            fill={layoutState.staticConfigDesktopInactive === false && layoutConfig.menuMode === 'static' ? 'currentColor' : ''}
                        ></path>
                    </svg>
                    <span>{t('config.config')}</span>
                </button>

                <button ref={menubuttonRef} type="button" className={`p-link toggle-button ${isFullscreen && 'active'}`} onClick={toggleFullscreen}>
                    <span>{isFullscreen ? t('config.appModeActive') : t('config.appMode')}</span>
                </button>
            </div>

            <h5 className="config-title">{t('config.rippleEffect')}</h5>
            <div className="ripple-toggle">
                <button
                    className={`toggle-button ${layoutConfig.ripple ? 'active' : ''}`}
                    onClick={() => changeRipple({ value: !layoutConfig.ripple })}
                    title={`Toggle ${t('config.rippleEffect')}`}
                >
                    <i className="pi pi-circle-fill ripple-icon" />
                    <span>{t('config.ripple')}</span>
                </button>
            </div>

            <div className="theme-container">
                <h5 className="config-title">{t('config.themes')}</h5>
                <ThemeCategory
                    title={t('config.bootstrap')}
                    themes={[
                        {
                            theme: 'bootstrap4-light-blue',
                            colorScheme: 'light',
                            name: t('config.blue'),
                            primary: '#0d6efd',
                            secondary: '#f8f9fa',
                            gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
                        },
                        {
                            theme: 'bootstrap4-light-purple',
                            colorScheme: 'light',
                            name: t('config.purple'),
                            primary: '#6f42c1',
                            secondary: '#e9ecef',
                            gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
                        },
                        {
                            theme: 'bootstrap4-dark-blue',
                            colorScheme: 'dark',
                            name: t('config.blue'),
                            primary: '#0d6efd',
                            secondary: '#212529',
                            gradient: 'bg-gradient-to-r from-blue-600 to-blue-700',
                        },
                        {
                            theme: 'bootstrap4-dark-purple',
                            colorScheme: 'dark',
                            name: t('config.purple'),
                            primary: '#6f42c1',
                            secondary: '#212529',
                            gradient: 'bg-gradient-to-r from-purple-600 to-purple-700',
                        },
                    ]}
                />
                <ThemeCategory
                    title={t('config.materialDesign')}
                    themes={[
                        {
                            theme: 'md-light-indigo',
                            colorScheme: 'light',
                            name: t('config.indigo'),
                            primary: '#3f51b5',
                            secondary: '#ffffff',
                            gradient: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
                        },
                        {
                            theme: 'md-light-deeppurple',
                            colorScheme: 'light',
                            name: t('config.deepPurple'),
                            primary: '#673ab7',
                            secondary: '#ffffff',
                            gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
                        },
                        {
                            theme: 'md-dark-indigo',
                            colorScheme: 'dark',
                            name: t('config.indigo'),
                            primary: '#3f51b5',
                            secondary: '#212529',
                            gradient: 'bg-gradient-to-r from-indigo-600 to-indigo-700',
                        },
                        {
                            theme: 'md-dark-deeppurple',
                            colorScheme: 'dark',
                            name: t('config.deepPurple'),
                            primary: '#673ab7',
                            secondary: '#212529',
                            gradient: 'bg-gradient-to-r from-purple-600 to-purple-700',
                        },
                    ]}
                />

                <ThemeCategory
                    title={t('config.customDesign')}
                    themes={[
                        {
                            theme: 'lara-light-indigo',
                            colorScheme: 'light',
                            name: t('config.indigo'),
                            primary: '#6366f1',
                            secondary: '#ffffff',
                            gradient: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
                        },
                        {
                            theme: 'lara-light-blue',
                            colorScheme: 'light',
                            name: t('config.blue'),
                            primary: '#3b82f6',
                            secondary: '#ffffff',
                            gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
                        },
                        {
                            theme: 'lara-light-purple',
                            colorScheme: 'light',
                            name: t('config.purple'),
                            primary: '#8b5cf6',
                            secondary: '#ffffff',
                            gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
                        },
                        {
                            theme: 'lara-light-teal',
                            colorScheme: 'light',
                            name: t('config.teal'),
                            primary: '#14b8a6',
                            secondary: '#ffffff',
                            gradient: 'bg-gradient-to-r from-teal-500 to-teal-600',
                        },
                        {
                            theme: 'lara-dark-indigo',
                            colorScheme: 'dark',
                            name: t('config.indigo'),
                            primary: '#6366f1',
                            secondary: '#1e1e1e',
                            gradient: 'bg-gradient-to-r from-indigo-600 to-indigo-700',
                        },
                        {
                            theme: 'lara-dark-blue',
                            colorScheme: 'dark',
                            name: t('config.blue'),
                            primary: '#3b82f6',
                            secondary: '#1e1e1e',
                            gradient: 'bg-gradient-to-r from-blue-600 to-blue-700',
                        },
                        {
                            theme: 'lara-dark-purple',
                            colorScheme: 'dark',
                            name: t('config.purple'),
                            primary: '#8b5cf6',
                            secondary: '#1e1e1e',
                            gradient: 'bg-gradient-to-r from-purple-600 to-purple-700',
                        },
                        {
                            theme: 'lara-dark-teal',
                            colorScheme: 'dark',
                            name: t('config.teal'),
                            primary: '#14b8a6',
                            secondary: '#1e1e1e',
                            gradient: 'bg-gradient-to-r from-teal-600 to-teal-700',
                        },
                    ]}
                />
            </div>

            <div className="config-tab-toggle">
                <button ref={menubuttonRef} type="button" className="p-link toggle-button">
                    <Link href="/settings">{t('config.moreSettings')}</Link>
                </button>
            </div>
        </div>
    );
};

export default AppConfigbar;
