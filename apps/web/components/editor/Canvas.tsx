import React, { useState } from 'react';
import { Trash2, Rows, Columns } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { BlockType } from './Toolbox';
import { DraggableBlock } from './DraggableBlock';
import { TableBlock } from './blocks/TableBlock';
import { ImageBlock } from './blocks/ImageBlock';

import dynamic from 'next/dynamic';

// Dynamically import PDF component to avoid SSR issues (DOMMatrix)
const PdfBackground = dynamic(() => import('./PdfBackground'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 flex items-center justify-center text-gray-400">Cargando soporte PDF...</div>
});

export interface EditorBlock {
    id: string;
    type: BlockType;
    x: number;
    y: number;
    w?: number; // width
    h?: number; // height
    content?: string; // For text, table JSON, image URL, etc.
    style?: React.CSSProperties; // New style property
}

interface CanvasProps {
    blocks: EditorBlock[];
    onDeleteBlock: (id: string) => void;
    onUpdateBlock: (id: string, updates: Partial<EditorBlock>) => void;
    pdfUrl?: string | null;
}

export function Canvas({ blocks, onDeleteBlock, onUpdateBlock, pdfUrl }: CanvasProps) {
    const { setNodeRef } = useDroppable({
        id: 'canvas',
    });
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    // Helper functions for Table manipulation
    const modifyTable = (blockId: string, action: 'addRow' | 'addCol' | 'removeRow' | 'removeCol') => {
        const block = blocks.find(b => b.id === blockId);
        if (!block) return;

        const data = block.content ? JSON.parse(block.content) : { rows: [['', ''], ['', '']] };
        let rows = data.rows as string[][];

        if (action === 'addRow') {
            const cols = rows[0]?.length || 2;
            rows.push(Array(cols).fill(''));
        } else if (action === 'addCol') {
            rows = rows.map(r => [...r, '']);
        } else if (action === 'removeRow') {
            if (rows.length > 1) rows.pop();
        } else if (action === 'removeCol') {
            if (rows[0]?.length > 1) {
                rows = rows.map(r => r.slice(0, -1));
            }
        }

        onUpdateBlock(blockId, { content: JSON.stringify({ rows }) });
    };

    return (
        <div
            className="flex-1 bg-gray-100 p-8 pb-32 overflow-y-auto flex justify-center relative"
            onClick={() => setSelectedBlockId(null)}
        >
            <div
                ref={setNodeRef}
                id="canvas-area"
                className="bg-white shadow-lg w-[210mm] min-h-[297mm] relative shrink-0 transition-all duration-200"
                style={{
                    backgroundImage: !pdfUrl ? 'radial-gradient(#e5e7eb 1px, transparent 1px)' : 'none',
                    backgroundSize: '20px 20px',
                    marginBottom: '100px' // Extra space at bottom
                }}
            >
                {pdfUrl && (
                    <img
                        src={pdfUrl}
                        className="absolute inset-0 w-full h-full object-contain opacity-50 pointer-events-none"
                        alt="Background PDF"
                    />
                )}

                {blocks.map((block) => {
                    const isSelected = selectedBlockId === block.id;

                    // Generate Settings Menu based on block type
                    let settingsMenu = null;

                    if (block.type === 'table') {
                        settingsMenu = (
                            <>
                                <button onClick={() => modifyTable(block.id, 'addRow')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <Rows size={14} /> <span>+ Fila</span>
                                </button>
                                <button onClick={() => modifyTable(block.id, 'addCol')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <Columns size={14} /> <span>+ Columna</span>
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button onClick={() => modifyTable(block.id, 'removeRow')} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                    <Trash2 size={14} /> <span>- Fila (Última)</span>
                                </button>
                                <button onClick={() => modifyTable(block.id, 'removeCol')} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                    <Trash2 size={14} /> <span>- Columna (Última)</span>
                                </button>
                            </>
                        );
                    }

                    // ... imports


                    // ... inside map
                    return (
                        <div
                            key={block.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBlockId(block.id);
                            }}
                            className="contents"
                        >


                            <DraggableBlock
                                // ...
                                block={block}
                                onDelete={onDeleteBlock}
                                onUpdate={onUpdateBlock}
                                settingsMenu={settingsMenu}
                                isSelected={isSelected}
                            >
                                {block.type === 'text' && (
                                    <textarea
                                        className="w-full resize-none bg-transparent border-none outline-none focus:ring-0 p-0 text-black leading-relaxed font-normal placeholder:text-gray-300"
                                        placeholder="Escribe aquí..."
                                        value={block.content || ''}
                                        onChange={(e) => onUpdateBlock(block.id, { content: e.target.value })}
                                        style={{
                                            height: '100%',
                                            minHeight: '1.5em',
                                            ...block.style // Apply styles here
                                        }}
                                        onPointerDown={(e) => e.stopPropagation()}
                                    />
                                )}

                                {block.type === 'table' && (
                                    <TableBlock
                                        content={block.content}
                                        onChange={(newContent) => onUpdateBlock(block.id, { content: newContent })}
                                    />
                                )}

                                {block.type === 'image' && (
                                    <ImageBlock
                                        content={block.content}
                                        onChange={(newContent) => onUpdateBlock(block.id, { content: newContent })}
                                        style={block.style} // Pass style to ImageBlock if needed
                                    />
                                )}

                                {block.type === 'separator' && (
                                    <div className="py-2 w-full">
                                        <hr className="border-t-2 border-gray-300" style={block.style} />
                                    </div>
                                )}

                                {(block.type === 'signature') && (
                                    <div className="h-24 border-2 border-dashed border-gray-300 rounded bg-gray-50/30 flex items-center justify-center text-gray-400" style={block.style}>
                                        <span className="text-sm">Espacio para Firma</span>
                                    </div>
                                )}

                                {block.type === 'date' && (
                                    <div className="text-gray-800 bg-gray-50/50 p-2 border-b border-gray-300 w-full" style={block.style}>
                                        <span className="text-xs text-gray-400 block mb-1">Fecha (Automática)</span>
                                        DD / MM / AAAA
                                    </div>
                                )}
                            </DraggableBlock>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
