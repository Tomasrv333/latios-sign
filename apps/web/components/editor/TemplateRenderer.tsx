import React from 'react';
import { EditorBlock } from './Canvas';

interface TemplateRendererProps {
    blocks: EditorBlock[];
}

export function TemplateRenderer({ blocks }: TemplateRendererProps) {
    return (
        <div className="bg-white shadow-lg w-[210mm] min-h-[297mm] p-8 flex flex-col mx-auto">
            {blocks.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-gray-400 italic">
                    Documento vacío
                </div>
            )}
            <div className="flex-1 space-y-4">
                {blocks.map((block) => (
                    <div key={block.id} className="relative">
                        {block.type === 'text' && (
                            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {block.content || 'Texto de ejemplo...'}
                            </div>
                        )}
                        {block.type === 'date' && (
                            <div className="text-gray-800">
                                <span className="font-medium">Fecha:</span> ______________
                            </div>
                        )}
                        {block.type === 'signature' && (
                            <div className="mt-4 mb-8">
                                <div className="h-24 border-b border-gray-400 flex items-end justify-center pb-2 text-gray-400">
                                    Firma aquí
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
