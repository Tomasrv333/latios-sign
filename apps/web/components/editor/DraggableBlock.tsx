import React, { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { EditorBlock } from './Canvas';
import { Trash2, Move, Pencil, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ChevronDown, Plus, Minus, Grid, Palette, List, ListOrdered, IndentIncrease, IndentDecrease } from 'lucide-react';
import { parseTableData, addRow, removeRow, addColumn, removeColumn, setHeaderRows, setHeaderColor, setBorderColor, setBorderWidth } from './blocks/TableBlock';

interface DraggableBlockProps {
    block: EditorBlock;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<EditorBlock>) => void;
    children: React.ReactNode;
    settingsMenu?: React.ReactNode;
    isSelected?: boolean;
    onSelect?: () => void;
    onEditModeChange?: (isEditing: boolean) => void;
    forceEdit?: boolean; // New prop to force edit mode
}

export function DraggableBlock({ block, onDelete, onUpdate, children, settingsMenu, isSelected, onSelect, onEditModeChange, forceEdit }: DraggableBlockProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: block.id,
        data: {
            ...block,
            isCanvasBlock: true,
        }
    });

    const [isResizing, setIsResizing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (typeof forceEdit === 'boolean' && forceEdit !== isEditMode) {
            setIsEditMode(forceEdit);
        }
    }, [forceEdit]);

    const [showColorPicker, setShowColorPicker] = useState<'text' | 'header' | 'border' | null>(null);
    const blockRef = useRef<HTMLDivElement>(null);
    const colorPickerRef = useRef<HTMLDivElement>(null);

    // Exit edit mode when clicking outside the block
    const onEditModeChangeRef = useRef(onEditModeChange);
    useEffect(() => {
        onEditModeChangeRef.current = onEditModeChange;
    }, [onEditModeChange]);

    useEffect(() => {
        function handleClickOutsideBlock(event: MouseEvent) {
            if (blockRef.current && !blockRef.current.contains(event.target as Node)) {
                setIsEditMode(false);
                setShowColorPicker(null);
            }
        }
        if (isEditMode) {
            document.addEventListener('mousedown', handleClickOutsideBlock);
        }
        onEditModeChangeRef.current?.(isEditMode); // Notify parent safely
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideBlock);
        };
    }, [isEditMode]);

    const isTextBlock = block.type === 'text';
    const isTableBlock = block.type === 'table';
    const isImageBlock = block.type === 'image';

    // Images need fixed dimensions, text uses fit-content
    const style = {
        transform: CSS.Translate.toString(transform),
        position: 'absolute' as const,
        left: block.x,
        top: block.y,
        width: isImageBlock ? (block.w || 200) : (block.w || 'fit-content'),
        height: isImageBlock ? (block.h || 150) : (block.h || 'auto'),
        minWidth: isImageBlock ? 50 : 60,
        minHeight: isImageBlock ? 50 : 30,
        zIndex: isDragging || isResizing || isSelected || isEditMode ? 1000 : 1,
        opacity: isDragging ? 0.7 : 1,
    };

    // Style helpers for text blocks
    const blockStyle = block.style || {};
    const updateStyle = (newStyle: React.CSSProperties) => {
        onUpdate(block.id, { style: { ...blockStyle, ...newStyle } });
    };
    const toggleStyle = (key: keyof React.CSSProperties, value: any, fallback: any) => {
        const current = blockStyle[key];
        updateStyle({ [key]: current === value ? fallback : value });
    };

    // Table data helpers
    const tableData = block.type === 'table' ? parseTableData(block.content) : null;
    const updateTableContent = (newContent: string) => {
        onUpdate(block.id, { content: newContent });
    };

    // Resize Handler - Width only
    const handleResizeWidth = (e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);

        const startX = e.clientX;
        const startWidth = typeof style.width === 'number' ? style.width : 200;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
            onUpdate(block.id, { w: newWidth });
        };

        const onPointerUp = () => {
            setIsResizing(false);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    // Resize Handler - Height only
    const handleResizeHeight = (e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);

        const startY = e.clientY;
        const startHeight = typeof style.height === 'number' ? style.height : 150;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const newHeight = Math.max(50, startHeight + (moveEvent.clientY - startY));
            onUpdate(block.id, { h: newHeight });
        };

        const onPointerUp = () => {
            setIsResizing(false);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    // Resize Handler - Proportional (corner)
    const handleResizeProportional = (e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = typeof style.width === 'number' ? style.width : 200;
        const startHeight = typeof style.height === 'number' ? style.height : 150;
        const aspectRatio = startWidth / startHeight;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;
            // Use the larger delta to maintain aspect ratio
            const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY * aspectRatio;
            const newWidth = Math.max(50, startWidth + delta);
            const newHeight = Math.max(50, newWidth / aspectRatio);
            onUpdate(block.id, { w: newWidth, h: newHeight });
        };

        const onPointerUp = () => {
            setIsResizing(false);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    const handleDoubleClick = () => {
        setIsEditMode(true);
    };

    const enterEditMode = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditMode(true);
    };

    const showControls = isSelected || isHovered || isEditMode;
    const dragProps = isEditMode ? {} : { ...attributes, ...listeners };

    // Select dropdown component
    const Select = ({ value, onChange, options, width = "w-auto" }: { value: string, onChange: (val: string) => void, options: { label: string, value: string }[], width?: string }) => (
        <div className={`relative ${width} group`}>
            <select
                className="appearance-none w-full bg-transparent text-sm font-medium text-gray-700 px-2 py-1 pe-5 focus:outline-none cursor-pointer hover:text-gray-900"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="text-gray-900 bg-white py-1">{opt.label}</option>
                ))}
            </select>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={12} />
            </div>
        </div>
    );

    // Color picker component
    const ColorPicker = ({ colors, onSelect, currentColor }: { colors: string[], onSelect: (color: string) => void, currentColor?: string }) => (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-2 grid grid-cols-5 gap-1.5 w-36 z-[100]">
            {colors.map(color => (
                <button
                    key={color}
                    className={`w-5 h-5 rounded-full border-2 hover:scale-110 transition-transform ${currentColor === color ? 'border-brand-500' : 'border-gray-200'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => onSelect(color)}
                    onPointerDown={(e) => e.stopPropagation()}
                />
            ))}
        </div>
    );

    const textColors = ['#000000', '#374151', '#9CA3AF', '#DC2626', '#EA580C', '#D97706', '#16A34A', '#2563EB', '#7C3AED', '#DB2777'];
    const tableColors = ['#f3f4f6', '#e5e7eb', '#dbeafe', '#dcfce7', '#fef3c7', '#fee2e2', '#f3e8ff', '#fce7f3', '#ffffff', '#1f2937'];

    return (
        <div
            ref={(node) => {
                setNodeRef(node);
                blockRef.current = node;
            }}
            style={style}
            data-draggable="true"
            className={`group absolute ${isEditMode ? '' : 'cursor-move'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDoubleClick={handleDoubleClick}
            onClick={() => onSelect?.()}
            {...dragProps}
        >
            {/* Border Frame */}
            <div
                className={`absolute inset-0 rounded transition-all pointer-events-none ${isEditMode
                    ? 'border-2 border-brand-600 shadow-[0_0_0_2px_rgba(79,70,229,0.15)]'
                    : isHovered || isSelected
                        ? 'border border-brand-500'
                        : 'border border-transparent'
                    }`}
            />

            {/* Edit Mode: Text Formatting Toolbar */}
            {isEditMode && isTextBlock && (
                <div
                    className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 px-1.5 py-1 z-50"
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {/* Font Family */}
                    <Select
                        width="w-20"
                        value={blockStyle.fontFamily as string || 'Inter'}
                        onChange={(val) => updateStyle({ fontFamily: val })}
                        options={[
                            { label: 'Inter', value: 'Inter' },
                            { label: 'Arial', value: 'Arial' },
                            { label: 'Times', value: 'Times New Roman' },
                            { label: 'Courier', value: 'Courier New' },
                        ]}
                    />
                    <div className="w-px h-5 bg-gray-200" />
                    {/* Font Size */}
                    <Select
                        width="w-12"
                        value={blockStyle.fontSize as string || '16px'}
                        onChange={(val) => updateStyle({ fontSize: val })}
                        options={[
                            { label: '12', value: '12px' },
                            { label: '14', value: '14px' },
                            { label: '16', value: '16px' },
                            { label: '18', value: '18px' },
                            { label: '20', value: '20px' },
                            { label: '24', value: '24px' },
                            { label: '32', value: '32px' },
                        ]}
                    />
                    <div className="w-px h-5 bg-gray-200" />
                    {/* Bold, Italic, Underline */}
                    <button onClick={() => toggleStyle('fontWeight', 'bold', 'normal')} onPointerDown={(e) => e.stopPropagation()} className={`p-1 rounded transition-colors ${blockStyle.fontWeight === 'bold' ? 'bg-brand-100 text-brand-600' : 'text-gray-600 hover:bg-gray-100'}`} title="Negrita"><Bold size={14} /></button>
                    <button onClick={() => toggleStyle('fontStyle', 'italic', 'normal')} onPointerDown={(e) => e.stopPropagation()} className={`p-1 rounded transition-colors ${blockStyle.fontStyle === 'italic' ? 'bg-brand-100 text-brand-600' : 'text-gray-600 hover:bg-gray-100'}`} title="Cursiva"><Italic size={14} /></button>
                    <button onClick={() => toggleStyle('textDecoration', 'underline', 'none')} onPointerDown={(e) => e.stopPropagation()} className={`p-1 rounded transition-colors ${blockStyle.textDecoration === 'underline' ? 'bg-brand-100 text-brand-600' : 'text-gray-600 hover:bg-gray-100'}`} title="Subrayado"><Underline size={14} /></button>
                    <div className="w-px h-5 bg-gray-200" />
                    {/* Alignment */}
                    <button onClick={() => updateStyle({ textAlign: 'left' })} onPointerDown={(e) => e.stopPropagation()} className={`p-1 rounded transition-colors ${blockStyle.textAlign === 'left' || !blockStyle.textAlign ? 'bg-brand-100 text-brand-600' : 'text-gray-600 hover:bg-gray-100'}`}><AlignLeft size={14} /></button>
                    <button onClick={() => updateStyle({ textAlign: 'center' })} onPointerDown={(e) => e.stopPropagation()} className={`p-1 rounded transition-colors ${blockStyle.textAlign === 'center' ? 'bg-brand-100 text-brand-600' : 'text-gray-600 hover:bg-gray-100'}`}><AlignCenter size={14} /></button>
                    <button onClick={() => updateStyle({ textAlign: 'right' })} onPointerDown={(e) => e.stopPropagation()} className={`p-1 rounded transition-colors ${blockStyle.textAlign === 'right' ? 'bg-brand-100 text-brand-600' : 'text-gray-600 hover:bg-gray-100'}`}><AlignRight size={14} /></button>
                    <div className="w-px h-5 bg-gray-200" />
                    {/* Text Color */}
                    <div className="relative" ref={colorPickerRef}>
                        <button className="p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors" title="Color de Texto" onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')} onPointerDown={(e) => e.stopPropagation()}>
                            <div className="flex flex-col items-center justify-center h-4 w-4">
                                <span className="font-bold text-xs leading-none" style={{ color: blockStyle.color as string || '#000' }}>A</span>
                                <div className="h-0.5 w-3 mt-0.5 rounded-full" style={{ backgroundColor: blockStyle.color as string || '#000' }} />
                            </div>
                        </button>
                        {showColorPicker === 'text' && (
                            <ColorPicker colors={textColors} currentColor={blockStyle.color as string} onSelect={(color) => { updateStyle({ color }); setShowColorPicker(null); }} />
                        )}
                    </div>
                </div>
            )}

            {/* Edit Mode: Table Toolbar */}
            {isEditMode && isTableBlock && tableData && (
                <div
                    className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 px-1.5 py-1 z-50"
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {/* Rows */}
                    <div className="flex items-center gap-0.5 text-gray-600">
                        <span className="text-xs font-medium px-1">Filas</span>
                        <button onClick={() => updateTableContent(removeRow(block.content || ''))} onPointerDown={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-gray-100" title="Quitar fila"><Minus size={12} /></button>
                        <span className="text-xs font-medium w-4 text-center">{tableData.rows.length}</span>
                        <button onClick={() => updateTableContent(addRow(block.content || ''))} onPointerDown={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-gray-100" title="Agregar fila"><Plus size={12} /></button>
                    </div>

                    <div className="w-px h-5 bg-gray-200" />

                    {/* Columns */}
                    <div className="flex items-center gap-0.5 text-gray-600">
                        <span className="text-xs font-medium px-1">Cols</span>
                        <button onClick={() => updateTableContent(removeColumn(block.content || ''))} onPointerDown={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-gray-100" title="Quitar columna"><Minus size={12} /></button>
                        <span className="text-xs font-medium w-4 text-center">{tableData.rows[0]?.length || 0}</span>
                        <button onClick={() => updateTableContent(addColumn(block.content || ''))} onPointerDown={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-gray-100" title="Agregar columna"><Plus size={12} /></button>
                    </div>

                    <div className="w-px h-5 bg-gray-200" />

                    {/* Header Rows */}
                    <div className="flex items-center gap-0.5 text-gray-600">
                        <span className="text-xs font-medium px-1">Header</span>
                        <button onClick={() => updateTableContent(setHeaderRows(block.content || '', Math.max(0, (tableData.headerRows || 0) - 1)))} onPointerDown={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-gray-100"><Minus size={12} /></button>
                        <span className="text-xs font-medium w-4 text-center">{tableData.headerRows || 0}</span>
                        <button onClick={() => updateTableContent(setHeaderRows(block.content || '', (tableData.headerRows || 0) + 1))} onPointerDown={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-gray-100"><Plus size={12} /></button>
                    </div>

                    <div className="w-px h-5 bg-gray-200" />

                    {/* Header Color */}
                    <div className="relative">
                        <button
                            className="p-1 rounded hover:bg-gray-100 text-gray-600 flex items-center gap-1"
                            title="Color de encabezado"
                            onClick={() => setShowColorPicker(showColorPicker === 'header' ? null : 'header')}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <Grid size={12} />
                            <div className="w-3 h-3 rounded border border-gray-300" style={{ backgroundColor: tableData.headerColor }} />
                        </button>
                        {showColorPicker === 'header' && (
                            <ColorPicker colors={tableColors} currentColor={tableData.headerColor} onSelect={(color) => { updateTableContent(setHeaderColor(block.content || '', color)); setShowColorPicker(null); }} />
                        )}
                    </div>

                    {/* Border Color */}
                    <div className="relative">
                        <button
                            className="p-1 rounded hover:bg-gray-100 text-gray-600 flex items-center gap-1"
                            title="Color de borde"
                            onClick={() => setShowColorPicker(showColorPicker === 'border' ? null : 'border')}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <Palette size={12} />
                            <div className="w-3 h-3 rounded border-2" style={{ borderColor: tableData.borderColor }} />
                        </button>
                        {showColorPicker === 'border' && (
                            <ColorPicker colors={['#d1d5db', '#9ca3af', '#6b7280', '#374151', '#000000', '#dc2626', '#16a34a', '#2563eb', '#7c3aed', '#db2777']} currentColor={tableData.borderColor} onSelect={(color) => { updateTableContent(setBorderColor(block.content || '', color)); setShowColorPicker(null); }} />
                        )}
                    </div>

                    <div className="w-px h-5 bg-gray-200" />

                    {/* Border Width */}
                    <Select
                        width="w-12"
                        value={String(tableData.borderWidth || 1)}
                        onChange={(val) => updateTableContent(setBorderWidth(block.content || '', parseInt(val)))}
                        options={[
                            { label: '1px', value: '1' },
                            { label: '2px', value: '2' },
                            { label: '3px', value: '3' },
                        ]}
                    />
                </div>
            )}

            {/* Edit Mode Indicator (for other blocks) */}
            {isEditMode && !isTextBlock && !isTableBlock && (
                <div className="absolute -top-6 left-0 bg-brand-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-t">
                    Editando
                </div>
            )}

            {/* Normal Mode Toolbar (Move, Edit, Delete) */}
            <div
                className={`absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white rounded-md shadow-md border border-gray-200 px-0.5 py-0.5 transition-all z-50 ${showControls && !isEditMode
                    ? 'opacity-100 visible'
                    : 'opacity-0 invisible'
                    }`}
                onMouseEnter={() => setIsHovered(true)}
            >
                <div className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded cursor-move transition-colors" title="Mover bloque" {...attributes} {...listeners}><Move size={14} /></div>
                <div className="w-px h-4 bg-gray-200" />
                <button onClick={enterEditMode} onPointerDown={(e) => e.stopPropagation()} className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors" title="Editar contenido"><Pencil size={14} /></button>
                <div className="w-px h-4 bg-gray-200" />
                <button onClick={(e) => { e.stopPropagation(); onDelete(block.id); }} onPointerDown={(e) => e.stopPropagation()} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar"><Trash2 size={14} /></button>
            </div>

            {/* Content Area */}
            <div className={`relative p-1 ${isEditMode ? '' : 'pointer-events-none select-none'} ${isResizing ? 'pointer-events-none' : ''}`}>
                {children}
            </div>

            {/* Resize Handles */}
            {/* Right edge - Width resize */}
            <div
                className={`absolute top-0 right-[-4px] bottom-0 w-2 cursor-col-resize z-50 flex items-center justify-center transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
                onPointerDown={handleResizeWidth}
            >
                <div className={`w-1 h-8 rounded-full transition-colors ${isResizing ? 'bg-brand-600' : 'bg-gray-300 hover:bg-brand-500'}`} />
            </div>

            {/* Bottom edge - Height resize (for images) */}
            {isImageBlock && (
                <div
                    className={`absolute bottom-[-4px] left-0 right-0 h-2 cursor-row-resize z-50 flex justify-center items-center transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
                    onPointerDown={handleResizeHeight}
                >
                    <div className={`h-1 w-8 rounded-full transition-colors ${isResizing ? 'bg-brand-600' : 'bg-gray-300 hover:bg-brand-500'}`} />
                </div>
            )}

            {/* Corner - Proportional resize (for images) */}
            {isImageBlock && (
                <div
                    className={`absolute bottom-[-6px] right-[-6px] w-3 h-3 cursor-nwse-resize z-50 flex items-center justify-center transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
                    onPointerDown={handleResizeProportional}
                >
                    <div className={`w-2.5 h-2.5 rounded-sm transition-colors ${isResizing ? 'bg-brand-600' : 'bg-gray-400 hover:bg-brand-500'}`} />
                </div>
            )}

            {/* Hover hint */}
            {isHovered && !isEditMode && !isDragging && (
                <div className="absolute bottom-1 right-1 text-[9px] text-gray-400 bg-white/80 px-1 rounded">
                    Doble clic para editar
                </div>
            )}
        </div>
    );
}
