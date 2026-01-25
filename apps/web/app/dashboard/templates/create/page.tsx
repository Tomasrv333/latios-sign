'use client';

import { useState, useEffect } from "react";
import { Editor } from "@/components/editor/Editor";
import { EditorBlock } from "@/components/editor/Canvas";
import { useRouter } from "next/navigation";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

export default function CreateTemplatePage() {
    const [blocks, setBlocks] = useState<EditorBlock[]>([]);
    const [name, setName] = useState("Nueva Plantilla");
    const [description, setDescription] = useState("");
    const [settings, setSettings] = useState({ signatureType: 'draw', processId: '' });
    const [isSaving, setIsSaving] = useState(false);

    const router = useRouter();
    const { setIsDirty, isDirty, setShowExitModal, setPendingNavigation } = useNavigationGuard();

    // Update dirty state in context whenever local state changes
    useEffect(() => {
        const dirty = blocks.length > 0 || name !== "Nueva Plantilla" || description !== "";
        setIsDirty(dirty);
    }, [blocks, name, description, settings, setIsDirty]);

    // Clean up dirty state when component unmounts
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

    const handleSave = async () => {
        if (!name.trim()) return alert("Por favor ingresa un nombre para la plantilla");
        if (blocks.length === 0) return alert("La plantilla debe tener al menos un bloque");

        try {
            setIsSaving(true);
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://127.0.0.1:3001/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    description: description.trim() || undefined,
                    structure: { blocks },
                    processId: settings.processId || undefined,
                    signatureType: settings.signatureType,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save template');
            }

            setIsDirty(false);
            router.push('/dashboard/templates');
        } catch (error) {
            console.error(error);
            alert('Error al guardar la plantilla');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (isDirty) {
            setPendingNavigation(null);
            setShowExitModal(true);
        } else {
            router.back();
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white z-10 relative">
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="text-lg font-semibold text-gray-800 border-none hover:bg-gray-50 focus:bg-gray-50 focus:ring-0 rounded px-2"
                        placeholder="Nombre de la Plantilla"
                    />
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="text-sm text-gray-500 border-none hover:bg-gray-50 focus:bg-gray-50 focus:ring-0 rounded px-2 w-96 placeholder-gray-400"
                        placeholder="Descripción corta (opcional)"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Plantilla'}
                    </button>
                </div>
            </div>
            <Editor
                blocks={blocks}
                onChange={setBlocks}
                settings={settings}
                onSettingsChange={setSettings as any}
            />
        </div>
    );
}
