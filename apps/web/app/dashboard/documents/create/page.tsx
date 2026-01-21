'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@latios/ui";
import { Loader2, FileText, ChevronRight, Check } from "lucide-react";
import { SendDocumentModal } from "@/components/templates/SendDocumentModal";
import { TemplateRenderer } from "@/components/editor/TemplateRenderer";
import { EditorBlock } from "@/components/editor/Canvas";

interface Template {
    id: string;
    name: string;
    description: string;
    updatedAt: string;
    structure: { blocks: EditorBlock[] };
    pdfUrl?: string | null;
}

export default function CreateDocumentPage() {
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [step, setStep] = useState<1 | 2>(1);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        fetch('/api/templates', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setTemplates(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-600" size={32} />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <header className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span className="cursor-pointer hover:text-brand-600" onClick={() => router.push('/dashboard/documents')}>Documentos</span>
                    <ChevronRight size={14} />
                    <span className="font-medium text-gray-900">Nuevo Documento</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Documento</h1>
                <p className="text-gray-500 mt-2">Sigue los pasos para enviar un documento a firmar.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Steps & Selection */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Stepper */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= 1 ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-gray-300 text-gray-400'} font-bold`}>1</div>
                        <div className="flex-1 h-0.5 bg-gray-200"></div>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step >= 2 ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-gray-300 text-gray-400'} font-bold`}>2</div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Selecciona una Plantilla</h3>
                        <div className="space-y-3">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    onClick={() => {
                                        setSelectedTemplate(template);
                                        setStep(2); // Auto advance to preview on mobile or just selection
                                    }}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedTemplate?.id === template.id
                                        ? 'border-brand-500 bg-brand-50 shadow-sm ring-1 ring-brand-500'
                                        : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-md ${selectedTemplate?.id === template.id ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{template.name}</h4>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description || 'Sin descripción'}</p>
                                        </div>
                                        {selectedTemplate?.id === template.id && (
                                            <div className="ml-auto text-brand-600">
                                                <Check size={18} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {templates.length === 0 && (
                                <p className="text-gray-500 text-sm italic">No hay plantillas disponibles.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview & Action */}
                <div className="lg:col-span-2">
                    {selectedTemplate ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[800px]">
                            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-medium text-gray-700">Vista Previa: {selectedTemplate.name}</h3>
                                <button
                                    onClick={() => setIsSendModalOpen(true)}
                                    className="px-6 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 shadow-sm transition-colors"
                                >
                                    Continuar y Enviar
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-gray-100 p-8 flex justify-center">
                                <div className="scale-75 origin-top">
                                    {/* We need to handle PDF Background in Renderer too if present */}
                                    <div className="relative" style={{ width: '210mm', minHeight: '297mm' }}>
                                        {/* If we had PDF support in renderer, checking... template renderer only renders blocks currently. */}
                                        {/* We'll just render blocks for now. The future renderer should support caching specific PDF page images. */}
                                        <TemplateRenderer blocks={selectedTemplate.structure.blocks || []} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400">
                            <div className="text-center">
                                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Selecciona una plantilla para visualizarla</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedTemplate && (
                <SendDocumentModal
                    isOpen={isSendModalOpen}
                    onClose={() => setIsSendModalOpen(false)}
                    templateId={selectedTemplate.id}
                />
            )}
        </div>
    );
}
