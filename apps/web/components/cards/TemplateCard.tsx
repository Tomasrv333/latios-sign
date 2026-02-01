'use client';

import React from 'react';
import { FileText, Verified, PenTool, CheckCircle2, Braces } from 'lucide-react';
import { TemplateRenderer } from '@/components/editor/TemplateRenderer';
import { extractVariables } from '@/lib/variableUtils';
import { EditorBlock } from '@/components/editor/Canvas';

export interface Template {
    id: string;
    name: string;
    description?: string;
    updatedAt: string;
    structure: {
        blocks: EditorBlock[];
        settings?: { tags?: string[] };
    };
    pdfUrl?: string | null;
    signatureType: 'digital' | 'electronic' | 'DIGITAL' | 'ELECTRONIC'; // Loose type to handle both API/UI cases
    processId?: string;
    creator?: { name: string };
}

interface TemplateCardProps {
    template: Template;
    isSelected?: boolean;
    onClick?: () => void;
    showPreview?: boolean;
    compact?: boolean; // For tighter spaces if needed
    className?: string; // specific className override
}

export function TemplateCard({ template, isSelected, onClick, showPreview = true }: TemplateCardProps) {
    // Normalization
    const isDigital = template.signatureType?.toString().toUpperCase() === 'DIGITAL';
    const typeLabel = isDigital ? 'Digital' : 'OTP';

    // Preview Logic
    const getPreviewBlocks = (structure: any) => {
        if (Array.isArray(structure)) return structure;
        if (structure && typeof structure === 'object' && Array.isArray(structure.blocks)) return structure.blocks;
        return [];
    };
    const blocks = getPreviewBlocks(template.structure);

    const variableCount = extractVariables(blocks || []).length;
    const tags = template.structure.settings?.tags || [];

    return (
        <div
            onClick={onClick}
            className={`group relative flex flex-col rounded-xl border transition-all cursor-pointer overflow-hidden bg-white h-full
                ${isSelected
                    ? 'border-brand-500 bg-brand-50/40 shadow-sm ring-1 ring-brand-500 transform scale-[1.01]'
                    : 'border-gray-200 hover:border-brand-200 hover:shadow-lg hover:-translate-y-0.5'
                }`}
        >
            {/* Header / Preview Area */}
            {showPreview && (
                <div className={`h-32 sm:h-40 overflow-hidden relative border-b border-gray-100 flex justify-center items-start pt-0 transition-colors
                    ${isSelected ? 'bg-brand-50/30' : 'bg-gray-50/50 group-hover:bg-gray-50'}`}>

                    {/* Miniature Document */}
                    <div className="transform scale-[0.25] origin-top mt-4 shadow-sm border border-gray-100 bg-white select-none pointer-events-none transition-transform duration-500 group-hover:scale-[0.26]">
                        <TemplateRenderer blocks={blocks} />
                    </div>

                    {/* Gradient Fade for bottom of preview */}
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />

                    {/* Badge */}
                    <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm border backdrop-blur-sm z-10 ${isDigital
                        ? 'bg-blue-50/90 text-blue-700 border-blue-200'
                        : 'bg-purple-50/90 text-purple-700 border-purple-200'
                        }`}>
                        {isDigital ? <Verified size={10} /> : <PenTool size={10} />}
                        {typeLabel}
                    </div>

                    {/* Selection Check */}
                    {isSelected && (
                        <div className="absolute top-2 left-2 text-brand-600 animate-in zoom-in spin-in-90 duration-300 z-10">
                            <CheckCircle2 size={22} className="fill-brand-100 shadow-sm rounded-full" />
                        </div>
                    )}
                </div>
            )}

            {/* Content Body */}
            <div className={`p-4 flex-1 flex flex-col ${isSelected ? 'bg-brand-50/10' : 'bg-white'}`}>
                <h3 className={`font-semibold text-gray-900 mb-1 transition-colors line-clamp-1 ${isSelected ? 'text-brand-900' : 'group-hover:text-brand-700'}`}>
                    {template.name}
                </h3>

                {/* Metadata Row (Variables) */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1.5" title="Campos Variables">
                        <div className="bg-gray-100 p-1 rounded-md text-gray-600">
                            <Braces size={12} />
                        </div>
                        <span className="font-medium">
                            {variableCount} Variables
                        </span>
                    </div>
                </div>

                {/* Tags Row */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium border border-gray-200 truncate max-w-[80px]">
                                {tag}
                            </span>
                        ))}
                        {tags.length > 3 && (
                            <span className="px-1.5 py-0.5 text-gray-400 text-[10px] font-medium">
                                +{tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                <p className="text-xs text-gray-400 line-clamp-2 mt-auto leading-relaxed">
                    {template.description || 'Sin descripción.'}
                </p>

                {/* Footer info (Author/Date) - Optional, mainly for detailed view, but good to have if space permits */}
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400">
                    <span className="truncate max-w-[100px]">{template.creator?.name ? `Por: ${template.creator.name}` : 'Sistema'}</span>
                    <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}
