'use client';

import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
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
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Toolbox, BlockType } from './Toolbox';
import { Canvas, EditorBlock } from './Canvas';
import { SortableBlock } from './SortableBlock';
import { Type, Calendar, PenTool } from 'lucide-react';

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
}

export function Editor({ blocks, onChange: setBlocks }: EditorProps) {
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

        // Dropped a Toolbox Item onto Canvas (or onto a block in Canvas)
        if (active.data.current?.isToolboxItem) {
            const type = active.data.current.type as BlockType;
            const newBlock: EditorBlock = {
                id: crypto.randomUUID(),
                type,
                content: '', // Default content
            };

            setBlocks((items) => {
                // If dropped over a specific item, insert after it.
                // Otherwise append to end.
                // Since "over.id" might be "canvas" or a block ID.
                if (over.id === 'canvas') {
                    return [...items, newBlock];
                }
                // Dropped over another block - insert after
                const overIndex = items.findIndex((b) => b.id === over.id);
                if (overIndex !== -1) {
                    const newItems = [...items];
                    newItems.splice(overIndex + 1, 0, newBlock);
                    return newItems;
                }
                return [...items, newBlock];
            });
        }
        // Reordering existing items
        else if (active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((b) => b.id === active.id);
                const newIndex = items.findIndex((b) => b.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }

        setActiveId(null);
        setActiveType(null);
    }

    function handleDeleteBlock(id: string) {
        setBlocks((items) => items.filter((b) => b.id !== id));
    }

    if (!isMounted) return null;

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <Toolbox />
                <Canvas blocks={blocks} onDeleteBlock={handleDeleteBlock} />

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId ? (
                        activeType ? (
                            // Render a preview
                            <div className="p-4 bg-white border border-brand-500 shadow-xl rounded-lg opacity-80 w-64">
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
