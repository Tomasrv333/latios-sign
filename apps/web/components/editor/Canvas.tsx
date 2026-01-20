import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableBlock } from './SortableBlock';
import { BlockType } from './Toolbox';

export interface EditorBlock {
    id: string;
    type: BlockType;
    content?: string;
}

interface CanvasProps {
    blocks: EditorBlock[];
    onDeleteBlock: (id: string) => void;
}

export function Canvas({ blocks, onDeleteBlock }: CanvasProps) {
    const { setNodeRef } = useDroppable({
        id: 'canvas',
    });

    return (
        <div className="flex-1 bg-gray-100 p-8 overflow-y-auto flex justify-center">
            <div
                ref={setNodeRef}
                className="bg-white shadow-lg w-[210mm] min-h-[297mm] p-8 flex flex-col"
            >
                <div className="mb-4 pb-4 border-b border-gray-100">
                    <h1 className="text-3xl font-bold text-gray-900">Documento Sin Título</h1>
                    <p className="text-gray-400 text-sm">Arrastra bloques aquí para construir tu plantilla</p>
                </div>

                <SortableContext
                    items={blocks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex-1 space-y-2">
                        {blocks.length === 0 && (
                            <div className="h-48 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                                Arrastra elementos del menú izquierdo
                            </div>
                        )}
                        {blocks.map((block) => (
                            <SortableBlock
                                key={block.id}
                                id={block.id}
                                type={block.type}
                                content={block.content}
                                onDelete={onDeleteBlock}
                            />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}
