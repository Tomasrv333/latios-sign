'use client';

import React from 'react';
import { CheckCircle, Download, Copy, ShieldCheck } from 'lucide-react';
import { Button, Card } from '@latios/ui';

interface CertificateViewProps {
    document: {
        id: string;
        recipientName: string;
        recipientEmail: string;
        sentAt: string;
        signedAt: string;
        integrityHash?: string;
    };
}

export function CertificateView({ document }: CertificateViewProps) {
    const copyHash = () => {
        if (document.integrityHash) {
            navigator.clipboard.writeText(document.integrityHash);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-4xl space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            L
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Documento firmado electrónicamente</h1>
                    </div>
                    <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <CheckCircle size={16} /> VÁLIDO
                    </span>
                </div>

                {/* Main Info Card */}
                <Card className="bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-2">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Formato</p>
                            <p className="text-gray-900 font-medium">Contrato Digital</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">ID Documento</p>
                            <p className="text-gray-900 font-medium text-sm font-mono truncate" title={document.id}>
                                {document.id.substring(0, 18)}...
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Firmante</p>
                            <div className="flex flex-col">
                                <span className="text-gray-900 font-medium">{document.recipientName}</span>
                                <span className="text-gray-500 text-xs">{document.recipientEmail}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Fecha de Firma</p>
                            <p className="text-gray-900 font-medium">
                                {new Date(document.signedAt).toLocaleString()}
                            </p>
                            <span className="text-xs text-brand-600 mt-1 block">Firma Electrónica (Latios)</span>
                        </div>
                    </div>
                </Card>

                {/* Integrity Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800">Integridad del documento</h3>
                    <p className="text-gray-600 text-sm">
                        Este hash criptográfico permite validar que el documento no ha sido alterado:
                    </p>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-4 shadow-sm">
                        <code className="flex-1 font-mono text-xs text-gray-600 break-all bg-gray-50 p-2 rounded">
                            {document.integrityHash || 'Calculando hash...'}
                        </code>
                        <button
                            onClick={copyHash}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1 text-xs font-medium"
                            title="Copiar Hash"
                        >
                            <Copy size={14} /> Copiar
                        </button>
                    </div>
                </div>

                {/* Validation Info */}
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <ShieldCheck size={20} className="text-brand-600" />
                        ¿Cómo se validó esta firma electrónica?
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-2">
                        <li>El firmante accedió mediante un enlace único seguro enviado a su correo electrónico.</li>
                        <li>Se registró la firma manuscrita y la fecha exacta del evento.</li>
                        <li>El documento fue sellado con un hash criptográfico único.</li>
                        <li>Se registró evidencia técnica completa y trazabilidad del proceso.</li>
                    </ul>
                </div>

                {/* Traceability Table */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800">Trazabilidad del documento</h3>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Fecha</th>
                                    <th className="px-6 py-3">Evento</th>
                                    <th className="px-6 py-3">Actor</th>
                                    <th className="px-6 py-3 text-right">Detalles</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-gray-600">
                                        {new Date(document.sentAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">Envío de Documento</td>
                                    <td className="px-6 py-4">Sistema (Latios)</td>
                                    <td className="px-6 py-4 text-right text-gray-500">Enviado a {document.recipientEmail}</td>
                                </tr>
                                <tr className="bg-green-50/30">
                                    <td className="px-6 py-4 font-mono text-gray-600">
                                        {new Date(document.signedAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-green-700">Documento Firmado</td>
                                    <td className="px-6 py-4">{document.recipientName}</td>
                                    <td className="px-6 py-4 text-right text-gray-500">Firma completada exitosamente</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-4 pb-12">
                    <Button size="lg" className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white">
                        <Download size={18} />
                        Descargar documento
                    </Button>
                </div>
            </div>
        </div>
    );
}
