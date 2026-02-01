import { Metadata } from 'next';
import TemplatesClient from './TemplatesClient';

export const metadata: Metadata = {
    title: 'Plantillas',
};

export default function TemplatesPage() {
    return <TemplatesClient />;
}
