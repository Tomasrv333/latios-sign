'use client';

import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
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
import { VariablesPanel } from './VariablesPanel';
import { FiguresPanel } from './FiguresPanel';
import { SendDocumentModal } from '../dashboard/send/SendDocumentModal';
import { Canvas, EditorBlock } from './Canvas';
import { EditorToolbar } from './EditorToolbar';
import { PagesManager } from './PagesManager';
import { Type, Calendar, PenTool } from 'lucide-react';
import { snapToGridModifier, createSmartGuidesModifier, Guideline } from './modifiers';

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
    settings?: any; // Received from parent for Toolbar usage
    onSettingsChange?: (newSettings: any) => void;
    templateId?: string;
}

export function Editor({ blocks, onChange: setBlocks, pdfUrl, settings, onSettingsChange, templateId }: EditorProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<BlockType | null>(null);
    const [isToolboxDrag, setIsToolboxDrag] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [guidelines, setGuidelines] = useState<Guideline[]>([]); // Smart Guides State

    // Modifier logic
    const smartGuidesModifier = React.useMemo(
        () => createSmartGuidesModifier(blocks, (lines) => setGuidelines(lines)),
        [blocks]
    );

    // Sidebar State
    const [activeTab, setActiveTab] = useState<'tools' | 'pages' | 'variables' | 'figures' | null>('pages'); // Default to Pages as key view
    const [numPages, setNumPages] = useState(1);
    const [focusPage, setFocusPage] = useState<number | null>(null); // For navigating to a specific page
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);

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
        setIsToolboxDrag(!!activeData?.isToolboxItem);

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
        setGuidelines([]); // Clear lines on drop

        if (!over) {
            setActiveId(null);
            setActiveType(null);
            return;
        }

        // Check if dropped on a specific page
        const isOverPage = over.id.toString().startsWith('canvas-page-');
        const isOverBlock = blocks.some(b => b.id === over.id);

        // Extract page number if dropped on page background, else defaults to... 1? or find block page?
        let targetPage = 1;

        if (isOverPage) {
            targetPage = parseInt(over.id.toString().replace('canvas-page-', ''));
        } else if (isOverBlock) {
            const targetBlock = blocks.find(b => b.id === over.id);
            if (targetBlock) targetPage = targetBlock.page;
        }

        if (isOverPage || isOverBlock) {
            // Needed to calculate relative coordinates if we want precision, 
            // but for dropping *new* items, we can just center/default or calculate.
            // Getting relative coords on dropped page is tricky without the page element ref.
            // Just default to a safe pos for now, or use event.delta/translated rect.

            const canvasElement = document.getElementById(`canvas-wrapper`); // Use wrapper logic if possible, or simple drop.

            // Simplified positioning:
            // Since we know the 'active.rect', we can try to find position.
            // But 'over.rect' is the page rect.

            let x = 0;
            let y = 0;

            if (over.rect) {
                // Approximate relative position
                // Note: 'translated' gives the final position of the DragOverlay item.
                // We compare it to the page (over) rect.
                const dropRect = active.rect.current.translated;
                if (dropRect) {
                    x = dropRect.left - over.rect.left;
                    y = dropRect.top - over.rect.top;

                    // Adjust for Zoom? 
                    // The passed 'x/y' to blocks are usually CSS pixels.
                    // If Zoom is applied via Transform, we might need to query the zoom level or assume 1 during drag calculations?
                    // Let's assume 1 for now or ignore advanced zoom calc until tested.

                    x = Math.max(0, x);
                    y = Math.max(0, y);
                }
            }

            if (active.data.current?.isToolboxItem) {
                const type = active.data.current.type as BlockType;

                // If it's a figure, get the specific shape from data
                let content = active.data.current.content || '';
                if (type === 'figure') {
                    content = active.data.current.figureType || 'square';
                }

                const newBlock: EditorBlock = {
                    id: Math.random().toString(36).substring(2, 9),
                    type,
                    content,
                    x,
                    y,
                    // No fixed w/h - blocks will auto-size to content
                    page: targetPage // Assign to specific page
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

                            // If we dragged to a new page, updating 'x,y' based on delta might be weird
                            // because delta is global delta.
                            // Ideally we just update coords. 
                            // *Complexity*: Dragging between pages requires re-calculating (x,y) relative to NEW page.
                            // For V1, let's keep it simple: Dragging updates X/Y safely.
                            // If we cross pages, we might need to detect 'over' change and update 'page' prop.

                            let newPage = b.page;
                            let finalX = Math.max(0, snappedX);
                            let finalY = Math.max(0, snappedY);

                            if (isOverPage && targetPage !== b.page) {
                                newPage = targetPage;
                                // Reset X/Y relative to new page top-left?
                                // event.delta is cumulative. 
                                // Proper way: (DropRect - NewPageRect)
                                if (active.rect.current.translated && over.rect) {
                                    finalX = active.rect.current.translated.left - over.rect.left;
                                    finalY = active.rect.current.translated.top - over.rect.top;
                                }
                            }

                            return {
                                ...b,
                                x: Math.max(0, finalX),
                                y: Math.max(0, finalY),
                                page: newPage
                            };
                        }
                        return b;
                    });
                });
            }
        }

        setActiveId(null);
        setActiveType(null);
        setIsToolboxDrag(false);
    }


    function handleUpdateBlock(id: string, updates: Partial<EditorBlock>) {
        setBlocks((items) => items.map(b => b.id === id ? { ...b, ...updates } : b));
    }

    function handleDeleteBlock(id: string) {
        setBlocks((items) => items.filter((b) => b.id !== id));
    }

    // Page Management Logic
    const handleAddPage = () => setNumPages(n => n + 1);

    const handleDeletePage = (pageIndex: number) => {
        if (numPages <= 1) return;

        // Remove blocks on this page
        setBlocks(prev => prev.filter(b => b.page !== pageIndex));

        // Shift blocks on subsequent pages down (pageIndex + 1 becomes pageIndex)
        setBlocks(prev => prev.map(b => {
            if (b.page > pageIndex) {
                return { ...b, page: b.page - 1 };
            }
            return b;
        }));

        setNumPages(n => n - 1);
    };

    const handleMovePage = (fromIndex: number, toIndex: number) => {
        if (toIndex < 1 || toIndex > numPages || fromIndex === toIndex) return;

        // Swap logic:
        // Blocks on 'fromIndex' -> become 'toIndex'
        // Blocks on 'toIndex' -> become 'fromIndex'

        setBlocks(prev => prev.map(b => {
            if (b.page === fromIndex) return { ...b, page: toIndex };
            if (b.page === toIndex) return { ...b, page: fromIndex };
            return b;
        }));

        // No change to numPages
    };

    // Sidebar Toggle Logic
    const handleTabChange = (tab: 'tools' | 'pages' | 'variables' | 'figures') => {
        if (activeTab === tab) {
            setActiveTab(null); // Close if clicking same
        } else {
            setActiveTab(tab);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden w-full bg-gray-50">
            {/* Toolbar */}
            <EditorToolbar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                signatureType={settings?.signatureType || 'draw'}
                onSignatureTypeChange={(type) => {
                    if (onSettingsChange) {
                        onSettingsChange({ ...settings, signatureType: type })
                    }
                }}
                processId={settings?.processId}
                onProcessChange={(id) => {
                    if (onSettingsChange) {
                        onSettingsChange({ ...settings, processId: id })
                    }
                }}
            />

            {/* SendDocumentModal Removed */}

            <div className="flex flex-1 overflow-hidden relative">
                <DndContext
                    sensors={sensors}
                    collisionDetection={pointerWithin}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    modifiers={[smartGuidesModifier]}
                >
                    {/* Collapsible Sidebar */}
                    <div
                        className={`border-r border-gray-200 bg-white transition-all duration-300 ease-in-out ${activeTab ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0 overflow-hidden'
                            }`}
                    >
                        <div className="w-64 h-full">
                            {activeTab === 'tools' && <Toolbox />}
                            {activeTab === 'figures' && <FiguresPanel />}
                            {activeTab === 'variables' && <VariablesPanel />}
                            {activeTab === 'pages' && (
                                <PagesManager
                                    blocks={blocks}
                                    numPages={numPages}
                                    onAddPage={handleAddPage}
                                    onDeletePage={handleDeletePage}
                                    onMovePage={handleMovePage}
                                    onPageClick={(pageNumber) => {
                                        setFocusPage(pageNumber);
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    <Canvas
                        blocks={blocks}
                        guidelines={guidelines}
                        onDeleteBlock={handleDeleteBlock}
                        onUpdateBlock={handleUpdateBlock}
                        pdfUrl={pdfUrl}
                        numPages={numPages}
                        onAddPage={handleAddPage}
                        focusPage={focusPage}
                        onFocusPageHandled={() => setFocusPage(null)}
                    />


                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeId && isToolboxDrag ? (
                            activeType ? (
                                <div className="p-4 bg-white border border-brand-500 shadow-xl rounded-lg opacity-80 w-64 pointer-events-none">
                                    <div className="flex items-center gap-3">
                                        {activeType === 'text' && <Type />}
                                        {activeType === 'date' && <Calendar />}
                                        {activeType === 'signature' && <PenTool />}
                                        {activeType === 'figure' && <span className="font-bold text-xl">♦</span>}
                                        <span className="font-medium capitalize">{activeType}</span>
                                    </div>
                                </div>
                            ) : null
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}
