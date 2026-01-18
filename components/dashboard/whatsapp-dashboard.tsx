"use client";

import React from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    MetricCard,
    EventState,
} from '@/components/ui/dashboard-components';
import { RecentEscalations, StateGauge } from './dashboard-widgets';

const whatsappVolumeData = [
    { name: 'Mon', Total: 1200, AI: 950 },
    { name: 'Tue', Total: 1500, AI: 1300 },
    { name: 'Wed', Total: 1100, AI: 900 },
    { name: 'Thu', Total: 1800, AI: 1600 },
    { name: 'Fri', Total: 2100, AI: 1900 },
    { name: 'Sat', Total: 1300, AI: 1100 },
    { name: 'Sun', Total: 900, AI: 800 },
];

const whatsappAutomationData = [
    { name: 'AI Handled', value: 85, color: '#10b981' },
    { name: 'Human Handled', value: 15, color: '#fafafa' },
];

const whatsappEscalationsMock = [
    { id: '1', name: 'John Doe', subject: 'Payment Issue', status: 'needs_attention' as EventState, time: '12:37 PM', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces' },
    { id: '2', name: 'Jane Smith', subject: 'Login Problem', status: 'processing' as EventState, time: '12:37 PM', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=faces' },
    { id: '3', name: 'Alice Johnson', subject: 'Refund Request', status: 'handled' as EventState, time: '12:00 PM', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=faces' },
    { id: '4', name: 'Bob Wilson', subject: 'Account Security', status: 'processing' as EventState, time: '10:37 AM', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=faces' },
    { id: '5', name: 'Charlie Brown', subject: 'Order Status', status: 'needs_attention' as EventState, time: '09:15 AM', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=faces' },
    { id: '6', name: 'David Miller', subject: 'Billing Inquiry', status: 'processing' as EventState, time: 'Yesterday', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=faces' },
    { id: '7', name: 'Eve Adams', subject: 'Technical Support', status: 'handled' as EventState, time: '2 Days Ago', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=faces' },
    { id: '8', name: 'Frank Wright', subject: 'Feature Request', status: 'needs_attention' as EventState, time: '3 Days Ago', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=32&h=32&fit=crop&crop=faces' },
];

const whatsappStateData = [
    { name: 'Resolved', value: 65, color: '#10b981' },
    { name: 'In Progress', value: 25, color: '#064e3b' },
    { name: 'Pending', value: 10, color: '#3f3f46', isHatched: true },
];

export default function WhatsAppDashboard() {
    return (
        <div className="flex flex-col gap-3">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricCard
                    title="WhatsApp AI Rate"
                    value="85.4%"
                    trend="+2.1% from last week"
                    variant="primary"
                />
                <MetricCard
                    title="Active Conversations"
                    value="1,248"
                    trend="+12% from yesterday"
                    variant="primary"
                />
                <MetricCard
                    title="Avg. Response Time"
                    value="1.2s"
                    trend="-0.3s"
                    variant="primary"
                />
                <MetricCard
                    title="Messages Sent"
                    value="12.5k"
                    trend="+5.4% from yesterday"
                    variant="primary"
                />
            </div>

            {/* Combined Grid for Row 2 & 3 with Row-Spanning Escalations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                {/* Row 2: Volume Trends */}
                <div className="lg:col-span-8 card-gradient glass p-3 rounded-2xl border border-zinc-800/50">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-sm font-bold tracking-tight">WhatsApp Volume Trends</h3>
                            <p className="text-[10px] text-zinc-500">Daily message throughput</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-zinc-50" />
                                <span className="text-[10px] text-zinc-400">Total</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] text-zinc-400">AI Handled</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={whatsappVolumeData}>
                                <defs>
                                    <linearGradient id="colorTotalWA" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fafafa" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#fafafa" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorAIWA" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#52525b"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#52525b"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '10px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Total"
                                    stroke="#fafafa"
                                    fillOpacity={1}
                                    fill="url(#colorTotalWA)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="AI"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorAIWA)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Escalations (Spans 2 Rows) */}
                <div className="lg:col-span-4 lg:row-span-2">
                    <RecentEscalations items={whatsappEscalationsMock} variant="chat" />
                </div>

                {/* Row 3: Automation Rate & State Gauge */}
                <div className="lg:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Automation Rate Pie */}
                    <div className="card-gradient glass p-3 rounded-2xl border border-zinc-800/50 flex flex-col items-center">
                        <div className="w-full mb-4">
                            <h3 className="text-sm font-bold tracking-tight">WA Automation Rate</h3>
                            <p className="text-[10px] text-zinc-500">AI vs Human</p>
                        </div>
                        <div className="h-[120px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={whatsappAutomationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={55}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {whatsappAutomationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xl font-bold">85%</span>
                                <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">AI Rate</span>
                            </div>
                        </div>
                        <div className="w-full mt-2 space-y-1">
                            {whatsappAutomationData.map((item) => (
                                <div key={item.name} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-[10px] text-zinc-400">{item.name}</span>
                                    </div>
                                    <span className="text-[10px] font-medium">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* WhatsApp State Gauge */}
                    <StateGauge
                        title="WhatsApp State"
                        data={whatsappStateData}
                        totalValue={90}
                        label="Messages Handled"
                    />
                </div>
            </div>
        </div>
    );
}
