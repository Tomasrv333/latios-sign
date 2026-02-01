'use client';

import { Card, Button } from "@latios/ui";
import { Plus, FileText, CheckCircle, Clock, ExternalLink, Filter, Layers, Users, Ban, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import DocumentActions from "@/components/dashboard/documents/DocumentActions";
import DocumentAuditModal from "@/components/dashboard/documents/DocumentAuditModal";

interface Document {
    id: string;
    status: 'SENT' | 'COMPLETED' | 'VOIDED';
    recipientName: string;
    recipientEmail: string;
    sentAt: string;
    signedAt?: string;
    token: string;
    template: {
        name: string;
        process?: {
            name: string;
        }
    };
    user?: {
        process?: {
            name: string;
        }
    };
}

type GroupBy = 'none' | 'template' | 'process';

export default function DocumentsClient() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [groupBy, setGroupBy] = useState<GroupBy>('none');

    // Modal State
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [isAuditOpen, setIsAuditOpen] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = () => {
        setLoading(true);
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
    };

    const handleVoid = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas anular este documento? El destinatario ya no podrá firmarlo.')) return;

        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`/api/documents/${id}/void`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchDocuments(); // Refresh
            } else {
                alert('Error al anular el documento');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este documento? Esta acción no se puede deshacer.')) return;

        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`/api/documents/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setDocuments(prev => prev.filter(d => d.id !== id));
            } else {
                alert('Error al eliminar el documento');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const stats = {
        sent: documents.length,
        completed: documents.filter(d => d.status === 'COMPLETED').length,
        pending: documents.filter(d => d.status === 'SENT').length,
    };

    const groupedDocuments = () => {
        if (groupBy === 'none') return { 'Todos los Documentos': documents };

        return documents.reduce((acc, doc) => {
            let key = 'Otros';
            if (groupBy === 'template') {
                key = doc.template?.name || 'Sin Plantilla';
            } else if (groupBy === 'process') {
                key = doc.template?.process?.name || doc.user?.process?.name || 'Sin Equipo';
            }

            if (!acc[key]) acc[key] = [];
            acc[key].push(doc);
            return acc;
        }, {} as Record<string, Document[]>);
    };

    const renderDocumentRow = (doc: Document) => (
        <tr key={doc.id} className="hover:bg-gray-50 bg-white transition-colors">
            <td className="px-6 py-4 font-medium text-gray-900">
                <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" />
                    <div>
                        <p>{doc.template?.name || 'Documento sin nombre'}</p>
                        {groupBy !== 'process' && doc.template?.process?.name && (
                            <p className="text-xs text-gray-400 font-normal">{doc.template.process.name}</p>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        doc.status === 'VOIDED' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                    }`}>
                    {doc.status === 'COMPLETED' ? <CheckCircle size={12} /> :
                        doc.status === 'VOIDED' ? <Ban size={12} /> :
                            <Clock size={12} />}
                    {doc.status === 'COMPLETED' ? 'Firmado' :
                        doc.status === 'VOIDED' ? 'Anulado' :
                            'Pendiente'}
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
                <div className="flex justify-end">
                    <DocumentActions
                        document={doc}
                        onViewInfo={() => {
                            setSelectedDocId(doc.id);
                            setIsAuditOpen(true);
                        }}
                        onVoid={() => handleVoid(doc.id)}
                        onDelete={() => handleDelete(doc.id)}
                    />
                </div>
            </td>
        </tr>
    );

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

            {/* Stats Cards */}
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

            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-200 shadow-sm w-fit">
                <span className="text-sm font-medium text-gray-500 pl-2 flex items-center gap-2">
                    <Filter size={14} />
                    Agrupar por:
                </span>
                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                    <button
                        onClick={() => setGroupBy('none')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${groupBy === 'none' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Ninguno
                    </button>
                    <button
                        onClick={() => setGroupBy('template')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${groupBy === 'template' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <Layers size={14} />
                        Plantilla
                    </button>
                    <button
                        onClick={() => setGroupBy('process')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${groupBy === 'process' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <Users size={14} />
                        Equipo
                    </button>
                </div>
            </div>

            {/* Content Groups */}
            <div className="space-y-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                        <p className="mt-2 text-gray-500">Cargando documentos...</p>
                    </div>
                ) : documents.length === 0 ? (
                    <Card title="Lista de Documentos">
                        <div className="text-gray-500 text-center py-12">
                            <p className="mb-4">No has creado ningún documento aún.</p>
                            <Link href="/dashboard/documents/create">
                                <Button variant="secondary">Crear mi primer documento</Button>
                            </Link>
                        </div>
                    </Card>
                ) : (
                    Object.entries(groupedDocuments()).map(([groupName, groupDocs]) => (
                        <Card key={groupName} title={groupBy !== 'none' ? groupName : 'Lista de Documentos'}>
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
                                        {groupDocs.map(renderDocumentRow)}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Modals */}
            {selectedDocId && (
                <DocumentAuditModal
                    documentId={selectedDocId}
                    isOpen={isAuditOpen}
                    onClose={() => setIsAuditOpen(false)}
                />
            )}
        </div>
    );
}
