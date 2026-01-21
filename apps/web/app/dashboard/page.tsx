'use client';

import Link from "next/link";
import { Card, Button } from "@latios/ui";
import { useEffect, useState } from "react";
import { FileText, CheckCircle, Clock, Plus } from "lucide-react"; // Added Plus

export default function DashboardPage() {
    // ... state ...
    const [user, setUser] = useState<{ name: string } | null>(null);
    const [stats, setStats] = useState({
        sent: 0,
        completed: 0,
        pending: 0,
        templates: 0,
        recent: [] as any[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ... useEffect content
        const token = localStorage.getItem('accessToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        Promise.all([
            fetch('/api/auth/me', { headers }).then(res => res.json()),
            fetch('/api/documents/stats', { headers }).then(res => res.json())
        ]).then(([userData, statsData]) => {
            if (userData && !userData.error) setUser(userData);
            if (statsData) setStats(statsData);
            setLoading(false);
        }).catch(err => {
            console.error("Dashboard Load Error", err);
            setLoading(false);
        });
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Bienvenido de nuevo, {user?.name?.split(' ')[0] || 'Usuario'} 👋
                    </h2>
                    <p className="text-gray-500">Aquí tienes un resumen de tu actividad.</p>
                </div>
                <Link href="/dashboard/documents/create">
                    <Button size="md">
                        <Plus size={18} />
                        Crear Documento
                    </Button>
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Documentos Enviados">
                    <p className="text-3xl font-bold text-brand-600">{stats.sent}</p>
                    <p className="text-sm text-gray-500 mt-2">Total de documentos</p>
                </Card>
                <Card title="Pendientes de Firma">
                    <p className="text-3xl font-bold text-orange-500">{stats.pending}</p>
                    <p className="text-sm text-gray-500 mt-2">Requieren atención</p>
                </Card>
                <Card title="Plantillas Activas">
                    <p className="text-3xl font-bold text-gray-700">{stats.templates}</p>
                    <p className="text-sm text-gray-500 mt-2">Listas para usar</p>
                </Card>
            </div>

            <Card title="Actividad Reciente">
                {stats.recent.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                        No hay actividad reciente para mostrar.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {stats.recent.map((doc) => (
                            <div key={doc.id} className="py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${doc.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {doc.status === 'COMPLETED' ? <CheckCircle size={18} /> : <Clock size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{doc.template?.name || 'Documento'}</p>
                                        <p className="text-sm text-gray-500">Enviado a {doc.recipientName}</p>
                                    </div>
                                </div>
                                <div className="text-right text-sm">
                                    <p className={`font-medium ${doc.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'}`}>
                                        {doc.status === 'COMPLETED' ? 'Firmado' : 'Pendiente'}
                                    </p>
                                    <p className="text-gray-400">{new Date(doc.sentAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
