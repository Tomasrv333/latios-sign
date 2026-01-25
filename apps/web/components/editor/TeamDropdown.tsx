'use client';

import React, { useEffect, useState } from 'react';
import { Building2, ChevronDown, Check, Users } from 'lucide-react';

interface Team {
    id: string;
    name: string;
    description?: string;
    leaders?: { user: { id: string } }[];
}

interface TeamDropdownProps {
    selectedTeamId: string | null;
    onSelect: (teamId: string) => void;
}

export function TeamDropdown({ selectedTeamId, onSelect }: TeamDropdownProps) {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) return;

                const meRes = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const user = await meRes.json();

                let loadedTeams: Team[] = [];
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

                // If only one team and nothing selected, auto-select
                if (loadedTeams.length === 1 && !selectedTeamId) {
                    onSelect(loadedTeams[0].id);
                }

            } catch (error) {
                console.error("Error loading teams", error);
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    const selectedTeam = teams.find(t => t.id === selectedTeamId);

    if (loading) return (
        <div className="h-8 w-32 bg-gray-100 rounded animate-pulse"></div>
    );

    if (teams.length === 0) return (
        <div className="text-xs text-gray-400 flex items-center gap-1">
            <Users size={12} />
            Sin equipos
        </div>
    );

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${selectedTeam
                        ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                        : 'bg-white text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300'
                    }`}
            >
                <Building2 size={16} />
                <span className="max-w-[120px] truncate">
                    {selectedTeam ? selectedTeam.name : 'Asignar Equipo'}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-2 z-50 min-w-[240px] bg-white rounded-xl shadow-lg border border-gray-200 p-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 rounded-md mb-1 border border-gray-100">
                            Selecciona el equipo propietario
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-0.5 custom-scrollbar">
                            {teams.map(team => (
                                <button
                                    key={team.id}
                                    onClick={() => {
                                        onSelect(team.id);
                                        setOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedTeamId === team.id
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <Building2 size={16} className={selectedTeamId === team.id ? 'text-blue-600' : 'text-gray-400'} />
                                        {team.name}
                                    </span>
                                    {selectedTeamId === team.id && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
