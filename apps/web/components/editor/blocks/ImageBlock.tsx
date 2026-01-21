import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@latios/ui';

interface ImageBlockProps {
    content?: string; // URL of the image
    onChange: (content: string) => void;
    readOnly?: boolean;
    style?: React.CSSProperties;
}

export function ImageBlock({ content, onChange, readOnly, style }: ImageBlockProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // In a real app, upload to S3/Cloudinary.
            // For MVP, since we don't have an upload endpoint yet, we'll use Base64.
            // WARNING: Large base64 strings can slow down the app/DB.
            // Ideally, we should implement an upload endpoint. 
            // I'll stick to Base64 for now as it doesn't require backend changes immediately, 
            // but I'll add a check for size.

            if (file.size > 500 * 1024) { // 500KB limit for Base64
                alert('La imagen es muy pesada para esta versión (Máx 500KB).');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                onChange(base64);
                setUploading(false);
            };
            reader.readAsDataURL(file);

        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    };

    if (!content) {
        if (readOnly) return null;
        return (
            <div
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => fileInputRef.current?.click()}
            >
                <ImageIcon size={32} className="mb-2 opacity-50" />
                <span className="text-sm font-medium">Subir Imagen</span>
                <span className="text-xs text-gray-400 mt-1">Máx 500KB</span>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleUpload}
                />
            </div>
        );
    }

    return (
        <div className="relative group w-full flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={content}
                alt="Uploaded content"
                className="max-w-full h-auto rounded-md shadow-sm object-contain max-h-[500px]"
                style={style}
            />

            {!readOnly && (
                <div className="absolute top-2 right-2 bg-white/90 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 p-1">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600"
                        title="Cambiar imagen"
                    >
                        <Upload size={14} />
                    </button>
                    <button
                        onClick={() => onChange('')}
                        className="p-1 hover:bg-red-50 rounded text-red-500"
                        title="Eliminar imagen"
                    >
                        <X size={14} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                    />
                </div>
            )}
        </div>
    );
}
