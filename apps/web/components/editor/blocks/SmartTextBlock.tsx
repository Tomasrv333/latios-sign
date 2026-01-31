import React, { useRef, useEffect, useState } from 'react';

interface SmartTextBlockProps {
    content: string;
    style: React.CSSProperties;
    onChange: (valid: string) => void;
    isEditing: boolean;
    onStartEditing: () => void;
    onEndEditing: () => void; // Called normally via onBlur
}

export function SmartTextBlock({ content, style, onChange, isEditing, onStartEditing, onEndEditing }: SmartTextBlockProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize logic shared with previous implementation
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            textareaRef.current.focus();
        }
    }, [isEditing, content]);

    // Token parsing for highlighting
    const renderHighlightedContent = () => {
        if (!content) return <span className="text-gray-400 italic">Escribe aquí...</span>;

        const parts = content.split(/(\{\{[^}]+\}\})/g);
        return parts.map((part, index) => {
            if (part.startsWith('{{') && part.endsWith('}}')) {
                // Variable Token
                return (
                    <span key={index} className="inline-block bg-purple-100 text-purple-700 font-medium px-1.5 py-0.5 rounded mx-0.5 border border-purple-200 text-[0.9em] align-middle shadow-sm">
                        {part}
                    </span>
                );
            }
            // Regular text - preserve newlines
            return <span key={index} className="whitespace-pre-wrap">{part}</span>;
        });
    };

    if (isEditing) {
        return (
            <textarea
                ref={textareaRef}
                className="bg-transparent border-none outline-none resize-none overflow-hidden text-black leading-relaxed font-normal placeholder:text-gray-400 min-w-[60px]"
                style={{
                    ...style,
                    width: '100%',
                    height: 'auto',
                    minHeight: style.height,
                    whiteSpace: 'pre-wrap' // Ensure wrapping matches View mode
                }}
                rows={Math.max(1, (content?.split('\n').length || 1))}
                placeholder="Escribe aquí..."
                value={content || ''}
                onChange={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                    onChange(e.target.value);
                }}
                onBlur={onEndEditing}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        const textarea = e.currentTarget;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const value = textarea.value;
                        const newValue = value.substring(0, start) + '\t' + value.substring(end);
                        onChange(newValue);
                        setTimeout(() => {
                            textarea.selectionStart = textarea.selectionEnd = start + 1;
                        }, 0);
                    }
                }}
            />
        );
    }

    // View Mode
    return (
        <div
            className="w-full h-full cursor-text"
            style={{
                ...style,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                minWidth: '60px',
                minHeight: '20px',
                // We need to ensure text styles match the textarea exactly
                fontFamily: style.fontFamily || 'Inter',
                fontSize: style.fontSize || '16px',
                fontWeight: style.fontWeight || 'normal',
                fontStyle: style.fontStyle || 'normal',
                textDecoration: style.textDecoration || 'none',
                textAlign: style.textAlign as any || 'left',
                color: style.color || '#000000',
                lineHeight: '1.625', // Match "leading-relaxed" (1.625) from tailwind
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onStartEditing();
            }}
        >
            {renderHighlightedContent()}
        </div>
    );
}
