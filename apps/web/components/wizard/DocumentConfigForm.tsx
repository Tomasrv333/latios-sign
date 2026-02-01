'use client';

import React, { useState, useEffect } from 'react';
import { Type, AlertCircle, ArrowRight } from 'lucide-react';

interface DocumentConfigFormProps {
    variables: string[];
    values: Record<string, string>;
    onChange: (values: Record<string, string>) => void;
    onNext: () => void;
}

export function DocumentConfigForm({ variables, values, onChange, onNext }: DocumentConfigFormProps) {
    // Local state for identifying "Solicit from Signer" mode
    // We'll treat a special key '_delegate' as the toggle, or manage it separately.
    // Ideally, we pass it in `values` or a separate prop. For now, let's assume `values._delegate` holds 'true'/'false'.

    // Ensure default delegate state
    useEffect(() => {
        if (!values._delegate) {
            onChange({ ...values, _delegate: 'false' });
        }
    }, []);

    const isDelegate = values._delegate === 'true';

    const handleDelegateToggle = (delegate: boolean) => {
        onChange({ ...values, _delegate: delegate ? 'true' : 'false' });
    };

    const handleChange = (key: string, val: string) => {
        onChange({ ...values, [key]: val });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Configuración del Documento</h2>
                <p className="text-sm text-gray-500">Define los datos variables del documento.</p>
            </div>

            <div className="p-6 space-y-6">

                {/* Mode Selector */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-900">¿Quién llena la información?</label>
                    </div>
                    <div className="flex p-1 bg-white border border-gray-200 rounded-lg">
                        <button
                            type="button"
                            onClick={() => handleDelegateToggle(false)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${!isDelegate
                                ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <Type size={16} />
                            <span>Llenar Ahora</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDelegateToggle(true)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${isDelegate
                                ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <UserIcon />
                            <span>Solicitar al Firmante</span>
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 flex items-start gap-1.5">
                        <AlertCircle size={14} className="mt-0.5 text-brand-500 shrink-0" />
                        {isDelegate
                            ? "los campos variables quedarán vacíos y se le pedirá al firmante que los complete antes de firmar."
                            : "Completa los campos ahora. Verás los cambios reflejados en la vista previa inmediatemente."}
                    </p>
                </div>

                {/* Variables Inputs */}
                {!isDelegate && variables.length > 0 && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {variables.map((variable) => (
                                <div key={variable} className="space-y-1.5 group">
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide group-focus-within:text-brand-600 transition-colors">
                                        {variable.replace(/_/g, ' ')}
                                    </label>
                                    <input
                                        type="text"
                                        value={values[variable] || ''}
                                        onChange={(e) => handleChange(variable, e.target.value)}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm"
                                        placeholder={`Escribe ${variable}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {!isDelegate && variables.length === 0 && (
                    <div className="py-8 text-center text-gray-400 text-sm">
                        No se encontraron variables en esta plantilla.
                    </div>
                )}


                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onNext}
                        className="px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-all flex items-center gap-2 shadow-sm hover:shadow active:scale-95"
                    >
                        Continuar
                        <ArrowRight size={18} />
                    </button>
                </div>

            </div>
        </div>
    );
}

function UserIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    )
}
