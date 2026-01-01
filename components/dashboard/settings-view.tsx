"use client";

import React, { useState } from 'react';
import {
    Building2,
    Route,
    BrainCircuit,
    ShieldAlert,
    Bell,
    Key,
    Users,
    Database,
    History,
    AlertTriangle,
    Copy,
    Check,
    Save,
    Plus,
    Trash2,
    Lock,
    Clock,
    Mail,
    Webhook,
    RefreshCw,
    LogOut,
    Power,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/components/ui/dashboard-components';

const tabs = [
    { id: 'tenant', label: 'Tenant Config', icon: Building2 },
    { id: 'routing', label: 'Routing Rules', icon: Route },
    { id: 'ai', label: 'AI Behavior', icon: BrainCircuit },
    { id: 'sla', label: 'SLA & Escalation', icon: ShieldAlert },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API & Integrations', icon: Key },
    { id: 'roles', label: 'Roles & Access', icon: Users },
    { id: 'compliance', label: 'Compliance', icon: Database },
    { id: 'audit', label: 'Audit Log', icon: History },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, color: 'text-rose-500' },
];

export default function SettingsView() {
    const [activeTab, setActiveTab] = useState('tenant');
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'tenant':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tenant Name</label>
                                <input type="text" readOnly value="Acme Corp Global" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tenant ID</label>
                                <div className="relative">
                                    <input type="text" readOnly value="82a624e6-37e5-4693-a7a1-81c1cd967e94" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-400 pr-10 font-mono" />
                                    <button onClick={() => copyToClipboard('82a624e6-37e5-4693-a7a1-81c1cd967e94')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                                        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Subscription Tier</label>
                                <div className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-sm font-bold">
                                    Enterprise Plan
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Account Status</label>
                                <div className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-sm font-bold flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Active
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Created Date</label>
                                <input type="text" readOnly value="October 15, 2024" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Data Residency</label>
                                <input type="text" readOnly value="US-East (Virginia)" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed" />
                            </div>
                        </div>

                        <div className="h-px bg-zinc-800/50" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Default Timezone</label>
                                <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                    <option>UTC (Coordinated Universal Time)</option>
                                    <option>EST (Eastern Standard Time)</option>
                                    <option>PST (Pacific Standard Time)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Business Hours</label>
                                <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                    <option>9:00 AM - 6:00 PM</option>
                                    <option>24/7 Support</option>
                                    <option>Custom</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Default Language</label>
                                <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                    <option>English (US)</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );

            case 'routing':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-lg font-bold text-zinc-50">Department Routing</h4>
                                <p className="text-sm text-zinc-500">Map incoming intents to specific business units.</p>
                            </div>
                            <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-lg font-bold transition-all">
                                <Plus size={18} />
                                Add Rule
                            </button>
                        </div>

                        <div className="space-y-4">
                            {[
                                { intent: 'Billing / Refund', dept: 'Billing', priority: 'High', sla: '1h' },
                                { intent: 'Technical Issue / Bug', dept: 'Technical Ops', priority: 'Critical', sla: '15m' },
                                { intent: 'General Inquiry', dept: 'Customer Support', priority: 'Medium', sla: '4h' },
                            ].map((rule, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl group">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Intent</span>
                                            <span className="text-sm text-zinc-300">{rule.intent}</span>
                                        </div>
                                        <ArrowRight className="text-zinc-700" size={16} />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Target Dept</span>
                                            <span className="text-sm text-zinc-300">{rule.dept}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">SLA Target</span>
                                            <span className="text-sm text-emerald-500 font-bold">{rule.sla}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full">
                                            {rule.priority}
                                        </span>
                                        <button className="p-2 text-zinc-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'ai':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h4 className="text-lg font-bold text-zinc-50">Automation Policy</h4>
                                <div className="space-y-4">
                                    <ToggleRow label="Enable Auto-Replies" description="Allow AI to send emails directly." enabled={true} />
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Confidence Threshold</label>
                                            <span className="text-xs font-bold text-emerald-500">85%</span>
                                        </div>
                                        <input type="range" defaultValue={85} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Max AI Replies per Thread</label>
                                        <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm">
                                            <option>3 replies</option>
                                            <option>5 replies</option>
                                            <option>Unlimited</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">AI Allowed Actions</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Acknowledge Only', 'Full Response', 'Classify Only'].map((action) => (
                                                <button key={action} className="px-3 py-1.5 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 rounded-lg">{action}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-lg font-bold text-zinc-50">Safety Guardrails</h4>
                                <div className="space-y-3">
                                    {['Legal Disputes', 'Billing Conflicts', 'Threatening Language', 'Sensitive PII'].map((item) => (
                                        <div key={item} className="flex items-center gap-3 p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                                            <Lock size={14} className="text-rose-500" />
                                            <span className="text-sm text-zinc-300">Never auto-reply to: <span className="font-bold">{item}</span></span>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Blacklisted Keywords</label>
                                    <input type="text" placeholder="lawsuit, attorney, refund demand..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'sla':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { priority: 'Critical', time: '15m', color: 'text-rose-500' },
                                { priority: 'High', time: '1h', color: 'text-amber-500' },
                                { priority: 'Medium', time: '4h', color: 'text-blue-500' },
                            ].map((sla) => (
                                <div key={sla.priority} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-4">
                                    <div className={cn("text-xs font-bold uppercase tracking-widest", sla.color)}>{sla.priority} SLA</div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-bold text-zinc-50">{sla.time}</span>
                                        <span className="text-xs text-zinc-500 mb-1.5">First Response</span>
                                    </div>
                                    <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold transition-all">Edit Target</button>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-6">
                            <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Escalation Triggers</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ToggleRow label="Time-based Escalation" description="Escalate when SLA is at risk." enabled={true} />
                                <ToggleRow label="Confidence-based Escalation" description="Escalate when AI confidence is low." enabled={true} />
                                <ToggleRow label="Sentiment-based Escalation" description="Escalate on angry or abusive tone." enabled={true} />
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Reassignment Timeout</label>
                                    <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm">
                                        <option>30 Minutes</option>
                                        <option>1 Hour</option>
                                        <option>Never</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-zinc-50">Alert Channels</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Mail className="text-blue-500" size={20} />
                                        <span className="text-sm font-bold">Email</span>
                                    </div>
                                    <ToggleSwitch enabled={true} />
                                </div>
                                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between opacity-50">
                                    <div className="flex items-center gap-3">
                                        <svg className="text-purple-500 w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" /></svg>
                                        <span className="text-sm font-bold">Slack</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Coming Soon</span>
                                </div>
                                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Bell className="text-amber-500" size={20} />
                                        <span className="text-sm font-bold">In-App</span>
                                    </div>
                                    <ToggleSwitch enabled={true} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-zinc-50">Alert Types</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ToggleRow label="SLA Breach Alerts" description="Notify when SLA is breached." enabled={true} />
                                <ToggleRow label="Automation Rate Drop" description="Alert on significant drops." enabled={true} />
                                <ToggleRow label="System Error Alerts" description="Critical system failures." enabled={true} />
                                <ToggleRow label="High Volume Spikes" description="Unusual traffic patterns." enabled={false} />
                                <ToggleRow label="Escalation Backlog" description="Unassigned escalation warnings." enabled={true} />
                            </div>
                        </div>
                    </div>
                );

            case 'api':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-bold text-zinc-50">API Keys</h4>
                                <button className="text-xs font-bold text-emerald-500 hover:underline">Generate New Key</button>
                            </div>
                            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-4">
                                <div className="flex justify-between items-center p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Production Key</span>
                                        <span className="text-sm font-mono text-zinc-400">••••••••••••••••••••••••••••••••</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-zinc-500 hover:text-zinc-300"><RefreshCw size={16} /></button>
                                        <button className="p-2 text-zinc-500 hover:text-rose-500"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-zinc-500">
                                    <div className="flex items-center gap-1.5"><Lock size={12} /> Scoped: Read/Write</div>
                                    <div className="flex items-center gap-1.5"><Clock size={12} /> Created: 3 months ago</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-zinc-50">Webhooks</h4>
                            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Webhook className="text-emerald-500" size={18} />
                                    <span className="text-sm text-zinc-300 font-mono">https://api.acme.com/webhooks/events</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs text-zinc-500">Active</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-zinc-50">Integrations</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { name: 'Gmail', status: 'Connected', color: 'text-emerald-500' },
                                    { name: 'Salesforce CRM', status: 'Not Connected', color: 'text-zinc-500' },
                                    { name: 'Zendesk', status: 'Connected', color: 'text-emerald-500' },
                                ].map((int) => (
                                    <div key={int.name} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                                        <span className="text-sm font-bold">{int.name}</span>
                                        <span className={cn("text-xs font-bold", int.color)}>{int.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'roles':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/30">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-900/50 border-b border-zinc-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Role</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Permissions</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Scope</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/30">
                                    {[
                                        { role: 'Admin', perms: 'Full Control', scope: 'Global' },
                                        { role: 'Manager', perms: 'Read / Write / Assign', scope: 'Department' },
                                        { role: 'Agent', perms: 'Read / Reply', scope: 'Assigned Only' },
                                    ].map((r) => (
                                        <tr key={r.role} className="hover:bg-zinc-800/10">
                                            <td className="px-6 py-4 text-sm font-bold text-zinc-50">{r.role}</td>
                                            <td className="px-6 py-4 text-sm text-zinc-400">{r.perms}</td>
                                            <td className="px-6 py-4 text-sm text-zinc-400">{r.scope}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-xs font-bold text-zinc-500 hover:text-zinc-300">Edit Policy</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Idle Session Timeout</label>
                                <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm">
                                    <option>30 Minutes</option>
                                    <option>1 Hour</option>
                                    <option>4 Hours</option>
                                </select>
                            </div>
                            <ToggleRow label="Force Logout on Role Change" description="End sessions when role is modified." enabled={true} />
                        </div>
                    </div>
                );

            case 'compliance':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-6">
                                <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Data Retention</h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500">Email Metadata Retention</label>
                                        <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm">
                                            <option>90 Days</option>
                                            <option>1 Year</option>
                                            <option>Indefinite</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500">Audit Log Retention</label>
                                        <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm">
                                            <option>1 Year</option>
                                            <option>3 Years</option>
                                            <option>7 Years</option>
                                        </select>
                                    </div>
                                    <ToggleRow label="Anonymize PII after 30 days" description="" enabled={true} />
                                </div>
                            </div>

                            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-6">
                                <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Purge Schedule</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-zinc-500">Last Purge Executed</span>
                                        <span className="text-xs font-bold text-zinc-300">Oct 24, 2025</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-zinc-500">Next Scheduled Purge</span>
                                        <span className="text-xs font-bold text-emerald-500">Jan 24, 2026</span>
                                    </div>
                                    <button className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold transition-all">Request Compliance Export</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'audit':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/30">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-900/50 border-b border-zinc-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Setting</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Change</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">User</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/30">
                                    {[
                                        { setting: 'SLA - Critical', change: '30m → 15m', user: 'Alex Rivera (Admin)', time: '2h ago' },
                                        { setting: 'API Key', change: 'Rotated', user: 'System', time: '1d ago' },
                                        { setting: 'Department', change: 'Added "Technical Ops"', user: 'Alex Rivera (Admin)', time: '3d ago' },
                                        { setting: 'AI Confidence', change: '80% → 85%', user: 'Sarah Chen (Manager)', time: '1w ago' },
                                    ].map((log, i) => (
                                        <tr key={i} className="hover:bg-zinc-800/10">
                                            <td className="px-6 py-4 text-sm font-bold text-zinc-50">{log.setting}</td>
                                            <td className="px-6 py-4 text-sm text-zinc-400 font-mono">{log.change}</td>
                                            <td className="px-6 py-4 text-sm text-zinc-400">{log.user}</td>
                                            <td className="px-6 py-4 text-sm text-zinc-500">{log.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-zinc-600 italic text-center">Audit logs are read-only and cannot be modified.</p>
                    </div>
                );

            case 'danger':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-rose-500">Danger Zone</h4>
                                    <p className="text-sm text-zinc-500">These actions are destructive and require administrative re-authentication.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <DangerAction
                                    title="Global Automation Kill-switch"
                                    description="Immediately disable all AI auto-replies across all departments."
                                    buttonText="Kill Automation"
                                    icon={<Power size={14} />}
                                    variant="primary"
                                />
                                <DangerAction
                                    title="Put Tenant in Read-Only Mode"
                                    description="Freeze all write operations and changes for this organization."
                                    buttonText="Enable Read-Only"
                                    icon={<Lock size={14} />}
                                    variant="secondary"
                                />
                                <DangerAction
                                    title="Reset AI Configuration"
                                    description="Restore all AI behavior and guardrail settings to factory defaults."
                                    buttonText="Reset to Default"
                                    icon={<RefreshCw size={14} />}
                                    variant="secondary"
                                />
                                <DangerAction
                                    title="Suspend Tenant"
                                    description="Freeze all operations and access for this organization."
                                    buttonText="Suspend Account"
                                    icon={<LogOut size={14} />}
                                    variant="secondary"
                                />
                                <div className="flex items-center justify-between p-4 bg-zinc-900 border border-rose-900/50 rounded-xl">
                                    <div>
                                        <div className="text-sm font-bold text-rose-500">Delete Organization</div>
                                        <div className="text-xs text-zinc-500">Permanently remove all data, users, and history. This cannot be undone.</div>
                                    </div>
                                    <button className="px-4 py-2 bg-rose-900/20 text-rose-500 hover:bg-rose-900/40 rounded-lg font-bold text-xs transition-all">
                                        Request Deletion
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">Platform Settings</h2>
                    <p className="text-zinc-500 mt-1">Configure tenant foundation, AI policies, and compliance.</p>
                </div>
                <button className="flex items-center gap-2 bg-zinc-50 text-zinc-950 px-6 py-2.5 rounded-xl font-bold hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-50/5">
                    <Save size={18} />
                    Save Changes
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <aside className="lg:w-56 shrink-0">
                    <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-zinc-900 text-zinc-50 border border-zinc-800 shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                                )}
                            >
                                <tab.icon size={18} className={tab.color} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content Area */}
                <main className="flex-1 min-w-0">
                    <div className="card-gradient glass p-8 rounded-3xl border border-zinc-800/50">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}

// Helper Components
function ToggleSwitch({ enabled }: { enabled: boolean }) {
    return (
        <div className={cn("w-10 h-5 rounded-full relative cursor-pointer transition-colors", enabled ? "bg-emerald-500" : "bg-zinc-700")}>
            <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all", enabled ? "right-0.5" : "left-0.5")} />
        </div>
    );
}

function ToggleRow({ label, description, enabled }: { label: string; description: string; enabled: boolean }) {
    return (
        <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <div>
                <div className="text-sm font-bold text-zinc-300">{label}</div>
                {description && <div className="text-xs text-zinc-500">{description}</div>}
            </div>
            <ToggleSwitch enabled={enabled} />
        </div>
    );
}

function DangerAction({ title, description, buttonText, icon, variant }: {
    title: string;
    description: string;
    buttonText: string;
    icon: React.ReactNode;
    variant: 'primary' | 'secondary';
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div>
                <div className="text-sm font-bold text-zinc-300">{title}</div>
                <div className="text-xs text-zinc-500">{description}</div>
            </div>
            <button className={cn(
                "px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2",
                variant === 'primary'
                    ? "bg-rose-500 hover:bg-rose-600 text-black"
                    : "border border-rose-500/50 text-rose-500 hover:bg-rose-500/10"
            )}>
                {icon}
                {buttonText}
            </button>
        </div>
    );
}
