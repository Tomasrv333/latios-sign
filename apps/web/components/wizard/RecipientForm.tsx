'use client';

import React, { useState } from 'react';
import { Mail, User, Phone, Upload, Send } from 'lucide-react';

interface RecipientFormProps {
    templateName: string;
    onSubmit: (data: RecipientData) => void;
    loading: boolean;
}

export interface RecipientData {
    name: string;
    email: string;
    phone?: string;
    sendViaEmail: boolean;
    sendViaWhatsapp: boolean;
    isMassive: boolean;
}

export function RecipientForm({ templateName, onSubmit, loading }: RecipientFormProps) {
    const [mode, setMode] = useState<'individual' | 'massive'>('individual');
    const [formData, setFormData] = useState<RecipientData>({
        name: '',
        email: '',
        phone: '',
        sendViaEmail: true,
        sendViaWhatsapp: false,
        isMassive: false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...formData, isMassive: mode === 'massive' });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Header - Simpler and cleaner */}
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Detalles del Destinatario</h2>
                    <p className="text-sm text-gray-500">Completa la información para <span className="font-medium text-gray-900">{templateName}</span></p>
                </div>
                {/* Tabs as a segmented control or pills */}
                <div className="flex bg-gray-100 p-1 rounded-lg self-start sm:self-center">
                    <button
                        type="button"
                        onClick={() => setMode('individual')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'individual'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Individual
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('massive')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'massive'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Masivo
                    </button>
                </div>
            </div>

            <div className="p-6">
                {mode === 'individual' ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Correo Electrónico <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="pl-10 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm"
                                        placeholder="destinatario@ejemplo.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Nombre (Opcional)</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="pl-10 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm"
                                            placeholder="Nombre del firmante"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Celular (Opcional)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="pl-10 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm"
                                            placeholder="+57 300 123 4567"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Canales de Envío</label>
                            <div className="flex gap-4">
                                <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${formData.sendViaEmail ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.sendViaEmail ? 'bg-brand-600 border-brand-600' : 'border-gray-300 bg-white'}`}>
                                        {formData.sendViaEmail && <Send size={10} className="text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.sendViaEmail}
                                        onChange={e => setFormData(prev => ({ ...prev, sendViaEmail: e.target.checked }))}
                                    />
                                    <span className="text-sm font-medium">Email</span>
                                </label>

                                <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-not-allowed opacity-50 bg-gray-50 grayscale`}>
                                    <div className={`w-4 h-4 rounded border border-gray-300 bg-white`}></div>
                                    <span className="text-sm font-medium text-gray-500">WhatsApp (Pronto)</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={loading || !formData.email}
                                className="flex-1 bg-brand-600 text-white font-medium py-2.5 rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all hover:-translate-y-0.5 text-sm"
                            >
                                {loading ? 'Enviando...' : 'Enviar Documento'}
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-12 space-y-4">
                        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Carga Masiva</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                            Importa una lista de destinatarios desde Excel o CSV.
                        </p>
                        <button disabled className="px-6 py-2 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed">
                            Próximamente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
