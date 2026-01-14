"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from './dashboard-components';

interface DropdownProps {
    children: React.ReactNode;
}

interface DropdownTriggerProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

interface DropdownContentProps {
    children: React.ReactNode;
    align?: 'left' | 'right';
    className?: string;
}

interface DropdownItemProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    destructive?: boolean;
}

interface DropdownContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    triggerRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownContext = React.createContext<DropdownContextType | null>(null);

export function Dropdown({ children }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);

    return (
        <DropdownContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
            <div className="relative inline-block text-left">
                {children}
            </div>
        </DropdownContext.Provider>
    );
}

export function DropdownTrigger({ children, onClick, className }: DropdownTriggerProps) {
    const context = React.useContext(DropdownContext);
    if (!context) throw new Error("DropdownTrigger must be used within a Dropdown");

    return (
        <div
            ref={context.triggerRef}
            onClick={(e) => {
                e.stopPropagation();
                context.setIsOpen(!context.isOpen);
                onClick?.();
            }}
            className={cn("cursor-pointer", className)}
        >
            {children}
        </div>
    );
}

export function DropdownContent({ children, align = 'right', className }: DropdownContentProps) {
    const context = React.useContext(DropdownContext);
    if (!context) throw new Error("DropdownContent must be used within a Dropdown");

    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const updatePosition = useCallback(() => {
        if (context.isOpen && context.triggerRef.current) {
            const rect = context.triggerRef.current.getBoundingClientRect();

            // Use fixed positioning relative to viewport
            let top = rect.bottom + 8; // 8px gap
            let left = align === 'right'
                ? rect.right - 224 // 224px is w-56 (14rem)
                : rect.left;

            setPosition({ top, left });
        }
    }, [context.isOpen, context.triggerRef, align]);

    // useLayoutEffect ensures position is calculated before paint
    React.useLayoutEffect(() => {
        updatePosition();
        // Update on resize and scroll (capturing scroll from any parent)
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [updatePosition]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                contentRef.current &&
                !contentRef.current.contains(event.target as Node) &&
                context?.triggerRef.current &&
                !context.triggerRef.current.contains(event.target as Node)
            ) {
                context?.setIsOpen(false);
            }
        }

        if (context.isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [context.isOpen, context]);

    if (!context.isOpen) return null;

    // Use a portal to render outside the overflow:hidden container
    // We check for document body to ensure we are on client
    if (typeof document === 'undefined') return null;

    // Don't render until we have a position to avoid flashing at 0,0
    if (!position) return null;

    return createPortal(
        <div
            ref={contentRef}
            style={{
                top: position.top,
                left: position.left,
                position: 'fixed',
            }}
            className={cn(
                "z-[9999] w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100",
                className
            )}
        >
            <div className="py-1">
                {children}
            </div>
        </div>,
        document.body
    );
}

export function DropdownItem({ children, onClick, className, destructive }: DropdownItemProps) {
    const context = React.useContext(DropdownContext);
    if (!context) throw new Error("DropdownItem must be used within a Dropdown");

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
                context.setIsOpen(false);
            }}
            className={cn(
                "w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2",
                destructive
                    ? "text-rose-500 hover:bg-rose-500/10"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50",
                className
            )}
        >
            {children}
        </button>
    );
}
