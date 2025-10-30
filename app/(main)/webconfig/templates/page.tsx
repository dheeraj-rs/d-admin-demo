'use client';
import dynamic from 'next/dynamic';
const Maintenance = dynamic(() => import('../../../../components/error-pages/maintenance'), {
    ssr: false,
});
export default function MaintenancePage() {
    return <Maintenance />;
}
