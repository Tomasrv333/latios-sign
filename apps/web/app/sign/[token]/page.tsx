'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SigningCanvas } from '@/components/signing/SigningCanvas';
import { EditorBlock } from '@/components/editor/Canvas';
import { Loader2 } from 'lucide-react';
import { CertificateView } from '@/components/signing/CertificateView';
import { Toast, ToastType } from '@latios/ui';

export default function SignDocumentPage() {
    const params = useParams();
    const token = params.token as string;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [documentData, setDocumentData] = useState<any>(null);
    const [values, setValues] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    useEffect(() => {
        if (!token) return;

        fetch(`/api/documents/public/${token}`)
            .then(async (res) => {
                if (!res.ok) {
                    if (res.status === 404) throw new Error('Documento no encontrado o enlace inválido');
                    throw new Error('Error al cargar el documento');
                }
                return res.json();
            })
            .then((data) => {
                if (data.status === 'COMPLETED') {
                    setIsComplete(true);
                }
                setDocumentData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, [token]);

    const handleValueChange = (id: string, value: string) => {
        setValues((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type });
    };

    const handleSubmit = async () => {
        if (!documentData) return;

        // Validate required fields
        const blocks = documentData.structure.blocks as EditorBlock[];
        const signatureBlocks = blocks.filter(b => b.type === 'signature');

        for (const block of signatureBlocks) {
            if (!values[block.id]) {
                showToast('Por favor firma el documento antes de finalizar.', 'error');
                return;
            }
        }

        try {
            setIsSubmitting(true);
            const res = await fetch(`/api/documents/public/${token}/sign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: values })
            });

            if (!res.ok) throw new Error('Error al firmar');

            setIsComplete(true);
        } catch (err) {
            console.error(err);
            showToast('Error al guardar la firma. Intenta nuevamente.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-brand-600" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <div className="text-red-500 mb-4 flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800 mb-2">Error de Acceso</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        )
    }

    if (isComplete && documentData) {
        return <CertificateView document={documentData} />;
    }

    const blocks = (documentData?.structure?.blocks || []) as EditorBlock[];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <header className="bg-white h-16 border-b border-gray-200 px-6 flex items-center justify-between shrink-0 z-20 sticky top-0 md:relative">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                    <span className="font-semibold text-gray-700 hidden sm:inline">Firmar Documento</span>
                </div>
                <div className="text-sm text-gray-500 hidden md:block">
                    Solicitado para: <span className="font-medium text-gray-900">{documentData?.recipientName}</span>
                </div>
                <div>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-brand-600 text-white rounded-md font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                    >
                        {isSubmitting ? 'Finalizando...' : 'Firmar y Finalizar'}
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-hidden flex flex-col relative w-full">
                <SigningCanvas
                    blocks={blocks}
                    values={values}
                    onChange={handleValueChange}
                    pdfUrl={documentData?.pdfUrl}
                />
            </main>
        </div>
    );
}
