import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Type, Calendar, PenTool, Grid, Image as ImageIcon, Minus } from 'lucide-react';
import { Card } from '@latios/ui';

export type BlockType = 'text' | 'date' | 'signature' | 'table' | 'image' | 'separator';

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
            className={`cursor-move p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 mb-3 ${isDragging ? 'opacity-50 ring-2 ring-brand-200 bg-gray-50' : ''
                }`}
        >
            <div className={`text-gray-500 ${isDragging ? 'opacity-50' : ''}`}>{icon}</div>
            <span className="font-medium text-gray-700">{label}</span>
        </div>
    );
}

export function Toolbox() {
    return (
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                HERRAMIENTAS
            </h3>
            <div className="flex-1 overflow-y-auto">
                <ToolboxItem
                    type="text"
                    label="Texto"
                    icon={<Type size={20} />}
                />
                <ToolboxItem
                    type="date"
                    label="Fecha"
                    icon={<Calendar size={20} />}
                />
                <ToolboxItem
                    type="signature"
                    label="Firma"
                    icon={<PenTool size={20} />}
                />
                <div className="my-2 border-t border-gray-200"></div>
                <ToolboxItem
                    type="table"
                    label="Tabla"
                    icon={<Grid size={20} />}
                />
                <ToolboxItem
                    type="image"
                    label="Imagen"
                    icon={<ImageIcon size={20} />}
                />
                <ToolboxItem
                    type="separator"
                    label="Separador"
                    icon={<Minus size={20} />}
                />
            </div>
        </div>
    );
}
