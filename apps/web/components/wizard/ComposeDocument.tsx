'use client';

import React, { useState, useEffect } from 'react';
import { Mail, User, Phone, Send, Type, FileJson } from 'lucide-react';
import { SignerData } from './SignerConfigForm';

interface ComposeDocumentProps {
    templateName: string;
    variables: string[];
    initialValues: Record<string, string>;
    onVariablesChange: (values: Record<string, string>) => void;
    onSubmit: (signerData: SignerData) => void;
    loading: boolean;
}

export function ComposeDocument({
    templateName,
    variables,
    initialValues,
    onVariablesChange,
    onSubmit,
    loading
}: ComposeDocumentProps) {

    // Signer State
    const [signerData, setSignerData] = useState<SignerData>({
        name: '',
        email: '',
        phone: '',
        sendViaEmail: true,
        sendViaWhatsapp: false,
        isMassive: false
    });

    // Toggle for Delegate
    // We expect initialValues to contain _delegate if set
    const isDelegate = initialValues._delegate === 'true';

    const handleDelegateToggle = (delegate: boolean) => {
        onVariablesChange({ ...initialValues, _delegate: delegate ? 'true' : 'false' });
    };

    const handleVariableChange = (key: string, val: string) => {
        onVariablesChange({ ...initialValues, [key]: val });
    };

    const handleSend = () => {
        onSubmit(signerData);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <FileJson size={14} className="text-brand-600" />
                    Datos y Destinatario
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">

                {/* SECTION 1: SIGNER */}
                <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">1. Destinatario</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Correo Electrónico <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                <input
                                    required
                                    type="email"
                                    value={signerData.email}
                                    onChange={(e) => setSignerData(prev => ({ ...prev, email: e.target.value }))}
                                    className="pl-9 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                    placeholder="email@ejemplo.com"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nombre</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={signerData.name}
                                        onChange={(e) => setSignerData(prev => ({ ...prev, name: e.target.value }))}
                                        className="pl-9 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                        placeholder="Nombre"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Celular</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                    <input
                                        type="tel"
                                        value={signerData.phone}
                                        onChange={(e) => setSignerData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="pl-9 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                        placeholder="Mobile"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: VARIABLES */}
                {variables.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">2. Variables del Documento</h3>
                        </div>

                        <div className="space-y-4">
                            {variables.map(variable => {
                                const isAssignedToSigner = initialValues[variable] === '__ASK_SIGNER__';

                                return (
                                    <div key={variable} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-medium text-gray-700 capitalize">
                                                {variable.replace(/_/g, ' ')}
                                            </label>
                                            <div className="flex bg-white rounded-md border border-gray-200 p-0.5 scale-90">
                                                <button
                                                    onClick={() => handleVariableChange(variable, '')}
                                                    className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${!isAssignedToSigner ? 'bg-brand-50 text-brand-700' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    Rellenar
                                                </button>
                                                <button
                                                    onClick={() => handleVariableChange(variable, '__ASK_SIGNER__')}
                                                    className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${isAssignedToSigner ? 'bg-blue-50 text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    Solicitar
                                                </button>
                                            </div>
                                        </div>

                                        {!isAssignedToSigner ? (
                                            <input
                                                type="text"
                                                value={initialValues[variable] || ''}
                                                onChange={(e) => handleVariableChange(variable, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-white"
                                                placeholder={`Valor para ${variable}`}
                                            />
                                        ) : (
                                            <div className="w-full px-3 py-2 border border-blue-100 bg-blue-50/50 rounded-lg text-xs text-blue-600 flex items-center gap-2">
                                                <Type size={12} />
                                                Se solicitará al firmante
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                <button
                    onClick={handleSend}
                    disabled={loading || !signerData.email}
                    className="w-full bg-brand-600 text-white font-medium py-3 rounded-xl hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    {loading ? 'Procesando...' : 'Enviar Documento'}
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
