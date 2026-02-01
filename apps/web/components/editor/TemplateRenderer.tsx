import React from 'react';
import { EditorBlock } from './Canvas';
import { TableBlock } from './blocks/TableBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { FigureBlock } from './blocks/FigureBlock';
import dynamic from 'next/dynamic';

// Dynamic import for PDF BG in Renderer if needed, but usually passed via props or separate layer.
// Simplified here.

interface TemplateRendererProps {
    blocks: EditorBlock[];
    variables?: Record<string, string>;
}

export function TemplateRenderer({ blocks, variables }: TemplateRendererProps) {
    // Variable substitution logic
    const getContent = (content: string) => {
        if (!variables) return content;
        let text = content;
        Object.entries(variables).forEach(([key, value]) => {
            // Replace {{key}} with value (case insensitive or exact depending on need, usually exact for now)
            // Using a simple split/join or regex
            const regex = new RegExp(`{{${key}}}`, 'g');
            text = text.replace(regex, value || `{{${key}}}`);
        });
        return text;
    };

    return (
        <div
            className="bg-white shadow-lg w-[210mm] min-h-[297mm] mx-auto relative print:shadow-none print:w-full print:mx-0 transition-all duration-300"
        // Ensure we use the same font/base styles as the editor if needed
        >
            {blocks.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 italic pointer-events-none">
                    Documento vacío
                </div>
            )}

            {blocks.map((block) => (
                <div
                    key={block.id}
                    className="absolute"
                    style={{
                        left: block.x ?? 0,
                        top: block.y ?? 0,
                        width: block.w || 300,
                        height: block.h || (block.type === 'figure' ? 100 : (block.type === 'image' ? 150 : 'auto')),
                        zIndex: block.zIndex ?? 1,
                    }}
                >
                    {block.type === 'text' && (
                        <div
                            className="text-gray-900 leading-relaxed whitespace-pre-wrap font-normal"
                            style={block.style}
                        >
                            {getContent(block.content || '')}
                        </div>
                    )}

                    {block.type === 'table' && (
                        <TableBlock content={block.content || ''} onChange={() => { }} readOnly />
                    )}

                    {block.type === 'image' && (
                        <div className="w-full">
                            <ImageBlock content={block.content || ''} onChange={() => { }} readOnly style={block.style} />
                        </div>
                    )}

                    {block.type === 'separator' && (
                        <div className="py-2 w-full">
                            <hr className="border-t-2 border-gray-300" style={block.style} />
                        </div>
                    )}

                    {block.type === 'figure' && (
                        <div className="w-full h-full">
                            <FigureBlock
                                content={block.content || 'square'}
                                onChange={() => { }}
                                style={block.style}
                            />
                        </div>
                    )}

                    {block.type === 'date' && (
                        <div className="text-gray-800 bg-gray-50/30 p-1 border-b border-gray-300 inline-block w-full" style={block.style}>
                            <span className="text-xs text-gray-500 block">Fecha</span>
                            {/* In actual PDF generation this would be dynamically filled */}
                            DD / MM / AAAA
                        </div>
                    )}
                    {block.type === 'signature' && (
                        <div className="h-24 border-b border-gray-800 flex items-end justify-center pb-2 text-gray-400 bg-gray-50/10" style={block.style}>
                            Firma del Responsable
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
