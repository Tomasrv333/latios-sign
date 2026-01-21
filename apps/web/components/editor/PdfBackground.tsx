'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF Worker
// Ensure this runs only in browser environment
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfBackgroundProps {
    pdfUrl: string;
}

export default function PdfBackground({ pdfUrl }: PdfBackgroundProps) {
    const [numPages, setNumPages] = useState<number>();

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="p-4 text-gray-400">Cargando PDF...</div>}
            error={<div className="p-4 text-red-500">Error al cargar PDF</div>}
            className="w-full h-full"
        >
            <Page
                pageNumber={1}
                width={794} // A4 width at 96 DPI approx (210mm)
                renderTextLayer={false}
                renderAnnotationLayer={false}
            />
        </Document>
    );
}
