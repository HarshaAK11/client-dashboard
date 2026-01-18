"use client";

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer
} from 'recharts';
import {
    User,
    MoreHorizontal,
    Plus
} from 'lucide-react';
import { cn, StatusBadge, EventState } from '@/components/ui/dashboard-components';

// --- Recent Escalations Component ---

interface EscalationItem {
    id: string;
    name: string;
    subject: string;
    status: EventState;
    avatar?: string;
    time?: string;
    priority?: string;
    email?: string;
}

export function RecentEscalations({ items, variant = 'default' }: { items: EscalationItem[], variant?: 'default' | 'chat' }) {
    if (variant === 'chat') {
        return (
            <div className="card-gradient glass p-3 rounded-2xl border border-zinc-800/50 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                    <h3 className="text-sm font-bold tracking-tight text-zinc-50">Recent Chats</h3>
                </div>
                <div className="flex flex-col gap-1">
                    {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/50 transition-all group cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                                {item.avatar ? (
                                    <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-zinc-500" />
                                )}
                            </div>
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-zinc-50 group-hover:text-emerald-400 transition-colors truncate">{item.name}</span>
                                    <span className="text-[10px] text-zinc-500 whitespace-nowrap ml-2">{item.time || '12:37 PM'}</span>
                                </div>
                                <span className="text-xs text-zinc-500 line-clamp-1 truncate pr-4">{item.subject}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="card-gradient glass p-3 rounded-2xl border border-zinc-800/50 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold tracking-tight text-zinc-50">Recent Escalations</h3>
            </div>
            <div className="flex flex-col gap-1">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-zinc-900/50 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                                {item.avatar ? (
                                    <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-zinc-500" />
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm text-zinc-50 group-hover:text-emerald-400 transition-colors truncate">{item.subject}</span>
                            </div>
                        </div>
                        <div className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ml-2",
                            item.priority === 'critical' ? "text-rose-500 border-rose-500/20 bg-rose-500/5" :
                                item.priority === 'high' ? "text-amber-500 border-amber-500/20 bg-amber-500/5" :
                                    "text-blue-500 border-blue-500/20 bg-blue-500/5"
                        )}>
                            {item.priority}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- State Gauge Component ---

interface StateData {
    name: string;
    value: number;
    color: string;
    isHatched?: boolean;
}

export function StateGauge({ title, data, totalValue, label }: { title: string, data: StateData[], totalValue: number, label: string }) {
    // Recharts Pie for semi-circle gauge
    const gaugeData = [
        ...data,
        { name: 'empty', value: data.reduce((acc, curr) => acc + curr.value, 0), color: 'transparent' }
    ];

    return (
        <div className="card-gradient glass p-3 rounded-2xl border border-zinc-800/50 flex flex-col gap-3">
            <h3 className="text-sm font-bold tracking-tight text-zinc-50">{title}</h3>
            <div className="h-[120px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="90%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    style={entry.isHatched ? { fill: 'url(#hatch)' } : {}}
                                />
                            ))}
                        </Pie>
                        <defs>
                            <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                <rect width="4" height="8" fill="#3f3f46" />
                            </pattern>
                        </defs>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 pointer-events-none">
                    <span className="text-3xl font-bold text-zinc-50">{totalValue}%</span>
                    <span className="text-[10px] text-zinc-500 font-medium">{label}</span>
                </div>
            </div>
            <div className="flex justify-center gap-6 mt-2">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={item.isHatched ? { background: 'repeating-linear-gradient(45deg, #3f3f46, #3f3f46 2px, #27272a 2px, #27272a 4px)' } : { backgroundColor: item.color }}
                        />
                        <span className="text-xs text-zinc-400">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
