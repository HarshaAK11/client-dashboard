"use client";

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Clock,
    DollarSign,
    AlertTriangle,
    Search,
    Download,
    Filter,
    ArrowRight,
    BrainCircuit,
    Users,
    Building2,
    Calendar,
    BarChart3,
    PieChart as PieChartIcon,
    Activity
} from 'lucide-react';
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
    Cell,
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    ZAxis
} from 'recharts';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    cn
} from '@/components/ui/dashboard-components';

// Mock Data for Analytics
const automationEffectivenessData = [
    { name: 'Week 1', success: 82, falseAuto: 5, bounce: 13 },
    { name: 'Week 2', success: 85, falseAuto: 4, bounce: 11 },
    { name: 'Week 3', success: 88, falseAuto: 3, bounce: 9 },
    { name: 'Week 4', success: 91, falseAuto: 2, bounce: 7 },
];

const confidenceVsOutcomeData = [
    { confidence: 95, outcome: 98, name: 'High' },
    { confidence: 80, outcome: 75, name: 'Med' },
    { confidence: 60, outcome: 40, name: 'Low' },
    { confidence: 40, outcome: 20, name: 'Critical' },
];

const costAnalysisData = [
    { name: 'Mon', saved: 420, cost: 120 },
    { name: 'Tue', saved: 510, cost: 150 },
    { name: 'Wed', saved: 380, cost: 110 },
    { name: 'Thu', saved: 490, cost: 140 },
    { name: 'Fri', saved: 450, cost: 130 },
    { name: 'Sat', saved: 210, cost: 60 },
    { name: 'Sun', saved: 180, cost: 50 },
];

const departmentPerformance = [
    { dept: 'Customer Support', volume: 1240, aiRate: 92, resTime: '45s', escalation: 4, intents: 'Billing, Password, Refund', sla: 0 },
    { dept: 'Technical Ops', volume: 850, aiRate: 65, resTime: '12m', escalation: 25, intents: 'Bug, API, Downtime', sla: 12 },
    { dept: 'Sales', volume: 620, aiRate: 45, resTime: '2h', escalation: 15, intents: 'Pricing, Demo, Quote', sla: 5 },
    { dept: 'HR', volume: 150, aiRate: 88, resTime: '5m', escalation: 2, intents: 'Leave, Payroll, Benefits', sla: 1 },
];

const behavioralData = [
    { hour: '00:00', volume: 120, escalation: 2 },
    { hour: '04:00', volume: 80, escalation: 1 },
    { hour: '08:00', volume: 450, escalation: 8 },
    { hour: '12:00', volume: 850, escalation: 15 },
    { hour: '16:00', volume: 720, escalation: 12 },
    { hour: '20:00', volume: 340, escalation: 5 },
];

export default function AnalyticsView() {
    const [activeTab, setActiveTab] = useState('overview');
    const [dateRange, setDateRange] = useState('Last 30 Days');

    return (
        <div className="flex flex-col gap-8 pb-12">
            {/* Header & Global Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">Advanced Analytics</h2>
                    <p className="text-zinc-500 mt-1">Operational intelligence and AI performance forensics.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-48">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <select
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Last Quarter</option>
                            <option>Custom Range</option>
                        </select>
                    </div>
                    <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all">
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Section 1: Automation Effectiveness & Section 2: Cost Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Automation Effectiveness */}
                <div className="card-gradient glass p-8 rounded-2xl border border-zinc-800/50">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <BrainCircuit className="text-emerald-500" size={20} />
                                <h3 className="text-lg font-bold tracking-tight text-zinc-50">Automation Effectiveness</h3>
                            </div>
                            <p className="text-sm text-zinc-500">Proving AI quality beyond simple volume.</p>
                        </div>
                        <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-bold">
                            +4.2% Quality
                        </div>
                    </div>

                    <div className="h-[250px] w-full mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={automationEffectivenessData}>
                                <defs>
                                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="success" stroke="#10b981" fillOpacity={1} fill="url(#colorSuccess)" strokeWidth={3} name="Success Rate %" />
                                <Area type="monotone" dataKey="falseAuto" stroke="#f43f5e" fill="transparent" strokeWidth={2} strokeDasharray="5 5" name="False Auto %" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">False Auto Rate</div>
                            <div className="text-xl font-bold text-rose-500">2.4%</div>
                        </div>
                        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">AI Bounce Rate</div>
                            <div className="text-xl font-bold text-amber-500">7.1%</div>
                        </div>
                        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Conf. Accuracy</div>
                            <div className="text-xl font-bold text-emerald-500">94.2%</div>
                        </div>
                    </div>
                </div>

                {/* Cost Analysis */}
                <div className="card-gradient glass p-8 rounded-2xl border border-zinc-800/50">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="text-blue-500" size={20} />
                                <h3 className="text-lg font-bold tracking-tight text-zinc-50">Human Intervention Cost</h3>
                            </div>
                            <p className="text-sm text-zinc-500">Financial impact and time savings projection.</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-zinc-50">$12,450</div>
                            <div className="text-xs text-emerald-500 font-medium">Estimated Savings</div>
                        </div>
                    </div>

                    <div className="h-[250px] w-full mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={costAnalysisData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#27272a' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }} />
                                <Bar dataKey="saved" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Minutes Saved" />
                                <Bar dataKey="cost" fill="#27272a" radius={[4, 4, 0, 0]} name="Human Minutes" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                <Clock size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-zinc-50">420 Human Hours Saved</div>
                                <div className="text-xs text-zinc-500">Based on $45/hr internal cost</div>
                            </div>
                        </div>
                        <ArrowRight className="text-zinc-600" size={20} />
                    </div>
                </div>
            </div>

            {/* Section 3: Department-Level Performance */}
            <div className="card-gradient glass rounded-2xl border border-zinc-800/50 overflow-hidden">
                <div className="p-8 border-b border-zinc-800/50">
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 className="text-purple-500" size={20} />
                        <h3 className="text-lg font-bold tracking-tight text-zinc-50">Department Performance Breakdown</h3>
                    </div>
                    <p className="text-sm text-zinc-500">Granular metrics per business unit.</p>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Department</TableHead>
                            <TableHead>Volume</TableHead>
                            <TableHead>AI Handled</TableHead>
                            <TableHead>Avg. Resolution</TableHead>
                            <TableHead>Escalation Rate</TableHead>
                            <TableHead>SLA Breaches</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {departmentPerformance
                            .map((dept) => (
                                <TableRow key={dept.dept}>
                                    <TableCell className="font-bold text-zinc-50">{dept.dept}</TableCell>
                                    <TableCell className="text-zinc-400">{dept.volume.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${dept.aiRate}%` }} />
                                            </div>
                                            <span className="text-xs font-medium">{dept.aiRate}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-400">{dept.resTime}</TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                            dept.escalation > 20 ? "bg-rose-500/10 text-rose-500" : "bg-zinc-800 text-zinc-400"
                                        )}>
                                            {dept.escalation}%
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "font-bold",
                                            dept.sla > 0 ? "text-rose-500" : "text-emerald-500"
                                        )}>
                                            {dept.sla}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

            {/* Section 4: Failure Forensics & Section 6: Training Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Failure Forensics */}
                <div className="card-gradient glass p-8 rounded-2xl border border-zinc-800/50">
                    <div className="flex items-center gap-2 mb-6">
                        <AlertTriangle className="text-rose-500" size={20} />
                        <h3 className="text-lg font-bold tracking-tight text-zinc-50">Failure & Escalation Forensics</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Top Escalation Reasons</div>
                            <div className="space-y-3">
                                {[
                                    { reason: "AI Unsure / Low Confidence", count: 142, color: "bg-amber-500" },
                                    { reason: "Missing Account Data", count: 89, color: "bg-rose-500" },
                                    { reason: "Angry / Frustrated Tone", count: 64, color: "bg-rose-600" },
                                    { reason: "Policy Violation Check", count: 31, color: "bg-zinc-600" },
                                ].map((item) => (
                                    <div key={item.reason} className="flex flex-col gap-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-zinc-300">{item.reason}</span>
                                            <span className="text-zinc-500 font-bold">{item.count}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                            <div className={cn("h-full", item.color)} style={{ width: `${(item.count / 142) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                            <div className="text-xs font-bold text-rose-500 mb-2">Repeated Failure Alert</div>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                "Billing Dispute" intent for "Enterprise" tier has failed 12 times in the last 48 hours. AI consistently misinterprets the refund policy for multi-year contracts.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Training Insights */}
                <div className="card-gradient glass p-8 rounded-2xl border border-zinc-800/50">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="text-emerald-500" size={20} />
                        <h3 className="text-lg font-bold tracking-tight text-zinc-50">Training & Improvement Insights</h3>
                    </div>

                    <div className="space-y-4">
                        {[
                            { title: "Suggested Prompt Update", desc: "Clarify 'Refund' vs 'Credit' logic in Billing prompt to reduce 15% of current escalations.", type: "improvement" },
                            { title: "Missing Knowledge Topic", desc: "High volume of queries regarding 'New API v4' which are currently human-handled.", type: "missing" },
                            { title: "Automation Candidate", desc: "85% of 'Address Change' requests are human-handled but follow a static pattern.", type: "candidate" },
                        ].map((insight, i) => (
                            <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl hover:border-emerald-500/30 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider",
                                        insight.type === 'improvement' ? "text-emerald-500" :
                                            insight.type === 'missing' ? "text-amber-500" : "text-blue-500"
                                    )}>
                                        {insight.title}
                                    </span>
                                    <ArrowRight size={14} className="text-zinc-700 group-hover:text-zinc-400 transition-all" />
                                </div>
                                <p className="text-sm text-zinc-400 leading-snug">{insight.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Section 5: Time-Based Analytics */}
            <div className="card-gradient glass p-8 rounded-2xl border border-zinc-800/50">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="text-zinc-400" size={20} />
                            <h3 className="text-lg font-bold tracking-tight text-zinc-50">Time-Based & Behavioral Analytics</h3>
                        </div>
                        <p className="text-sm text-zinc-500">Identifying performance degradation during peak loads.</p>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={behavioralData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="hour" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }} />
                            <Line type="monotone" dataKey="volume" stroke="#fafafa" strokeWidth={3} dot={{ r: 4, fill: '#fafafa' }} name="Volume" />
                            <Line type="monotone" dataKey="escalation" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4, fill: '#f43f5e' }} name="Escalation Rate" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
