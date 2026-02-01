import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Square, Circle, Triangle, Star, Hexagon, Octagon } from 'lucide-react';
import { BlockType } from './Toolbox';

interface FigureItemProps {
    figureType: string;
    label: string;
    icon: React.ReactNode;
}

function FigureItem({ figureType, label, icon }: FigureItemProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `toolbox-figure-${figureType}`,
        data: {
            type: 'figure',
            figureType: figureType,
            isToolboxItem: true,
        },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`cursor-move px-3 py-2.5 bg-white border border-gray-200 rounded-md hover:border-brand-300 hover:bg-brand-50/50 transition-all flex items-center gap-2.5 ${isDragging ? 'opacity-50 ring-2 ring-brand-300 bg-brand-50 shadow-md' : ''
                }`}
        >
            <div className={`text-gray-400 ${isDragging ? 'text-brand-500' : ''}`}>{icon}</div>
            <span className="text-sm font-medium text-gray-600">{label}</span>
        </div>
    );
}

export function FiguresPanel() {
    return (
        <div className="w-60 bg-gray-50/80 border-r border-gray-200 p-3 h-full flex flex-col">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
                Figuras
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2">
                <FigureItem
                    figureType="square"
                    label="Cuadrado"
                    icon={<Square size={16} />}
                />
                <FigureItem
                    figureType="circle"
                    label="Círculo"
                    icon={<Circle size={16} />}
                />
                <FigureItem
                    figureType="triangle"
                    label="Triángulo"
                    icon={<Triangle size={16} />}
                />
                <FigureItem
                    figureType="star"
                    label="Estrella"
                    icon={<Star size={16} />}
                />
                <FigureItem
                    figureType="hexagon"
                    label="Hexágono"
                    icon={<Hexagon size={16} />}
                />
            </div>
        </div>
    );
}
