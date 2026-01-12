"use client";

import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { GSAPButton } from '@/components/ui/gsap-button';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
    isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = 'primary',
    isLoading = false
}) => {
    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={title}>
            <div className="p-6 space-y-6">
                <p className="text-zinc-400 text-sm leading-relaxed">
                    {description}
                </p>
                <div className="flex justify-end gap-3">
                    <GSAPButton
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm"
                    >
                        {cancelText}
                    </GSAPButton>
                    <GSAPButton
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm"
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </GSAPButton>
                </div>
            </div>
        </Dialog>
    );
};
