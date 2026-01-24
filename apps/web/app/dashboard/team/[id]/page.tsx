'use client';

import { useEffect, useState, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Users, UserPlus, Trash2, Crown, UserMinus, ArrowLeft, X, AlertCircle, Search, Filter, Calendar, Settings, Edit, AlertTriangle } from 'lucide-react';
import { Button } from '@latios/ui';
import { Input } from '@/components/ui/Input';
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
    templates?: {
        id: string;
        name: string;
        description: string;
        isPublished: boolean;
        _count: { documents: number };
    }[];
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
    createdAt: string;
    process?: {
        id: string;
        name: string;
    };
}

export default function ProcessDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [processId, setProcessId] = useState<string | null>(null);
    const [process, setProcess] = useState<Process | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    // Manage local modals for adding members/leaders within this page
    const [availableLeaders, setAvailableLeaders] = useState<User[]>([]);
    const [availableMembers, setAvailableMembers] = useState<User[]>([]);

    // Modal States
    const [showAssignLeaderModal, setShowAssignLeaderModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);

    // Admin Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', description: '' });
    const [deleteConfirmationName, setDeleteConfirmationName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Confirmation State (for removing users)
    const [confirmAction, setConfirmAction] = useState<{ type: 'LEADER' | 'MEMBER', id: string, name?: string } | null>(null);

    // Filters for Modals
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
    const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'free'>('all');

    const [loadingUsers, setLoadingUsers] = useState(false);

    // Unwrap params
    useEffect(() => {
        params.then(unwrappedParams => {
            setProcessId(unwrappedParams.id);
        });
    }, [params]);

    useEffect(() => {
        if (!processId) return;

        const token = localStorage.getItem('accessToken');
        fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(user => {
                if (user && user.role) setUserRole(user.role);
            })
            .catch(err => console.error(err));

        fetchProcessDetail(processId);
        fetchMembers();
    }, [processId]);

    const fetchProcessDetail = async (id: string) => {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://127.0.0.1:3001/processes/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProcess(data);
                setEditForm({ name: data.name, description: data.description || '' });
            } else {
                router.push('/dashboard/team');
            }
        } catch (error) {
            console.error('Error fetching process detail:', error);
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

    const fetchMembers = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch('http://127.0.0.1:3001/users?role=MANAGER', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAvailableMembers(data);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    // --- Actions ---

    const handleAssignLeader = async (leaderId: string) => {
        if (!process) return;
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://127.0.0.1:3001/processes/${process.id}/leaders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: leaderId })
            });
            if (res.ok) {
                setShowAssignLeaderModal(false);
                fetchProcessDetail(process.id);
            }
        } catch (error) {
            console.error('Error assigning leader:', error);
        }
    };

    const handleAddMember = async (memberId: string) => {
        if (!process) return;
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://127.0.0.1:3001/processes/${process.id}/members`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: memberId })
            });
            if (res.ok) {
                fetchProcessDetail(process.id);
                fetchMembers();
                setShowAddMemberModal(false);
            }
        } catch (error) {
            console.error('Error adding member:', error);
        }
    };

    const handleConfirmRemove = async () => {
        if (!process || !confirmAction) return;

        const token = localStorage.getItem('accessToken');
        const endpoint = confirmAction.type === 'LEADER'
            ? `http://127.0.0.1:3001/processes/${process.id}/leaders/${confirmAction.id}`
            : `http://127.0.0.1:3001/processes/${process.id}/members/${confirmAction.id}`;

        try {
            const res = await fetch(endpoint, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchProcessDetail(process.id);
                if (confirmAction.type === 'MEMBER') fetchMembers();
                setConfirmAction(null);
            }
        } catch (error) {
            console.error('Error removing user:', error);
        }
    };

    const handleUpdateProcess = async () => {
        if (!process) return;
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://127.0.0.1:3001/processes/${process.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                fetchProcessDetail(process.id);
                setShowEditModal(false);
            }
        } catch (error) {
            console.error('Error updating process:', error);
        }
    };

    const handleDeleteProcess = async () => {
        if (!process) return;
        if (deleteConfirmationName !== process.name) return;

        setIsDeleting(true);
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://127.0.0.1:3001/processes/${process.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                router.push('/dashboard/team');
            }
        } catch (error) {
            console.error('Error deleting process:', error);
            setIsDeleting(false);
        }
    };

    // --- Computed ---

    const isAdmin = userRole === 'ADMIN';
    const isLeaderOrAdmin = userRole === 'ADMIN' || userRole === 'LEADER';

    const filteredMembers = useMemo(() => {
        let result = availableMembers;
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(m =>
                m.name.toLowerCase().includes(lowerTerm) ||
                m.email.toLowerCase().includes(lowerTerm)
            );
        }
        if (filterStatus === 'assigned') {
            result = result.filter(m => !!m.process);
        } else if (filterStatus === 'free') {
            result = result.filter(m => !m.process);
        }

        // Filter out Leaders from the members list to avoid duplication
        result = result.filter(m => m.role !== 'LEADER');

        result.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return 0;
        });
        return result;
    }, [availableMembers, searchTerm, sortBy, filterStatus]);

    const filteredLeaders = useMemo(() => {
        let result = availableLeaders;
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(m =>
                m.name.toLowerCase().includes(lowerTerm) ||
                m.email.toLowerCase().includes(lowerTerm)
            );
        }
        if (filterStatus === 'assigned') {
            result = result.filter(m => process?.leaders.some(l => l.user.id === m.id));
        } else if (filterStatus === 'free') {
            result = result.filter(m => !process?.leaders.some(l => l.user.id === m.id));
        }
        result.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return 0;
        });
        return result;
    }, [availableLeaders, searchTerm, sortBy, filterStatus, process?.leaders]);


    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-brand-600" size={32} />
            </div>
        );
    }

    if (!process) {
        return null;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Volver a Equipos
                </button>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{process.name}</h1>
                        <p className="text-gray-500 mt-1 max-w-2xl">{process.description || 'Sin descripción'}</p>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowEditModal(true)}
                                className="text-gray-600"
                            >
                                <Settings size={16} className="mr-2" />
                                Configuración
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowDeleteModal(true)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                                <Trash2 size={16} className="mr-2" />
                                Eliminar Equipo
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Compact Stats Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
                <div className="flex items-center gap-4 px-4">
                    <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Miembros</p>
                        <p className="text-2xl font-bold text-gray-900">{process.members?.filter(m => m.role !== 'LEADER').length || 0}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 px-4">
                    <div className="bg-purple-50 p-2.5 rounded-lg text-purple-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Plantillas</p>
                        <p className="text-2xl font-bold text-gray-900">{process.templates?.filter(t => t.isPublished).length || 0}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 px-4">
                    <div className="bg-green-50 p-2.5 rounded-lg text-green-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Documentos</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {process.templates?.reduce((acc, t) => acc + t._count.documents, 0) || 0}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Main): Templates and Members */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Templates Section (Now Main) */}
                    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Plantillas Asignadas
                            </h3>
                            {isAdmin && (
                                <Button size="sm" variant="secondary" onClick={() => router.push('/dashboard/templates')}>
                                    Administrar Plantillas
                                </Button>
                            )}
                        </div>
                        <div className="p-6">
                            {(!process.templates || process.templates.length === 0) ? (
                                <div className="text-center py-8 px-4 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50">
                                    <p className="text-sm text-gray-500 mb-2">No hay plantillas vinculadas.</p>
                                    <p className="text-xs text-gray-400">
                                        Ve al módulo de <strong>Plantillas</strong>, edita una y asígnala al proceso "{process.name}".
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {process.templates.map(template => (
                                        <div key={template.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-200 hover:shadow-sm transition-all group">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                                                    {template.name}
                                                </h4>
                                                {template.isPublished ? (
                                                    <span className="shrink-0 w-2 h-2 rounded-full bg-green-500" title="Publicada"></span>
                                                ) : (
                                                    <span className="shrink-0 w-2 h-2 rounded-full bg-gray-300" title="Borrador"></span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                                                {template.description || 'Sin descripción'}
                                            </p>
                                            <div className="flex items-center text-xs text-gray-400 gap-4">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    {template._count.documents}
                                                </span>
                                                <span className="text-purple-600 font-medium cursor-pointer hover:underline" onClick={() => router.push(`/dashboard/templates/edit/${template.id}`)}>
                                                    Editar
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Members Section */}
                    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Users size={18} className="text-blue-500" />
                                Miembros del Equipo
                            </h3>
                            {isLeaderOrAdmin && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowAddMemberModal(true);
                                        setSearchTerm('');
                                        setFilterStatus('all');
                                        setSortBy('name');
                                        fetchMembers();
                                    }}
                                >
                                    <UserPlus size={16} className="mr-2" />
                                    Agregar Miembro
                                </Button>
                            )}
                        </div>
                        <div className="p-0">
                            {(!process.members || process.members.length === 0) ? (
                                <div className="text-center py-12">
                                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                    <p className="text-gray-500 italic">No hay miembros en este equipo aún.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {process.members
                                        .filter(member => member.role !== 'LEADER')
                                        .map(member => (
                                            <div key={member.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{member.name}</p>
                                                        <p className="text-sm text-gray-500">{member.email}</p>
                                                    </div>
                                                </div>
                                                {isLeaderOrAdmin && (
                                                    <button
                                                        onClick={() => setConfirmAction({ type: 'MEMBER', id: member.id, name: member.name })}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remover miembro"
                                                    >
                                                        <UserMinus size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column (Side): Leaders */}
                <div className="space-y-6">
                    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-8">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Crown size={18} className="text-yellow-500" />
                                Líderes
                            </h3>
                            {isAdmin && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowAssignLeaderModal(true);
                                        setSearchTerm('');
                                        setFilterStatus('all');
                                        setSortBy('name');
                                        fetchLeaders();
                                    }}
                                >
                                    <UserPlus size={16} className="mr-2" />
                                    Asignar
                                </Button>
                            )}
                        </div>
                        <div className="p-0">
                            {process.leaders.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {process.leaders.map(leader => (
                                        <div key={leader.user.id} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-sm">
                                                    {leader.user.name.charAt(0)}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-medium text-gray-900 text-sm truncate">{leader.user.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{leader.user.email}</p>
                                                </div>
                                            </div>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => setConfirmAction({ type: 'LEADER', id: leader.user.id, name: leader.user.name })}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 italic text-sm">No hay líderes asignados.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* Edit Process Modal */}
            {showEditModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Configuración del Equipo</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Equipo</label>
                                <Input
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ej. Comercial"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                    rows={3}
                                    value={editForm.description}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Describe el propósito de este equipo..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancelar</Button>
                                <Button onClick={handleUpdateProcess}>Guardar Cambios</Button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-2 border-red-100">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">¿Eliminar Equipo?</h3>
                            <div className="bg-red-50 p-3 rounded-lg text-red-800 text-sm mb-6 border border-red-100">
                                <p className="font-semibold mb-1">¡Esta acción es destructiva!</p>
                                <ul className="list-disc list-inside space-y-1 opacity-90">
                                    <li>Se eliminará el equipo permanentemente.</li>
                                    <li>Los usuarios serán desvinculados (no eliminados).</li>
                                    <li>Las plantillas serán desvinculadas (no eliminadas).</li>
                                </ul>
                            </div>

                            <p className="text-sm text-gray-600 mb-2">
                                Para confirmar, escribe <span className="font-mono font-bold select-all text-gray-900">{process.name}</span> abajo:
                            </p>
                            <Input
                                value={deleteConfirmationName}
                                onChange={(e) => setDeleteConfirmationName(e.target.value)}
                                placeholder={process.name}
                                className="mb-6 font-mono"
                            />

                            <div className="flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Cancelar</Button>
                                <button
                                    onClick={handleDeleteProcess}
                                    disabled={deleteConfirmationName !== process.name || isDeleting}
                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    {isDeleting ? 'Eliminando...' : 'Sí, eliminar este equipo'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal for Assigning Leader */}
            {showAssignLeaderModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Asignar Líder</h3>
                            <button onClick={() => setShowAssignLeaderModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Filters & Search */}
                        <div className="px-6 py-3 border-b border-gray-100 space-y-3 bg-gray-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o correo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <Filter size={14} />
                                    </div>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value as any)}
                                        className="w-full pl-8 pr-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-500 appearance-none"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="assigned">Asignados</option>
                                        <option value="free">Sin Asignar</option>
                                    </select>
                                </div>
                                <div className="relative flex-1">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <Calendar size={14} />
                                    </div>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="w-full pl-8 pr-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-500 appearance-none"
                                    >
                                        <option value="name">Nombre (A-Z)</option>
                                        <option value="date">Más recientes</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-0 overflow-y-auto flex-1">
                            {loadingUsers ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-brand-600" size={24} />
                                </div>
                            ) : filteredLeaders.length === 0 ? (
                                <div className="text-center py-12 px-6">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                        <Users className="text-gray-400" size={24} />
                                    </div>
                                    <p className="text-gray-900 font-medium">No se encontraron líderes</p>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Intenta ajustar los filtros o la búsqueda.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredLeaders.map(leader => {
                                        const isAssigned = process?.leaders.some(l => l.user.id === leader.id);
                                        return (
                                            <div key={leader.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold shrink-0">
                                                        {leader.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{leader.name}</p>
                                                        <p className="text-xs text-gray-500">{leader.email}</p>
                                                    </div>
                                                </div>

                                                {isAssigned ? (
                                                    <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                                                        Líder actual
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAssignLeader(leader.id)}
                                                        className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm ml-4"
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

            {/* Modal for Adding Member */}
            {showAddMemberModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Agregar Miembro al Equipo</h3>
                            <button onClick={() => setShowAddMemberModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Filters & Search */}
                        <div className="px-6 py-3 border-b border-gray-100 space-y-3 bg-gray-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o correo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <Filter size={14} />
                                    </div>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value as any)}
                                        className="w-full pl-8 pr-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-500 appearance-none"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="assigned">Asignados</option>
                                        <option value="free">Sin Equipo</option>
                                    </select>
                                </div>
                                <div className="relative flex-1">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <Calendar size={14} />
                                    </div>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="w-full pl-8 pr-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-500 appearance-none"
                                    >
                                        <option value="name">Nombre (A-Z)</option>
                                        <option value="date">Más recientes</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-0 overflow-y-auto flex-1">
                            {filteredMembers.length === 0 ? (
                                <div className="text-center py-12 px-6">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                        <Users className="text-gray-400" size={24} />
                                    </div>
                                    <p className="text-gray-900 font-medium">No se encontraron usuarios</p>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Intenta ajustar los filtros o la búsqueda.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredMembers.map(member => {
                                        const isCurrentMember = process?.members?.some(m => m.id === member.id);
                                        const otherProcessName = member.process?.name;
                                        const isOtherProcess = !!otherProcessName && member.process?.id !== process.id;

                                        return (
                                            <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold shrink-0">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                                                        <p className="text-xs text-gray-500">{member.email}</p>
                                                        {isOtherProcess && (
                                                            <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full w-fit">
                                                                <AlertCircle size={10} />
                                                                <span>En: {otherProcessName}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {isCurrentMember ? (
                                                    <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                                        Miembro actual
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddMember(member.id)}
                                                        className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm ml-4"
                                                    >
                                                        Agregar
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

            {/* Confirmation Modal (Remove User) */}
            {confirmAction && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="text-red-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">¿Confirmar eliminación?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Estás a punto de remover a <span className="font-medium text-gray-900">{confirmAction.name}</span> del proceso. Esta acción no se puede deshacer.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => setConfirmAction(null)}
                                    className="w-full"
                                >
                                    Cancelar
                                </Button>
                                <button
                                    onClick={handleConfirmRemove}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-colors"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
