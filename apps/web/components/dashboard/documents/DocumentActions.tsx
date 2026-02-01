import { MoreVertical, Eye, Info, Ban, Trash2, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface DocumentActionsProps {
    document: any;
    onViewInfo: () => void;
    onVoid: () => void;
    onDelete: () => void;
}

export default function DocumentActions({ document: doc, onViewInfo, onVoid, onDelete }: DocumentActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        window.document.addEventListener("mousedown", handleClickOutside);
        return () => {
            window.document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const isCompleted = doc.status === 'COMPLETED';
    const isVoided = doc.status === 'VOIDED';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
                <MoreVertical size={16} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1 animate-in fade-in zoom-in-95 duration-100">
                    <a
                        href={`/sign/${doc.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => setIsOpen(false)}
                    >
                        <ExternalLink size={14} className="text-gray-400" />
                        Visualizar
                    </a>

                    <button
                        onClick={() => {
                            setIsOpen(false);
                            onViewInfo();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Info size={14} className="text-blue-500" />
                        Info Completa
                    </button>

                    {!isCompleted && !isVoided && (
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onVoid();
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Ban size={14} className="text-orange-500" />
                            Anular
                        </button>
                    )}

                    <div className="h-px bg-gray-100 my-1"></div>

                    <button
                        onClick={() => {
                            setIsOpen(false);
                            onDelete();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <Trash2 size={14} />
                        Eliminar
                    </button>
                </div>
            )}
        </div>
    );
}
