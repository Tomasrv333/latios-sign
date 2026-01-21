'use client';

import React, { useState } from 'react';
import { Loader2, Mail, Link as LinkIcon, Copy, Check } from 'lucide-react';

interface SendDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    templateId: string;
}

export function SendDocumentModal({ isOpen, onClose, templateId }: SendDocumentModalProps) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    templateId,
                    recipientEmail: email,
                    recipientName: name
                })
            });

            if (!res.ok) throw new Error('Failed to send document');

            const data = await res.json();
            const fullUrl = `${window.location.origin}${data.publicUrl}`;
            setGeneratedLink(fullUrl);
            setStep('success');
        } catch (error) {
            console.error(error);
            alert('Error al enviar el documento');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Enviar Documento</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div className="p-6">
                    {step === 'form' ? (
                        <form onSubmit={handleSend} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo del Destinatario</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                        placeholder="cliente@ejemplo.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (Opcional)</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                    placeholder="Juan Pérez"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full bg-brand-600 text-white font-medium py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin w-4 h-4" />}
                                {loading ? 'Creando...' : 'Crear y Generar Link'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <Check className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900">¡Documento Listo!</h4>
                            <p className="text-sm text-gray-500">
                                El documento ha sido creado. Comparte este enlace con el destinatario para que firme.
                            </p>

                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                                <LinkIcon className="text-gray-400 w-5 h-5 shrink-0" />
                                <input
                                    readOnly
                                    value={generatedLink}
                                    className="bg-transparent border-none text-sm text-gray-600 w-full focus:ring-0"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 hover:bg-white rounded-md transition-colors"
                                    title="Copiar"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                                </button>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full bg-gray-100 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-200"
                            >
                                Cerrar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
