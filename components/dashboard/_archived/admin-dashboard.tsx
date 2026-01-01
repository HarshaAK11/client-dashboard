"use client";

import React, { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
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
    Activity,
    Zap,
    ShieldAlert,
    TrendingUp,
    Mail
} from 'lucide-react';
import { MetricCard } from '@/components/ui/dashboard-components';

export default function AdminDashboard() {

    // Mail data state
    const [mailData, setMailData] = useState<any[]>([]);
    // Statistics state
    const [stats, setStats] = useState({
        total: 0,
        aiCount: 0,
        automationRate: 0
    });

    // Calculate volume trends from real data (Last 7 days ending today)
    const dynamicVolumeData = React.useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = [];
        const now = new Date();

        // Generate the last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            last7Days.push({
                dateStr,
                name: i === 0 ? 'Today' : days[d.getDay()],
                Total: 0,
                AI: 0
            });
        }

        if (!mailData || mailData.length === 0) {
            return last7Days.map(({ name, Total, AI }) => ({ name, Total, AI }));
        }

        // Group data by date string (YYYY-MM-DD)
        const grouped = mailData.reduce((acc: any, item: any) => {
            const dateStr = new Date(item.created_at).toISOString().split('T')[0];
            if (!acc[dateStr]) {
                acc[dateStr] = { Total: 0, AI: 0 };
            }
            acc[dateStr].Total += 1;
            if (item.handled_by === 'ai') {
                acc[dateStr].AI += 1;
            }
            return acc;
        }, {});

        // Map the last 7 days to the grouped data
        return last7Days.map(day => ({
            name: day.name,
            Total: grouped[day.dateStr]?.Total || 0,
            AI: grouped[day.dateStr]?.AI || 0
        }));
    }, [mailData]);



    // Fetch data from API
    useEffect(() => {
        fetch('/api/emails')
            .then(res => res.json())
            .then(json => {
                if (json.data) {
                    const data = json.data;
                    // Calculate 'ai' count and total
                    const aiCount = data.filter((item: any) => item.handled_by === 'ai').length;
                    const total = data.length;
                    const rate = total > 0 ? (aiCount / total) * 100 : 0;

                    setMailData(data);
                    setStats({
                        total,
                        aiCount,
                        automationRate: rate
                    });
                }
            })
            .catch(err => console.error('Error fetching dashboard data:', err));
    }, []);

    const automationData = [
        { name: 'AI Handled', value: stats.aiCount, color: '#10b981' },
        { name: 'Human Handled', value: stats.total - stats.aiCount, color: '#fafafa' },
    ];

    return (
        <div className="flex flex-col gap-8">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="AI Automation Rate"
                    value={`${stats.automationRate.toFixed(1)}%`}
                    trend="+2.1%"
                    trendType="positive"
                    icon={Zap}
                />  
                <MetricCard
                    title="Total Event Volume"
                    value={stats.total.toLocaleString()}
                    trend="+12%"
                    trendType="positive"
                    icon={Mail}
                />
                <MetricCard
                    title="System-wide Risk"
                    value="Low"
                    trend="Stable"
                    trendType="neutral"
                    icon={ShieldAlert}
                />
                <MetricCard
                    title="Avg. Response Time"
                    value="1.2s"
                    trend="-0.4s"
                    trendType="positive"
                    icon={Activity}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 card-gradient glass p-8 rounded-2xl border border-zinc-800/50">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold tracking-tight">Volume Trends</h3>
                            <p className="text-sm text-zinc-500">7-day rolling window of event throughput</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-zinc-50" />
                                <span className="text-xs text-zinc-400">Total</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-xs text-zinc-400">AI Handled</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dynamicVolumeData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fafafa" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#fafafa" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#52525b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#52525b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Total"
                                    stroke="#fafafa"
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="AI"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorAI)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Automation Rate Pie */}
                <div className="card-gradient glass p-8 rounded-2xl border border-zinc-800/50 flex flex-col items-center">
                    <div className="w-full mb-8">
                        <h3 className="text-lg font-bold tracking-tight">Automation Rate</h3>
                        <p className="text-sm text-zinc-500">AI vs Human distribution</p>
                    </div>
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={automationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {automationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold">{stats.automationRate.toFixed(0)}%</span>
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">AI Rate</span>
                        </div>
                    </div>
                    <div className="w-full mt-4 space-y-2">
                        {automationData.map((item) => (
                            <div key={item.name} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs text-zinc-400">{item.name}</span>
                                </div>
                                <span className="text-xs font-medium">{item.value} events</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
