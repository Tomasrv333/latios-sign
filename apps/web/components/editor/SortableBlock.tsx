import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { BlockType } from './Toolbox';

interface SortableBlockProps {
    id: string;
    type: BlockType;
    content?: string;
    onDelete: (id: string) => void;
}

export function SortableBlock({ id, type, content, onDelete }: SortableBlockProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-md mb-2 hover:border-brand-500 transition-colors"
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-move text-gray-400 hover:text-gray-600 p-1"
            >
                <GripVertical size={16} />
            </div>

            <div className="flex-1">
                {type === 'text' && (
                    <div className="p-2 bg-gray-50 rounded text-sm text-gray-800">
                        {content || 'Bloque de Texto (Click para editar)'}
                    </div>
                )}
                {type === 'date' && (
                    <div className="p-2 bg-blue-50 rounded text-sm text-blue-800 font-mono">
                        {content || 'DD/MM/YYYY'}
                    </div>
                )}
                {type === 'signature' && (
                    <div className="p-4 bg-orange-50 border border-dashed border-orange-200 rounded text-sm text-orange-800 text-center">
                        Espacio para Firma
                    </div>
                )}
            </div>

            <button
                onClick={() => onDelete(id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 transition-opacity"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}
