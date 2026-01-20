'use client';

import { useState } from "react";
import { Editor } from "@/components/editor/Editor";
import { EditorBlock } from "@/components/editor/Canvas";
import { useRouter } from "next/navigation";

export default function CreateTemplatePage() {
    const [blocks, setBlocks] = useState<EditorBlock[]>([]);
    const [name, setName] = useState("Nueva Plantilla");
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        if (!name.trim()) return alert("Por favor ingresa un nombre para la plantilla");
        if (blocks.length === 0) return alert("La plantilla debe tener al menos un bloque");

        try {
            setIsSaving(true);
            // Direct connection to Backend to bypass Proxy issues
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://127.0.0.1:3001/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    description: `Template with ${blocks.length} blocks`,
                    structure: { blocks }, // Wrapping in an object to future proof
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save template');
            }

            const data = await response.json();
            alert('Plantilla guardada exitosamente!');
            router.push('/dashboard/templates'); // Or wherever appropriate
        } catch (error) {
            console.error(error);
            alert('Error al guardar la plantilla');
        } finally {
            setIsSaving(false);
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
                </div>
                <div className="flex gap-3">
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
                        {isSaving ? 'Guardando...' : 'Guardar Plantilla'}
                    </button>
                </div>
            </div>
            <Editor blocks={blocks} onChange={setBlocks} />
        </div>
    );
}
