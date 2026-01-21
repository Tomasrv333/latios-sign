import React from 'react';
import { EditorBlock } from './Canvas';
import { TableBlock } from './blocks/TableBlock';
import { ImageBlock } from './blocks/ImageBlock';
import dynamic from 'next/dynamic';

// Dynamic import for PDF BG in Renderer if needed, but usually passed via props or separate layer.
// Simplified here.

interface TemplateRendererProps {
    blocks: EditorBlock[];
}

export function TemplateRenderer({ blocks }: TemplateRendererProps) {
    return (
        <div
            className="bg-white shadow-lg w-[210mm] min-h-[297mm] mx-auto relative print:shadow-none print:w-full print:mx-0"
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
                        // height is auto primarily, unless specified (future)
                    }}
                >
                    {block.type === 'text' && (
                        <div className="text-gray-900 leading-relaxed whitespace-pre-wrap font-normal">
                            {block.content || ''}
                        </div>
                    )}

                    {block.type === 'table' && (
                        <TableBlock content={block.content} onChange={() => { }} readOnly />
                    )}

                    {block.type === 'image' && (
                        <div className="w-full">
                            <ImageBlock content={block.content} onChange={() => { }} readOnly />
                        </div>
                    )}

                    {block.type === 'separator' && (
                        <div className="py-2 w-full">
                            <hr className="border-t-2 border-gray-300" />
                        </div>
                    )}

                    {block.type === 'date' && (
                        <div className="text-gray-800 bg-gray-50/30 p-1 border-b border-gray-300 inline-block w-full">
                            <span className="text-xs text-gray-500 block">Fecha</span>
                            {/* In actual PDF generation this would be dynamically filled */}
                            DD / MM / AAAA
                        </div>
                    )}
                    {block.type === 'signature' && (
                        <div className="h-24 border-b border-gray-800 flex items-end justify-center pb-2 text-gray-400 bg-gray-50/10">
                            Firma del Responsable
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
