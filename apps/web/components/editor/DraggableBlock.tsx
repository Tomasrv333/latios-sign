import React, { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { EditorBlock } from './Canvas';

interface DraggableBlockProps {
    block: EditorBlock;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<EditorBlock>) => void;
    children: React.ReactNode;
}

export function DraggableBlock({ block, onDelete, onUpdate, children }: DraggableBlockProps) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useDraggable({
        id: block.id,
        data: {
            ...block,
            isCanvasBlock: true,
        }
    });

    const [isResizing, setIsResizing] = useState(false);
    // Local width state for smooth resizing without updating global state every pixel (optional, but good for perf)
    // Actually, updating global state is fine for this scale.

    const style = {
        transform: CSS.Translate.toString(transform),
        position: 'absolute' as const,
        left: block.x,
        top: block.y,
        width: block.w || 300,
        height: block.h, // Undefined means auto
        zIndex: isDragging || isResizing ? 1000 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    // Resize Handler
    const handleResizeStart = (e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);

        const startX = e.clientX;
        const startWidth = block.w || 300;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const newWidth = Math.max(150, startWidth + (moveEvent.clientX - startX));
            // Snap width to grid (20px)
            const snappedWidth = Math.round(newWidth / 20) * 20;
            onUpdate(block.id, { w: snappedWidth });
        };

        const onPointerUp = () => {
            setIsResizing(false);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group absolute flex flex-col ${isResizing ? 'cursor-ew-resize' : ''}`}
        >
            {/* Header / Drag Handle Wrapper */}
            <div className="absolute -top-7 left-0 right-0 h-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-brand-100/50 rounded-t border border-brand-200 px-2 backdrop-blur-sm z-50">
                {/* Drag Handle - The ACTIVATOR */}
                <div
                    ref={setActivatorNodeRef}
                    {...attributes}
                    {...listeners}
                    className="cursor-move p-1 -ml-2 rounded hover:bg-brand-200 flex items-center gap-2 text-brand-700 font-medium text-xs"
                >
                    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 3C5.5 3.27614 5.27614 3.5 5 3.5C4.72386 3.5 4.5 3.27614 4.5 3C4.5 2.72386 4.72386 2.5 5 2.5C5.27614 2.5 5.5 2.72386 5.5 3ZM5.5 7.5C5.5 7.77614 5.27614 8 5 8C4.72386 8 4.5 7.77614 4.5 7.5C4.5 7.22386 4.72386 7 5 7C5.27614 7 5.5 7.22386 5.5 7.5ZM5.5 12C5.5 12.2761 5.27614 12.5 5 12.5C4.72386 12.5 4.5 12.2761 4.5 12C4.5 11.7239 4.72386 11.5 5 11.5C5.27614 11.5 5.5 11.7239 5.5 12ZM10.5 3C10.5 3.27614 10.2761 3.5 10 3.5C9.72386 3.5 9.5 3.27614 9.5 3C9.5 2.72386 9.72386 2.5 10 2.5C10.2761 2.5 10.5 2.72386 10.5 3ZM10.5 7.5C10.5 7.77614 10.2761 8 10 8C9.72386 8 9.5 7.77614 9.5 7.5C9.5 7.22386 9.72386 7 10 7C10.2761 7 10.5 7.22386 10.5 7.5ZM10.5 12C10.5 12.2761 10.2761 12.5 10 12.5C9.72386 12.5 9.5 12.2761 9.5 12C9.5 11.7239 9.72386 11.5 10 11.5C10.2761 11.5 10.5 11.7239 10.5 12Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    {block.type.toUpperCase()}
                </div>

                {/* Delete Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isDragging) onDelete(block.id);
                    }}
                    className="text-gray-400 hover:text-red-500 rounded p-1 hover:bg-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            {/* Content Content - Not Draggable directly (text selectable) */}
            <div className={`relative ${isResizing ? 'pointer-events-none' : ''}`}>
                {children}
            </div>

            {/* Resize Handle - Right Edge */}
            <div
                className="absolute top-0 right-[-6px] bottom-0 w-3 cursor-col-resize hover:bg-brand-400/20 z-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onPointerDown={handleResizeStart}
            >
                <div className="w-1 h-6 bg-gray-300 rounded-full" />
            </div>
        </div>
    );
}
