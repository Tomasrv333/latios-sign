
'use client';

import { Card, Button } from "@latios/ui";
import { Plus, FileText, CheckCircle, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Document {
    id: string;
    status: 'SENT' | 'COMPLETED';
    recipientName: string;
    recipientEmail: string;
    sentAt: string;
    signedAt?: string;
    token: string;
    template: {
        name: string;
    };
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        fetch('/api/documents', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setDocuments(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const stats = {
        sent: documents.length,
        completed: documents.filter(d => d.status === 'COMPLETED').length,
        pending: documents.filter(d => d.status === 'SENT').length,
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
                    <p className="text-gray-500">Gestiona y envía tus documentos para firma.</p>
                </div>
                <Link href="/dashboard/documents/create">
                    <Button size="md">
                        <Plus size={18} />
                        Crear Documento
                    </Button>
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Enviados">
                    <p className="text-3xl font-bold text-brand-600">{stats.sent}</p>
                    <p className="text-sm text-gray-500 mt-2">Documentos enviados</p>
                </Card>
                <Card title="Firmados">
                    <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                    <p className="text-sm text-gray-500 mt-2">Completados</p>
                </Card>
                <Card title="Pendientes">
                    <p className="text-3xl font-bold text-orange-500">{stats.pending}</p>
                    <p className="text-sm text-gray-500 mt-2">Esperando firma</p>
                </Card>
            </div>

            <Card title="Lista de Documentos">
                {documents.length === 0 ? (
                    <div className="text-gray-500 text-center py-12">
                        <p className="mb-4">No has creado ningún documento aún.</p>
                        <Link href="/dashboard/documents/create">
                            <Button variant="secondary">Crear mi primer documento</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Documento / Plantilla</th>
                                    <th className="px-6 py-3">Estado</th>
                                    <th className="px-6 py-3">Destinatario</th>
                                    <th className="px-6 py-3">Fecha Envío</th>
                                    <th className="px-6 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {documents.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50 bg-white transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <FileText size={16} className="text-gray-400" />
                                                {doc.template?.name || 'Documento sin nombre'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.status === 'COMPLETED'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {doc.status === 'COMPLETED' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                {doc.status === 'COMPLETED' ? 'Firmado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900">{doc.recipientName}</span>
                                                <span className="text-gray-500 text-xs">{doc.recipientEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(doc.sentAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a
                                                href={`/sign/${doc.token}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-brand-600 hover:text-brand-800 font-medium inline-flex items-center gap-1 hover:underline"
                                            >
                                                Ver
                                                <ExternalLink size={14} />
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
