"use client";

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import {
    Users,
    ShieldAlert,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import {
    MetricCard,
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

const workloadData = [
    { name: 'Sarah J.', assigned: 12, capacity: 20 },
    { name: 'Mike R.', assigned: 18, capacity: 20 },
    { name: 'Elena D.', assigned: 8, capacity: 20 },
    { name: 'David K.', assigned: 15, capacity: 20 },
];

const escalationQueue = [
    { id: '1', subject: 'Urgent: Billing Discrepancy', priority: 'urgent', state: 'escalated', time: '12m ago' },
    { id: '2', subject: 'Technical Issue: API Access', priority: 'high', state: 'needs_attention', time: '45m ago' },
    { id: '3', subject: 'Refund Request #4920', priority: 'medium', state: 'needs_attention', time: '1h ago' },
];

export default function ManagerDashboard() {
    return (
        <div className="flex flex-col gap-8">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Active Escalations"
                    value="14"
                    trend="+3"
                    trendType="negative"
                    icon={AlertCircle}
                />
                <MetricCard
                    title="Avg. SLA Compliance"
                    value="94.2%"
                    trend="+0.8%"
                    trendType="positive"
                    icon={CheckCircle2}
                />
                <MetricCard
                    title="Pending Review"
                    value="28"
                    trend="-5"
                    trendType="positive"
                    icon={Clock}
                />
                <MetricCard
                    title="Active Agents"
                    value="8 / 10"
                    icon={Users}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Workload Balance */}
                <div className="card-gradient glass p-8 rounded-2xl border border-zinc-800/50">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold tracking-tight">Agent Workload Balance</h3>
                        <p className="text-sm text-zinc-500">Current assignment density per agent</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={workloadData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    stroke="#52525b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    width={80}
                                />
                                <Tooltip
                                    cursor={{ fill: '#27272a', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                />
                                <Bar dataKey="assigned" radius={[0, 4, 4, 0]}>
                                    {workloadData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.assigned > 15 ? '#f43f5e' : '#10b981'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Escalation Queue */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <h3 className="text-lg font-bold tracking-tight">Escalation Queue</h3>
                            <p className="text-sm text-zinc-500">Events requiring immediate manager intervention</p>
                        </div>
                        <button className="text-xs font-medium text-zinc-400 hover:text-zinc-50 transition-colors">View All</button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {escalationQueue.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.subject}</TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                                            item.priority === 'urgent' ? "text-rose-500 bg-rose-500/10" : "text-amber-500 bg-amber-500/10"
                                        )}>
                                            {item.priority}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge state={item.state as EventState} />
                                    </TableCell>
                                    <TableCell className="text-zinc-500">{item.time}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
