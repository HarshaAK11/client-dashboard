"use client";

import React from 'react';
import { Shield, Check, UserCog } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/components/ui/dashboard-components';

interface RoleSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (role: string) => void;
    currentRole?: string;
    title?: string;
}

const ROLES = [
    { id: 'admin', label: 'Admin', description: 'Full access to all resources and settings' },
    { id: 'manager', label: 'Manager', description: 'Can manage department escalations and agents' },
    { id: 'agent', label: 'Agent', description: 'Can handle assigned tickets and view queue' },
];

export const RoleSelectionDialog: React.FC<RoleSelectionDialogProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentRole,
    title = "Select Role"
}) => {
    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={title}>
            <div className="p-4 space-y-2">
                {ROLES.map((role) => {
                    const isCurrent = currentRole === role.id;
                    return (
                        <button
                            key={role.id}
                            onClick={() => {
                                onSelect(role.id);
                                onClose();
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-xl transition-all group hover:bg-zinc-900",
                                isCurrent && "bg-emerald-500/5 border border-emerald-500/20"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors",
                                isCurrent ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700 group-hover:text-zinc-300"
                            )}>
                                {role.id === 'admin' ? <Shield size={20} /> : <UserCog size={20} />}
                            </div>
                            <div className="flex-1 text-left">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-zinc-200">{role.label}</span>
                                    {isCurrent && (
                                        <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                            Current
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500">{role.description}</p>
                            </div>
                            {isCurrent && (
                                <Check size={18} className="text-emerald-500 shrink-0" />
                            )}
                        </button>
                    );
                })}
            </div>
        </Dialog>
    );
};
