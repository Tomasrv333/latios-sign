'use client';

import React, { useRef } from 'react';
import { EditorBlock } from '../editor/Canvas';
import { TableBlock } from '../editor/blocks/TableBlock';
import { ImageBlock } from '../editor/blocks/ImageBlock';
import dynamic from 'next/dynamic';
import ReactSignatureCanvas from 'react-signature-canvas';
import { X } from 'lucide-react';

const PdfBackground = dynamic(() => import('../editor/PdfBackground'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 flex items-center justify-center text-gray-400">Cargando documento...</div>
});

interface SigningCanvasProps {
    blocks: EditorBlock[];
    values: Record<string, string>;
    onChange: (id: string, value: string) => void;
    pdfUrl?: string | null;
}

export function SigningCanvas({ blocks, values, onChange, pdfUrl }: SigningCanvasProps) {
    return (
        <div className="flex-1 bg-gray-100 p-4 md:p-8 overflow-y-auto flex justify-center relative">
            <div
                className="bg-white shadow-lg w-full max-w-[210mm] min-h-[297mm] relative shrink-0 transition-shadow"
                style={{
                    // Removed the dot grid background. Only plain white or PDF.
                    backgroundImage: 'none',
                }}
            >
                {pdfUrl && (
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <PdfBackground pdfUrl={pdfUrl} />
                    </div>
                )}

                {blocks.map((block) => (
                    <div
                        key={block.id}
                        className="absolute flex flex-col justify-center"
                        style={{
                            left: block.x,
                            top: block.y,
                            width: block.w || 300,
                            minHeight: block.h || 40,
                            zIndex: 10
                        }}
                    >
                        {renderBlockContent(block, values[block.id] || '', (val) => onChange(block.id, val), values)}
                    </div>
                ))}
            </div>
        </div>
    );
}

function renderBlockContent(block: EditorBlock, value: string, onChange: (val: string) => void, allValues: Record<string, string>) {
    // STATIC TEXT: Render as read-only text, preserving whitespace, but performing variable substitution
    if (block.type === 'text') {
        let content = block.content || "";

        // Perform interpolation
        if (content) {
            Object.entries(allValues || {}).forEach(([key, val]) => {
                if (val) {
                    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                    content = content.replace(regex, val);
                }
            });
        }

        return (
            <div
                className="w-full h-full text-gray-900 leading-relaxed font-normal whitespace-pre-wrap"
                style={{
                    // Match the styling of the printed document
                    fontSize: '1rem',
                }}
            >
                {content}
            </div>
        );
    }

    // INPUTS: Interactive fields for the signer
    if (block.type === 'date') {
        return (
            <input
                type="date"
                className="w-full h-full bg-blue-50/30 hover:bg-blue-50/50 border-b border-gray-300 focus:border-brand-500 focus:bg-white focus:ring-0 px-2 text-gray-900 transition-colors"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    if (block.type === 'signature') {
        return <SignatureInput value={value} onChange={onChange} />;
    }

    if (block.type === 'table') {
        return <TableBlock content={block.content} onChange={() => { }} readOnly />;
    }

    if (block.type === 'image') {
        return <ImageBlock content={block.content} onChange={() => { }} readOnly style={block.style} />;
    }

    return null;
}

function SignatureInput({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const padRef = useRef<ReactSignatureCanvas>(null);

    // If we have a value, show the image + clear button
    if (value) {
        return (
            <div className="relative w-full h-24 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} alt="Firma" className="w-full h-full object-contain" />
                <button
                    onClick={() => onChange('')}
                    className="absolute top-1 right-1 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Borrar firma"
                >
                    <X size={16} />
                </button>
            </div>
        )
    }

    return (
        <div className="w-full h-24 bg-gray-50 relative cursor-crosshair">
            <ReactSignatureCanvas
                ref={padRef}
                canvasProps={{ className: 'w-full h-full' }}
                clearOnResize={false}
                onEnd={() => {
                    if (padRef.current) {
                        // Check if empty? trim()??
                        if (padRef.current.isEmpty()) {
                            onChange('');
                        } else {
                            onChange(padRef.current.toDataURL());
                        }
                    }
                }}
            />
            <div className="absolute bottom-1 right-2 text-[10px] text-gray-400 pointer-events-none">
                Firma aquí
            </div>
        </div>
    );
}
