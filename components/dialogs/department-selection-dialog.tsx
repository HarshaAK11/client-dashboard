"use client";

import React, { useState } from 'react';
import { Search, Building2, Check, Loader2, ArrowRight } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/components/ui/dashboard-components';
import { useDepartments } from '@/hooks/useDepartments';

interface DepartmentSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (departmentId: string) => void;
    currentDepartmentId?: string;
    title?: string;
    allowCurrentSelection?: boolean;
}

export const DepartmentSelectionDialog: React.FC<DepartmentSelectionDialogProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentDepartmentId,
    title = "Escalate to Team",
    allowCurrentSelection = false
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: rawData, isLoading } = useDepartments();
    const departments = rawData?.data || [];

    const filteredDepartments = departments.filter((dept: any) =>
        dept.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={title}>
            <div className="p-4 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search departments..."
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Department List */}
                <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-3">
                            <Loader2 size={24} className="animate-spin" />
                            <span className="text-sm">Loading departments...</span>
                        </div>
                    ) : filteredDepartments.length > 0 ? (
                        filteredDepartments.map((dept: any) => {
                            const isCurrent = currentDepartmentId === dept.id || currentDepartmentId === dept.name;
                            return (
                                <button
                                    key={dept.id}
                                    onClick={() => {
                                        if (!isCurrent || allowCurrentSelection) {
                                            onSelect(dept.id);
                                            onClose();
                                        }
                                    }}
                                    disabled={isCurrent && !allowCurrentSelection}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
                                        isCurrent && !allowCurrentSelection
                                            ? "bg-zinc-900/50 border border-zinc-800/50 opacity-60 cursor-not-allowed"
                                            : "hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors",
                                        isCurrent ? "bg-zinc-800 text-zinc-500" : "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black"
                                    )}>
                                        <Building2 size={20} />
                                    </div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-sm font-medium truncate",
                                                isCurrent ? "text-zinc-500" : "text-zinc-200"
                                            )}>{dept.name}</span>
                                            {isCurrent && (
                                                <div className="flex items-center gap-1.5 text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                    <ArrowRight size={10} />
                                                    Current
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-zinc-500 truncate">
                                            {isCurrent ? "Current Department" : "Select this team"}
                                        </div>
                                    </div>
                                    {isCurrent ? (
                                        <Check size={18} className="text-zinc-700 shrink-0" />
                                    ) : (
                                        <ArrowRight size={18} className="text-zinc-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" />
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 text-zinc-500">
                            <p className="text-sm">No departments found matching "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
};
