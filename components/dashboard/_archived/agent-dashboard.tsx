"use client";

import React from 'react';
import {
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle,
    ShieldAlert,
    Reply,
    BrainCircuit,
    Clock
} from 'lucide-react';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    StatusBadge,
    EventState,
    cn
} from '@/components/ui/dashboard-components';

const agentEvents = [
    {
        id: '1',
        subject: 'Inquiry about Enterprise Pricing',
        intent: 'Sales Inquiry',
        priority: 'high',
        state: 'queued',
        summary: 'Customer is asking for a detailed breakdown of enterprise tier features and volume discounts.',
        sentiment: 0.8,
        time: '5m ago'
    },
    {
        id: '2',
        subject: 'Technical Support: Webhook Failure',
        intent: 'Technical Issue',
        priority: 'urgent',
        state: 'processing',
        summary: 'System detected a recurring 500 error on the customer\'s ingestion endpoint.',
        sentiment: -0.4,
        time: '12m ago'
    },
    {
        id: '3',
        subject: 'Feedback on New Dashboard UI',
        intent: 'Feedback',
        priority: 'low',
        state: 'handled',
        summary: 'User expressed positive feedback regarding the new dark mode aesthetics.',
        sentiment: 0.9,
        time: '2h ago'
    },
];

export default function AgentDashboard() {
    return (
        <div className="flex flex-col gap-6">
            {/* Search and Filter Bar */}
            <div className="flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search events, intents, or subjects..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-50 transition-all">
                        <Filter className="w-3.5 h-3.5" />
                        Filters
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-zinc-50 text-zinc-950 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-all">
                        Refresh Queue
                    </button>
                </div>
            </div>

            {/* Event List */}
            <div className="flex flex-col gap-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Subject & AI Summary</TableHead>
                            <TableHead>Intent</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sentiment</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {agentEvents.map((event) => (
                            <TableRow key={event.id} className="group">
                                <TableCell>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="font-semibold text-zinc-100">{event.subject}</span>
                                        <div className="flex items-start gap-2 p-2 rounded bg-zinc-900/50 border border-zinc-800/50">
                                            <BrainCircuit className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                            <p className="text-[11px] leading-relaxed text-zinc-400 italic">
                                                {event.summary}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-medium text-zinc-300">{event.intent}</span>
                                </TableCell>
                                <TableCell>
                                    <span className={cn(
                                        "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                                        event.priority === 'urgent' ? "text-rose-500 bg-rose-500/10" :
                                            event.priority === 'high' ? "text-amber-500 bg-amber-500/10" : "text-zinc-500 bg-zinc-500/10"
                                    )}>
                                        {event.priority}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge state={event.state as EventState} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full",
                                                    event.sentiment > 0 ? "bg-emerald-500" : "bg-rose-500"
                                                )}
                                                style={{ width: `${Math.abs(event.sentiment) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-zinc-500 font-mono">
                                            {event.sentiment > 0 ? '+' : ''}{event.sentiment.toFixed(1)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button title="Mark Handled" className="p-1.5 rounded hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-500 transition-all">
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button title="Escalate" className="p-1.5 rounded hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500 transition-all">
                                            <ShieldAlert className="w-4 h-4" />
                                        </button>
                                        <button title="Manual Reply" className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-50 transition-all">
                                            <Reply className="w-4 h-4" />
                                        </button>
                                        <button title="More" className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-50 transition-all">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-zinc-500 group-hover:hidden">{event.time}</span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
