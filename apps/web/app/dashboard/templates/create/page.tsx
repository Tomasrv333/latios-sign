import { Editor } from "@/components/editor/Editor";

export default function CreateTemplatePage() {
    return (
        <div className="bg-white min-h-screen">
            <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white">
                <h1 className="text-lg font-semibold text-gray-800">Crear Nueva Plantilla</h1>
                <div className="flex gap-3">
                    <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
                    <button className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm hover:bg-brand-700">Guardar Plantilla</button>
                </div>
            </div>
            <Editor />
        </div>
    );
}
