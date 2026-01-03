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
    Mail,
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle,
    Reply,
    BrainCircuit
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
import { GSAPButton } from '@/components/ui/gsap-button';
import { useAuth } from '@/contexts/UserContext';
import { permissions } from '@/lib/permissions';

export default function UnifiedDashboard() {
    const { user, loading } = useAuth();

    // Shared state
    const [mailData, setMailData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        aiCount: 0,
        automationRate: 0
    });
    const [escalatedMails, setEscalatedMails] = useState(0);

    // Calculate volume trends from real data (Last 7 days)
    const dynamicVolumeData = React.useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = [];
        const now = new Date();

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

        fetch('/api/escalations')
            .then(res => res.json())
            .then(json => {
                if (json.data) {
                    const data = json.data
                    const escalatedMails = data.filter((item: any) => item.current_state === 'needs_attention').length
                    setEscalatedMails(escalatedMails)
                }
            })
            .catch(err => console.error('Error fetching dashboard data:', err));
    }, []);

    const automationData = [
        { name: 'AI Handled', value: stats.aiCount, color: '#10b981' },
        { name: 'Human Handled', value: stats.total - stats.aiCount, color: '#fafafa' },
    ];

    // Mock data for manager/agent views
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-zinc-500">Loading dashboard...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-zinc-500">Please sign in to view the dashboard</div>
            </div>
        );
    }

    // AGENT DASHBOARD VIEW
    if (user.role === 'agent') {
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
                        <GSAPButton variant="secondary" className="px-3 py-2 text-xs">
                            <Filter className="w-3.5 h-3.5" />
                            Filters
                        </GSAPButton>
                        <GSAPButton variant="primary" className="px-3 py-2 text-xs">
                            Refresh Queue
                        </GSAPButton>
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
                                            {permissions.canMarkEventResolved(user.role, { assigned_user_id: user.id }, user.id) && (
                                                <button title="Mark Handled" className="p-1.5 rounded hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-500 transition-all">
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button title="Escalate" className="p-1.5 rounded hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500 transition-all">
                                                <ShieldAlert className="w-4 h-4" />
                                            </button>
                                            {permissions.canReplyToAssignedEvents(user.role) && (
                                                <button title="Manual Reply" className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-50 transition-all">
                                                    <Reply className="w-4 h-4" />
                                                </button>
                                            )}
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

    // MANAGER DASHBOARD VIEW
    if (user.role === 'manager') {
        return (
            <div className="flex flex-col gap-8">
                {/* Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Active Escalations"
                        value={escalatedMails}
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
                    {permissions.canViewTeamWorkload(user.role) && (
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
                    )}

                    {/* Escalation Queue */}
                    {permissions.canViewDepartmentEscalations(user.role) && (
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
                    )}
                </div>
            </div>
        );
    }

    // ADMIN DASHBOARD VIEW (default)
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
