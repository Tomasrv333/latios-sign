import React, { useState, useRef, useEffect } from 'react';
import { Square, Circle, Triangle, Star, Hexagon, RefreshCcw } from 'lucide-react';

interface FigureData {
    type: string;
    fill: string;
    stroke: string;
    strokeWidth: number;
}

interface FigureBlockProps {
    content: string; // JSON string or simple type string
    style?: React.CSSProperties;
    onChange: (updates: { content: string }) => void;
    isEditing?: boolean;
    onStartEditing?: () => void;
    onEndEditing?: () => void;
}

export function FigureBlock({ content, style, onChange }: FigureBlockProps) {
    // Parse content
    let data: FigureData = {
        type: 'square',
        fill: 'transparent',
        stroke: '#4F46E5', // brand-600
        strokeWidth: 2
    };

    try {
        if (content && content.startsWith('{')) {
            const parsed = JSON.parse(content);
            data = { ...data, ...parsed };
        } else if (content) {
            data.type = content;
        }
    } catch (e) {
        // Fallback to simple string if parse fails (legacy/safety)
        if (content) data.type = content;
    }

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const updateData = (updates: Partial<FigureData>) => {
        onChange({ content: JSON.stringify({ ...data, ...updates }) });
    };

    const getIcon = (type: string, size: string | number = 24, className = "") => {
        const props = {
            size,
            className,
            strokeWidth: data.strokeWidth,
            fill: data.fill !== 'transparent' ? data.fill : 'none',
            color: data.stroke,
            preserveAspectRatio: "none"
        };
        switch (type) {
            case 'square': return <Square {...props} />;
            case 'circle': return <Circle {...props} />;
            case 'triangle': return <Triangle {...props} />;
            case 'star': return <Star {...props} />;
            case 'hexagon': return <Hexagon {...props} />;
            default: return <Square {...props} />;
        }
    };

    const handleSelectType = (type: string) => {
        updateData({ type });
        setIsOpen(false);
    }

    return (
        <div className="group relative w-full h-full flex items-center justify-center" style={style}>
            <div className="w-full h-full flex items-center justify-center">
                {getIcon(data.type, "100%", "w-full h-full transition-all duration-200")}
            </div>

            {/* Quick Swap Menu (Type only) */}
            <div className="absolute -top-3 -right-3 z-50" ref={containerRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-white shadow-md border border-gray-200 p-1 rounded-full text-gray-500 hover:text-brand-600 hidden group-hover:flex"
                    title="Cambiar Figura"
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                >
                    <RefreshCcw size={14} />
                </button>

                {isOpen && (
                    <div className="absolute top-8 right-0 bg-white p-2 rounded-lg shadow-xl border border-gray-200 w-48 animate-in fade-in zoom-in-95 z-50">
                        <div className="grid grid-cols-4 gap-2">
                            {['square', 'circle', 'triangle', 'star', 'hexagon'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleSelectType(type)}
                                    className={`p-2 rounded hover:bg-gray-100 flex items-center justify-center ${data.type === type ? 'bg-brand-50 text-brand-600' : 'text-gray-600'}`}
                                    title={type}
                                >
                                    {/* Preview always simple */}
                                    {(() => {
                                        const PreviewProps = { size: 20 };
                                        switch (type) {
                                            case 'square': return <Square {...PreviewProps} />;
                                            case 'circle': return <Circle {...PreviewProps} />;
                                            case 'triangle': return <Triangle {...PreviewProps} />;
                                            case 'star': return <Star {...PreviewProps} />;
                                            case 'hexagon': return <Hexagon {...PreviewProps} />;
                                            default: return <Square {...PreviewProps} />;
                                        }
                                    })()}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
