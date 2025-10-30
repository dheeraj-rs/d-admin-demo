'use client';
import dynamic from 'next/dynamic';
const ElementCodeEditor = dynamic(() => import('../../../components/elements/ElementCodeEditor'), {
    ssr: false,
});

export default function AddElementsPage() {
    return <ElementCodeEditor />;
}
