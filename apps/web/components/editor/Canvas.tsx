import React, { useState, useEffect } from 'react';
import { Trash2, Rows, Columns, Plus, Minus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { BlockType } from './Toolbox';
import { DraggableBlock } from './DraggableBlock';
import { TableBlock } from './blocks/TableBlock';
import { SmartTextBlock } from './blocks/SmartTextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { FigureBlock } from './blocks/FigureBlock';
import dynamic from 'next/dynamic';
import { snapToGridModifier, Guideline } from './modifiers';

const PdfBackground = dynamic(() => import('./PdfBackground'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 flex items-center justify-center text-gray-400">Cargando soporte PDF...</div>
});

export interface EditorBlock {
    id: string;
    type: BlockType;
    x: number;
    y: number;
    w?: number;
    h?: number;
    content?: string;
    style?: React.CSSProperties;
    page: number; // New Property: Page Number (1-indexed)
    zIndex?: number;
}

interface CanvasProps {
    blocks: EditorBlock[];
    guidelines?: Guideline[]; // Received from Editor
    onDeleteBlock: (id: string) => void;
    onUpdateBlock: (id: string, updates: Partial<EditorBlock>) => void;
    pdfUrl?: string | null;
    numPages: number;
    onAddPage: () => void;
    focusPage?: number | null; // When set, pan to this page
    onFocusPageHandled?: () => void; // Callback to clear focusPage after navigating
}

const SinglePage = React.forwardRef(({ pageNumber, blocks, zoom, pdfUrl, guidelines, children }: any, ref: any) => {
    const { setNodeRef } = useDroppable({
        id: `canvas-page-${pageNumber}`,
        data: { page: pageNumber }
    });

    // Combine refs
    const setRef = (node: HTMLElement | null) => {
        setNodeRef(node);
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
    };

    return (
        <div
            ref={setRef}
            id={`canvas-page-${pageNumber}`}
            className="bg-white shadow-xl w-[210mm] min-h-[297mm] relative shrink-0 transition-transform duration-200 origin-center mb-16" // Increased margin
            style={{
                backgroundImage: !pdfUrl ? 'radial-gradient(#e5e7eb 1px, transparent 1px)' : 'none',
                backgroundSize: '20px 20px',
                backgroundPosition: '-10px -10px', // Shift dots to align with grid Intersections (0,0)
                transform: `scale(${zoom})`,
            }}
        >
            {/* Page Number Indicator - Subtle Text */}
            <div className={`absolute -top-10 left-1/2 -translate-x-1/2 text-gray-300 font-medium text-sm select-none ${pageNumber === 1 ? 'opacity-0' : ''}`}>
                Página {pageNumber}
            </div>

            {pdfUrl && pageNumber === 1 && (
                <img
                    src={pdfUrl}
                    className="absolute inset-0 w-full h-full object-contain opacity-50 pointer-events-none"
                    alt="Background PDF"
                />
            )}

            {/* Smart Guides Overlay */}
            {guidelines && guidelines.map((line: Guideline, i: number) => {
                if (line.page && line.page !== pageNumber) return null;

                if (line.orientation === 'vertical') {
                    return (
                        <div
                            key={i}
                            className="absolute top-0 bottom-0 w-px bg-brand-500 z-[1000] pointer-events-none"
                            style={{ left: line.x }}
                        />
                    );
                } else {
                    return (
                        <div
                            key={i}
                            className="absolute left-0 right-0 h-px bg-brand-500 z-[1000] pointer-events-none"
                            style={{ top: line.y }}
                        />
                    );
                }
            })}

            {children}
        </div>
    );
});

export function Canvas({ blocks, guidelines, onDeleteBlock, onUpdateBlock, pdfUrl, numPages, onAddPage, focusPage, onFocusPageHandled }: CanvasProps) {
    // Note: We don't use useDroppable('canvas') here anymore. Each page is a droppable.

    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const lastMousePos = React.useRef({ x: 0, y: 0 });

    // Pan to focusPage when it changes
    useEffect(() => {
        if (focusPage && focusPage >= 1 && focusPage <= numPages) {
            const pageElement = document.getElementById(`canvas-page-${focusPage}`);
            const wrapperElement = document.getElementById('canvas-wrapper');

            if (pageElement && wrapperElement) {
                const wrapperRect = wrapperElement.getBoundingClientRect();
                const pageRect = pageElement.getBoundingClientRect();

                // Calculate the relative offset of the page within the wrapper (independent of pan)
                const paramsOffset = pageRect.top - wrapperRect.top;

                // Set pan to place page top at 80px from container top
                setPan({ x: 0, y: 80 - paramsOffset });
            }

            onFocusPageHandled?.();
        }
    }, [focusPage, numPages, zoom, onFocusPageHandled]);

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
            if (rows[0]?.length > 1) rows = rows.map(r => r.slice(0, -1));
        }
        onUpdateBlock(blockId, { content: JSON.stringify({ rows }) });
    };

    const handleLayerChange = (blockId: string, action: 'front' | 'back' | 'forward' | 'backward') => {
        const block = blocks.find(b => b.id === blockId);
        if (!block) return;

        let newZIndex = block.zIndex || 1;
        const allZIndices = blocks.map(b => b.zIndex || 1);

        switch (action) {
            case 'front':
                newZIndex = Math.max(...allZIndices, 0) + 1;
                break;
            case 'back':
                // Prevent negative z-index which puts it behind the page background
                newZIndex = Math.max(0, Math.min(...allZIndices) - 1);
                break;
            case 'forward':
                newZIndex += 1;
                break;
            case 'backward':
                newZIndex = Math.max(0, newZIndex - 1);
                break;
        }

        onUpdateBlock(blockId, { zIndex: newZIndex });
    };

    // Zoom handlers
    const handleZoomIn = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoom(prev => Math.min(prev + 0.1, 2));
    };
    const handleZoomOut = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoom(prev => Math.max(prev - 0.1, 0.5));
    };
    const handleZoomFit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    // Panning - Only allow panning from background, not from blocks
    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;

        // Don't start panning if clicking on or inside a draggable block
        if (target.closest('[data-draggable="true"]')) {
            return;
        }

        // Don't start panning if clicking on interactive elements inside blocks
        if (target.closest('button') || target.closest('input') || target.closest('textarea')) {
            return;
        }

        // Start panning only from empty canvas areas
        setIsPanning(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPanning) return;
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;
        setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => setIsPanning(false);
    const handleMouseLeave = () => setIsPanning(false);

    return (
        <div
            className={`flex-1 bg-gray-100/50 overflow-hidden flex relative touch-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!isPanning && !target.closest('[data-draggable="true"]')) {
                    setSelectedBlockId(null);
                }
            }}
        >
            {/* Canvas Wrapper with Pan Transform */}
            <div
                id="canvas-wrapper"
                className="absolute inset-0 flex flex-col items-center pb-32" // Added pb-32 for robust bottom scrolling space
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px)`,
                    transition: isPanning ? 'none' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    // Force height for scrolling content if needed, but 'absolute inset-0' + overflow might clip.
                    // Wait, overflow is hidden on parent, Pan moves this wrapper.
                    // We need this wrapper to be "infinite" effectively.
                }}
            >
                {/* Scale Wrapper applied to all pages together */}
                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    {Array.from({ length: numPages }).map((_, i) => {
                        const pageNum = i + 1;
                        const pageBlocks = blocks.filter(b => (b.page || 1) === pageNum); // Default to page 1 for migration

                        return (
                            <SinglePage
                                key={pageNum}
                                pageNumber={pageNum}
                                blocks={pageBlocks}
                                zoom={1} // Zoom handled by parent wrapper
                                pdfUrl={pdfUrl}
                                guidelines={guidelines} // Pass guidelines
                            >
                                {pageBlocks.map((block) => {
                                    const isSelected = selectedBlockId === block.id;
                                    let settingsMenu = null;
                                    if (block.type === 'table') {
                                        // ... (same settings menu logic)
                                        settingsMenu = (
                                            <>
                                                <button onClick={() => modifyTable(block.id, 'addRow')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                    <Rows size={14} /> <span>+ Fila</span>
                                                </button>
                                                {/* ... other buttons ... */}
                                            </>
                                        );
                                    }

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
                                                block={block}
                                                onDelete={onDeleteBlock}
                                                onUpdate={onUpdateBlock}
                                                onLayerChange={handleLayerChange}
                                                settingsMenu={settingsMenu}
                                                isSelected={isSelected}
                                                onEditModeChange={(isEditing) => isEditing ? setEditingBlockId(block.id) : setEditingBlockId(null)}
                                                forceEdit={editingBlockId === block.id}
                                            >
                                                {/* ... Render Block Content same as before ... */}
                                                {block.type === 'text' && (
                                                    <SmartTextBlock
                                                        content={block.content || ''}
                                                        style={block.style || {}}
                                                        onChange={(val) => onUpdateBlock(block.id, { content: val })}
                                                        isEditing={editingBlockId === block.id}
                                                        onStartEditing={() => setEditingBlockId(block.id)}
                                                        onEndEditing={() => setEditingBlockId(null)}
                                                    />
                                                )}
                                                {block.type === 'table' && (
                                                    <TableBlock
                                                        content={block.content || ''}
                                                        onChange={(newContent) => onUpdateBlock(block.id, { content: newContent })}
                                                    />
                                                )}
                                                {block.type === 'signature' && (
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
                                                {block.type === 'image' && (
                                                    <ImageBlock
                                                        content={block.content}
                                                        onChange={(newContent) => onUpdateBlock(block.id, { content: newContent })}
                                                        style={block.style}
                                                    />
                                                )}
                                                {block.type === 'figure' && (
                                                    <FigureBlock
                                                        content={block.content || 'square'}
                                                        onChange={(updates) => onUpdateBlock(block.id, updates)}
                                                        style={block.style}
                                                    />
                                                )}
                                                {block.type === 'separator' && (
                                                    <div className="w-full py-2">
                                                        <hr className="border-t border-gray-300" style={block.style} />
                                                    </div>
                                                )}
                                            </DraggableBlock>
                                        </div>
                                    );
                                })}
                            </SinglePage>
                        );
                    })}

                    <button
                        onClick={onAddPage}
                        className="mt-4 mb-32 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium text-sm"
                    >
                        <Plus size={16} /> Agregar Nueva Página
                    </button>

                </div>
            </div>

            {/* Bottom Right Controls (Same) */}
            <div className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-white p-1.5 rounded-lg shadow-lg border border-gray-200">
                <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Reducir Zoom (-)">
                    <Minus size={18} />
                </button>
                <div className="px-2 text-sm font-medium text-gray-700 min-w-[3ch] text-center select-none">
                    {Math.round(zoom * 100)}%
                </div>
                <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Aumentar Zoom (+)">
                    <Plus size={18} />
                </button>
                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                <button onClick={handleZoomFit} className="px-3 py-1.5 text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 rounded transition-colors">
                    Fit
                </button>
            </div>
        </div>
    );
}
