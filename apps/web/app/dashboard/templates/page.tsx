'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { FileText, Plus, Loader2, X, Trash2, Eye, Pencil } from 'lucide-react';
import { Button, Card } from '@latios/ui';
import { TemplateRenderer } from '@/components/editor/TemplateRenderer';

interface Template {
    id: string;
    name: string;
    description?: string;
    updatedAt: string;
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Preview State
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [templateStructure, setTemplateStructure] = useState<any[]>([]);
    const [loadingPreview, setLoadingPreview] = useState(false);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem('accessToken');

        // 1. Fetch User Role
        fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(user => {
                if (user && user.role) setUserRole(user.role);
            })
            .catch(err => console.error(err));

        // 2. Fetch Templates
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

    // Delete State
    const [itemToDelete, setItemToDelete] = useState<Template | null>(null);

    // ... (useEffect remains same)

    const handleDeleteClick = (e: React.MouseEvent, template: Template) => {
        e.preventDefault();
        e.stopPropagation();
        setItemToDelete(template);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        const id = itemToDelete.id;

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
            setItemToDelete(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePreview = async (template: Template) => {
        // ... (existing logic)
        setSelectedTemplate(template);
        setLoadingPreview(true);
        setTemplateStructure([]);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`http://127.0.0.1:3001/templates/${template.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const fullTemplate = await res.json();
                const s = fullTemplate.structure;
                // Robust parsing logic
                let blocks: any[] = [];
                if (Array.isArray(s)) {
                    blocks = s;
                } else if (s && typeof s === 'object') {
                    if (Array.isArray(s.blocks)) {
                        blocks = s.blocks;
                    }
                }
                // Fallback
                if (!Array.isArray(blocks) || blocks.length === 0) {
                    if (typeof s === 'string') {
                        try {
                            const parsed = JSON.parse(s);
                            if (Array.isArray(parsed)) blocks = parsed;
                            else if (parsed.blocks && Array.isArray(parsed.blocks)) blocks = parsed.blocks;
                        } catch (e) { }
                    }
                }
                setTemplateStructure(blocks || []);
            }
        } catch (error) {
            console.error("Preview fetch error", error);
        } finally {
            setLoadingPreview(false);
        }
    };

    const closePreview = () => {
        setSelectedTemplate(null);
        setTemplateStructure([]);
    };

    const canEdit = userRole === 'ADMIN' || userRole === 'LEADER';

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Plantillas</h2>
                    <p className="text-gray-500">Administra y utiliza las plantillas disponibles para tu equipo.</p>
                </div>
                {canEdit && (
                    <Link href="/dashboard/templates/create">
                        <Button>
                            <Plus size={18} />
                            Nueva Plantilla
                        </Button>
                    </Link>
                )}
            </header>

            {/* Delete Modal via Portal */}
            {mounted && itemToDelete && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
                                <Trash2 className="text-red-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">¿Eliminar plantilla?</h3>
                            <p className="text-gray-500 text-center text-sm">
                                Estás a punto de eliminar <strong>"{itemToDelete.name}"</strong>. Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                            <button
                                onClick={() => setItemToDelete(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Preview Modal via Portal */}
            {mounted && selectedTemplate && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-gray-100 w-full max-w-6xl h-[90vh] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 z-10">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{selectedTemplate.name}</h3>
                                <p className="text-sm text-gray-500">Vista Previa - Solo Lectura</p>
                            </div>
                            <button
                                onClick={closePreview}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pt-10 pb-32 flex justify-center bg-gray-100/50">
                            {loadingPreview ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <Loader2 className="animate-spin text-brand-600 mb-2" size={48} />
                                    <p className="text-gray-500">Cargando documento...</p>
                                </div>
                            ) : (
                                <div className="scale-[0.60] origin-top shadow-2xl">
                                    <TemplateRenderer blocks={templateStructure} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

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
                    {canEdit && (
                        <Link
                            href="/dashboard/templates/create"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Crear Plantilla
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <Card
                            key={template.id}
                            className="hover:shadow-md group relative cursor-pointer h-52 flex flex-col"
                        >
                            {/* Card Content Click Handler */}
                            {canEdit ? (
                                <Link href={`/dashboard/templates/${template.id}`} className="absolute inset-0 z-0" />
                            ) : (
                                <div onClick={() => handlePreview(template)} className="absolute inset-0 z-0 cursor-pointer" />
                            )}

                            {/* Header: Icon + Edit */}
                            <div className="relative z-10 pointer-events-none flex justify-between items-start mb-4">
                                <div className="p-2 bg-brand-50 rounded-lg">
                                    <FileText className="text-brand-600" size={24} />
                                </div>
                                {canEdit && (
                                    <Link
                                        href={`/dashboard/templates/${template.id}`}
                                        className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors pointer-events-auto"
                                        title="Editar"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Pencil size={18} />
                                    </Link>
                                )}
                            </div>

                            {/* Body */}
                            <div className="relative z-10 pointer-events-none flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                                    {template.name}
                                </h3>
                                <p className="text-xs text-gray-400 mb-1">
                                    {new Date(template.updatedAt).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {template.description || 'Sin descripción'}
                                </p>
                            </div>

                            {/* Footer: Delete + Preview */}
                            <div className="relative z-10 pt-4 border-t border-gray-100 flex items-center justify-between">
                                {canEdit ? (
                                    <button
                                        onClick={(e) => handleDeleteClick(e, template)}
                                        className="p-1.5 -ml-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors pointer-events-auto"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                ) : (
                                    <span></span>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePreview(template);
                                    }}
                                    className="p-1.5 -mr-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors pointer-events-auto"
                                    title="Vista Previa"
                                >
                                    <Eye size={18} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
