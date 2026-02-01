import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Type, Calendar, PenTool, Grid, Image as ImageIcon, Minus } from 'lucide-react';

export type BlockType = 'text' | 'date' | 'signature' | 'table' | 'image' | 'separator' | 'figure';

interface ToolboxItemProps {
    type: BlockType;
    label: string;
    icon: React.ReactNode;
}

function ToolboxItem({ type, label, icon }: ToolboxItemProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `toolbox-${type}`,
        data: {
            type,
            isToolboxItem: true,
        },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`cursor-move px-3 py-2.5 bg-white border border-gray-200 rounded-md hover:border-brand-300 hover:bg-brand-50/50 transition-all flex items-center gap-2.5 ${isDragging ? 'opacity-50 ring-2 ring-brand-300 bg-brand-50 shadow-md' : ''
                }`}
        >
            <div className={`text-gray-400 ${isDragging ? 'text-brand-500' : ''}`}>{icon}</div>
            <span className="text-sm font-medium text-gray-600">{label}</span>
        </div>
    );
}

export function Toolbox() {
    return (
        <div className="w-60 bg-gray-50/80 border-r border-gray-200 p-3 h-full flex flex-col">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
                Herramientas
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2">
                <ToolboxItem
                    type="text"
                    label="Texto"
                    icon={<Type size={16} />}
                />
                <ToolboxItem
                    type="date"
                    label="Fecha"
                    icon={<Calendar size={16} />}
                />
                <ToolboxItem
                    type="signature"
                    label="Firma"
                    icon={<PenTool size={16} />}
                />
                <ToolboxItem
                    type="table"
                    label="Tabla"
                    icon={<Grid size={16} />}
                />
                <ToolboxItem
                    type="image"
                    label="Imagen"
                    icon={<ImageIcon size={16} />}
                />
                <ToolboxItem
                    type="separator"
                    label="Separador"
                    icon={<Minus size={16} />}
                />
            </div>
        </div>
    );
}
