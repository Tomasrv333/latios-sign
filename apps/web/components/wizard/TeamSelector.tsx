'use client';

import React, { useEffect, useState } from 'react';
import { Users, CheckCircle2, Building2 } from 'lucide-react';

export interface Team {
    id: string;
    name: string;
    description?: string;
    leaders?: { user: { id: string } }[];
}

interface TeamSelectorProps {
    selectedTeamId: string | null;
    onSelect: (team: Team) => void;
}

export function TeamSelector({ selectedTeamId, onSelect }: TeamSelectorProps) {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const token = localStorage.getItem('accessToken');

                // 1. Get Current User info
                const meRes = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const user = await meRes.json();

                let loadedTeams: Team[] = [];

                // 2. Fetch all processes
                const procRes = await fetch('http://127.0.0.1:3001/processes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (procRes.ok) {
                    const allProcesses: Team[] = await procRes.json();

                    if (user.role === 'ADMIN') {
                        loadedTeams = allProcesses;
                    } else {
                        loadedTeams = allProcesses.filter(p => {
                            const isMember = user.processId === p.id || (user.process && user.process.id === p.id);
                            const isLeader = p.leaders?.some((l: any) => l.user.id === user.id);
                            return isMember || isLeader;
                        });
                    }
                } else if (user.process) {
                    loadedTeams = [user.process];
                }

                setTeams(loadedTeams);
                setLoading(false);

                if (loadedTeams.length === 1 && !selectedTeamId) {
                    onSelect(loadedTeams[0]);
                }

            } catch (error) {
                console.error("Error loading teams", error);
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    if (loading) {
        return <div className="p-12 text-center text-gray-400 animate-pulse">Cargando equipos...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-gray-100 pb-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Selecciona el Equipo</h2>
                    <p className="text-sm text-gray-500 mt-1">Elige el contexto para este envío (filtra las plantillas disponibles)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team) => {
                    const isSelected = selectedTeamId === team.id;
                    return (
                        <div
                            key={team.id}
                            onClick={() => onSelect(team)}
                            className={`group relative p-5 rounded-xl border transition-all cursor-pointer flex flex-col items-start gap-4 ${isSelected
                                ? 'border-brand-500 bg-brand-50/60 shadow-sm ring-1 ring-brand-500'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                }`}
                        >
                            <div className="flex justify-between w-full">
                                <div className={`p-2.5 rounded-lg transition-colors ${isSelected ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500 group-hover:text-brand-600 group-hover:bg-brand-50'}`}>
                                    <Building2 size={20} />
                                </div>
                                {isSelected && (
                                    <div className="text-brand-600">
                                        <CheckCircle2 size={20} className="fill-brand-100" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className={`font-semibold text-base mb-1 transition-colors ${isSelected ? 'text-brand-900' : 'text-gray-900'}`}>
                                    {team.name}
                                </h3>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                    {team.description || 'Sin descripción disponible para este equipo.'}
                                </p>
                            </div>
                        </div>
                    );
                })}
                {teams.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Users className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                        <h3 className="text-gray-900 font-medium text-sm">Sin equipos asignados</h3>
                        <p className="text-gray-500 text-xs mt-1">No hemos encontrado equipos vinculados a tu cuenta.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
