import { Metadata } from 'next';
import TeamClient from './TeamClient';

export const metadata: Metadata = {
    title: 'Equipo',
};

export default function TeamPage() {
    return <TeamClient />;
}
