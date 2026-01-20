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

        // We only care if dropped on 'canvas'
        if (over.id === 'canvas') {
            // Calculate coordinates relative to the canvas
            // active.rect.current.translated contains the final screen coordinates
            // We need to subtract the canvas bounding box
            const canvasElement = document.getElementById('canvas-area');
            let x = 0;
            let y = 0;

            if (canvasElement && active.rect.current?.translated) {
                const canvasRect = canvasElement.getBoundingClientRect();
                const dropRect = active.rect.current.translated;

                x = dropRect.left - canvasRect.left;
                y = dropRect.top - canvasRect.top;

                // Ensure positive coordinates and typical padding
                x = Math.max(0, x);
                // Adjust for the header height (approx 100px) if we want to default below it, 
                // but for now user places it where they want.
                y = Math.max(0, y);
            }

            if (active.data.current?.isToolboxItem) {
                const type = active.data.current.type as BlockType;
                const newBlock: EditorBlock = {
                    id: crypto.randomUUID(),
                    type,
                    content: '',
                    x,
                    y,
                    w: 300 // Default width
                };
                setBlocks((items) => [...items, newBlock]);
            } else {
                // Moving an existing block on the canvas
                setBlocks((items) => {
                    return items.map(b => {
                        if (b.id === active.id) {
                            // Logic: The 'active' item has a 'translated' rect relative to viewport.
                            // But cleaner way: use the delta accumulation.
                            // Warning: 'event.delta' is the TOTAL displacement from start.
                            // 'b.x/b.y' are the STARTING positions (captured in closure).
                            // Wait! 'setBlocks' callback uses CURRENT 'items'.
                            // BUT 'b' inside map is the CURRENT state *before* this drag applied?
                            // No, 'b.x/y' is the position BEFORE drag started?
                            // Actually, 'dnd-kit' modifiers apply to the visual transform.
                            // The 'event.delta' is (current - start).
                            // So we should add delta to the ORIGINAL position.
                            // BUT if 'items' comes from state, does it have the original pos?
                            // Yes, because we haven't updated state during drag.

                            const newX = Math.round(b.x + event.delta.x);
                            const newY = Math.round(b.y + event.delta.y);

                            // Snap to 20px grid manually here if we want to PERSIST the snap?
                            // The modifier only affected the visual drag.
                            // To align the final data, we should probably snap the final coordinate too.
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
                collisionDetection={closestCorners}
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
                />

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId ? (
                        activeType ? (
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
