"use client";

import React, { useState } from 'react';
import { Search, User, Check, Loader2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/components/ui/dashboard-components';
import { useUsers } from '@/hooks/useUsers';

interface UserSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (userId: string) => void;
    currentAssigneeId?: string;
    title?: string;
}

export const UserSelectionDialog: React.FC<UserSelectionDialogProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentAssigneeId,
    title = "Select User"
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: rawData, isLoading } = useUsers();
    const users = rawData?.data || [];

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={title}>
            <div className="p-4 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email or department..."
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* User List */}
                <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-3">
                            <Loader2 size={24} className="animate-spin" />
                            <span className="text-sm">Loading team members...</span>
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => {
                                    onSelect(user.id);
                                    onClose();
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all group hover:bg-zinc-900",
                                    currentAssigneeId === user.id && "bg-emerald-500/5 border border-emerald-500/20"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                                    currentAssigneeId === user.id ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700"
                                )}>
                                    {user.full_name?.charAt(0) || '?'}
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-zinc-200 truncate">{user.full_name}</span>
                                        {currentAssigneeId === user.id && (
                                            <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-zinc-500 truncate">{user.department_name} • {user.email}</div>
                                </div>
                                {currentAssigneeId === user.id ? (
                                    <Check size={18} className="text-emerald-500 shrink-0" />
                                ) : (
                                    <User size={18} className="text-zinc-600 group-hover:text-zinc-400 shrink-0" />
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-12 text-zinc-500">
                            <p className="text-sm">No users found matching "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
};
