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
    icon: Icon
}: {
    title: string;
    value: string | number;
    trend?: string;
    trendType?: 'positive' | 'negative' | 'neutral';
    icon?: React.ElementType;
}) {
    return (
        <div className="card-gradient glass p-6 rounded-xl border border-zinc-800/50 flex flex-col gap-4 transition-all hover:border-zinc-700/50">
            <div className="flex justify-between items-start">
                <span className="text-zinc-400 text-sm font-medium">{title}</span>
                {Icon && <Icon className="w-5 h-5 text-zinc-500" />}
            </div>
            <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold tracking-tight">{value}</span>
                {trend && (
                    <span className={cn(
                        'text-xs font-medium px-1.5 py-0.5 rounded',
                        trendType === 'positive' && 'text-emerald-500 bg-emerald-500/10',
                        trendType === 'negative' && 'text-rose-500 bg-rose-500/10',
                        trendType === 'neutral' && 'text-zinc-400 bg-zinc-400/10'
                    )}>
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
}

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

