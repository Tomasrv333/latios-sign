'use client';

import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, Check, Palette, FileText, Webhook, Shield, Mail, Hash } from 'lucide-react';
import { VariableManager } from '../../../components/dashboard/settings/VariableManager';

// Mock settings data (In real app, fetch from API)
const DEFAULT_SETTINGS = {
    // General / Defaults
    defaultExpirationDays: 30,
    sendReminders: true,
    reminderFrequencyDays: 3,
    legalDisclaimer: 'Este documento ha sido firmado electrónicamente a través de Latios Sign, cumpliendo con la normativa vigente.',

    // Branding (Sign Service)
    emailLogoUrl: '',
    primaryColor: '#0070F3', // Brand Default

    // Integrations
    webhookUrl: '',
    apiKey: 'sk_live_...'
};

export default function SettingsClient() {
    const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'integrations' | 'variables'>('general');
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    // Verify Admin Access
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => {
                    if (data && data.role !== 'ADMIN') {
                        // Redirect if not admin
                        window.location.href = '/dashboard';
                    }
                    setUserRole(data.role);
                })
                .catch(() => {
                    window.location.href = '/auth/login';
                });
        } else {
            window.location.href = '/auth/login';
        }
    }, []);

    const handleChange = (key: keyof typeof DEFAULT_SETTINGS, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setIsDirty(true);
        setSaveSuccess(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        // In real app: PUT /api/settings
        // console.log("Saving settings:", settings);

        setIsSaving(false);
        setIsDirty(false);
        setSaveSuccess(true);

        setTimeout(() => setSaveSuccess(false), 3000);
    };

    if (!userRole) return null; // Loading state

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ajustes de Firma</h1>
                    <p className="text-gray-500 text-sm mt-1">Configura el comportamiento del servicio de firmas</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${isDirty
                        ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md transform hover:-translate-y-0.5'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {isSaving ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : saveSuccess ? (
                        <Check size={20} />
                    ) : (
                        <Save size={20} />
                    )}
                    {isSaving ? 'Guardando...' : saveSuccess ? 'Guardado' : 'Guardar Cambios'}
                </button>
            </header>

            <div className="flex gap-8 items-start">
                {/* Sidebar Navigation */}
                <nav className="w-64 shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-l-4 ${activeTab === 'general'
                            ? 'bg-brand-50 text-brand-700 border-brand-600'
                            : 'text-gray-600 hover:bg-gray-50 border-transparent'
                            }`}
                    >
                        <FileText size={18} />
                        General y Defaults
                    </button>
                    <button
                        onClick={() => setActiveTab('branding')}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-l-4 ${activeTab === 'branding'
                            ? 'bg-brand-50 text-brand-700 border-brand-600'
                            : 'text-gray-600 hover:bg-gray-50 border-transparent'
                            }`}
                    >
                        <Palette size={18} />
                        Personalización (Branding)
                    </button>
                    <button
                        onClick={() => setActiveTab('variables')}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-l-4 ${activeTab === 'variables'
                            ? 'bg-brand-50 text-brand-700 border-brand-600'
                            : 'text-gray-600 hover:bg-gray-50 border-transparent'
                            }`}
                    >
                        <Hash size={18} />
                        Variables Dinámicas
                    </button>
                    <button
                        onClick={() => setActiveTab('integrations')}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-l-4 ${activeTab === 'integrations'
                            ? 'bg-brand-50 text-brand-700 border-brand-600'
                            : 'text-gray-600 hover:bg-gray-50 border-transparent'
                            }`}
                    >
                        <Webhook size={18} />
                        Integraciones
                    </button>
                </nav>

                {/* Content Area */}
                <div className="flex-1 space-y-6">
                    {activeTab === 'general' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* ... content ... */}
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <Shield className="text-brand-600" size={20} />
                                Configuración de Documentos
                            </h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Caducidad por defecto (días)
                                        </label>
                                        <p className="text-xs text-gray-500 mb-2">Tiempo antes de que un sobre expire automáticamente.</p>
                                        <input
                                            type="number"
                                            value={settings.defaultExpirationDays}
                                            onChange={(e) => handleChange('defaultExpirationDays', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Frecuencia de Recordatorios (días)
                                        </label>
                                        <p className="text-xs text-gray-500 mb-2">Cada cuánto reenviar correo si no ha firmado.</p>
                                        <input
                                            type="number"
                                            value={settings.reminderFrequencyDays}
                                            onChange={(e) => handleChange('reminderFrequencyDays', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                            disabled={!settings.sendReminders}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <input
                                        type="checkbox"
                                        id="sendReminders"
                                        checked={settings.sendReminders}
                                        onChange={(e) => handleChange('sendReminders', e.target.checked)}
                                        className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 cursor-pointer"
                                    />
                                    <label htmlFor="sendReminders" className="text-sm font-medium text-gray-900 cursor-pointer select-none">
                                        Enviar recordatorios automáticos por correo
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Aviso Legal (Pie de página)
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">Texto legal que aparecerá adjunto en el documento final firmado.</p>
                                    <textarea
                                        rows={4}
                                        value={settings.legalDisclaimer}
                                        onChange={(e) => handleChange('legalDisclaimer', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-sm resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'branding' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* ... content ... */}
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <Mail className="text-brand-600" size={20} />
                                Personalización de Correos
                            </h2>

                            <div className="space-y-6">
                                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm mb-6 flex items-start gap-2">
                                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                    <p>Estos ajustes sobrescriben la configuración global de la organización únicamente para los correos transaccionales de firma.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL del Logo
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://empresa.com/logo.png"
                                        value={settings.emailLogoUrl}
                                        onChange={(e) => handleChange('emailLogoUrl', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Color Primario (Botones)
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={settings.primaryColor}
                                            onChange={(e) => handleChange('primaryColor', e.target.value)}
                                            className="h-10 w-20 p-1 border border-gray-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={settings.primaryColor}
                                            onChange={(e) => handleChange('primaryColor', e.target.value)}
                                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 border-t border-gray-200 pt-6">
                                    <h3 className="text-sm font-medium text-gray-900 mb-4">Vista Previa (Botón)</h3>
                                    <div className="p-8 bg-gray-50 rounded-lg flex justify-center border border-gray-200 border-dashed">
                                        <button
                                            style={{ backgroundColor: settings.primaryColor }}
                                            className="px-6 py-3 text-white font-semibold rounded-md shadow-sm transition-opacity hover:opacity-90"
                                        >
                                            Revisar y Firmar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'variables' && (
                        <VariableManager />
                    )}

                    {activeTab === 'integrations' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* ... content ... */}
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <Webhook className="text-brand-600" size={20} />
                                API y Webhooks
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Webhook URL
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">Recibe notificaciones POST cuando un documento cambia de estado.</p>
                                    <input
                                        type="url"
                                        placeholder="https://api.tu-sistema.com/webhooks/latios"
                                        value={settings.webhookUrl}
                                        onChange={(e) => handleChange('webhookUrl', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        API Key (Pública)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={settings.apiKey}
                                            readOnly
                                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 font-mono text-sm outline-none"
                                        />
                                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors">
                                            Regenerar
                                        </button>
                                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors">
                                            Copiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
