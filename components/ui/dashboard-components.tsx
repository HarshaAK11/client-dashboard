import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Status Badge Component
export type EventState = 'queued' | 'processing' | 'handled' | 'needs_attention' | 'escalated' | 'error';

export function StatusBadge({ state }: { state: EventState }) {
    const styles: Record<EventState, string> = {
        queued: 'bg-zinc-800 text-zinc-400 border-zinc-700',
        processing: 'bg-slate-800 text-slate-300 border-slate-700 animate-pulse',
        handled: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 glow-emerald',
        needs_attention: 'bg-amber-500/10 text-amber-500 border-amber-500/20 glow-amber',
        escalated: 'bg-rose-500/10 text-rose-500 border-rose-500/20 glow-rose',
        error: 'bg-rose-900/20 text-rose-400 border-rose-800',
    };

    return (
        <span className={cn(
            'px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider',
            styles[state]
        )}>
            {state.replace('_', ' ')}
        </span>
    );
}

// Metric Card Component
export function MetricCard({
    title,
    value,
    trend,
    trendType = 'neutral',
    variant = 'default'
}: {
    title: string;
    value: string | number;
    trend?: string;
    trendType?: 'positive' | 'negative' | 'neutral';
    variant?: 'default' | 'primary';
}) {
    if (variant === 'primary') {
        return (
            <div className="bg-[#064e3b] p-4 rounded-2xl border border-emerald-800/20 shadow-2xl flex flex-col gap-3 transition-all relative overflow-hidden group">
                <div className="flex justify-between items-start relative z-10">
                    <span className="text-white/80 text-sm font-medium tracking-tight">{title}</span>
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#064e3b]">
                        <ArrowUpRight size={16} />
                    </div>
                </div>
                <div className="flex flex-col gap-1 relative z-10">
                    <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
                    {trend && (
                        <div className="flex items-center gap-2">
                            <div className="bg-emerald-400/20 px-1.5 py-0.5 rounded-lg flex items-center gap-1 border border-emerald-400/20">
                                <span className="text-[10px] font-bold text-emerald-400">5</span>
                                <TrendingUp size={10} className="text-emerald-400" />
                            </div>
                            <span className="text-[10px] font-medium text-emerald-400/80">{trend}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50 flex flex-col gap-3 transition-all hover:border-zinc-700/50 shadow-xl group">
            <div className="flex justify-between items-start">
                <span className="text-zinc-400 text-sm font-medium tracking-tight">{title}</span>
                <div className="w-7 h-7 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:border-zinc-700 transition-all">
                    <ArrowUpRight size={16} />
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold tracking-tight text-zinc-50">{value}</span>
                {trend && (
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-500/10 px-1.5 py-0.5 rounded-lg flex items-center gap-1 border border-emerald-500/20">
                            <span className="text-[10px] font-bold text-emerald-500">6</span>
                            <TrendingUp size={10} className="text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-medium text-zinc-500">{trend}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

import { ArrowUpRight, TrendingUp } from 'lucide-react';

// Data Table Components (Simplified)
export function Table({ children, className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
    return (
        <div className={cn('w-full overflow-x-auto rounded-xl border border-zinc-800/50 glass', className)}>
            <table className="w-full text-left border-collapse" {...props}>
                {children}
            </table>
        </div>
    );
}

export function TableHeader({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
    return <thead className={cn("bg-zinc-900/50 border-b border-zinc-800/50", className)} {...props}>{children}</thead>;
}

export function TableBody({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
    return <tbody className={cn("divide-y divide-zinc-800/50", className)} {...props}>{children}</tbody>;
}

export function TableRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
    return <tr className={cn('hover:bg-zinc-800/20 transition-colors', className)} {...props}>{children}</tr>;
}

export function TableHead({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
    return <th className={cn("px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider", className)} {...props}>{children}</th>;
}

export function TableCell({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
    return <td className={cn('px-6 py-4 text-sm text-zinc-300', className)} {...props}>{children}</td>;
}

