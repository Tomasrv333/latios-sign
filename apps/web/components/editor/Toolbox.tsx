import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Type, Calendar, PenTool } from 'lucide-react';
import { Card } from '@latios/ui';

export type BlockType = 'text' | 'date' | 'signature';

interface ToolboxItemProps {
    type: BlockType;
    label: string;
    icon: React.ReactNode;
}

function ToolboxItem({ type, label, icon }: ToolboxItemProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `toolbox-${type}`,
        data: {
            type,
            isToolboxItem: true,
        },
    });

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="cursor-move p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 mb-3"
        >
            <div className="text-gray-500">{icon}</div>
            <span className="font-medium text-gray-700">{label}</span>
        </div>
    );
}

export function Toolbox() {
    return (
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Bloques
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
            </div>
        </div>
    );
}
