"use client";

import React, { useState } from 'react';
import { Mail, User, Shield, Building2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { GSAPButton } from '@/components/ui/gsap-button';
import { cn } from '@/components/ui/dashboard-components';
import { useDepartments } from '@/hooks/useDepartments';
import { useToast } from '@/components/ui/toast';

interface InviteMemberDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'agent' | 'manager'>('agent');
    const [departmentId, setDepartmentId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: deptData } = useDepartments();
    const { showToast } = useToast();
    const departments = deptData?.data || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !fullName) {
            showToast('Email and Full Name are required', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/users/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    full_name: fullName,
                    role,
                    department_id: departmentId || null
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send invite');
            }

            showToast('Invite sent successfully', 'success');
            onSuccess();
            handleClose();
        } catch (error: any) {
            console.error('Invite failed:', error);
            showToast(error.message || 'Failed to send invite', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setFullName('');
        setRole('agent');
        setDepartmentId('');
        onClose();
    };

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} title="Invite Team Member">
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                    </div>
                </div>

                {/* Full Name */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                    </div>
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Role <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setRole('agent')}
                            className={cn(
                                "flex items-center gap-2 p-3 rounded-xl border transition-all",
                                role === 'agent'
                                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500"
                                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                            )}
                        >
                            <Shield size={16} />
                            <span className="text-sm font-medium">Agent</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('manager')}
                            className={cn(
                                "flex items-center gap-2 p-3 rounded-xl border transition-all",
                                role === 'manager'
                                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500"
                                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                            )}
                        >
                            <Shield size={16} />
                            <span className="text-sm font-medium">Manager</span>
                        </button>
                    </div>
                </div>

                {/* Department */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Department <span className="text-zinc-500 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <select
                            value={departmentId}
                            onChange={(e) => setDepartmentId(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">No Department</option>
                            {departments.map((dept: any) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <GSAPButton
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm"
                    >
                        Cancel
                    </GSAPButton>
                    <GSAPButton
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm"
                    >
                        {isSubmitting ? 'Sending Invite...' : 'Send Invite'}
                    </GSAPButton>
                </div>
            </form>
        </Dialog>
    );
};
