'use client';

import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { FileText, Plus, Loader2, X, Trash2, Eye, Pencil, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { Button } from '@latios/ui';
import { TemplateRenderer } from '@/components/editor/TemplateRenderer';

interface Template {
    id: string;
    name: string;
    description?: string;
    updatedAt: string;
    structure: any;
    creator?: { name: string };
    process?: { id: string; name: string };
    signatureType: 'DIGITAL' | 'ELECTRONIC';
}

interface Process {
    id: string;
    name: string;
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [processes, setProcesses] = useState<Process[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Filters & View Mode
    const [processFilter, setProcessFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Preview (Modal) State
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [templateStructure, setTemplateStructure] = useState<any[]>([]);

    // Collapsed State
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    const toggleSection = (groupName: string) => {
        setCollapsedSections(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem('accessToken');

        fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(user => {
                if (user && user.role) setUserRole(user.role);
                if (user.role === 'ADMIN' || user.role === 'LEADER') {
                    fetch('http://127.0.0.1:3001/processes', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                        .then(res => res.ok ? res.json() : [])
                        .then(data => setProcesses(data));
                }
            })
            .catch(err => console.error(err));

        fetch('http://127.0.0.1:3001/templates', {
            headers: { 'Authorization': `Bearer ${token}` }
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

    const [itemToDelete, setItemToDelete] = useState<Template | null>(null);

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
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete');
            setTemplates((prev) => prev.filter((t) => t.id !== id));
            setItemToDelete(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePreview = (template: Template) => {
        setSelectedTemplate(template);
        let blocks: any[] = [];
        const s = template.structure;
        if (Array.isArray(s)) blocks = s;
        else if (s && typeof s === 'object' && Array.isArray(s.blocks)) blocks = s.blocks;
        setTemplateStructure(blocks);
    };

    const closePreview = () => {
        setSelectedTemplate(null);
        setTemplateStructure([]);
    };

    const canEdit = userRole === 'ADMIN' || userRole === 'LEADER';

    // Grouping Logic
    const groupedTemplates = useMemo(() => {
        const groups: Record<string, Template[]> = {};

        const filtered = templates.filter(t => {
            if (processFilter === 'all') return true;
            if (processFilter === 'unassigned') return !t.process;
            return t.process?.id === processFilter;
        });

        filtered.forEach(t => {
            const key = t.process ? t.process.name : 'General (Sin Equipo)';
            if (!groups[key]) groups[key] = [];
            groups[key].push(t);
        });

        const sortedKeys = Object.keys(groups).sort();

        return sortedKeys.map(key => ({
            name: key,
            items: groups[key]
        }));
    }, [templates, processFilter]);

    const getPreviewBlocks = (structure: any) => {
        if (Array.isArray(structure)) return structure;
        if (structure && typeof structure === 'object' && Array.isArray(structure.blocks)) return structure.blocks;
        return [];
    };

    // --- Components ---

    const TemplateCard = ({ template }: { template: Template }) => {
        const blocks = getPreviewBlocks(template.structure);
        const isElectronic = template.signatureType === 'ELECTRONIC';
        const createdBy = template.creator?.name || 'Desconocido';

        return (
            <Link
                href={canEdit ? `/dashboard/templates/${template.id}` : '#'}
                onClick={(e) => {
                    if (!canEdit) {
                        e.preventDefault();
                        handlePreview(template);
                    }
                }}
                className="group relative flex-shrink-0 w-[280px] h-[340px] bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col cursor-pointer ring-0 hover:ring-2 hover:ring-brand-500/20 snap-start"
            >
                {/* Header Preview Area */}
                <div className="h-[180px] bg-gray-50 relative overflow-hidden flex justify-center items-start pt-0 border-b border-gray-100 group-hover:bg-brand-50/10 transition-colors">
                    <div className="w-[794px] transform scale-[0.36] origin-top bg-white shadow-xl pointer-events-none select-none rounded-sm ring-1 ring-gray-900/5 transition-transform duration-500 group-hover:translate-y-0">
                        <TemplateRenderer blocks={blocks} />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10 w-full pl-3 pointer-events-none">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-md shadow-sm border ${isElectronic
                                ? 'bg-purple-50/90 text-purple-700 border-purple-200'
                                : 'bg-blue-50/90 text-blue-700 border-blue-200'
                            }`}>
                            {isElectronic ? 'OTP' : 'Digital'}
                        </span>
                    </div>
                </div>
                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col relative z-20 bg-white">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-brand-600 transition-colors line-clamp-1" title={template.name}>
                        {template.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3 h-10">
                        {template.description || 'Sin descripción añadida.'}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-400 font-medium">
                        <span className="truncate max-w-[120px]">Por: {createdBy}</span>
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-500">{new Date(template.updatedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </Link>
        );
    };

    const TemplateListItem = ({ template }: { template: Template }) => {
        const isElectronic = template.signatureType === 'ELECTRONIC';
        const createdBy = template.creator?.name || 'Desconocido';

        return (
            <div className="bg-white border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors py-3 px-4 flex items-center gap-4 group">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <FileText size={20} />
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate flex items-center gap-2">
                        {template.name}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border ${isElectronic
                                ? 'bg-purple-50 text-purple-700 border-purple-100'
                                : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                            {isElectronic ? 'OTP' : 'Digital'}
                        </span>
                    </h3>
                    <p className="text-xs text-gray-500 truncate max-w-md">
                        {template.description || 'Sin descripción'}
                    </p>
                </div>

                {/* Metadata */}
                <div className="hidden md:flex flex-col items-end text-xs text-gray-400 gap-0.5 w-32">
                    <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                    <span className="text-[10px]">Por: {createdBy}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => handlePreview(template)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Ver"
                    >
                        <Eye size={16} />
                    </button>
                    {canEdit && (
                        <>
                            <Link
                                href={`/dashboard/templates/${template.id}`}
                                className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                                title="Editar"
                            >
                                <Pencil size={16} />
                            </Link>
                            <button
                                onClick={(e) => handleDeleteClick(e, template)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Eliminar"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Plantillas</h2>
                    <p className="text-gray-500">Administra y utiliza las plantillas disponibles para tu equipo.</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">

                    {/* View Toggle */}
                    <div className="flex items-center bg-gray-100/50 p-1 rounded-lg border border-gray-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Vista Cuadrícula"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Vista Lista"
                        >
                            <List size={18} />
                        </button>
                    </div>

                    {(userRole === 'ADMIN' || userRole === 'LEADER') && (
                        <select
                            value={processFilter}
                            onChange={(e) => setProcessFilter(e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 w-full md:w-48"
                        >
                            <option value="all">Ver Todos</option>
                            <option value="unassigned">Sin Asignar</option>
                            {processes.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    )}

                    {canEdit && (
                        <Link href="/dashboard/templates/create">
                            <Button>
                                <Plus size={18} className="mr-2" />
                                Nueva Plantilla
                            </Button>
                        </Link>
                    )}
                </div>
            </header>

            {/* Content Groups */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-brand-600" size={32} />
                </div>
            ) : groupedTemplates.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FileText className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No se encontraron plantillas</h3>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {groupedTemplates.map((group) => {
                        const isCollapsed = collapsedSections[group.name];
                        return (
                            <section key={group.name} className="space-y-4">
                                <div
                                    className="flex items-center gap-4 cursor-pointer group/header select-none"
                                    onClick={() => toggleSection(group.name)}
                                >
                                    <div className={`p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400 group-hover/header:text-gray-600 ${isCollapsed ? '' : 'rotate-90'}`}>
                                        <ChevronRight size={20} className="transition-transform duration-200" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        {group.name}
                                        <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {group.items.length}
                                        </span>
                                    </h3>
                                    <div className="h-px bg-gray-200 flex-1"></div>
                                </div>

                                {!isCollapsed && (
                                    <div className="animate-in slide-in-from-top-2 duration-300">
                                        {viewMode === 'grid' ? (
                                            /* Grid Mode (Carousel) */
                                            <div className="relative group/carousel">
                                                <div className="flex overflow-x-auto gap-6 py-6 -mx-2 px-2 snap-x scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                                    {group.items.map(template => (
                                                        <TemplateCard key={template.id} template={template} />
                                                    ))}
                                                    <div className="w-2 flex-shrink-0" />
                                                </div>
                                            </div>
                                        ) : (
                                            /* List Mode (Table) */
                                            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                                {group.items.map(template => (
                                                    <TemplateListItem key={template.id} template={template} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
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

            {mounted && selectedTemplate && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-gray-100 w-full max-w-6xl h-[90vh] rounded-xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 z-10">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{selectedTemplate.name}</h3>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span>Vista Previa</span>
                                    {selectedTemplate.creator && <span className="flex items-center gap-1">• Por: {selectedTemplate.creator.name}</span>}
                                    {selectedTemplate.process && <span className="flex items-center gap-1">• Equipo: {selectedTemplate.process.name}</span>}
                                </div>
                            </div>
                            <button
                                onClick={closePreview}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pt-10 pb-32 flex justify-center bg-gray-100/50">
                            <div className="scale-[0.60] origin-top shadow-2xl">
                                <TemplateRenderer blocks={templateStructure} />
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
