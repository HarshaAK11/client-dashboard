"use client";

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/components/ui/dashboard-components';
import { gsapAnimations } from '@/lib/gsap-animations';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
    isOpen,
    onClose,
    title,
    children,
    className
}) => {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            document.body.style.overflow = 'hidden';
        } else if (shouldRender) {
            // Animate out
            if (overlayRef.current && contentRef.current) {
                gsapAnimations.dialogOut(overlayRef.current, contentRef.current, () => {
                    setShouldRender(false);
                    document.body.style.overflow = 'unset';
                });
            } else {
                setShouldRender(false);
                document.body.style.overflow = 'unset';
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (shouldRender && isOpen && overlayRef.current && contentRef.current) {
            gsapAnimations.dialogIn(overlayRef.current, contentRef.current);
        }
    }, [shouldRender, isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog Content */}
            <div
                ref={contentRef}
                className={cn(
                    "relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col",
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h3 className="text-lg font-bold text-zinc-50">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-900 rounded-xl transition-colors text-zinc-500 hover:text-zinc-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};
