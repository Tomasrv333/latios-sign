import React, { useState, useEffect } from 'react';
import { X, Send, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { EditorBlock } from '../../editor/Canvas';
import { extractVariables } from '../../../lib/variableUtils';

interface SendDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    blocks: EditorBlock[];
    onSend: (data: any) => Promise<void>;
}

export function SendDocumentModal({ isOpen, onClose, blocks, onSend }: SendDocumentModalProps) {
    const [step, setStep] = useState<'form' | 'recipients' | 'review'>('form');
    const [variables, setVariables] = useState<string[]>([]);
    const [variableValues, setVariableValues] = useState<Record<string, string>>({});
    const [recipients, setRecipients] = useState([{ email: '', role: 'SIGNER' }]);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const extracted = extractVariables(blocks);
            setVariables(extracted);
            // Initialize empty values
            const initialValues: Record<string, string> = {};
            extracted.forEach(v => initialValues[v] = '');
            setVariableValues(initialValues);

            // If no variables, skip to recipients
            if (extracted.length === 0) {
                setStep('recipients');
            } else {
                setStep('form');
            }
        }
    }, [isOpen, blocks]);

    const handleVariableChange = (key: string, value: string) => {
        setVariableValues(prev => ({ ...prev, [key]: value }));
    };

    const handleSend = async () => {
        try {
            setIsSending(true);
            await onSend({
                variableValues,
                recipients
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Enviar Documento</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'form' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-800 text-sm">
                                Este documento contiene variables. Por favor, completa la información antes de enviar.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {variables.map(variable => (
                                    <div key={variable}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                            {variable.replace(/_/g, ' ')}
                                        </label>
                                        <input
                                            type="text"
                                            value={variableValues[variable] || ''}
                                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                            placeholder={`Valor para ${variable}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'recipients' && (
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900">Destinatarios</h3>
                            {/* Simplified recipient input for MVP */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email del Firmante</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    value={recipients[0].email}
                                    onChange={e => setRecipients([{ ...recipients[0], email: e.target.value }])}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    {step === 'form' && variables.length > 0 ? (
                        <button
                            onClick={() => setStep('recipients')}
                            className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 font-medium"
                        >
                            Siguiente
                        </button>
                    ) : (
                        <button
                            onClick={handleSend}
                            disabled={isSending}
                            className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 font-medium flex items-center gap-2"
                        >
                            {isSending ? 'Enviando...' : <><Send size={18} /> Enviar</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
