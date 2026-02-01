import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EditorBlock } from './Canvas';
import { FigureBlock } from './blocks/FigureBlock';

interface PagesManagerProps {
    blocks: EditorBlock[];
    numPages: number;
    onAddPage: () => void;
    onDeletePage: (pageIndex: number) => void;
    onMovePage: (fromIndex: number, toIndex: number) => void;
    onPageClick?: (pageNumber: number) => void;
}

// Separate component for the sortable item
function PageThumbnail({ id, index, blocks, onDelete, showDelete, onClick }: { id: string, index: number, blocks: EditorBlock[], onDelete: () => void, showDelete: boolean, onClick?: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    const pageBlocks = blocks.filter(b => (b.page || 1) === (index + 1));

    return (
        <div ref={setNodeRef} style={style} className="flex flex-col items-center gap-2 relative group touch-none px-4">
            {/* Aspect Ratio Container (A4 approx 1:1.41) */}
            <div
                {...attributes}
                {...listeners}
                onClick={(e) => {
                    // Only trigger if not dragging
                    if (!isDragging && onClick) {
                        e.stopPropagation();
                        onClick();
                    }
                }}
                className="w-[140px] aspect-[1/1.41] bg-white border border-gray-200 rounded shadow-sm hover:shadow-md hover:border-brand-400 transition-all relative overflow-hidden cursor-pointer active:cursor-grabbing"
            >
                {/* Mini Preview Content */}
                {/* Scale calculation: Container width approx 210px in sidebar (w-64 - padding). 
                    Let's assume the thumbnail width is around 180px. A4 width is 794px. Scale ~0.22.
                    Using transform scale.
                */}
                <div className="absolute inset-0 pointer-events-none origin-top-left" style={{ transform: 'scale(0.18)', width: '210mm', height: '297mm' }}>
                    <div className="w-full h-full bg-white relative">
                        {pageBlocks.map(block => (
                            <div
                                key={block.id}
                                className="absolute overflow-hidden"
                                style={{
                                    left: block.x,
                                    top: block.y,
                                    width: block.w || 300,
                                    height: block.h || (block.type === 'figure' ? 100 : 'auto'),
                                    zIndex: block.zIndex ?? 1,
                                }}
                            >
                                {block.type === 'text' && (
                                    <div className="text-gray-800 whitespace-pre-wrap leading-tight" style={{ fontSize: '12px' }}>
                                        {block.content || ' '}
                                    </div>
                                )}

                                {block.type === 'table' && (
                                    <div className="w-full border border-gray-300 bg-white">
                                        <div className="grid grid-cols-2 gap-px bg-gray-300 border border-gray-300">
                                            <div className="bg-white h-4 w-full"></div>
                                            <div className="bg-white h-4 w-full"></div>
                                            <div className="bg-white h-4 w-full"></div>
                                            <div className="bg-white h-4 w-full"></div>
                                        </div>
                                    </div>
                                )}

                                {block.type === 'signature' && (
                                    <div className="w-full h-16 border-2 border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center">
                                        <span className="text-[10px] text-gray-400">Firma</span>
                                    </div>
                                )}

                                {block.type === 'date' && (
                                    <div className="text-gray-800 bg-gray-50 border-b border-gray-300 w-full p-1">
                                        <span className="text-[8px] text-gray-400 block">Fecha</span>
                                    </div>
                                )}

                                {block.type === 'image' && block.content && (
                                    <img src={block.content} className="w-full h-full object-cover" alt="img" />
                                )}
                                {block.type === 'image' && !block.content && (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <span className="text-[10px] text-gray-400">Img</span>
                                    </div>
                                )}

                                {block.type === 'figure' && (
                                    <div className="w-full h-full pointer-events-none">
                                        <FigureBlock content={block.content || 'square'} onChange={() => { }} style={{ ...block.style }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hover Actions */}
                {showDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag start
                            onDelete();
                        }}
                        className="absolute top-2 right-2 p-1 bg-white text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-20 border border-gray-200"
                        title="Eliminar Página"
                        onPointerDown={e => e.stopPropagation()}
                    >
                        <Trash2 size={12} />
                    </button>
                )}
            </div>

            <span className="text-[10px] text-gray-400 font-medium">Página {index + 1}</span>
        </div>
    );
}

export function PagesManager({ blocks, numPages, onAddPage, onDeletePage, onMovePage, onPageClick }: PagesManagerProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const items = Array.from({ length: numPages }).map((_, i) => `page-${i + 1}`);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = items.indexOf(active.id as string);
            const newIndex = items.indexOf(over?.id as string);
            onMovePage(oldIndex + 1, newIndex + 1);
        }
    };

    return (
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 h-full flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>HOJAS ({numPages})</span>
                <button
                    onClick={onAddPage}
                    className="p-1 hover:bg-gray-200 rounded text-brand-600 transition-colors"
                    title="Nueva Página"
                >
                    <Plus size={14} />
                </button>
            </h3>

            <div className="flex-1 overflow-y-auto pr-1">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-1 gap-6 pb-4">
                            {items.map((id, index) => (
                                <PageThumbnail
                                    key={id}
                                    id={id}
                                    index={index}
                                    blocks={blocks}
                                    onDelete={() => onDeletePage(index + 1)}
                                    showDelete={numPages > 1}
                                    onClick={() => onPageClick?.(index + 1)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            <button
                onClick={onAddPage}
                className="mt-4 w-full py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium text-sm flex items-center justify-center gap-2 shrink-0"
            >
                <Plus size={16} /> Agregar Página
            </button>
        </div>
    );
}
