import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    actions?: React.ReactNode;
}

export function Card({ children, className = '', title, actions }: CardProps) {
    return (
        <div className={`bg-bg-surface rounded-2xl shadow-soft p-6 ${className}`}>
            {(title || actions) && (
                <div className="flex justify-between items-center mb-4">
                    {title && <h3 className="text-gray-900 font-semibold text-lg">{title}</h3>}
                    {actions && <div>{actions}</div>}
                </div>
            )}
            {children}
        </div>
    );
}
