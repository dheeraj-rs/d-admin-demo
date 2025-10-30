'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import WebsiteBuilderHeader from './WebsiteBuilderHeader';
import WebsitesBuilderSidebar from './WebsitesBuilderSidebar';
import EditorCanvas from './EditorCanvas';
import ReactFlowCanvas from './ReactFlowCanvas';
import websiteBuilderStore from './store/websiteBuilderStore';
import { useWebsiteBuilderCache } from '../../hooks/useWebsiteBuilderCache';
import { pageCacheUtils, usePageCache } from '../../lib/pageCache';
import '../../styles/pages/websites/index.scss';
import '../../styles/pages/website-builder/index.scss';
import WebsiteBuilderPropertys from './WebsiteBuilderPropertys';
import WebSiteSaveModal from './WebSiteSaveModal';
import { useGetWebsite } from '../../service/SnippetService';
import SpinningLoader from '../sample/Loader/SpinningLoader';
import FileManagerPage from '../../app/(main)/folder/page';
import FolderImporter from './Importing-project/page';

interface WebsitesBuilderProps {
    id?: string;
}

// Inner component that uses useSearchParams
const WebsitesBuilderInner = ({ id }: WebsitesBuilderProps) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { canvasType, isSaveProject, isImportPanelOpen, isProjectFilesPanelOpen, setPage1SectionCodes } = websiteBuilderStore();
    const { data, isLoading, isError, error } = useGetWebsite(id || '');

    // Generate page ID for caching
    const pageId = pageCacheUtils.generatePageId(pathname, Object.fromEntries(searchParams.entries()));

    // Initialize page caching
    const { isCacheFresh, manualSave } = useWebsiteBuilderCache(pageId);

    // Check if this page already has cached data
    const { getPageCache } = usePageCache();
    const hasCache = !!getPageCache(pageId);

    useEffect(() => {
        // If cache exists, do not clear or overwrite with server data
        if (hasCache) return;

        setPage1SectionCodes([]);
        if (id && data?.data?.snippet) {
            const { snippet } = data.data;
            if (snippet && snippet.length > 0) {
                setPage1SectionCodes(snippet);
            }
        }
    }, [data, id, setPage1SectionCodes, hasCache]);

    return (
        <div className="children__fixed-h-wrapper">
            <div className="websites-builder__wrapper">
                <WebsiteBuilderHeader websiteId={id} />
                <div className="websites-builder-content">
                    <div className="sidebar-container">
                        <WebsitesBuilderSidebar />
                    </div>
                    {isLoading && id ? (
                        <div className="canvas-wrapper">
                            <SpinningLoader />
                        </div>
                    ) : isError ? (
                        <div className="error-message">{error.message}</div>
                    ) : (
                        <div className="canvas-wrapper">
                            {!isProjectFilesPanelOpen && canvasType === 'classic' && <EditorCanvas />}
                            {!isProjectFilesPanelOpen && canvasType === 'flow' && <ReactFlowCanvas />}
                            {!isImportPanelOpen && isProjectFilesPanelOpen && <FileManagerPage />}
                            {isImportPanelOpen && <FolderImporter />}
                        </div>
                    )}

                    <div className="property-sidebar-container">
                        <WebsiteBuilderPropertys />
                    </div>
                </div>
                {isSaveProject && <WebSiteSaveModal websiteId={id} />}
            </div>
        </div>
    );
};

// Wrapper component with Suspense boundary
const WebsitesBuilder = ({ id }: WebsitesBuilderProps) => {
    return (
        <Suspense fallback={<SpinningLoader />}>
            <WebsitesBuilderInner id={id} />
        </Suspense>
    );
};

export default WebsitesBuilder;
