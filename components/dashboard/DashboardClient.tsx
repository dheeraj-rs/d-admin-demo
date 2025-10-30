'use client';

import DasboardError from '../error-pages/DasboardError';
import SpinningLoader from '../sample/Loader/SpinningLoader';
import AppFooter from '../../layout/AppFooter';
import { DashboardService } from '../../service/DashboardService';
import { DashboardData } from '../../types/dashboard';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../../lib/i18n';

interface DashboardClientProps {
    initialData?: DashboardData | null;
}

const DashboardClient: React.FC<DashboardClientProps> = ({ initialData }) => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(initialData || null);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<{ type: string; message: string } | null>(null);
    const [animationReady, setAnimationReady] = useState(false);
    const dashboardRef = useRef(null);
    const hasFetchedData = useRef(!!initialData);
    const { t } = useLanguage();

    useEffect(() => {
        // If we have initial data, skip fetching
        if (initialData) {
            setLoading(false);
            setTimeout(() => {
                setAnimationReady(true);
            }, 100);
            return;
        }

        // Prevent duplicate API calls
        if (hasFetchedData.current) {
            return;
        }

        hasFetchedData.current = true;
        setLoading(true);

        DashboardService?.getDashboardData()
            .then((data) => {
                setDashboardData(data);
                setError(null);
                setLoading(false);

                // Delay animation start to ensure DOM is ready
                setTimeout(() => {
                    setAnimationReady(true);
                }, 100);
            })
            .catch((error) => {
                console.error('Error fetching dashboard data:', error);
                let errorMessage = t('dashboard.error.loadData');
                let errorType = 'general';

                if (error instanceof SyntaxError && error.message.includes('JSON')) {
                    errorType = 'json';
                    errorMessage = t('dashboard.error.invalidData');
                } else if (error.message === 'Failed to fetch') {
                    errorType = 'network';
                    errorMessage = t('dashboard.error.network');
                } else if (error.status === 401) {
                    errorType = 'auth';
                    errorMessage = t('dashboard.error.auth');
                }

                setError({ type: errorType, message: errorMessage });
                setLoading(false);
            });
    }, [initialData, t]);

    if (loading) {
        return <SpinningLoader />;
    }

    if (error || !dashboardData) {
        return (
            <div className="dashboard-error-wrapper">
                <DasboardError error={error} />
            </div>
        );
    }

    const websiteData = dashboardData?.websiteInventory?.liveWebsites;
    const performanceData = dashboardData?.performanceAnalytics?.websiteTraffic;
    const userEngagement = dashboardData?.userEngagement;
    const systemNotifications = dashboardData?.systemMonitoring?.notifications?.recent;

    return (
        <div className="children__wrapper">
            <div className="dashboard-wrapper">
                <div className="dashboard" ref={dashboardRef}>
                    <div className={`dashboard__container ${animationReady ? 'animate-cards' : 'pre-animation'}`}>
                        {/* Website Inventory Overview */}
                        <Link href="/webconfig/live" className="dashboard-card" data-card-index="0">
                            <div className="card-header">
                                <div>
                                    <span className="card-label">{t('dashboard.liveWebsites')}</span>
                                    <div className="card-value">{websiteData?.total}</div>
                                </div>
                                <div className="icon-container blue">
                                    <i className="pi pi-globe icon blue" />
                                </div>
                            </div>
                            <span className="highlight-text">{websiteData?.newSites} {t('dashboard.new')} </span>
                            <span className="secondary-text">{t('dashboard.active')}: {websiteData?.activePercentage}%</span>
                        </Link>

                        {/* Performance Metrics */}
                        <div className="dashboard-card" data-card-index="1">
                            <div className="card-header">
                                <div>
                                    <span className="card-label">{t('dashboard.totalVisits')}</span>
                                    <div className="card-value">{performanceData?.overallMetrics?.totalVisits?.toLocaleString()}</div>
                                </div>
                                <div className="icon-container orange">
                                    <i className="pi pi-chart-line icon orange" />
                                </div>
                            </div>
                            <span className="highlight-text">{performanceData?.overallMetrics?.uniqueVisitors?.toLocaleString()} </span>
                            <span className="secondary-text">{t('dashboard.uniqueVisitors')}</span>
                        </div>

                        {/* User Engagement */}
                        <Link href="/webconfig/portfolio" className="dashboard-card" data-card-index="2">
                            <div className="card-header">
                                <div>
                                    <span className="card-label">{t('dashboard.portfolio')}</span>
                                    <div className="card-value">{userEngagement?.portfolio?.newSites}</div>
                                </div>
                                <div className="icon-container cyan">
                                    <i className="pi pi-clock icon cyan" />
                                </div>
                            </div>
                            <span className="secondary-text">{t('dashboard.totalSites')} </span>
                            <span className="highlight-text">{userEngagement?.portfolio?.total?.toLocaleString()} </span>
                        </Link>

                        {/* System Notifications */}
                        <div className="dashboard-card" data-card-index="3">
                            <div className="card-header">
                                <div>
                                    <span className="card-label">{t('dashboard.notifications')}</span>
                                    <div className="card-value">{systemNotifications?.length}</div>
                                </div>
                                <div className="icon-container purple">
                                    <i className="pi pi-bell icon purple" />
                                </div>
                            </div>
                            <span className="highlight-text">{systemNotifications?.filter((n) => n.priority === 'high').length} {t('dashboard.highPriority')} </span>
                            <span className="secondary-text">{t('dashboard.recentAlerts')}</span>
                        </div>

                        {/* Website Categories */}
                        <div className="trend-card" data-card-index="4">
                            <div className="trend-card-header">
                                <div className="icon-container-alt blue">
                                    <i className="pi pi-bookmark icon blue" />
                                </div>
                                <div className="trend-meta">
                                    <span className="trend-label">{t('dashboard.topCategories')}</span>
                                    <span className="trend-sublabel">{dashboardData?.websiteInventory?.templateLibrary?.total} {t('dashboard.templates')}</span>
                                </div>
                            </div>
                            <div className="trend-value">
                                {dashboardData?.websiteInventory?.templateLibrary?.topCategories?.slice(0, 2).map((category, index) => (
                                    <span key={index}>
                                        {t(`dashboard.category.${category.toLowerCase()}`)}
                                        {index < 1 && ', '}
                                    </span>
                                ))}
                            </div>
                            <div className="trend-footer">
                                <i className="pi pi-arrow-up icon-small green" />
                                <span className="trend-status green">{t('dashboard.growingCategories')}</span>
                            </div>
                        </div>

                        {/* Traffic Sources */}
                        <div className="trend-card" data-card-index="5">
                            <div className="trend-card-header">
                                <div className="icon-container-alt green">
                                    <i className="pi pi-chart-bar icon green" />
                                </div>
                                <div className="trend-meta">
                                    <span className="trend-label">{t('dashboard.trafficSource')}</span>
                                    <span className="trend-sublabel">{performanceData?.overallMetrics?.trafficSources?.organic}% {t('dashboard.organic')}</span>
                                </div>
                            </div>
                            <div className="trend-value">{t('dashboard.organicSearch')}</div>
                            <div className="trend-footer">
                                <i className="pi pi-arrow-up icon-small green" />
                                <span className="trend-status green">{t('dashboard.leadingChannel')}</span>
                            </div>
                        </div>

                        {/* Device Usage */}
                        <div className="trend-card" data-card-index="6">
                            <div className="trend-card-header">
                                <div className="icon-container-alt purple">
                                    <i className="pi pi-desktop icon purple" />
                                </div>
                                <div className="trend-meta">
                                    <span className="trend-label">{t('dashboard.websiteVisited')}</span>
                                    <span className="trend-sublabel">{performanceData?.overallMetrics?.deviceBreakdown?.desktop}% {t('dashboard.desktop')}</span>
                                </div>
                            </div>
                            <div className="trend-value">{t('dashboard.desktopDominant')}</div>
                            <div className="trend-footer">
                                <i className="pi pi-desktop icon-small purple" />
                                <span className="trend-status purple">{t('dashboard.primaryPlatform')}</span>
                            </div>
                        </div>

                        {/* User Satisfaction */}
                        <div className="trend-card" data-card-index="7">
                            <div className="trend-card-header">
                                <div className="icon-container-alt orange">
                                    <i className="pi pi-star-fill icon orange" />
                                </div>
                                <div className="trend-meta">
                                    <span className="trend-label">{t('dashboard.elementVisited')}</span>
                                    <span className="trend-sublabel">{dashboardData?.systemMonitoring?.userSatisfaction?.recommendationRate}% {t('dashboard.recommended')}</span>
                                </div>
                            </div>
                            <div className="trend-value">{t('dashboard.highSatisfaction')}</div>
                            <div className="trend-footer">
                                <i className="pi pi-thumbs-up icon-small orange" />
                                <span className="trend-status orange">{t('dashboard.recommended')}</span>
                            </div>
                        </div>

                        {/* Left Column */}
                        <div className="dashboard-column" data-card-index="8">
                            {/* Download Activity */}
                            <div className="dashboard-panel">
                                <h5 className="panel-title">{t('dashboard.downloadActivity')}</h5>
                                <ul className="activity-list">
                                    {userEngagement?.downloadActivity?.map((activity, index) => (
                                        <li key={index} className="download-item">
                                            <div className="download-type">{t(`dashboard.download.${activity.type.toLowerCase()}`)}</div>
                                            <div className="progress-container">
                                                <div className="progress-bar-bg">
                                                    <div className={`progress-bar ${activity.color}`} style={{ width: `${activity.percentage}%` }} />
                                                </div>
                                                <span className={`progress-value ${activity.color}`}>{activity.percentage}%</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Visited Cards Section */}
                            <div className="visited-cards">
                                <div className="visited-grid">
                                    {/* Website Visited Card */}
                                    <div className="visited-card">
                                        <div className="card-header">
                                            <div>
                                                <span className="card-label">{t('dashboard.websiteVisited')}</span>
                                                <div className="card-value">{performanceData?.overallMetrics?.deviceBreakdown?.desktop}%</div>
                                            </div>
                                            <div className="icon-container purple">
                                                <i className="pi pi-desktop icon purple" />
                                            </div>
                                        </div>
                                        <span className="highlight-text">{t('dashboard.desktopDominant')}</span>
                                        <span className="secondary-text">{t('dashboard.primaryPlatform')}</span>
                                    </div>

                                    {/* Element Visited Card */}
                                    <div className="visited-card">
                                        <div className="card-header">
                                            <div>
                                                <span className="card-label">{t('dashboard.elementVisited')}</span>
                                                <div className="card-value">{dashboardData?.systemMonitoring?.userSatisfaction?.recommendationRate}%</div>
                                            </div>
                                            <div className="icon-container orange">
                                                <i className="pi pi-star-fill icon orange" />
                                            </div>
                                        </div>
                                        <span className="highlight-text">{t('dashboard.highSatisfaction')}</span>
                                        <span className="secondary-text">{t('dashboard.recommended')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="dashboard-column" data-card-index="9">
                            <div className="visited-cards">
                                <div className="visited-grid">
                                    {/* Website Visited Card */}
                                    <div className="visited-card">
                                        <div className="card-header">
                                            <div>
                                                <span className="card-label">{t('dashboard.websiteVisited')}</span>
                                                <div className="card-value">{performanceData?.overallMetrics?.deviceBreakdown?.desktop}%</div>
                                            </div>
                                            <div className="icon-container purple">
                                                <i className="pi pi-desktop icon purple" />
                                            </div>
                                        </div>
                                        <span className="highlight-text">{t('dashboard.desktopDominant')}</span>
                                    </div>

                                    {/* Element Visited Card */}
                                    <div className="visited-card">
                                        <div className="card-header">
                                            <div>
                                                <span className="card-label">{t('dashboard.elementVisited')}</span>
                                                <div className="card-value">{dashboardData?.systemMonitoring?.userSatisfaction?.recommendationRate}%</div>
                                            </div>
                                            <div className="icon-container orange">
                                                <i className="pi pi-star-fill icon orange" />
                                            </div>
                                        </div>
                                        <span className="highlight-text">{t('dashboard.highSatisfaction')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notifications */}
                            <div className="dashboard-panel">
                                <h5 className="panel-title">{t('dashboard.systemNotifications')}</h5>
                                <ul className="activity-list">
                                    {systemNotifications && systemNotifications.length ? (
                                        systemNotifications.map((notification: any) => (
                                            <li key={notification.id} className="notification-item">
                                                <div className={`notification-icon-container ${notification.type === 'Error' ? 'red' : 'blue'}`}>
                                                    <i className={`pi ${notification.icon} icon ${notification.type === 'Error' ? 'red' : 'blue'}`} />
                                                </div>
                                                <span className="notification-content">
                                                    {(() => {
                                                        const message = notification.message.toLowerCase();
                                                        if (message.includes('website published')) {
                                                            return t('dashboard.notification.websitePublished');
                                                        } else if (message.includes('template updated')) {
                                                            return t('dashboard.notification.templateUpdated');
                                                        } else if (message.includes('issue resolved')) {
                                                            return t('dashboard.notification.issueResolved');
                                                        }
                                                        return notification.message;
                                                    })()}
                                                    <span className="notification-timestamp">{new Date(notification.timestamp).toLocaleString()}</span>
                                                </span>
                                            </li>
                                        ))
                                    ) : (
                                        <div className="no-data">
                                            <i className="pi pi-check-circle no-data-icon"></i>
                                            <span>{t('dashboard.noNotifications')}</span>
                                        </div>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Issue Tracking Overview */}
                        <div className="issue-tracking-section" data-card-index="10">
                            <div className="dashboard-panel">
                                <div className="issue-grid">
                                    {/* Issue Status */}
                                    <div className="issue-card">
                                        <div className="issue-card-header">
                                            <div>
                                                <span className="issue-label">{t('dashboard.totalIssues')}</span>
                                                <div className="issue-value">{dashboardData?.performanceAnalytics?.issueTracking?.issueStatus?.total}</div>
                                            </div>
                                            <div className="icon-container red">
                                                <i className="pi pi-exclamation-circle icon red" />
                                            </div>
                                        </div>
                                        <span className="issue-highlight">
                                            {dashboardData?.performanceAnalytics?.issueTracking?.issueStatus?.resolved} {t('dashboard.resolved')}
                                        </span>
                                    </div>

                                    {/* Critical Issues */}
                                    <div className="issue-card">
                                        <div className="issue-card-header">
                                            <div>
                                                <span className="issue-label">{t('dashboard.criticalIssues')}</span>
                                                <div className="issue-value">
                                                    {dashboardData?.performanceAnalytics?.issueTracking?.severityBreakdown?.critical}
                                                </div>
                                            </div>
                                            <div className="icon-container yellow">
                                                <i className="pi pi-bolt icon yellow" />
                                            </div>
                                        </div>
                                        <span className="issue-meta">
                                            {t('dashboard.averageResolution')}: {dashboardData?.performanceAnalytics?.issueTracking?.resolutionTimeline?.average}
                                        </span>
                                    </div>

                                    {/* System Health */}
                                    <div className="issue-card">
                                        <div className="issue-card-header">
                                            <div>
                                                <span className="issue-label">{t('dashboard.systemUptime')}</span>
                                                <div className="issue-value">{dashboardData?.systemMonitoring?.healthMetrics?.uptime}</div>
                                            </div>
                                            <div className="icon-container green">
                                                <i className="pi pi-check-circle icon green" />
                                            </div>
                                        </div>
                                        <span className="issue-meta">{t('dashboard.responseTime')}: {dashboardData?.systemMonitoring?.healthMetrics?.responseTime}</span>
                                    </div>

                                    {/* Server Load */}
                                    <div className="issue-card">
                                        <div className="issue-card-header">
                                            <div>
                                                <span className="issue-label">{t('dashboard.serverLoad')}</span>
                                                <div className="issue-value">{dashboardData?.systemMonitoring?.healthMetrics?.serverLoad}</div>
                                            </div>
                                            <div className="icon-container purple">
                                                <i className="pi pi-server icon purple" />
                                            </div>
                                        </div>
                                        <span className="issue-meta">{t('dashboard.criticalAlerts')}: {dashboardData?.systemMonitoring?.healthMetrics?.criticalAlerts}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <AppFooter />
            </div>
        </div>
    );
};

export default DashboardClient; 