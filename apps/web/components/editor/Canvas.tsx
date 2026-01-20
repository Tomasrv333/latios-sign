import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableBlock } from './SortableBlock';
import { BlockType } from './Toolbox';
import { DraggableBlock } from './DraggableBlock';

export interface EditorBlock {
    id: string;
    type: BlockType;
    content?: string;
    // Coordinates and dimensions for absolute positioning
    x: number;
    y: number;
    w?: number; // Optional width
    h?: number; // Optional height
}

interface CanvasProps {
    blocks: EditorBlock[];
    onDeleteBlock: (id: string) => void;
    onUpdateBlock: (id: string, updates: Partial<EditorBlock>) => void;
}

export function Canvas({ blocks, onDeleteBlock, onUpdateBlock }: CanvasProps) {
    const { setNodeRef } = useDroppable({
        id: 'canvas',
    });

    return (
        <div className="flex-1 bg-gray-100 p-8 overflow-y-auto flex justify-center relative">
            <div
                ref={setNodeRef}
                id="canvas-area"
                className="bg-white shadow-lg w-[210mm] min-h-[297mm] relative"
                style={{
                    backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            >
                <div className="p-8 pb-4 border-b border-gray-100 mb-4 select-none">
                    <h1 className="text-3xl font-bold text-gray-900">Documento Sin Título</h1>
                    <p className="text-gray-400 text-sm">Arrastra bloques aquí</p>
                </div>

                {blocks.map((block) => (
                    <DraggableBlock
                        key={block.id}
                        block={block}
                        onDelete={onDeleteBlock}
                        onUpdate={onUpdateBlock}
                    >
                        <div className="border border-brand-100 hover:border-brand-500 rounded p-2 bg-white/80 backdrop-blur-sm relative shadow-sm transition-all focus-within:ring-2 ring-brand-200">

                            {block.type === 'text' && (
                                <textarea
                                    className="w-full resize-none bg-transparent border-none focus:ring-0 p-0 text-gray-900 leading-relaxed font-normal"
                                    placeholder="Escribe aquí..."
                                    value={block.content || ''}
                                    onChange={(e) => onUpdateBlock(block.id, { content: e.target.value })}
                                    style={{
                                        minHeight: '40px',
                                        // Auto-height is tricky with resize dragging, so we stick to flow content or explicit height if we added height resizing.
                                        // For now, let text flow.
                                    }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                />
                            )}
                            {block.type !== 'text' && (
                                <div className="p-4 bg-gray-50/50 border border-gray-100 dashed rounded text-center text-sm text-gray-500 select-none">
                                    {block.type === 'signature' ? 'Espacio para Firma' : block.content || block.type}
                                </div>
                            )}
                        </div>
                    </DraggableBlock>
                ))}
            </div>
        </div>
    );
}
