"use client";

import React, { useRef } from 'react';
import { gsapAnimations } from '@/lib/gsap-animations';
import { cn } from '@/components/ui/dashboard-components';

interface GSAPButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export const GSAPButton: React.FC<GSAPButtonProps> = ({
    children,
    className,
    variant = 'primary',
    ...props
}) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleMouseEnter = () => {
        if (buttonRef.current) {
            gsapAnimations.buttonHover(buttonRef.current);
        }
    };

    const handleMouseLeave = () => {
        if (buttonRef.current) {
            gsapAnimations.buttonUnhover(buttonRef.current);
        }
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (buttonRef.current) {
            gsapAnimations.buttonClick(buttonRef.current);
        }
        if (props.onClick) {
            props.onClick(e);
        }
    };

    const variantClasses = {
        primary: "bg-emerald-500 hover:bg-emerald-600 text-black",
        secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-50",
        ghost: "hover:bg-zinc-800 text-zinc-500 hover:text-zinc-50",
        danger: "bg-rose-500 hover:bg-rose-600 text-white"
    };

    return (
        <button
            ref={buttonRef}
            className={cn(
                "px-4 py-2 rounded-xl font-bold transition-colors flex items-center justify-center gap-2",
                variantClasses[variant],
                className
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    );
};
