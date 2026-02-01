'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Check, Loader2, ChevronLeft, UploadCloud } from "lucide-react";
import { TeamSelector, Team } from "@/components/wizard/TeamSelector";
import { TemplateGrid, Template } from "@/components/wizard/TemplateGrid";
import { SendingConfiguration } from "@/components/wizard/SendingConfiguration";
import { ComposeDocument } from "@/components/wizard/ComposeDocument";
import { TemplateRenderer } from "@/components/editor/TemplateRenderer";
import { extractVariables } from "@/lib/variableUtils";
import { SignerData } from "@/components/wizard/SignerConfigForm"; // Generic type

export default function CreateDocumentWizard() {
    const router = useRouter();

    // Wizard State
    // 1. Team, 2. Template, 3. Config (Mode/Security), 4. Compose/Upload
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

    // Selection State
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    // Config State
    const [sendMode, setSendMode] = useState<'individual' | 'massive'>('individual');

    // Data State (Individual)
    const [variableValues, setVariableValues] = useState<Record<string, string>>({});

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

    const handleConfigNext = () => {
        setStep(4);
    };

    const handleSendDocument = async (signerData: SignerData) => {
        if (!selectedTemplate) return;

        setIsSending(true);
        try {
            const token = localStorage.getItem('accessToken');
            const { _delegate, ...allVariables } = variableValues;

            const filledVariables: Record<string, string> = {};
            const signerVariables: string[] = [];

            Object.entries(allVariables).forEach(([key, value]) => {
                if (value === '__ASK_SIGNER__') {
                    signerVariables.push(key);
                } else {
                    filledVariables[key] = value;
                }
            });

            const res = await fetch('/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    templateId: selectedTemplate.id,
                    recipientEmail: signerData.email,
                    recipientName: signerData.name,
                    variableValues: filledVariables,
                    signerVariables: signerVariables
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
        if (step === 3) return true;
        return false;
    };

    const goNext = () => {
        if (canGoNext()) setStep(prev => Math.min(prev + 1, 4) as any);
    };

    const goBack = () => {
        setStep(prev => Math.max(prev - 1, 1) as any);
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

            {/* Stepper (Compact & Modern) */}
            <div className="mb-10">
                <div className="flex items-center justify-center w-full gap-4">
                    <button
                        onClick={goBack}
                        disabled={step === 1}
                        className={`p-2 rounded-full transition-all ${step > 1 ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-200 opacity-0'}`}
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="flex items-center w-full max-w-2xl">
                        {[
                            { id: 1, label: 'Equipo' },
                            { id: 2, label: 'Plantilla' },
                            { id: 3, label: 'Configuración' },
                            { id: 4, label: sendMode === 'individual' ? 'Redactar' : 'Carga' }
                        ].map((s, index, arr) => (
                            <div key={s.id} className="flex flex-1 items-center last:flex-none">
                                <div
                                    className="relative flex flex-col items-center group cursor-pointer"
                                    onClick={() => step > s.id && setStep(s.id as any)}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 z-10 ${step >= s.id
                                        ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-100'
                                        : 'bg-white border-2 border-gray-300 text-gray-400'
                                        }`}>
                                        {step > s.id ? <Check size={14} strokeWidth={3} /> : s.id}
                                    </div>
                                    <span className={`absolute -bottom-7 whitespace-nowrap text-xs font-semibold tracking-wide transition-colors ${step >= s.id ? 'text-brand-700' : 'text-gray-400'
                                        }`}>
                                        {s.label}
                                    </span>
                                </div>
                                {index < arr.length - 1 && (
                                    <div className="flex-1 h-[2px] mx-3 relative bg-gray-100">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-brand-600 transition-all duration-500 ease-out"
                                            style={{ width: step > s.id ? '100%' : '0%' }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={goNext}
                        disabled={!canGoNext() || step === 4}
                        className={`p-2 rounded-full transition-all ${canGoNext() && step < 4 ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-200 opacity-0'}`}
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

                {/* Step 3: Config Strategy */}
                {step === 3 && selectedTemplate && (
                    <div className="max-w-3xl mx-auto">
                        <SendingConfiguration
                            mode={sendMode}
                            setMode={setSendMode}
                            signatureType={(selectedTemplate as any).signatureType || 'DIGITAL'}
                            onNext={handleConfigNext}
                        />
                    </div>
                )}

                {/* Step 4: Compose (Individual) or Upload (Massive) */}
                {step === 4 && selectedTemplate && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {sendMode === 'individual' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[750px]">
                                {/* Form Column (Left - 4 cols) */}
                                <div className="lg:col-span-4 h-full">
                                    <ComposeDocument
                                        templateName={selectedTemplate.name}
                                        variables={extractVariables(selectedTemplate.structure.blocks || [])}
                                        initialValues={variableValues}
                                        onVariablesChange={setVariableValues}
                                        onSubmit={handleSendDocument}
                                        loading={isSending}
                                    />
                                </div>

                                {/* Preview Column (Right - 8 cols) */}
                                <div className="lg:col-span-8 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full shadow-inner relative">
                                    <div className="absolute top-4 right-4 z-10">
                                        {variableValues._delegate === 'true' && (
                                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 shadow-sm">
                                                Modo Delegado
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
                                        <div className="scale-[0.8] origin-top shadow-2xl transition-all duration-300">
                                            <div className="bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
                                                <TemplateRenderer
                                                    blocks={selectedTemplate.structure.blocks || []}
                                                    variables={variableValues._delegate === 'true' ? {} : variableValues}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                <div className="w-20 h-20 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <UploadCloud size={40} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Carga Masiva de Destinatarios</h2>
                                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                                    Sube un archivo .CSV o .XLSX con los columnas correspondientes a las variables de tu plantilla.
                                </p>
                                <button className="mt-8 px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-sm">
                                    Seleccionar Archivo
                                </button>
                                <p className="text-xs text-gray-400 mt-4">Próximamente disponible</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
