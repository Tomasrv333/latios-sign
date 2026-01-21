'use client';

import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    pointerWithin,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DragOverlayProps,
} from '@dnd-kit/core';
import {
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Toolbox, BlockType } from './Toolbox';
import { Canvas, EditorBlock } from './Canvas';
import { Type, Calendar, PenTool } from 'lucide-react';
import { snapToGridModifier } from './modifiers';

const dropAnimation: DragOverlayProps['dropAnimation'] = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

interface EditorProps {
    blocks: EditorBlock[];
    onChange: React.Dispatch<React.SetStateAction<EditorBlock[]>>;
    pdfUrl?: string | null;
}

export function Editor({ blocks, onChange: setBlocks, pdfUrl }: EditorProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<BlockType | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const activeData = active.data.current;

        setActiveId(active.id as string);

        if (activeData?.isToolboxItem) {
            setActiveType(activeData.type);
        } else {
            // It's a sortable block
            const block = blocks.find((b) => b.id === active.id);
            if (block) setActiveType(block.type);
        }
    }

    function handleDragOver(event: DragOverEvent) {
        // Optional: useful if we had multiple droppable containers
        // For now, everything drops into 'canvas' or reorders within it
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            setActiveType(null);
            return;
        }

        // Determine if dropped within canvas (either directly on canvas or on a block inside it)
        const isOverCanvas = over.id === 'canvas';
        const isOverBlock = blocks.some(b => b.id === over.id);

        if (isOverCanvas || isOverBlock) {
            const canvasElement = document.getElementById('canvas-area');
            let x = 0;
            let y = 0;

            if (canvasElement && active.rect.current?.translated) {
                const canvasRect = canvasElement.getBoundingClientRect();
                const dropRect = active.rect.current.translated;

                x = dropRect.left - canvasRect.left;
                y = dropRect.top - canvasRect.top;

                x = Math.max(0, x);
                y = Math.max(0, y);
            }

            if (active.data.current?.isToolboxItem) {
                const type = active.data.current.type as BlockType;
                const newBlock: EditorBlock = {
                    id: Math.random().toString(36).substring(2, 9),
                    type,
                    content: '',
                    x,
                    y,
                    w: 300
                };
                setBlocks((items) => [...items, newBlock]);
            } else {
                setBlocks((items) => {
                    return items.map(b => {
                        if (b.id === active.id) {
                            const newX = Math.round(b.x + event.delta.x);
                            const newY = Math.round(b.y + event.delta.y);

                            const snappedX = Math.round(newX / 20) * 20;
                            const snappedY = Math.round(newY / 20) * 20;

                            return {
                                ...b,
                                x: Math.max(0, snappedX),
                                y: Math.max(0, snappedY)
                            };
                        }
                        return b;
                    });
                });
            }
        }

        setActiveId(null);
        setActiveType(null);
    }

    function handleUpdateBlock(id: string, updates: Partial<EditorBlock>) {
        setBlocks((items) => items.map(b => b.id === id ? { ...b, ...updates } : b));
    }

    function handleDeleteBlock(id: string) {
        setBlocks((items) => items.filter((b) => b.id !== id));
    }

    if (!isMounted) return null;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden w-full">
            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                modifiers={[snapToGridModifier]}
            >
                <Toolbox />
                <Canvas
                    blocks={blocks}
                    onDeleteBlock={handleDeleteBlock}
                    onUpdateBlock={handleUpdateBlock}
                    pdfUrl={pdfUrl}
                />



                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId ? (
                        activeType ? (
                            <div className="p-4 bg-white border border-brand-500 shadow-xl rounded-lg opacity-80 w-64 pointer-events-none">
                                <div className="flex items-center gap-3">
                                    {activeType === 'text' && <Type />}
                                    {activeType === 'date' && <Calendar />}
                                    {activeType === 'signature' && <PenTool />}
                                    <span className="font-medium capitalize">{activeType}</span>
                                </div>
                            </div>
                        ) : null
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
