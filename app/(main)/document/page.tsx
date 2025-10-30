'use client';
import dynamic from 'next/dynamic';
import DocumentManager from './components/DocumentManager';
const Maintenance = dynamic(() => import('../../../components/error-pages/maintenance'), {
    ssr: false,
});
export default function DocumentManagerPage() {
    return <DocumentManager />;
}
