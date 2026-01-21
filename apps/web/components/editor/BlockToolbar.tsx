import React, { useState, useRef, useEffect } from 'react';
import { EditorBlock } from './Canvas';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Trash2, ChevronDown } from 'lucide-react';

interface BlockToolbarProps {
    block: EditorBlock;
    onUpdate: (id: string, updates: Partial<EditorBlock>) => void;
    onDelete?: (id: string) => void;
    customActions?: React.ReactNode;
}

export function BlockToolbar({ block, onUpdate, onDelete, customActions }: BlockToolbarProps) {
    const style = block.style || {};
    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef<HTMLDivElement>(null);

    // Close color picker on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setShowColorPicker(false);
            }
        }
        if (showColorPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showColorPicker]);

    const updateStyle = (newStyle: React.CSSProperties) => {
        onUpdate(block.id, {
            style: { ...style, ...newStyle }
        });
    };

    const toggleStyle = (key: keyof React.CSSProperties, value: any, fallback: any) => {
        const current = style[key];
        updateStyle({ [key]: current === value ? fallback : value });
    };

    // Shared "Delete" button
    const DeleteButton = () => (
        onDelete ? (
            <button
                onClick={() => onDelete(block.id)}
                className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors ml-1"
                title="Eliminar Bloque"
            >
                <Trash2 size={16} />
            </button>
        ) : null
    );

    const Select = ({ value, onChange, options, width = "w-auto" }: { value: string, onChange: (val: string) => void, options: { label: string, value: string }[], width?: string }) => (
        <div className={`relative ${width} group`}>
            <select
                className="appearance-none w-full bg-transparent text-sm font-medium text-gray-900 px-2 py-1 pe-6 focus:outline-none cursor-pointer"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{ textAlignLast: 'left' }}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="text-gray-900 bg-white py-1">{opt.label}</option>
                ))}
            </select>
            {/* Custom Arrow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-gray-900">
                <ChevronDown size={14} strokeWidth={2.5} />
            </div>
        </div>
    );

    if (block.type === 'text') {
        return (
            <div
                className="absolute right-0 bottom-full mb-2 z-[60] bg-white rounded-lg shadow-xl border border-gray-200 p-1.5 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200 whitespace-nowrap"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Font Family */}
                <Select
                    width="w-24"
                    value={style.fontFamily || 'Inter'}
                    onChange={(val) => updateStyle({ fontFamily: val })}
                    options={[
                        { label: 'Inter', value: 'Inter' },
                        { label: 'Arial', value: 'Arial' },
                        { label: 'Times', value: 'Times New Roman' },
                        { label: 'Courier', value: 'Courier New' },
                    ]}
                />

                <div className="w-px h-5 bg-gray-200"></div>

                {/* Font Size */}
                <Select
                    width="w-16"
                    value={style.fontSize || '16px'}
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

                <div className="w-px h-5 bg-gray-200"></div>

                {/* Formatting */}
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => toggleStyle('fontWeight', 'bold', 'normal')}
                        className={`p-1.5 rounded transition-colors ${style.fontWeight === 'bold' ? 'bg-gray-100 text-brand-600' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                        title="Negrita"
                    >
                        <Bold size={16} />
                    </button>
                    <button
                        onClick={() => toggleStyle('fontStyle', 'italic', 'normal')}
                        className={`p-1.5 rounded transition-colors ${style.fontStyle === 'italic' ? 'bg-gray-100 text-brand-600' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                        title="Cursiva"
                    >
                        <Italic size={16} />
                    </button>
                    <button
                        onClick={() => toggleStyle('textDecoration', 'underline', 'none')}
                        className={`p-1.5 rounded transition-colors ${style.textDecoration === 'underline' ? 'bg-gray-100 text-brand-600' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                        title="Subrayado"
                    >
                        <Underline size={16} />
                    </button>
                </div>

                <div className="w-px h-5 bg-gray-200"></div>

                {/* Alignment */}
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => updateStyle({ textAlign: 'left' })}
                        className={`p-1.5 rounded transition-colors ${style.textAlign === 'left' || !style.textAlign ? 'bg-gray-100 text-brand-600' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                        <AlignLeft size={16} />
                    </button>
                    <button
                        onClick={() => updateStyle({ textAlign: 'center' })}
                        className={`p-1.5 rounded transition-colors ${style.textAlign === 'center' ? 'bg-gray-100 text-brand-600' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                        <AlignCenter size={16} />
                    </button>
                    <button
                        onClick={() => updateStyle({ textAlign: 'right' })}
                        className={`p-1.5 rounded transition-colors ${style.textAlign === 'right' ? 'bg-gray-100 text-brand-600' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                        <AlignRight size={16} />
                    </button>
                </div>

                <div className="w-px h-5 bg-gray-200"></div>

                {/* Text Color */}
                <div className="relative" ref={colorPickerRef}>
                    <button
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
                        title="Color de Texto"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                    >
                        <div className="flex flex-col items-center justify-center h-5 w-5">
                            <span className="font-bold text-sm leading-none" style={{ color: style.color as string || '#000' }}>A</span>
                            <div className="h-0.5 w-4 mt-0.5 rounded-full" style={{ backgroundColor: style.color as string || '#000' }}></div>
                        </div>
                    </button>

                    {showColorPicker && (
                        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-3 grid grid-cols-5 gap-2 w-48 z-50 animate-in fade-in zoom-in-95 duration-100">
                            {[
                                '#000000', '#374151', '#9CA3AF', '#DC2626', '#EA580C',
                                '#D97706', '#16A34A', '#2563EB', '#7C3AED', '#DB2777'
                            ].map(color => (
                                <button
                                    key={color}
                                    className="w-6 h-6 rounded-full border border-gray-200 shadow-sm hover:scale-110 hover:shadow-md transition-all ring-offset-1 focus:ring-2 focus:ring-brand-500 outline-none"
                                    style={{ backgroundColor: color }}
                                    onClick={() => {
                                        updateStyle({ color });
                                        setShowColorPicker(false);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Custom Actions Slot */}
                {customActions && (
                    <>
                        <div className="w-px h-5 bg-gray-200"></div>
                        {customActions}
                    </>
                )}

                <div className="w-px h-5 bg-gray-200"></div>
                <DeleteButton />
            </div>
        );
    }

    // Default container for other blocks (Image, etc.)
    return (
        <div
            className="absolute right-0 bottom-full mb-2 z-[60] bg-white rounded-lg shadow-xl border border-gray-200 p-1.5 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200 whitespace-nowrap"
            onMouseDown={(e) => e.stopPropagation()}
        >
            {block.type === 'image' && (
                <>
                    <span className="text-sm font-medium text-gray-700 px-1">Radio:</span>
                    <Select
                        width="w-20"
                        value={style.borderRadius || '0px'}
                        onChange={(val) => updateStyle({ borderRadius: val })}
                        options={[
                            { label: '0', value: '0px' },
                            { label: '4', value: '4px' },
                            { label: '8', value: '8px' },
                            { label: '16', value: '16px' },
                            { label: 'O', value: '9999px' },
                        ]}
                    />

                    <div className="w-px h-5 bg-gray-200"></div>

                    <span className="text-sm font-medium text-gray-700 px-1">Sombra:</span>
                    <Select
                        width="w-24"
                        value={style.boxShadow || 'none'}
                        onChange={(val) => updateStyle({ boxShadow: val })}
                        options={[
                            { label: 'No', value: 'none' },
                            { label: 'Sutil', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
                            { label: 'Media', value: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
                            { label: 'Alta', value: '0 10px 15px -3px rgb(0 0 0 / 0.1)' },
                        ]}
                    />
                </>
            )}

            {customActions && (
                <>
                    <div className="w-px h-5 bg-gray-200"></div>
                    {customActions}
                </>
            )}

            <div className="w-px h-5 bg-gray-200"></div>
            <DeleteButton />
        </div>
    );
}
