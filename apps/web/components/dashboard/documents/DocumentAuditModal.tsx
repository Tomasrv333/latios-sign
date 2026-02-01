import { Button } from "@latios/ui";
import { X, CheckCircle, Clock, Trash2, Ban, Send, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface AuditLog {
    id: string;
    action: string;
    createdAt: string;
    metadata: any;
}

interface DocumentAuditModalProps {
    documentId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function DocumentAuditModal({ documentId, isOpen, onClose }: DocumentAuditModalProps) {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && documentId) {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            fetch(`/api/documents/${documentId}/audit`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    setLogs(Array.isArray(data) ? data : []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch audit logs", err);
                    setLoading(false);
                });
        }
    }, [isOpen, documentId]);

    if (!isOpen) return null;

    const getIconForAction = (action: string) => {
        switch (action) {
            case 'DOCUMENT_CREATED': return <Send size={16} className="text-blue-600" />;
            case 'DOCUMENT_VIEWED': return <Eye size={16} className="text-purple-600" />;
            case 'DOCUMENT_SIGNED': return <CheckCircle size={16} className="text-green-600" />;
            case 'DOCUMENT_VOIDED': return <Ban size={16} className="text-orange-600" />;
            case 'DOCUMENT_DELETED': return <Trash2 size={16} className="text-red-600" />;
            default: return <Clock size={16} className="text-gray-500" />;
        }
    };

    const getLabelForAction = (action: string) => {
        switch (action) {
            case 'DOCUMENT_CREATED': return 'Documento Creado y Enviado';
            case 'DOCUMENT_VIEWED': return 'Documento Visto por Destinatario';
            case 'DOCUMENT_SIGNED': return 'Documento Firmado';
            case 'DOCUMENT_VOIDED': return 'Documento Anulado';
            case 'DOCUMENT_DELETED': return 'Documento Eliminado';
            default: return action.replace('DOCUMENT_', '').replace('_', ' ');
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-900">Historial del Documento</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No hay registros de auditoría disponibles para este documento.
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 py-2">
                            {logs.map((log) => (
                                <div key={log.id} className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                                        {/* Dot */}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            {getIconForAction(log.action)}
                                            <span className="font-medium text-gray-900">{getLabelForAction(log.action)}</span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                        {log.metadata && (
                                            <pre className="text-[10px] bg-gray-50 p-2 rounded border border-gray-100 mt-1 overflow-x-auto text-gray-600">
                                                {JSON.stringify(log.metadata, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-end">
                    <Button variant="secondary" onClick={onClose} size="sm">Cerrar</Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
