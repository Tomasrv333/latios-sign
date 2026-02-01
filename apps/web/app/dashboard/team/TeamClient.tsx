'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Users, Trash2, Crown, X } from 'lucide-react';
import { Button, Card } from '@latios/ui';
import { createPortal } from 'react-dom';

interface ProcessLeader {
    user: {
        id: string;
        name: string;
        email: string;
    };
}

interface ProcessMember {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface Process {
    id: string;
    name: string;
    description?: string;
    leaders: ProcessLeader[];
    members?: ProcessMember[];
    _count: {
        members: number;
        templates: number;
    };
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function TeamClient() {
    const router = useRouter();
    const [processes, setProcesses] = useState<Process[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Create Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProcessName, setNewProcessName] = useState('');
    const [newProcessDescription, setNewProcessDescription] = useState('');
    const [creating, setCreating] = useState(false);

    // Assign Leader Modal States
    const [showAssignLeaderModal, setShowAssignLeaderModal] = useState(false);
    const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
    const [availableLeaders, setAvailableLeaders] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem('accessToken');

        fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(user => {
                if (user && user.role) setUserRole(user.role);
            })
            .catch(err => console.error(err));

        fetchProcesses();
    }, []);

    const fetchProcesses = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch('http://127.0.0.1:3001/processes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProcesses(data);
            }
        } catch (error) {
            console.error('Error fetching processes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaders = async () => {
        setLoadingUsers(true);
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch('http://127.0.0.1:3001/users?role=LEADER', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAvailableLeaders(data);
            }
        } catch (error) {
            console.error('Error fetching leaders:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleCreateProcess = async () => {
        if (!newProcessName.trim()) return;
        setCreating(true);

        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch('http://127.0.0.1:3001/processes', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newProcessName,
                    description: newProcessDescription
                })
            });

            if (res.ok) {
                setShowCreateModal(false);
                setNewProcessName('');
                setNewProcessDescription('');
                fetchProcesses();
            }
        } catch (error) {
            console.error('Error creating process:', error);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteProcess = async (processId: string, processName: string) => {
        if (!confirm(`¿Estás seguro de eliminar el proceso "${processName}"?`)) return;

        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://127.0.0.1:3001/processes/${processId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchProcesses();
            }
        } catch (error) {
            console.error('Error deleting process:', error);
        }
    };

    const handleOpenAssignLeader = (process: Process) => {
        setSelectedProcess(process);
        setShowAssignLeaderModal(true);
        fetchLeaders();
    };

    const handleAssignLeader = async (leaderId: string) => {
        if (!selectedProcess) return;
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://127.0.0.1:3001/processes/${selectedProcess.id}/leaders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: leaderId })
            });
            if (res.ok) {
                setShowAssignLeaderModal(false);
                fetchProcesses();
            }
        } catch (error) {
            console.error('Error assigning leader:', error);
        }
    };

    const isAdmin = userRole === 'ADMIN';

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Equipo</h2>
                    <p className="text-gray-500">
                        {isAdmin
                            ? 'Administra procesos, líderes y colaboradores de tu organización.'
                            : 'Gestiona los colaboradores de tus procesos asignados.'}
                    </p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} />
                        Nuevo Proceso
                    </Button>
                )}
            </header>

            {/* Create Process Modal */}
            {mounted && showCreateModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Crear Nuevo Proceso</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proceso</label>
                                    <input
                                        type="text"
                                        value={newProcessName}
                                        onChange={(e) => setNewProcessName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                                        placeholder="Ej: Recursos Humanos"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                                    <textarea
                                        value={newProcessDescription}
                                        onChange={(e) => setNewProcessDescription(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-gray-900 bg-white placeholder-gray-400"
                                        rows={3}
                                        placeholder="Describe brevemente el proceso..."
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateProcess}
                                disabled={creating || !newProcessName.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50"
                            >
                                {creating ? <Loader2 className="animate-spin" size={18} /> : 'Crear Proceso'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Assign Leader Modal */}
            {mounted && showAssignLeaderModal && selectedProcess && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Asignar Líder a "{selectedProcess.name}"</h3>
                            <button onClick={() => setShowAssignLeaderModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 max-h-96 overflow-y-auto">
                            {loadingUsers ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-brand-600" size={24} />
                                </div>
                            ) : availableLeaders.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No hay líderes disponibles.</p>
                            ) : (
                                <div className="space-y-2">
                                    {availableLeaders.map(leader => {
                                        const isAssigned = selectedProcess.leaders.some(l => l.user.id === leader.id);
                                        return (
                                            <div
                                                key={leader.id}
                                                className={`flex items-center justify-between p-3 rounded-lg border ${isAssigned ? 'bg-yellow-50 border-yellow-200' : 'border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-900">{leader.name}</p>
                                                    <p className="text-sm text-gray-500">{leader.email}</p>
                                                </div>
                                                {isAssigned ? (
                                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Asignado</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAssignLeader(leader.id)}
                                                        className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                                                    >
                                                        Asignar
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Processes Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-brand-600" size={32} />
                </div>
            ) : processes.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Users className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No hay procesos creados</h3>
                    <p className="text-gray-500 mt-2 mb-6">
                        {isAdmin
                            ? 'Crea tu primer proceso para organizar a tu equipo.'
                            : 'No tienes procesos asignados.'}
                    </p>
                    {isAdmin && (
                        <Button variant="secondary" onClick={() => setShowCreateModal(true)}>
                            Crear Proceso
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {processes.map((process) => (
                        <Card
                            key={process.id}
                            className="hover:shadow-md group relative cursor-pointer"
                            onClick={() => router.push(`/dashboard/team/${process.id}`)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Users className="text-blue-600" size={24} />
                                </div>
                                <div className="flex gap-1">
                                    {isAdmin && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleOpenAssignLeader(process); }}
                                                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                title="Asignar Líder"
                                            >
                                                <Crown size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteProcess(process.id, process.name); }}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar Proceso"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                                {process.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {process.description || 'Sin descripción'}
                            </p>

                            {/* Leaders */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <Crown size={14} className="text-yellow-500" />
                                    <span>Líderes ({process.leaders.length})</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {process.leaders.slice(0, 3).map(leader => (
                                        <span
                                            key={leader.user.id}
                                            className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full"
                                        >
                                            {leader.user.name}
                                        </span>
                                    ))}
                                    {process.leaders.length > 3 && (
                                        <span className="text-xs text-gray-400">+{process.leaders.length - 3} más</span>
                                    )}
                                    {process.leaders.length === 0 && (
                                        <span className="text-xs text-gray-400 italic">Sin líderes asignados</span>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                <span>{process._count.members - process.leaders.length} miembros</span>
                                <span>{process._count.templates} plantillas</span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
