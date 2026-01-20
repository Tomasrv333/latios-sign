import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
    const base = "rounded-full font-medium transition-all duration-200 flex items-center justify-center";

    const variants = {
        primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm hover:shadow-lifted",
        secondary: "border border-brand-500 text-brand-500 hover:bg-brand-50",
        ghost: "text-gray-500 hover:text-brand-500 hover:bg-gray-50"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-8 py-3 text-lg"
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        />
    );
}
