'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Check, Loader2, ChevronLeft } from "lucide-react";
import { TeamSelector, Team } from "@/components/wizard/TeamSelector";
import { TemplateGrid, Template } from "@/components/wizard/TemplateGrid";
import { RecipientForm, RecipientData } from "@/components/wizard/RecipientForm";
import { TemplateRenderer } from "@/components/editor/TemplateRenderer";
import { extractVariables } from "@/lib/variableUtils";

export default function CreateDocumentWizard() {
    const router = useRouter();

    // Wizard State
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // Selection State
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    // Data Loading
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    // Sending State
    const [isSending, setIsSending] = useState(false);
    const [successData, setSuccessData] = useState<{ url: string } | null>(null);

    // Fetch templates when step 2 active (or preload)
    useEffect(() => {
        if (selectedTeam) {
            setLoadingTemplates(true);
            const token = localStorage.getItem('accessToken');
            fetch('/api/templates', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    setTemplates(data || []);
                    setLoadingTemplates(false);
                })
                .catch(err => {
                    console.error("Error loading templates", err);
                    setLoadingTemplates(false);
                });
        }
    }, [selectedTeam]);

    const handleTeamSelect = (team: Team) => {
        setSelectedTeam(team);
        setStep(2);
    };

    const handleTemplateSelect = (template: Template) => {
        setSelectedTemplate(template);
        setStep(3);
    };

    const handleSendDocument = async (data: RecipientData) => {
        if (!selectedTemplate) return;

        setIsSending(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    templateId: selectedTemplate.id,
                    recipientEmail: data.email,
                    recipientName: data.name,
                    variableValues: data.variableValues
                })
            });

            if (!res.ok) throw new Error('Failed to send');

            const responseData = await res.json();
            setSuccessData({ url: `${window.location.origin}${responseData.publicUrl}` });

        } catch (error) {
            console.error(error);
            alert('Error al enviar el documento');
        } finally {
            setIsSending(false);
        }
    };

    const canGoNext = () => {
        if (step === 1) return !!selectedTeam;
        if (step === 2) return !!selectedTemplate;
        return false;
    };

    const goNext = () => {
        if (canGoNext()) setStep(prev => Math.min(prev + 1, 3) as 1 | 2 | 3);
    };

    const goBack = () => {
        setStep(prev => Math.max(prev - 1, 1) as 1 | 2 | 3);
    };

    // Render Success View
    if (successData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <Check size={40} strokeWidth={3} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">¡Documento Enviado!</h2>
                        <p className="text-gray-500 mt-2">El destinatario ha recibido la notificación correctamente.</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500 break-all border border-gray-200">
                        {successData.url}
                    </div>

                    <button
                        onClick={() => router.push('/dashboard/documents')}
                        className="w-full py-3 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors"
                    >
                        Volver a Documentos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen font-sans">
            {/* Header / Breadcrumb */}
            <header className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span className="cursor-pointer hover:text-brand-600" onClick={() => router.push('/dashboard/documents')}>Documentos</span>
                    <ChevronRight size={14} />
                    <span className="font-medium text-gray-900">Nuevo Envío</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Enviar Documento</h1>
            </header>

            {/* Stepper (Compact & Modern with Arrows) */}
            <div className="mb-10">
                <div className="flex items-center justify-center w-full gap-4">
                    {/* Back Arrow */}
                    <button
                        onClick={goBack}
                        disabled={step === 1}
                        className={`p-2 rounded-full transition-all ${step > 1
                            ? 'text-gray-500 hover:bg-gray-100 hover:text-brand-600 cursor-pointer'
                            : 'text-gray-200 cursor-default opacity-0'
                            }`}
                        title="Anterior"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="flex items-center w-full max-w-lg">
                        {/* Step 1 */}
                        <div className="relative flex flex-col items-center group cursor-pointer" onClick={() => step > 1 && setStep(1)}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 z-10 ${step >= 1
                                ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-100'
                                : 'bg-white border-2 border-gray-300 text-gray-400'
                                }`}>
                                {step > 1 ? <Check size={14} strokeWidth={3} /> : '1'}
                            </div>
                            <span className={`absolute -bottom-7 whitespace-nowrap text-xs font-semibold tracking-wide transition-colors ${step >= 1 ? 'text-brand-700' : 'text-gray-400'
                                }`}>
                                Equipo
                            </span>
                        </div>

                        {/* Connector 1-2 */}
                        <div className="flex-1 h-[2px] mx-3 relative bg-gray-100">
                            <div
                                className="absolute top-0 left-0 h-full bg-brand-600 transition-all duration-500 ease-out"
                                style={{ width: step >= 2 ? '100%' : '0%' }}
                            ></div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex flex-col items-center group cursor-pointer" onClick={() => step > 2 && setStep(2)}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 z-10 ${step >= 2
                                ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-100'
                                : 'bg-white border-2 border-gray-300 text-gray-400'
                                }`}>
                                {step > 2 ? <Check size={14} strokeWidth={3} /> : '2'}
                            </div>
                            <span className={`absolute -bottom-7 whitespace-nowrap text-xs font-semibold tracking-wide transition-colors ${step >= 2 ? 'text-brand-700' : 'text-gray-400'
                                }`}>
                                Plantilla
                            </span>
                        </div>

                        {/* Connector 2-3 */}
                        <div className="flex-1 h-[2px] mx-3 relative bg-gray-100">
                            <div
                                className="absolute top-0 left-0 h-full bg-brand-600 transition-all duration-500 ease-out"
                                style={{ width: step >= 3 ? '100%' : '0%' }}
                            ></div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 z-10 ${step >= 3
                                ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-100'
                                : 'bg-white border-2 border-gray-300 text-gray-400'
                                }`}>
                                3
                            </div>
                            <span className={`absolute -bottom-7 whitespace-nowrap text-xs font-semibold tracking-wide transition-colors ${step >= 3 ? 'text-brand-700' : 'text-gray-400'
                                }`}>
                                Envío
                            </span>
                        </div>
                    </div>

                    {/* Forward Arrow */}
                    <button
                        onClick={goNext}
                        disabled={!canGoNext() || step === 3}
                        className={`p-2 rounded-full transition-all ${canGoNext() && step < 3
                            ? 'text-gray-500 hover:bg-gray-100 hover:text-brand-600 cursor-pointer'
                            : 'text-gray-200 cursor-default opacity-0'
                            }`}
                        title="Siguiente"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Wizard Content */}
            <div className="min-h-[400px]">
                {step === 1 && (
                    <TeamSelector
                        selectedTeamId={selectedTeam?.id || null}
                        onSelect={handleTeamSelect}
                    />
                )}

                {step === 2 && (
                    <>
                        {loadingTemplates ? (
                            <div className="h-64 flex items-center justify-center">
                                <Loader2 className="animate-spin text-brand-600" size={32} />
                            </div>
                        ) : (
                            <TemplateGrid
                                teamId={selectedTeam!.id}
                                selectedTemplateId={selectedTemplate?.id || null}
                                onSelect={handleTemplateSelect}
                                templates={templates}
                            />
                        )}
                    </>
                )}

                {step === 3 && selectedTemplate && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Form Column */}
                        <div className="space-y-4">
                            <RecipientForm
                                templateName={selectedTemplate.name}
                                onSubmit={handleSendDocument}
                                loading={isSending}
                                variables={extractVariables(selectedTemplate.structure.blocks || [])}
                            />
                        </div>

                        {/* Preview Column */}
                        <div className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden flex flex-col h-[700px] shadow-inner">
                            <div className="p-3 bg-white border-b border-gray-200 text-center font-medium text-gray-600 text-xs uppercase tracking-wide">
                                Vista Previa del Documento
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
                                <div className="scale-[0.65] origin-top shadow-xl">
                                    <div className="bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
                                        <TemplateRenderer blocks={selectedTemplate.structure.blocks || []} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
