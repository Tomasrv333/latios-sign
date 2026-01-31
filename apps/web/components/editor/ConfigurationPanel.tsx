import React from 'react';
import { Card } from '@latios/ui';
import { Settings, Shield, Building } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface ConfigurationPanelProps {
    settings: {
        signatureType: 'draw' | 'otp';
        requireId: boolean;
        companyName?: string;
        description?: string; // Added description
    };
    onChange: (settings: any) => void;
}

export function ConfigurationPanel({ settings, onChange }: ConfigurationPanelProps) {
    const handleChange = (key: string, value: any) => {
        onChange({ ...settings, [key]: value });
    };

    return (
        <div className="w-full bg-white h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <Settings size={18} className="text-gray-500" />
                <h3 className="font-semibold text-gray-700">Ajustes Generales</h3>
            </div>

            <div className="space-y-6 flex-1">
                {/* Signature Settings */}
                <section>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Shield size={14} />
                        Firma y Seguridad
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Firma</label>
                            <select
                                value={settings.signatureType}
                                onChange={(e) => handleChange('signatureType', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            >
                                <option value="draw">Garabato Digital</option>
                                <option value="otp">Firma Electrónica (OTP)</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-1">
                                {settings.signatureType === 'draw'
                                    ? 'El usuario dibuja su firma en pantalla.'
                                    : 'Se envía un código único al email/celular.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="requireId"
                                checked={settings.requireId}
                                onChange={(e) => handleChange('requireId', e.target.checked)}
                                className="rounded text-brand-600 focus:ring-brand-500 border-gray-300"
                            />
                            <label htmlFor="requireId" className="text-sm text-gray-700 cursor-pointer select-none">Requerir Documento ID</label>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-gray-300"></div>

                {/* Company Settings */}
                <section>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Building size={14} />
                        Información
                    </h4>
                    <div className="space-y-4">
                        <Input
                            label="Nombre Empresa"
                            value={settings.companyName || ''}
                            onChange={(e) => handleChange('companyName', e.target.value)}
                            placeholder="Ej. Mi Empresa SAS"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de la Plantilla</label>
                            <textarea
                                value={settings.description || ''}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                                rows={3}
                                placeholder="Describe brevemente el propósito de este documento..."
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
