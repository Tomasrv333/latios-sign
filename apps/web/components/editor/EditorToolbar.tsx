import { PanelLeft, Shapes, MousePointer2, Files } from 'lucide-react';
import { TeamDropdown } from './TeamDropdown';

interface EditorToolbarProps {
    activeTab: 'tools' | 'pages' | null;
    onTabChange: (tab: 'tools' | 'pages') => void;
    signatureType: 'draw' | 'otp';
    onSignatureTypeChange: (type: 'draw' | 'otp') => void;
    processId?: string;
    onProcessChange?: (id: string) => void;
}

export function EditorToolbar({
    activeTab,
    onTabChange,
    signatureType,
    onSignatureTypeChange,
    processId,
    onProcessChange
}: EditorToolbarProps) {
    return (
        <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 z-20 shrink-0">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onTabChange('pages')}
                    className={`p-1.5 rounded-md flex items-center gap-2 transition-colors ${activeTab === 'pages'
                        ? 'bg-brand-50 text-brand-600'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    title="Gestionar Hojas"
                >
                    <Files size={18} />
                    <span className="text-sm font-medium hidden sm:inline">Hojas</span>
                </button>

                <button
                    onClick={() => onTabChange('tools')}
                    className={`p-1.5 rounded-md flex items-center gap-2 transition-colors ${activeTab === 'tools'
                        ? 'bg-brand-50 text-brand-600'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    title="Herramientas"
                >
                    <PanelLeft size={18} />
                    <span className="text-sm font-medium hidden sm:inline">Herramientas</span>
                </button>

                <div className="h-4 w-px bg-gray-200 mx-2" />

                <button
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 flex items-center gap-2 cursor-not-allowed"
                    title="Próximamente: Figuras"
                    disabled
                >
                    <Shapes size={18} />
                    <span className="text-sm font-medium hidden sm:inline">Figuras</span>
                </button>
            </div>

            <div className="flex items-center gap-4">
                {/* Team Selector added here */}
                {onProcessChange && (
                    <TeamDropdown
                        selectedTeamId={processId || null}
                        onSelect={onProcessChange}
                    />
                )}

                <div className="h-4 w-px bg-gray-200" />

                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                    <button
                        onClick={() => onSignatureTypeChange('draw')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${signatureType === 'draw'
                            ? 'bg-white text-brand-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Firma Digital
                    </button>
                    <button
                        onClick={() => onSignatureTypeChange('otp')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${signatureType === 'otp'
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Firma Electrónica (OTP)
                    </button>
                </div>
            </div>
        </div>
    );
}
