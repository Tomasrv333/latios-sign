'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserPlus, Search, Filter, Pencil, Trash2, Shield, User, Mail, Briefcase, Lock } from 'lucide-react';
import { Button } from '@latios/ui';
import { createPortal } from 'react-dom';

interface Process {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    process?: Process;
    createdAt: string;
}

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [processes, setProcesses] = useState<Process[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form states
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'MEMBER',
        processId: ''
    });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');

        // Fetch current user (ensure is Admin)
        fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(user => {
                if (user && user.role === 'ADMIN') {
                    setCurrentUser(user);
                    fetchUsers();
                    fetchProcesses();
                } else {
                    router.push('/dashboard');
                }
            })
            .catch(() => router.push('/auth/login'));
    }, []);

    const fetchUsers = async () => {
        const token = localStorage.getItem('accessToken');
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:3001/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

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
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        const token = localStorage.getItem('accessToken');
        try {
            const payload: any = { ...formData };
            if (!payload.processId) delete payload.processId;

            const res = await fetch('http://127.0.0.1:3001/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setShowCreateModal(false);
                setFormData({ name: '', email: '', password: '', role: 'MEMBER', processId: '' });
                fetchUsers();
            } else {
                alert('Error al crear usuario. Verifica que el correo no esté en uso.');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setProcessing(true);
        const token = localStorage.getItem('accessToken');
        try {
            const payload: any = {
                name: formData.name,
                role: formData.role,
                processId: formData.processId || null
            };
            if (formData.password) {
                payload.password = formData.password;
            }

            const res = await fetch(`http://127.0.0.1:3001/users/${selectedUser.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setShowEditModal(false);
                setSelectedUser(null);
                setFormData({ name: '', email: '', password: '', role: 'MEMBER', processId: '' });
                fetchUsers();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        setProcessing(true);
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://127.0.0.1:3001/users/${selectedUser.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setShowDeleteModal(false);
                setSelectedUser(null);
                fetchUsers();
            } else {
                const err = await res.json();
                alert(err.message || 'Error al eliminar usuario');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    const openEdit = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            processId: user.process?.id || ''
        });
        setShowEditModal(true);
    };

    const openDelete = (user: User) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const filteredUsers = useMemo(() => {
        let result = users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });

        if (sortConfig) {
            result.sort((a: User, b: User) => {
                let aValue: any = a[sortConfig.key as keyof User];
                let bValue: any = b[sortConfig.key as keyof User];

                // Handle nested or special fields
                if (sortConfig.key === 'process') {
                    aValue = a.process?.name || '';
                    bValue = b.process?.name || '';
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [users, searchTerm, roleFilter, sortConfig]);

    const handleSort = (key: string) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">Administrador</span>;
            case 'LEADER': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">Líder</span>;
            case 'MANAGER': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">Colaborador</span>;
            case 'MEMBER': return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">Miembro</span>;
            default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{role}</span>;
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-brand-600" size={32} /></div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
                    <p className="text-gray-500">Gestiona los accesos y roles de tu organización.</p>
                </div>
                <Button onClick={() => {
                    setFormData({ name: '', email: '', password: '', role: 'MEMBER', processId: '' });
                    setShowCreateModal(true);
                }}>
                    <UserPlus size={18} className="mr-2" />
                    Nuevo Usuario
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        className="pl-10 pr-4 py-2.5 w-full bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="relative w-full sm:w-auto">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <select
                        className="pl-10 pr-8 py-2.5 w-full sm:w-48 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900 text-sm appearance-none cursor-pointer transition-all font-medium"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">Todos los Roles</option>
                        <option value="ADMIN">Administrador</option>
                        <option value="LEADER">Líder</option>
                        <option value="MANAGER">Colaborador</option>
                        <option value="MEMBER">Miembro</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>
                                <div className="flex items-center gap-1">Usuario {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('role')}>
                                <div className="flex items-center gap-1">Rol {sortConfig?.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('process')}>
                                <div className="flex items-center gap-1">Equipo / Proceso {sortConfig?.key === 'process' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('createdAt')}>
                                <div className="flex items-center gap-1">Fecha de Ingreso {sortConfig?.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg">
                                                {user.name.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getRoleBadge(user.role)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.process ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            {user.process.name}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">Sin asignar</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openEdit(user)} className="text-brand-600 hover:text-brand-900 mr-4">
                                        <Pencil size={18} />
                                    </button>
                                    <button onClick={() => openDelete(user)} className="text-red-600 hover:text-red-900">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <User className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
                        <p className="mt-1 text-sm text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <form onSubmit={handleCreate}>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <UserPlus size={20} className="text-brand-600" />
                                    Nuevo Usuario
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input required type="text" className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 text-gray-900" placeholder="Juan Pérez" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input required type="email" className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 text-gray-900" placeholder="juan@empresa.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Inicial</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input required type="password" className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 text-gray-900" placeholder="********" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">El usuario podrá cambiarla después.</p>
                                    </div>
                                    {/* Role & Team Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <select className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 text-gray-900 text-sm" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                                    <option value="MEMBER">Miembro</option>
                                                    <option value="MANAGER">Colaborador</option>
                                                    <option value="LEADER">Líder</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Equipo (Opcional)</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <select className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 text-gray-900 text-sm" value={formData.processId} onChange={e => setFormData({ ...formData, processId: e.target.value })}>
                                                    <option value="">Sin Asignar</option>
                                                    {processes.map((p) => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setShowCreateModal(false)} type="button">Cancelar</Button>
                                <Button type="submit" disabled={processing}>{processing ? 'Creando...' : 'Crear Usuario'}</Button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Edit Modal */}
            {showEditModal && selectedUser && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <form onSubmit={handleUpdate}>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Pencil size={20} className="text-brand-600" />
                                    Editar Usuario
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                        <input required type="text" className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 text-gray-900" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    {/* Role & Team Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                            <select className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 text-gray-900 text-sm" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                                <option value="MEMBER">Miembro</option>
                                                <option value="MANAGER">Colaborador</option>
                                                <option value="LEADER">Líder</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Equipo</label>
                                            <select className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 text-gray-900 text-sm" value={formData.processId} onChange={e => setFormData({ ...formData, processId: e.target.value })}>
                                                <option value="">Sin Asignar</option>
                                                {processes.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <label className="block text-sm font-medium text-gray-900 mb-1">Restablecer Contraseña (Opcional)</label>
                                        <input
                                            type="password"
                                            autoComplete="new-password"
                                            className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 text-gray-900 placeholder-gray-400"
                                            placeholder="Escribe para cambiar la contraseña..."
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Déjalo en blanco para mantener la actual.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setShowEditModal(false)} type="button">Cancelar</Button>
                                <Button type="submit" disabled={processing}>{processing ? 'Guardando...' : 'Guardar Cambios'}</Button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedUser && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-center">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="text-red-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar Usuario?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Estás a punto de eliminar a <strong>{selectedUser.name}</strong>. Esta acción es irreversible.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button variant="ghost" onClick={() => setShowDeleteModal(false)} className="w-full">Cancelar</Button>
                                <button
                                    onClick={handleDelete}
                                    disabled={processing}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-colors"
                                >
                                    {processing ? 'Eliminando...' : 'Eliminar'}
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
