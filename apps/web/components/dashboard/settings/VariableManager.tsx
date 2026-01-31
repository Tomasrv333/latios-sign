import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, FolderPlus, ChevronRight, ChevronDown, Type, Calendar, Hash, Mail, Phone, DollarSign } from 'lucide-react';

// Types (Mirroring Backend)
type VariableType = 'TEXT' | 'NUMBER' | 'DATE' | 'CURRENCY' | 'EMAIL' | 'PHONE';

interface VariableContainer {
    id: string;
    name: string;
    description?: string;
    variables?: Variable[];
}

interface Variable {
    id: string;
    key: string;
    label: string;
    type: VariableType;
    description?: string;
    containerId?: string;
}

const TYPE_ICONS: Record<VariableType, React.ElementType> = {
    TEXT: Type,
    NUMBER: Hash,
    DATE: Calendar,
    CURRENCY: DollarSign,
    EMAIL: Mail,
    PHONE: Phone,
};

export function VariableManager() {
    const [containers, setContainers] = useState<VariableContainer[]>([]);
    const [variables, setVariables] = useState<Variable[]>([]); // Flat list or derived from containers? Backend sends flat variables or nested in containers. 
    // Backend service: findAllContainers includes variables. findAllVariables includes container.
    // Let's use findAllContainers to get the hierarchy.

    const [isLoading, setIsLoading] = useState(true);
    const [isCreatingContainer, setIsCreatingContainer] = useState(false);
    const [isCreatingVariable, setIsCreatingVariable] = useState(false);
    const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);

    // Form States
    const [newContainerName, setNewContainerName] = useState('');
    const [newVariable, setNewVariable] = useState<Partial<Variable>>({ type: 'TEXT' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const res = await fetch('/api/variables/containers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setContainers(data);
                // Also load orphan variables if necessary, but ideally all belong to a container or "Uncategorized"
                // For now, let's assume we work with containers.
            }
        } catch (error) {
            console.error("Failed to load variables", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateContainer = async () => {
        if (!newContainerName.trim()) return;
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/variables/containers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newContainerName })
            });
            if (res.ok) {
                setNewContainerName('');
                setIsCreatingContainer(false);
                loadData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateVariable = async () => {
        if (!newVariable.key || !newVariable.label || !selectedContainerId) return;

        // Auto-format key: lowercase, underscores
        const formattedKey = newVariable.key.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/variables', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newVariable,
                    key: formattedKey,
                    containerId: selectedContainerId
                })
            });
            if (res.ok) {
                setNewVariable({ type: 'TEXT' });
                setIsCreatingVariable(false);
                loadData();
            } else {
                alert('Error creando variable. Asegúrate de que la clave sea única.');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteContainer = async (id: string) => {
        if (!confirm('¿Estás seguro? Se eliminarán también las variables dentro.')) return;
        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`/api/variables/containers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteVariable = async (id: string) => {
        if (!confirm('¿Eliminar variable?')) return;
        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`/api/variables/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Hash className="text-brand-600" size={20} />
                        Variables Dinámicas
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Define las variables que se podrán utilizar en las plantillas.</p>
                </div>
                <button
                    onClick={() => setIsCreatingContainer(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                >
                    <FolderPlus size={16} />
                    Nuevo Grupo
                </button>
            </div>

            {/* Create Container Form */}
            {isCreatingContainer && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Nombre del Grupo (ej. Datos Cliente)"
                        value={newContainerName}
                        onChange={(e) => setNewContainerName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                        autoFocus
                    />
                    <div className="flex items-center gap-2">
                        <button onClick={handleCreateContainer} className="px-3 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">Guardar</button>
                        <button onClick={() => setIsCreatingContainer(false)} className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm">Cancelar</button>
                    </div>
                </div>
            )}

            {/* Containers List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="text-center py-8 text-gray-400">Cargando variables...</div>
                ) : containers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                        No hay grupos de variables definidos.
                    </div>
                ) : (
                    containers.map(container => (
                        <div key={container.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                    <ChevronDown size={16} className="text-gray-400" />
                                    {container.name}
                                    <span className="text-xs text-gray-400 font-normal">({container.variables?.length || 0} variables)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedContainerId(container.id);
                                            setIsCreatingVariable(true);
                                            setNewVariable({ type: 'TEXT', containerId: container.id });
                                        }}
                                        className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                                        title="Agregar Variable"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteContainer(container.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Eliminar Grupo"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Variables in this container */}
                            <div className="divide-y divide-gray-100">
                                {container.variables?.map(variable => {
                                    const Icon = TYPE_ICONS[variable.type] || Type;
                                    return (
                                        <div key={variable.id} className="px-4 py-3 flex items-center justify-between hover:bg-white transition-colors bg-white/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                                                    <Icon size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{variable.label}</div>
                                                    <div className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded w-fit mt-0.5">
                                                        {`{{${variable.key}}}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs text-gray-400 uppercase font-medium">{variable.type}</span>
                                                <button
                                                    onClick={() => handleDeleteVariable(variable.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* New Variable Form (Inline) */}
                                {isCreatingVariable && selectedContainerId === container.id && (
                                    <div className="px-4 py-3 bg-brand-50/30 flex items-center gap-3 animate-in fade-in duration-200">
                                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                                        </div>
                                        <div className="grid grid-cols-12 gap-3 flex-1">
                                            <div className="col-span-3">
                                                <input
                                                    type="text"
                                                    placeholder="Nombre Etiquetas"
                                                    value={newVariable.label || ''}
                                                    onChange={(e) => setNewVariable({ ...newVariable, label: e.target.value })}
                                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-brand-500 outline-none"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    type="text"
                                                    placeholder="clave_unica"
                                                    value={newVariable.key || ''}
                                                    onChange={(e) => setNewVariable({ ...newVariable, key: e.target.value })}
                                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-brand-500 outline-none font-mono text-xs"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <select
                                                    value={newVariable.type}
                                                    onChange={(e) => setNewVariable({ ...newVariable, type: e.target.value as VariableType })}
                                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-brand-500 outline-none"
                                                >
                                                    {Object.keys(TYPE_ICONS).map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-span-3 flex items-center gap-2">
                                                <button onClick={handleCreateVariable} className="px-3 py-1.5 bg-brand-600 text-white rounded text-xs font-medium hover:bg-brand-700">Crear</button>
                                                <button onClick={() => setIsCreatingVariable(false)} className="px-2 py-1.5 text-gray-500 hover:text-gray-700 text-xs">Cancelar</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
