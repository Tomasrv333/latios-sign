import React, { useState } from 'react';
import { Search, FileText } from 'lucide-react';
import { TemplateCard, Template } from '@/components/cards/TemplateCard';

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                    <div key={template.id} className="h-[320px]">
                        <TemplateCard
                            template={template as any}
                            isSelected={selectedTemplateId === template.id}
                            onClick={() => onSelect(template as any)}
                        />
                    </div>
                ))}

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
