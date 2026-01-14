"use client";

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/components/ui/dashboard-components';
import { GSAPButton } from '@/components/ui/gsap-button';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info' | 'primary';
    isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = 'danger',
    isLoading = false
}) => {
    const iconStyles = {
        danger: "text-rose-500 bg-rose-500/10",
        warning: "text-amber-500 bg-amber-500/10",
        info: "text-emerald-500 bg-emerald-500/10",
        primary: "text-blue-500 bg-blue-500/10"
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={title}>
            <div className="p-6 space-y-6">
                <div className="flex gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                        iconStyles[variant]
                    )}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <GSAPButton
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm"
                    >
                        {cancelLabel}
                    </GSAPButton>
                    <GSAPButton
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-6 py-2 text-sm"
                    >
                        {isLoading && <Loader2 size={16} className="animate-spin mr-2" />}
                        {confirmLabel}
                    </GSAPButton>
                </div>
            </div>
        </Dialog>
    );
};
