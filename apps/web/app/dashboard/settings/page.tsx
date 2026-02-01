import { Metadata } from 'next';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
    title: 'Ajustes',
};

export default function SettingsPage() {
    return <SettingsClient />;
}
