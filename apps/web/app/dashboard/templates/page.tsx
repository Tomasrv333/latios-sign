'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, Loader2 } from 'lucide-react';

interface Template {
    id: string;
    name: string;
    description?: string;
    updatedAt: string;
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        // Direct connection to Backend
        fetch('http://127.0.0.1:3001/templates', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error('Failed to fetch templates');
            })
            .then((data) => {
                setTemplates(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault(); // Prevent navigation to edit
        e.stopPropagation();

        if (!confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://127.0.0.1:3001/templates/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete');

            setTemplates((prev) => prev.filter((t) => t.id !== id));
        } catch (error) {
            console.error(error);
            alert('Error al eliminar la plantilla');
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Mis Plantillas</h2>
                    <p className="text-gray-500">Gestiona tus plantillas de documentos reutilizables.</p>
                </div>
                <Link
                    href="/dashboard/templates/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 transition-colors"
                >
                    <Plus size={16} />
                    Nueva Plantilla
                </Link>
            </header>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-brand-600" size={32} />
                </div>
            ) : templates.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FileText className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No tienes plantillas creadas</h3>
                    <p className="text-gray-500 mt-2 mb-6">Crea tu primera plantilla para empezar a automatizar tus documentos.</p>
                    <Link
                        href="/dashboard/templates/create"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        Crear Plantilla
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group relative cursor-pointer"
                        >
                            {/* Card Content Link Wrapper */}
                            <Link href={`/dashboard/templates/${template.id}`} className="absolute inset-0 z-0" />

                            <div className="relative z-10 pointer-events-none">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-brand-50 rounded-lg">
                                        <FileText className="text-brand-600" size={24} />
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(template.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                                    {template.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                    {template.description || 'Sin descripción'}
                                </p>
                            </div>

                            <div className="relative z-10 mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                                <button
                                    onClick={(e) => handleDelete(e, template.id)}
                                    className="text-red-500 hover:text-red-700 font-medium text-xs uppercase tracking-wide px-2 py-1 rounded hover:bg-red-50 pointer-events-auto transition-colors"
                                >
                                    Eliminar
                                </button>
                                <span className="text-brand-600 font-medium hover:underline pointer-events-none">
                                    Abrir
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
