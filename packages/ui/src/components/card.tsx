import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    actions?: React.ReactNode;
}

export function Card({ children, className = '', title, actions }: CardProps) {
    return (
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-200 ${className}`}>
            {(title || actions) && (
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                    {title && <h3 className="text-gray-900 font-bold text-base">{title}</h3>}
                    {actions && <div>{actions}</div>}
                </div>
            )}
            <div className={title || actions ? 'p-6' : 'p-6 h-full'}>
                {children}
            </div>
        </div>
    );
}
