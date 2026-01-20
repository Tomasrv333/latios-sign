'use client';

import { useState, useEffect } from "react";
import { Editor } from "@/components/editor/Editor";
import { EditorBlock } from "@/components/editor/Canvas";
import { TemplateRenderer } from "@/components/editor/TemplateRenderer";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditTemplatePage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [blocks, setBlocks] = useState<EditorBlock[]>([]);
    const [name, setName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (!id) return;

        const token = localStorage.getItem('accessToken');
        fetch(`/api/templates/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch template');
                return res.json();
            })
            .then((data) => {
                setName(data.name);
                if (data.structure && Array.isArray(data.structure.blocks)) {
                    setBlocks(data.structure.blocks);
                } else {
                    setBlocks([]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError('No se pudo cargar la plantilla. Verifica tu conexión o permisos.');
                setLoading(false);
            });
    }, [id, router]);

    const handleSave = async () => {
        if (!name.trim()) return;
        if (blocks.length === 0) return;

        try {
            setIsSaving(true);
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/templates/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    description: `Template with ${blocks.length} blocks`,
                    structure: { blocks },
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update template');
            }

            // Success feedback could be a simple state change or redirect
            router.push('/dashboard/templates');
        } catch (error) {
            console.error(error);
            setError('Error al actualizar la plantilla');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-brand-600" size={32} />
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white z-10 relative">
                {error && (
                    <div className="absolute top-16 left-0 w-full bg-red-50 text-red-600 px-6 py-2 text-sm border-b border-red-100">
                        {error}
                    </div>
                )}
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="text-lg font-semibold text-gray-800 border-none hover:bg-gray-50 focus:bg-gray-50 focus:ring-0 rounded px-2"
                        placeholder="Nombre de la Plantilla"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowPreview(true)}
                        className="px-4 py-2 text-sm text-brand-600 border border-brand-200 rounded-md hover:bg-brand-50"
                    >
                        Vista Previa
                    </button>
                    {/* Delete Button */}
                    <button
                        onClick={async () => {
                            if (!confirm('¿Eliminar esta plantilla permanentemente?')) return;
                            try {
                                const token = localStorage.getItem('accessToken');
                                const res = await fetch(`/api/templates/${id}`, {
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                if (res.ok) {
                                    router.push('/dashboard/templates');
                                } else {
                                    setError('Error al eliminar');
                                }
                            } catch (e) {
                                console.error(e);
                                setError('Error al eliminar');
                            }
                        }}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                    >
                        Eliminar
                    </button>

                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            <Editor blocks={blocks} onChange={setBlocks} />

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-8">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">Vista Previa del Documento</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
                            <TemplateRenderer blocks={blocks} />
                        </div>
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 text-gray-700"
                            >
                                Cerrar Vista Previa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
