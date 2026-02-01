'use client';

import React from 'react';
import { User, Users, ShieldCheck, Mail } from 'lucide-react';

interface SendingConfigurationProps {
    mode: 'individual' | 'massive';
    setMode: (mode: 'individual' | 'massive') => void;
    signatureType: string;
    onNext: () => void;
}

export function SendingConfiguration({ mode, setMode, signatureType, onNext }: SendingConfigurationProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Configuración del Envío</h2>
                <p className="text-sm text-gray-500">Define la estrategia y seguridad para este proceso.</p>
            </div>

            <div className="p-6 space-y-8">

                {/* Strategy Selection */}
                <div className="space-y-4">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Modalidad de Envío
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            onClick={() => setMode('individual')}
                            className={`cursor-pointer rounded-xl border-2 p-4 transition-all hover:border-brand-300 relative ${mode === 'individual'
                                ? 'border-brand-500 bg-brand-50'
                                : 'border-gray-100 bg-white hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${mode === 'individual' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${mode === 'individual' ? 'text-brand-900' : 'text-gray-900'}`}>Individual</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Envía un único documento personalizado a una persona específica. Ideal para contratos puntuales.
                                    </p>
                                </div>
                            </div>
                            {mode === 'individual' && (
                                <div className="absolute top-4 right-4 text-brand-500">
                                    <div className="w-4 h-4 rounded-full bg-brand-500 border-4 border-white shadow-sm ring-1 ring-brand-200"></div>
                                </div>
                            )}
                        </div>

                        <div
                            onClick={() => setMode('massive')}
                            className={`cursor-pointer rounded-xl border-2 p-4 transition-all hover:border-brand-300 relative ${mode === 'massive'
                                ? 'border-brand-500 bg-brand-50'
                                : 'border-gray-100 bg-white hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${mode === 'massive' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${mode === 'massive' ? 'text-brand-900' : 'text-gray-900'}`}>Masivo</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Carga un archivo Excel/CSV y envía a múltiples destinatarios automáticamente.
                                    </p>
                                </div>
                            </div>
                            {mode === 'massive' && (
                                <div className="absolute top-4 right-4 text-brand-500">
                                    <div className="w-4 h-4 rounded-full bg-brand-500 border-4 border-white shadow-sm ring-1 ring-brand-200"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Security Context & Legal Support */}
                <div className={`rounded-xl border p-5 transition-all ${signatureType === 'DIGITAL'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-purple-50 border-purple-200'
                    }`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full shrink-0 ${signatureType === 'DIGITAL' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            {signatureType === 'DIGITAL' ? <ShieldCheck size={28} /> : <ShieldCheck size={28} />}
                        </div>
                        <div className="space-y-3">
                            <div>
                                <h4 className={`text-base font-bold flex items-center gap-2 ${signatureType === 'DIGITAL' ? 'text-blue-900' : 'text-purple-900'}`}>
                                    {signatureType === 'DIGITAL' ? 'Firma Digital Certificada' : 'Firma Electrónica Simple'}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border ${signatureType === 'DIGITAL'
                                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                                        : 'bg-purple-100 text-purple-700 border-purple-200'
                                        }`}>
                                        {signatureType === 'DIGITAL' ? 'Máxima Validez' : 'Estándar'}
                                    </span>
                                </h4>
                                <p className={`text-sm mt-1 leading-relaxed ${signatureType === 'DIGITAL' ? 'text-blue-800' : 'text-purple-800'}`}>
                                    {signatureType === 'DIGITAL'
                                        ? "Este documento garantiza la integridad, autenticidad y no repudio mediante un certificado digital emitido por una entidad acreditada (ONAC)."
                                        : "La validez jurídica de este documento se basa en la autenticación del firmante (vía Correo/OTP) y el acuerdo entre las partes."}
                                </p>
                            </div>

                            {/* Legal Supports Grid */}
                            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 border-t ${signatureType === 'DIGITAL' ? 'border-blue-200' : 'border-purple-200'}`}>
                                <div className="flex items-center gap-2">
                                    <CheckCircleIcon color={signatureType === 'DIGITAL' ? '#2563EB' : '#9333EA'} />
                                    <span className={signatureType === 'DIGITAL' ? 'text-blue-900' : 'text-purple-900'}>
                                        {signatureType === 'DIGITAL' ? 'Ley 527 de 1999 (Colombia)' : 'Ley 527 de 1999 (Art. 7)'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircleIcon color={signatureType === 'DIGITAL' ? '#2563EB' : '#9333EA'} />
                                    <span className={signatureType === 'DIGITAL' ? 'text-blue-900' : 'text-purple-900'}>
                                        {signatureType === 'DIGITAL' ? 'Integración con Adobe Reader' : 'Trazabilidad por Auditoría'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircleIcon color={signatureType === 'DIGITAL' ? '#2563EB' : '#9333EA'} />
                                    <span className={signatureType === 'DIGITAL' ? 'text-blue-900' : 'text-purple-900'}>
                                        Estampa Cronológica
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircleIcon color={signatureType === 'DIGITAL' ? '#2563EB' : '#9333EA'} />
                                    <span className={signatureType === 'DIGITAL' ? 'text-blue-900' : 'text-purple-900'}>
                                        {signatureType === 'DIGITAL' ? 'No Repudio Automático' : 'Prueba de Entrega'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Continue Button */}
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onNext}
                        className="px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-all flex items-center gap-2 shadow-sm hover:shadow active:scale-95"
                    >
                        Configurar Datos
                        <Mail size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function CheckCircleIcon({ color }: { color: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    )
}

