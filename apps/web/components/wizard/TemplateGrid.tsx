'use client';

import React, { useState } from 'react';
import { FileText, Search, PenTool, Verified, FileSignature, CheckCircle2 } from 'lucide-react';
import { EditorBlock } from '@/components/editor/Canvas';

export interface Template {
    id: string;
    name: string;
    description: string;
    updatedAt: string;
    structure: { blocks: EditorBlock[] };
    pdfUrl?: string | null;
    signatureType: 'digital' | 'electronic';
    processId?: string;
}

interface TemplateGridProps {
    teamId: string;
    selectedTemplateId: string | null;
    onSelect: (template: Template) => void;
    templates: Template[];
}

export function TemplateGrid({ teamId, selectedTemplateId, onSelect, templates }: TemplateGridProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTemplates = templates.filter(t =>
        (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        t.processId === teamId
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-gray-100 pb-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Selecciona una Plantilla</h2>
                    <p className="text-sm text-gray-500 mt-1">Elige el documento base para enviar a firmar</p>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar plantilla..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => {
                    const isSelected = selectedTemplateId === template.id;
                    const isDigital = template.signatureType?.toLowerCase() === 'digital';
                    const typeLabel = isDigital ? 'Firma Digital' : 'Firma Electrónica';

                    return (
                        <div
                            key={template.id}
                            onClick={() => onSelect(template)}
                            className={`group relative flex flex-col rounded-xl border transition-all cursor-pointer overflow-hidden ${isSelected
                                ? 'border-brand-500 bg-brand-50/40 shadow-sm ring-1 ring-brand-500'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                }`}
                        >
                            {/* Header Stub */}
                            <div className={`h-24 border-b border-gray-50 flex items-center justify-center relative transition-colors ${isSelected ? 'bg-brand-100/30' : 'bg-gray-50/50'}`}>
                                <FileText size={40} className={`opacity-40 transition-colors ${isSelected ? 'text-brand-600 opacity-60' : 'text-gray-400'}`} />

                                {/* Badge */}
                                <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 shadow-sm border ${isDigital
                                    ? 'bg-purple-50 text-purple-700 border-purple-100'
                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                    {isDigital ? <Verified size={10} /> : <PenTool size={10} />}
                                    {typeLabel}
                                </div>

                                {isSelected && (
                                    <div className="absolute top-3 left-3 text-brand-600 animate-in zoom-in spin-in-90 duration-300">
                                        <CheckCircle2 size={20} className="fill-brand-100" />
                                    </div>
                                )}
                            </div>

                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className={`font-semibold text-gray-900 mb-1 transition-colors ${isSelected ? 'text-brand-900' : ''}`}>
                                    {template.name}
                                </h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
                                    {template.description || 'Sin descripción disponible.'}
                                </p>

                                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                                    <FileSignature size={12} />
                                    <span>Actualizado hace 2 días</span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredTemplates.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <FileText size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No se encontraron plantillas.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
