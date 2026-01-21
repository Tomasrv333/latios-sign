import React, { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { EditorBlock } from './Canvas';
import { Settings, Trash2, GripVertical } from 'lucide-react';
import { BlockToolbar } from './BlockToolbar';

interface DraggableBlockProps {
    block: EditorBlock;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<EditorBlock>) => void;
    children: React.ReactNode;
    settingsMenu?: React.ReactNode; // Slot for custom actions
    isSelected?: boolean;
}

export function DraggableBlock({ block, onDelete, onUpdate, children, settingsMenu, isSelected }: DraggableBlockProps) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useDraggable({
        id: block.id,
        data: {
            ...block,
            isCanvasBlock: true,
        }
    });

    const [isResizing, setIsResizing] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        }
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const style = {
        transform: CSS.Translate.toString(transform),
        position: 'absolute' as const,
        left: block.x,
        top: block.y,
        width: block.w || 300,
        height: block.h,
        zIndex: isDragging || isResizing || showMenu || isSelected ? 1000 : 1, // Elevate when menu is open or selected
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
            className={`group absolute flex flex-col ${isResizing ? 'cursor-ew-resize' : ''} transition-colors border ${showMenu || isSelected ? 'border-brand-500 ring-1 ring-brand-500' : 'border-transparent hover:border-brand-300'}`}
        >
            {/* Controls Overlay (Only visible on hover, menu open, or SELECTED) */}
            <div className={`absolute -top-3 left-0 right-0 flex justify-between pointer-events-none ${showMenu || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity z-50`}>
                {/* Drag Handle (Top Left) */}
                <div
                    ref={setActivatorNodeRef}
                    {...attributes}
                    {...listeners}
                    className="pointer-events-auto cursor-move bg-white shadow-sm border border-gray-200 rounded p-1 text-gray-500 hover:text-brand-600 hover:border-brand-300 transition-colors -ml-2 -mt-2"
                    title="Arrastrar"
                >
                    <GripVertical size={14} />
                </div>

                {/* Settings Trigger (Top Right) */}
                <div className="relative pointer-events-auto -mr-2 -mt-2" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className={`bg-white shadow-sm border rounded p-1 transition-colors ${showMenu ? 'text-brand-600 border-brand-300' : 'text-gray-500 border-gray-200 hover:text-brand-600 hover:border-brand-300'}`}
                        title="Ajustes"
                    >
                        <Settings size={14} />
                    </button>

                    {/* Settings Menu Dropdown / Toolbar */}
                    {showMenu && (
                        <BlockToolbar
                            block={block}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            customActions={settingsMenu}
                        />
                    )}
                </div>
            </div>

            {/* Content Content */}
            <div className={`relative ${isResizing ? 'pointer-events-none' : ''} ${showMenu ? 'pointer-events-none opacity-50' : ''}`}>
                {children}
            </div>

            {/* Resize Handle - Right Edge */}
            <div
                className="absolute top-0 right-[-6px] bottom-0 w-3 cursor-col-resize hover:bg-brand-400/20 z-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onPointerDown={handleResizeStart}
            >
                <div className={`w-1 h-6 rounded-full transition-colors ${isResizing ? 'bg-brand-500' : 'bg-gray-300'}`} />
            </div>
        </div>
    );
}
