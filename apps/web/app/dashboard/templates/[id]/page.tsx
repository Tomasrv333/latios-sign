'use client';

import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@/components/editor/Editor";
import { EditorBlock } from "@/components/editor/Canvas";
import { TemplateRenderer } from "@/components/editor/TemplateRenderer";
import { useRouter, useParams } from "next/navigation";
import { createPortal } from "react-dom";
import { Loader2, Pencil, Eye, Save, ArrowLeft, Trash2, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { ConfigurationPanel } from "@/components/editor/ConfigurationPanel";
// import { Input } from "@/components/ui/Input"; // Will use in ConfigPanel refactor

export default function EditTemplatePage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    // Navigation Guard
    const { setIsDirty, isDirty, setShowExitModal, setPendingNavigation } = useNavigationGuard();
    const initialLoadRef = useRef(true);
    const initialBlocksRef = useRef<EditorBlock[]>([]);
    const initialNameRef = useRef("");

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [blocks, setBlocks] = useState<EditorBlock[]>([]);
    const [name, setName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Modals state
    const [showPreview, setShowPreview] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const [settings, setSettings] = useState({
        signatureType: 'draw' as 'draw' | 'otp',
        requireId: false,
        companyName: '',
        description: '', // Init default
        processId: ''
    });

    // Track dirty state by comparing with initial values
    useEffect(() => {
        if (initialLoadRef.current) return; // Skip during initial load

        const hasBlockChanges = JSON.stringify(blocks) !== JSON.stringify(initialBlocksRef.current);
        const hasNameChange = name !== initialNameRef.current;
        const dirty = hasBlockChanges || hasNameChange;
        setIsDirty(dirty);
    }, [blocks, name, setIsDirty]);

    // Clean up dirty state on unmount
    useEffect(() => {
        return () => {
            setIsDirty(false);
        };
    }, [setIsDirty]);

    // Browser refresh/close guard
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isDirty) return;
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

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
                // Load description into settings for the panel
                // Map Backend Enum to Frontend State
                const backendType = data.signatureType || 'DIGITAL';
                const uiSignatureType = backendType === 'ELECTRONIC' ? 'otp' : 'draw';

                const initialSettings = {
                    signatureType: uiSignatureType as 'draw' | 'otp',
                    requireId: false,
                    companyName: '',
                    description: data.description || '', // Load description
                    processId: data.processId || ''
                };

                // Load structure
                let loadedBlocks: EditorBlock[] = [];
                if (data.structure) {
                    if (Array.isArray(data.structure.blocks)) {
                        loadedBlocks = data.structure.blocks;
                        setBlocks(loadedBlocks);
                    }
                    if (data.structure.settings) {
                        Object.assign(initialSettings, data.structure.settings);
                        // Force override with DB column truth if present, ensuring consistency
                        initialSettings.signatureType = uiSignatureType;
                        if (!initialSettings.description) initialSettings.description = data.description || '';
                    }
                } else {
                    setBlocks([]);
                }
                setSettings(initialSettings);

                // Store initial values for dirty detection
                initialBlocksRef.current = loadedBlocks;
                initialNameRef.current = data.name;

                // Mark initial load complete (after a tick to let state settle)
                setTimeout(() => {
                    initialLoadRef.current = false;
                }, 100);

                // Load PDF URL
                if (data.pdfUrl) {
                    setPdfUrl(data.pdfUrl);
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

        try {
            setIsSaving(true);

            // Map Frontend State to Backend Enum
            const apiSignatureType = settings.signatureType === 'otp' ? 'ELECTRONIC' : 'DIGITAL';

            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/templates/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    description: settings.description?.trim() || undefined,
                    processId: settings.processId || undefined,
                    signatureType: apiSignatureType, // Crucial: Send mapped value
                    structure: {
                        blocks,
                        settings
                    },
                    pdfUrl: pdfUrl,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update template');
            }

            setShowSaveConfirm(false); // Close modal

            // Update initial refs to mark as clean without reload
            initialBlocksRef.current = blocks;
            initialNameRef.current = name;
            setIsDirty(false); // Manually set clean

            // Optional: Show success toast here if available, or rely on "Cambios guardados" status
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
            <div className="h-16 border-b border-gray-300 px-4 flex items-center justify-between bg-white z-10 sticky top-0 shadow-sm">
                {error && (
                    <div className="absolute top-16 left-0 w-full bg-red-50 text-red-600 px-6 py-2 text-sm border-b border-red-100 z-50">
                        {error}
                    </div>
                )}

                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                        title="Volver"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex items-center gap-2 group relative">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-lg font-semibold text-gray-800 border-none outline-none focus:outline-none hover:bg-gray-50 focus:bg-gray-50 focus:ring-1 focus:ring-brand-500 rounded px-2 py-1 pr-8 transition-colors w-full max-w-md"
                            placeholder="Nombre de la Plantilla"
                        />
                        <Pencil size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Status Label */}
                    <div className="flex items-center mr-4">
                        <div className={`w-2 h-2 rounded-full mr-2 ${isDirty ? 'bg-amber-500' : 'bg-green-500'}`} />
                        <span className={`text-sm font-medium ${isDirty ? 'text-amber-600' : 'text-green-600'}`}>
                            {isDirty ? 'Cambios sin guardar' : 'Cambios guardados'}
                        </span>
                    </div>

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
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors mr-2"
                        title="Eliminar Plantilla"
                    >
                        <Trash2 size={20} />
                    </button>

                    {/* Config Button */}
                    <button
                        onClick={() => setShowConfig(true)}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors mr-2"
                        title="Configuración de Plantilla"
                    >
                        <Settings size={20} />
                    </button>

                    <button
                        onClick={() => setShowPreview(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-brand-600 transition-colors"
                    >
                        <Eye size={18} />
                        <span className="hidden sm:inline">Vista Previa</span>
                    </button>

                    <button
                        onClick={() => setShowSaveConfirm(true)}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                    >
                        {isSaving ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
                    </button>
                </div>
            </div>

            <Editor
                blocks={blocks}
                onChange={setBlocks}
                pdfUrl={pdfUrl}
                settings={settings}
                onSettingsChange={setSettings}
                templateId={id}
            // Sidebar removed (Now internal)
            />

            {/* Config Modal */}
            {showConfig && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">Configuración de Plantilla</h3>
                            <button onClick={() => setShowConfig(false)} className="p-1 hover:bg-gray-100 rounded-full">
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            <ConfigurationPanel settings={settings} onChange={setSettings} />
                        </div>
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowConfig(false)}
                                className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm hover:bg-brand-700"
                            >
                                Listo
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Save Confirm Modal */}
            {showSaveConfirm && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-6 text-center">
                        <div className="mx-auto bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-green-600">
                            <Save size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Guardar cambios?</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            Asegúrate de revisar la disposición de las herramientas en el mapa y la configuración de la plantilla antes de continuar.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setShowSaveConfirm(false)}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                            >
                                Revisar más
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 flex items-center gap-2"
                            >
                                {isSaving && <Loader2 className="animate-spin" size={14} />}
                                Confirmar y Guardar
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Preview Modal */}
            {showPreview && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-8 transition-opacity">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">Vista Previa del Documento</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                            >
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-gray-100 p-8 pb-32 flex justify-center">
                            <div className="transform scale-[0.8] origin-top">
                                <TemplateRenderer blocks={blocks} />
                            </div>
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
                </div>,
                document.body
            )}
        </div>
    );
}
