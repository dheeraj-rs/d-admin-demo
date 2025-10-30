'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
const ElementCodeEditor = dynamic(() => import('../../../../components/elements/ElementCodeEditor'), {
    ssr: false,
});

export default function ECodePage() {
    const params = useParams();
    const id = params.id as string;

    return <ElementCodeEditor id={id} />;
}
