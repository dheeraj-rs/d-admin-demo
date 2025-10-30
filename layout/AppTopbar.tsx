import { classNames } from '../lib/utils';
import { AppTopbarRef } from '../types';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { LayoutContext } from './context/LayoutContext';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../lib/i18n';
import { getCurrentUser } from '../lib/permissions';
import { performLogout } from '../lib/auth-logout';
import authFetch from '../lib/auth-fetch';
import { safeJsonParse } from '../lib/safe-fetch';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, onConfigToggle, onBottombarToggle, showProfileSidebar, onTopbarToggle } = useContext(LayoutContext);
    const { logout: oldLogout, user: oldUser } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();

    // Check both auth systems
    const superAdminUser = getCurrentUser();
    const user = superAdminUser || oldUser;

    const logout = async () => {
        console.log('🔓 Logout initiated from AppTopbar');
        console.log('Current user:', user);
        
        try {
            console.log('🔄 Calling logout API...');
            
            // Call simple logout API and WAIT for completion
            const response = await fetch('/api/auth/simple-logout', {
                method: 'POST',
            });
            
            const data = await response.json();
            console.log('✅ Logout API response:', data);
            
            // Clear ALL client-side data
            localStorage.clear();
            sessionStorage.clear();
            
            // Set logout flags to prevent auto-login
            localStorage.setItem('prevent_auto_login', 'true');
            sessionStorage.setItem('logout_performed', 'true');
            
            console.log('✅ User logged out, redirecting to home...');
            
            // Redirect to home with full page reload
            window.location.href = '/';
        } catch (error) {
            console.error('❌ Logout error:', error);
            // Even if API fails, force logout on client side
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/';
        }
    };
    const topbarRef = useRef<HTMLDivElement>(null);
    const menubuttonRef = useRef<HTMLButtonElement>(null);
    const profileMenuButtonRef = useRef<HTMLButtonElement>(null);
    const topbarmenuRef = useRef<HTMLDivElement>(null);
    const topbarmenubuttonRef = useRef<HTMLButtonElement>(null);
    const pathname = usePathname();
    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    const [showMessageDropdown, setShowMessageDropdown] = useState(false);
    const messageDropdownRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const loginButtonRef = useRef<HTMLButtonElement>(null);

    const [currentUser, setCurrentUser] = useState<any>(null);

    // Fetch current user on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/user');
                const data = await response.json();
                if (data.success && data.user) {
                    setCurrentUser(data.user);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, []);

    // Override user with currentUser if available
    const displayUser = currentUser || user;

    useEffect(() => {
        setIsMounted(true);
        fetchMessages();

        // Auto-refresh messages every 60 seconds (only when page is visible)
        const interval = setInterval(() => {
            if (!document.hidden) {
                fetchMessages();
            }
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // Load Google One Tap script
    useEffect(() => {
        const loadGoogleScript = () => {
            if (window.google?.accounts?.id) {
                setGoogleScriptLoaded(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                setGoogleScriptLoaded(true);
            };
            document.body.appendChild(script);
        };

        loadGoogleScript();
    }, []);

    // Initialize Google One Tap when user is not logged in and script is loaded
    useEffect(() => {
        // Check if user is logged in via cookies as well
        const hasAuthCookie = document.cookie.includes('auth_token=') || document.cookie.includes('user_token=');
        if (!googleScriptLoaded || displayUser || hasAuthCookie) return;

        // IMPORTANT: Check if user just logged out - prevent auto-login
        const preventAutoLogin = localStorage.getItem('prevent_auto_login') === 'true';
        const justLoggedOut = sessionStorage.getItem('logout_performed') === 'true';
        
        if (preventAutoLogin || justLoggedOut) {
            console.log('🚫 Auto-login prevented - user logged out');
            // Clear the flags after 2 seconds to allow manual login
            setTimeout(() => {
                localStorage.removeItem('prevent_auto_login');
                sessionStorage.removeItem('logout_performed');
                console.log('✅ Auto-login prevention cleared - manual login allowed');
            }, 2000);
            return;
        }

        // Suppress Google OAuth and FedCM errors in console
        const originalError = console.error;
        const suppressedErrors = [
            'FedCM', 
            'NetworkError', 
            'GSI_LOGGER',
            'The given origin is not allowed',
            'Not a valid origin for the client',
            'popup_closed_by_user'
        ];

        console.error = (...args: any[]) => {
            const errorMsg = args.join(' ');
            const shouldSuppress = suppressedErrors.some(err => errorMsg.includes(err));
            if (!shouldSuppress) {
                originalError.apply(console, args);
            }
        };

        const initializeGoogleOneTap = () => {
            if (!window.google?.accounts?.id) {
                setTimeout(initializeGoogleOneTap, 100);
                return;
            }

            try {
                window.google.accounts.id.initialize({
                    client_id: '810166744861-oe506bicohrjcnh8i0f516n7s4oah6lb.apps.googleusercontent.com',
                    callback: handleGoogleCallback,
                    ux_mode: 'popup',
                    auto_select: false, // DISABLE auto-login to prevent automatic re-login after logout
                    cancel_on_tap_outside: true,
                    itp_support: true,
                    use_fedcm_for_prompt: false,
                });

                // Show the Google One Tap prompt (appears in top-right corner)
                // Only show if not recently logged out
                setTimeout(() => {
                    try {
                        const stillPreventAutoLogin = localStorage.getItem('prevent_auto_login') === 'true';
                        if (window.google?.accounts?.id && !stillPreventAutoLogin) {
                            (window.google.accounts.id as any).prompt?.((notification: any) => {
                                // Handle prompt dismissal silently
                                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                                    // Silently ignore - user dismissed or already logged in
                                }
                            });
                        }
                    } catch (promptError) {
                        // Silently handle prompt errors (e.g., origin not allowed)
                    }
                }, 500);
            } catch (error) {
                // Silently handle initialization errors
            }
        };

        initializeGoogleOneTap();

        return () => {
            // Restore original console.error
            console.error = originalError;

            // Cancel any pending prompts
            if (window.google?.accounts?.id) {
                try {
                    (window.google.accounts.id as any).cancel?.();
                } catch (e) {
                    // Ignore if method doesn't exist
                }
            }
        };
    }, [googleScriptLoaded, displayUser]);

    const handleGoogleCallback = async (response: any) => {
        try {
            const credential = response.credential;
            const payload = JSON.parse(atob(credential.split('.')[1]));

            const loginResponse = await fetch('/api/auth/simple-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    googleId: payload.sub,
                    email: payload.email,
                    name: payload.name,
                    profilePicture: payload.picture,
                }),
            });

            const data = await loginResponse.json();

            if (data.success) {
                // Close modal if open
                setShowLoginModal(false);
                // Reload page to show logged-in state
                window.location.reload();
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
        }
    };

    const handleLoginClick = () => {
        setShowLoginModal(true);

        // Render Google button after modal opens
        setTimeout(() => {
            if (window.google?.accounts?.id) {
                const buttonElement = document.getElementById('google-signin-button-dropdown');
                if (buttonElement) {
                    window.google.accounts.id.renderButton(buttonElement, {
                        theme: 'filled_blue',
                        size: 'large',
                        text: 'signin_with',
                        shape: 'rectangular',
                        width: 300,
                    });
                }
            }
        }, 100);
    };

    const fetchMessages = async () => {
        try {
            const response = await authFetch('/api/messages?limit=5&unreadOnly=false');
            const data = await safeJsonParse(response);
            if (data.success && data.data) {
                setMessages(data.data);
                setUnreadCount(data.data.filter((msg: any) => !msg.isRead).length);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleMarkAsRead = async (messageId: string, link?: string) => {
        try {
            await fetch(`/api/messages/${messageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isRead: true })
            });
            fetchMessages();

            // Navigate to link if provided
            if (link) {
                setShowMessageDropdown(false);
                router.push(link);
            }
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const handleClearAll = async () => {
        try {
            await fetch('/api/messages/mark-all-read', {
                method: 'POST'
            });
            fetchMessages();
        } catch (error) {
            console.error('Error clearing messages:', error);
        }
    };

    const formatTimestamp = (timestamp: Date) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    useImperativeHandle(ref, () => ({
        topbarElement: topbarRef.current,
        menubutton: menubuttonRef.current,
        profileMenuButton: profileMenuButtonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current,
    }));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Check if click is outside dropdown and not on the notification button
            if (
                messageDropdownRef.current &&
                !messageDropdownRef.current.contains(target) &&
                !target.closest('.topbar-notification-btn') &&
                showMessageDropdown
            ) {
                setShowMessageDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMessageDropdown]);

    return (
        <React.Fragment>
            <nav ref={topbarRef} className="layout-topbar-main">
                <div className="topbar-start">
                    <Link href="/" className="logo-row">
                        <Image
                            src={`/layout/logo-${layoutConfig.colorScheme?.includes('dark') || layoutConfig.theme?.includes('dark') ? 'dark' : 'white'}.svg`}
                            width={40}
                            height={40}
                            alt="logo"
                            className="logo-img"
                        />
                        <span className="logo-text">
                            {'D-Admin'.split('').map((letter: string, index: number) => (
                                <span key={index}>{letter}</span>
                            ))}
                        </span>
                    </Link>
                    <div className="breadcrumb">
                        <Link href="/" className="breadcrumb-link">
                            {t('nav.dashboard')}
                        </Link>
                        {pathSegments.map((segment, index) => (
                            <React.Fragment key={index}>
                                <span className="breadcrumb-separator">/</span>
                                <Link href={'/' + pathSegments.slice(0, index + 1).join('/')} className="breadcrumb-segment">
                                    {t(`nav.${segment}`) || segment.charAt(0).toUpperCase() + segment.slice(1)}
                                </Link>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="topbar-center">
                    <div className="topbar-notification-wrapper">
                        <button
                            className="topbar-notification-btn"
                            onClick={() => setShowMessageDropdown(!showMessageDropdown)}
                            title={t('header.notifications')}
                        >
                            <i className="pi pi-bell" />
                            <span className="notification-text">{t('header.notifications')}</span>
                            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                        </button>

                        {showMessageDropdown && (
                            <div className="notification-modal" ref={messageDropdownRef}>
                                <div className="notification-modal-header">
                                    <h3>{t('header.notifications')}</h3>
                                    {unreadCount > 0 && (
                                        <button className="notification-clear-all" onClick={handleClearAll}>
                                            <i className="pi pi-check-circle" />
                                            <span>{t('actions.clear')}</span>
                                        </button>
                                    )}
                                </div>

                                <div className="notification-modal-body">
                                    {messages.length === 0 ? (
                                        <div className="notification-empty">
                                            <i className="pi pi-inbox" />
                                            <p>No notifications</p>
                                        </div>
                                    ) : (
                                        <div className="notification-list">
                                            {messages.map((message) => (
                                                <div
                                                    key={message._id}
                                                    className={`notification-item ${!message.isRead ? 'unread' : ''}`}
                                                    onClick={() => handleMarkAsRead(message._id, message.link)}
                                                    style={{ cursor: message.link ? 'pointer' : 'default' }}
                                                >
                                                    <div className="notification-icon">
                                                        <i className={message.icon || 'pi pi-bell'} />
                                                    </div>
                                                    <div className="notification-content">
                                                        <h4 className="notification-title">{message.title}</h4>
                                                        <p className="notification-desc">{message.description}</p>
                                                        <span className="notification-time">{formatTimestamp(message.timestamp)}</span>
                                                    </div>
                                                    {!message.isRead && <span className="notification-unread-dot" />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="notification-modal-footer">
                                    <Link href="/messages" onClick={() => setShowMessageDropdown(false)}>
                                        View All Messages
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="topbar-end">
                    <div
                        ref={topbarmenuRef}
                        className={classNames('layout-topbar-menu', {
                            'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible,
                        })}
                    >
                        <div className="layout-button-container">
                            <button ref={menubuttonRef} type="button" className="p-link layout-topbar-button" onClick={onMenuToggle}>
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
                                <span>{t('sidebar.collapse')}</span>
                            </button>
                            <button ref={menubuttonRef} type="button" className="p-link layout-topbar-button" onClick={onTopbarToggle}>
                                <svg viewBox="0 0 32 32" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                    <title>open-panel-top</title>
                                    <path
                                        d="M28,4H4A2,2,0,0,0,2,6V26a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4ZM28,26H4V14H28Z"
                                        fill="currentColor"
                                    ></path>
                                    <path d="M4,6h24v6H4Z" fill={layoutState.topbarAutoHide === false ? 'currentColor' : ''}></path>
                                </svg>
                                <span>{t('layout.headerStyle')}</span>
                            </button>
                            <button ref={menubuttonRef} type="button" className="p-link layout-topbar-button" onClick={onBottombarToggle}>
                                <svg viewBox="0 0 32 32" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                    <title>open-panel-bottom</title>
                                    <path
                                        d="M28,4H4A2,2,0,0,0,2,6V26a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4ZM28,18H4V6H28Z"
                                        fill="currentColor"
                                    ></path>
                                    <path d="M4,20h24v6H4Z" fill={layoutState.staticBottombarDesktopInactive === false ? 'currentColor' : ''}></path>
                                </svg>
                                <span>{t('layout.footerStyle')}</span>
                            </button>
                            <button ref={menubuttonRef} type="button" className="p-link layout-topbar-button" onClick={onConfigToggle}>
                                <svg viewBox="0 0 32 32" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                    <title>open-panel-right</title>
                                    <path
                                        d="M28,4H4A2,2,0,0,0,2,6V26a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V6A2,2,0,0,0,28,4ZM20,26H4V6H20Z"
                                        fill="currentColor"
                                    ></path>
                                    <path
                                        d="M22,6h6V26H22Z"
                                        fill={layoutState.staticConfigDesktopInactive === false && layoutConfig.menuMode === 'static' ? 'currentColor' : ''}
                                    ></path>
                                </svg>
                                <span>{t('nav.webconfig')}</span>
                            </button>
                        </div>

                        <div className="topbar-actions">
                            {/* Settings - Available for ALL logged in users */}
                            {isMounted && displayUser && (
                                <Link href="/settings">
                                    <button ref={menubuttonRef} type="button" className="p-link layout-topbar-button" title={t('nav.settings')}>
                                        <i className="pi pi-cog"></i>
                                        <span>{t('nav.settings')}</span>
                                    </button>
                                </Link>
                            )}

                            {/* Show Logout when logged in, Login when not logged in */}
                            {isMounted && displayUser ? (
                                <button type="button" className="p-link layout-topbar-button" onClick={logout} title={t('user.logout')}>
                                    <i className="pi pi-sign-out"></i>
                                    <span>{t('user.logout')}</span>
                                </button>
                            ) : isMounted ? (
                                <button ref={loginButtonRef} type="button" className="p-link layout-topbar-button" onClick={handleLoginClick} title={t('user.login')}>
                                    <i className="pi pi-user"></i>
                                    <span>{t('user.login')}</span>
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* User Profile Button - Shows Settings/Logout or Login */}
                {isMounted && (
                    <button
                        ref={profileMenuButtonRef}
                        type="button"
                        className="p-link layout-topbar-button layout-topbar-menu-button layout-topbar-user-button"
                        onClick={displayUser ? showProfileSidebar : handleLoginClick}
                        title={displayUser ? t('nav.settings') : t('user.login')}
                    >
                        <i className={displayUser ? "pi pi-user" : "pi pi-sign-in"} />
                    </button>
                )}
                <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-button layout-topbar-menu-button" onClick={onConfigToggle}>
                    <i className="pi pi-palette" />
                </button>
                <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-button layout-topbar-menu-button" onClick={onMenuToggle}>
                    <i className="pi pi-bars" />
                </button>
            </nav>
            <div className="layout-topbar-mask" />

            {/* Login Dropdown Modal */}
            {showLoginModal && (
                <>
                    <div className="login-dropdown-overlay" onClick={() => setShowLoginModal(false)} />
                    <div className="login-dropdown-modal">
                        <button className="modal-close-btn" onClick={() => setShowLoginModal(false)}>
                            <i className="pi pi-times"></i>
                        </button>

                        <div className="modal-header">
                            <h2 className="modal-title">Sign in</h2>
                            <p className="modal-subtitle">to continue to D-Admin</p>
                        </div>

                        <div className="modal-body">
                            <div id="google-signin-button-dropdown"></div>
                        </div>

                        <div className="modal-footer">
                            <a href="/privacy" target="_blank">Privacy policy</a>
                            <span>•</span>
                            <a href="/terms" target="_blank">Terms of Service</a>
                        </div>
                    </div>
                </>
            )}

            <style jsx>{`
                .login-dropdown-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: transparent;
                    z-index: 9998;
                }

                .login-dropdown-modal {
                    position: fixed;
                    top: 70px;
                    right: 20px;
                    background: var(--surface-card);
                    border-radius: var(--border-radius);
                    padding: 24px 20px;
                    width: 340px;
                    max-width: calc(100vw - 40px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                    border: 1px solid var(--surface-border);
                    z-index: 9999;
                    animation: slideDown 0.3s ease-out;
                }

                @keyframes slideDown {
                    from {
                        transform: translateY(-10px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .modal-close-btn {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: transparent;
                    border: none;
                    color: var(--text-color-secondary);
                    font-size: 1.25rem;
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 50%;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                }

                .modal-close-btn:hover {
                    background: var(--surface-hover);
                    color: var(--text-color);
                }

                .modal-header {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .modal-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--text-color);
                    margin: 0 0 4px 0;
                }

                .modal-subtitle {
                    font-size: 0.875rem;
                    color: var(--text-color-secondary);
                    margin: 0;
                }

                .modal-body {
                    margin-bottom: 16px;
                    display: flex;
                    justify-content: center;
                }

                #google-signin-button-dropdown {
                    display: flex;
                    justify-content: center;
                }


                .modal-footer {
                    text-align: center;
                    padding-top: 16px;
                    border-top: 1px solid var(--surface-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 0.75rem;
                }

                .modal-footer a {
                    color: var(--primary-color);
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .modal-footer a:hover {
                    color: var(--primary-600);
                    text-decoration: underline;
                }

                .modal-footer span {
                    color: var(--text-color-secondary);
                }

                @media (max-width: 640px) {
                    .login-dropdown-modal {
                        top: 60px;
                        right: 10px;
                        left: 10px;
                        width: auto;
                        padding: 20px 16px;
                    }

                    .modal-title {
                        font-size: 1.25rem;
                    }
                }
            `}</style>
        </React.Fragment>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;