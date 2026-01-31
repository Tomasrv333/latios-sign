import React, { useEffect, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Search, ChevronDown, ChevronRight, Hash, Type, Calendar, Mail, Phone, DollarSign } from 'lucide-react';

type VariableType = 'TEXT' | 'NUMBER' | 'DATE' | 'CURRENCY' | 'EMAIL' | 'PHONE';

interface Variable {
    id: string;
    key: string;
    label: string;
    type: VariableType;
}

interface VariableContainer {
    id: string;
    name: string;
    variables?: Variable[];
}

const TYPE_ICONS: Record<VariableType, React.ElementType> = {
    TEXT: Type,
    NUMBER: Hash,
    DATE: Calendar,
    CURRENCY: DollarSign,
    EMAIL: Mail,
    PHONE: Phone,
};

function VariableItem({ variable }: { variable: Variable }) {
    // We can make variables draggable if we want to drop them onto the canvas as blocks,
    // OR just clickable to copy/insert.
    // Given the requirement "insert into text blocks", usually user copies the token or drags into a text block (complex).
    // Simplest approach: Click to copy token to clipboard, or drag to create a NEW text block with that token.

    // Let's enable drag to create a text block with the token pre-filled.
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `variable-${variable.key}`,
        data: {
            isToolboxItem: true,
            type: 'text', // It becomes a text block
            content: `{{${variable.key}}}`, // Pre-filled content
        }
    });

    const Icon = TYPE_ICONS[variable.type] || Type;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-grab border border-transparent hover:border-gray-200 transition-all ${isDragging ? 'opacity-50' : ''}`}
            title={`Variable: ${variable.label} - Click para copiar clave`}
            onClick={(e) => {
                // Optional: Copy to clipboard on click?
                // navigator.clipboard.writeText(`{{${variable.key}}}`);
                // toast.success(...)
            }}
        >
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Icon size={14} />
            </div>
            <div className="overflow-hidden">
                <div className="text-sm font-medium text-gray-900 truncate">{variable.label}</div>
                <div className="text-xs text-gray-400 font-mono truncate">{`{{${variable.key}}}`}</div>
            </div>
        </div>
    );
}

export function VariablesPanel() {
    const [containers, setContainers] = useState<VariableContainer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedContainers, setExpandedContainers] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            const res = await fetch('/api/variables/containers', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setContainers(data);
                // Expand all by default?
                const expanded: Record<string, boolean> = {};
                data.forEach((c: any) => expanded[c.id] = true);
                setExpandedContainers(expanded);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleContainer = (id: string) => {
        setExpandedContainers(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredContainers = containers.map(c => ({
        ...c,
        variables: c.variables?.filter(v =>
            v.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.key.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(c => (c.variables && c.variables.length > 0) || c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-200">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">Variables</h3>
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                        type="text"
                        placeholder="Buscar variables..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {isLoading ? (
                    <div className="text-center py-8 text-xs text-gray-400">Cargando...</div>
                ) : filteredContainers.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-400">No se encontraron variables.</div>
                ) : (
                    filteredContainers.map(container => (
                        <div key={container.id} className="rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleContainer(container.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                            >
                                {expandedContainers[container.id] ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                                <span className="text-sm font-medium text-gray-700">{container.name}</span>
                            </button>

                            {expandedContainers[container.id] && (
                                <div className="pl-4 pr-2 py-1 space-y-1">
                                    {container.variables?.map(variable => (
                                        <VariableItem key={variable.id} variable={variable} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                Arrastra una variable al lienzo para crear un bloque de texto vinculado.
            </div>
        </div>
    );
}
