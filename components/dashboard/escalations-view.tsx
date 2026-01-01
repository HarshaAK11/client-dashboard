"use client";

import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    Clock,
    User,
    MoreVertical,
    CheckCircle2,
    UserPlus,
    ExternalLink,
    AlertCircle,
    Filter,
    Search,
    ChevronRight,
    Info,
    MessageSquare
} from 'lucide-react';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    cn
} from '@/components/ui/dashboard-components';
import { useToast } from '@/components/ui/toast';
import { UserSelectionDialog } from './user-selection-dialog';

// Mock Data for Escalations
const mockEscalations = [
    {
        id: '1',
        summary: "Customer requesting immediate refund for multi-year enterprise contract.",
        reason: "Policy Violation Check",
        priority: "critical",
        department: "Billing",
        assignedTo: "Unassigned",
        assignedToId: "Unassigned",
        escalatedAt: new Date(Date.now() - 1000 * 60 * 12), // 12 mins ago
        slaDeadline: new Date(Date.now() + 1000 * 60 * 18), // 18 mins left
        confidence: 0.42,
        aiReason: "Escalated due to low confidence (0.42) and missing invoice number.",
        emailContent: "I need a full refund for our enterprise plan. We are moving to a different provider and the current service doesn't meet our needs as discussed in the contract section 4.2."
    },
    {
        id: '2',
        summary: "Technical issue with API v4 integration for high-volume client.",
        reason: "AI confidence below threshold",
        priority: "high",
        department: "Technical Ops",
        assignedTo: "Alex Rivera",
        assignedToId: "alex-rivera-uuid",
        escalatedAt: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
        slaDeadline: new Date(Date.now() - 1000 * 60 * 15), // Breached 15 mins ago
        confidence: 0.58,
        aiReason: "AI unsure about specific API v4 error codes mentioned in the thread.",
        emailContent: "Our integration is failing with error code 500.42. This is impacting our production traffic. Please advise immediately."
    },
    {
        id: '3',
        summary: "Angry tone detected in feedback regarding recent downtime.",
        reason: "Angry or abusive tone detected",
        priority: "medium",
        department: "Customer Support",
        assignedTo: "Sarah Chen",
        assignedToId: "sarah-chen-uuid",
        escalatedAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
        slaDeadline: new Date(Date.now() + 1000 * 60 * 55), // 55 mins left
        confidence: 0.85,
        aiReason: "Sentiment analysis detected high frustration levels and urgent keywords.",
        emailContent: "This is the third time this week the service has been down! This is completely unacceptable and I'm losing money every minute you're offline!"
    }
];

export default function EscalationsView({ role }: { role: string }) {
    const [escalations, setEscalations] = useState(() => {
        // Role-based filtering logic
        if (role === 'admin') return mockEscalations;
        if (role === 'manager') {
            // Managers see their department (e.g., Billing)
            return mockEscalations.filter(e => e.department === 'Billing' || e.department === 'Customer Support');
        }
        // Agents see only their assigned escalations
        return mockEscalations.filter(e => e.assignedTo === 'Sarah Chen'); // Mocking current user as Sarah Chen
    });

    useEffect(() => {
        fetch('/api/escalations')
            .then(response => response.json())
            .then(json => {
                if (json.data) {
                    const data = json.data.map((item: any) => ({
                        ...item,
                        escalatedAt: new Date(item.escalatedAt),
                        slaDeadline: new Date(item.slaDeadline),
                        assignedTo: item.assignedTo,
                        assignedToId: item.assignedToId
                    }))
                    setEscalations(data)
                }
            })
    }, [])

    const [selectedEscalation, setSelectedEscalation] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast } = useToast();

    // User Selection Dialog State
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [userDialogTarget, setUserDialogTarget] = useState<any>(null);

    const CURRENT_USER = "Sarah Chen"; // Mock current user
    const MOCK_USER_ID = process.env.NEXT_PUBLIC_MOCK_USER_ID || 'sarah-chen-uuid';

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            case 'high': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    const getSLAStatus = (deadline: Date) => {
        const now = new Date();
        const diff = deadline.getTime() - now.getTime();
        if (diff < 0) return { label: 'Breached', color: 'text-rose-500' };
        if (diff < 1000 * 60 * 20) return { label: 'Breach Risk', color: 'text-amber-500' };
        return { label: 'On Track', color: 'text-emerald-500' };
    };

    const getTimeSince = (date: Date) => {
        const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
        return `${diff}m`;
    };

    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [activeAssignMenuId, setActiveAssignMenuId] = useState<string | null>(null);
    const [isReasonFilterOpen, setIsReasonFilterOpen] = useState(false);
    const [selectedReasons, setSelectedReasons] = useState<Set<string>>(new Set());
    const [isPriorityFilterOpen, setIsPriorityFilterOpen] = useState(false);
    const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(new Set());

    // Reason Categories
    const reasonCategories = {
        "SLA & Time": ["sla_breach_risk", "sla_breached"],
        "Sentiment": ["negative_sentiment", "hostile_language", "complaint_detected"],
        "AI / System": ["ai_confidence_low", "classification_failed", "ambiguous_request"],
        "Business Critical": ["payment_or_billing_issue", "legal_or_compliance", "service_outage"],
        "Human Signals": ["explicit_human_request", "previous_ai_failed"]
    };

    const priorities = ["critical", "high", "medium", "low"];

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (activeMenuId && !(e.target as Element).closest('.action-menu')) {
                setActiveMenuId(null);
            }
            if (activeAssignMenuId && !(e.target as Element).closest('.assign-menu')) {
                setActiveAssignMenuId(null);
            }
            if (isReasonFilterOpen && !(e.target as Element).closest('.reason-filter')) {
                setIsReasonFilterOpen(false);
            }
            if (isPriorityFilterOpen && !(e.target as Element).closest('.priority-filter')) {
                setIsPriorityFilterOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeMenuId, activeAssignMenuId, isReasonFilterOpen, isPriorityFilterOpen]);

    const handleAction = async (action: string, item: any, payload: any = {}) => {
        // Prompt for required inputs
        if (action === 'escalate_department') {
            const dept = prompt("Enter Department ID to escalate to:");
            if (!dept) return;
            payload.departmentId = dept;
        } else if (action === 'snooze') {
            const minutes = prompt("Snooze for how many minutes?", "60");
            if (!minutes) return;
            payload.until = new Date(Date.now() + parseInt(minutes) * 60000).toISOString();
        } else if (action === 'ai_override') {
            const reason = prompt("Enter new escalation reason:");
            if (!reason) return;
            payload.reason = reason;
        }

        try {
            const response = await fetch('/api/escalations/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    eventId: item.id,
                    payload
                })
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error || 'Action failed');

            showToast(result.message || `Action ${action} completed`, 'success');

            // Refresh data
            const res = await fetch('/api/escalations');
            const json = await res.json();
            if (json.data) {
                const data = json.data.map((item: any) => ({
                    ...item,
                    escalatedAt: new Date(item.escalatedAt),
                    slaDeadline: new Date(item.slaDeadline),
                    assignedTo: item.assignedTo,
                    assignedToId: item.assignedToId
                }));
                setEscalations(data);
                setSelectedEscalation(null); // Close panel
                setActiveMenuId(null); // Close menu
                setActiveAssignMenuId(null); // Close assign menu
            }
        } catch (error: any) {
            console.error('Action error:', error);
            showToast(error.message || 'Failed to perform action', 'error');
        }
    };

    const toggleReason = (reason: string) => {
        const newSelected = new Set(selectedReasons);
        if (newSelected.has(reason)) {
            newSelected.delete(reason);
        } else {
            newSelected.add(reason);
        }
        setSelectedReasons(newSelected);
    };

    const toggleCategory = (category: string) => {
        const categoryReasons = reasonCategories[category as keyof typeof reasonCategories];
        const allSelected = categoryReasons.every(r => selectedReasons.has(r));

        const newSelected = new Set(selectedReasons);
        if (allSelected) {
            categoryReasons.forEach(r => newSelected.delete(r));
        } else {
            categoryReasons.forEach(r => newSelected.add(r));
        }
        setSelectedReasons(newSelected);
    };

    const togglePriority = (priority: string) => {
        const newSelected = new Set(selectedPriorities);
        if (newSelected.has(priority)) {
            newSelected.delete(priority);
        } else {
            newSelected.add(priority);
        }
        setSelectedPriorities(newSelected);
    };

    const filteredEscalations = escalations.filter(e => {
        const matchesSearch = e.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.reason.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesReason = selectedReasons.size === 0 || selectedReasons.has(e.reason);
        const matchesPriority = selectedPriorities.size === 0 || selectedPriorities.has(e.priority.toLowerCase());

        return matchesSearch && matchesReason && matchesPriority;
    });

    return (
        <div className="flex flex-col gap-8 relative min-h-[600px]">
            {/* Header & Stats */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Escalation Queue</h2>
                    <p className="text-zinc-500">Manage high-priority events requiring human intervention.</p>
                </div>
                <div className="flex gap-6">
                    <div className="text-right">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Unassigned</div>
                        <div className="text-2xl font-bold text-rose-500">
                            {escalations.filter(e => e.assignedTo === 'Unassigned').length}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Stuck {'>'} 30m</div>
                        <div className="text-2xl font-bold text-amber-500">
                            {escalations.filter(e => (Date.now() - e.escalatedAt.getTime()) > 1000 * 60 * 30).length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search escalations..."
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Reason Filter */}
                <div className="relative reason-filter">
                    <button
                        className={cn(
                            "flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors",
                            isReasonFilterOpen && "border-emerald-500/50 ring-2 ring-emerald-500/10"
                        )}
                        onClick={() => {
                            setIsReasonFilterOpen(!isReasonFilterOpen);
                            setIsPriorityFilterOpen(false);
                        }}
                    >
                        <Filter size={16} />
                        Reason
                        {selectedReasons.size > 0 && (
                            <span className="bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {selectedReasons.size}
                            </span>
                        )}
                    </button>

                    {isReasonFilterOpen && (
                        <div className="absolute top-full mt-2 left-0 w-64 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 p-2 max-h-[400px] overflow-y-auto">
                            {Object.entries(reasonCategories).map(([category, reasons]) => {
                                const allSelected = reasons.every(r => selectedReasons.has(r));
                                const someSelected = reasons.some(r => selectedReasons.has(r));

                                return (
                                    <div key={category} className="mb-2 last:mb-0">
                                        <div
                                            className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-900 rounded-lg cursor-pointer group"
                                            onClick={() => toggleCategory(category)}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                                allSelected ? "bg-emerald-500 border-emerald-500" :
                                                    someSelected ? "bg-emerald-500/50 border-emerald-500" : "border-zinc-700 group-hover:border-zinc-500"
                                            )}>
                                                {allSelected && <CheckCircle2 size={10} className="text-black" />}
                                                {!allSelected && someSelected && <div className="w-2 h-2 bg-black rounded-sm" />}
                                            </div>
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{category}</span>
                                        </div>
                                        <div className="pl-4 space-y-1 mt-1">
                                            {reasons.map(reason => (
                                                <div
                                                    key={reason}
                                                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-900 rounded-lg cursor-pointer group"
                                                    onClick={() => toggleReason(reason)}
                                                >
                                                    <div className={cn(
                                                        "w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors",
                                                        selectedReasons.has(reason) ? "bg-emerald-500 border-emerald-500" : "border-zinc-700 group-hover:border-zinc-500"
                                                    )}>
                                                        {selectedReasons.has(reason) && <CheckCircle2 size={10} className="text-black" />}
                                                    </div>
                                                    <span className="text-sm text-zinc-300">{reason.replace(/_/g, ' ')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Priority Filter */}
                <div className="relative priority-filter">
                    <button
                        className={cn(
                            "flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors",
                            isPriorityFilterOpen && "border-emerald-500/50 ring-2 ring-emerald-500/10"
                        )}
                        onClick={() => {
                            setIsPriorityFilterOpen(!isPriorityFilterOpen);
                            setIsReasonFilterOpen(false);
                        }}
                    >
                        <ShieldAlert size={16} />
                        Priority
                        {selectedPriorities.size > 0 && (
                            <span className="bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {selectedPriorities.size}
                            </span>
                        )}
                    </button>

                    {isPriorityFilterOpen && (
                        <div className="absolute top-full mt-2 right-0 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 p-2 overflow-hidden">
                            {priorities.map(priority => (
                                <div
                                    key={priority}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-900 rounded-lg cursor-pointer group"
                                    onClick={() => togglePriority(priority)}
                                >
                                    <div className={cn(
                                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                        selectedPriorities.has(priority) ? "bg-emerald-500 border-emerald-500" : "border-zinc-700 group-hover:border-zinc-500"
                                    )}>
                                        {selectedPriorities.has(priority) && <CheckCircle2 size={12} className="text-black" />}
                                    </div>
                                    <span className="text-sm text-zinc-300 capitalize">{priority}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Escalation Table */}
            <div className="card-gradient glass rounded-2xl border border-zinc-800/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Email Summary</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>SLA</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEscalations.map((item) => {
                            const sla = getSLAStatus(item.slaDeadline);
                            return (
                                <TableRow key={item.id} className="group cursor-pointer" onClick={() => setSelectedEscalation(item)}>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium text-zinc-50 line-clamp-1">{item.summary}</span>
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{item.department}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs text-zinc-400">{item.reason}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                                            getPriorityColor(item.priority)
                                        )}>
                                            {item.priority}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                                                item.assignedTo === 'Unassigned' ? "bg-rose-500/20 text-rose-500" : "bg-zinc-800 text-zinc-400"
                                            )}>
                                                {item.assignedTo === 'Unassigned' ? '?' : item.assignedTo.charAt(0)}
                                            </div>
                                            <span className={cn(
                                                "text-xs",
                                                item.assignedTo === 'Unassigned' ? "text-rose-500 font-medium" : "text-zinc-400"
                                            )}>
                                                {item.assignedTo}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-zinc-500">
                                            <Clock size={12} />
                                            <span className="text-xs">{getTimeSince(item.escalatedAt)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn("text-xs font-bold", sla.color)}>
                                            {sla.label}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                        <div className="flex justify-end gap-2 items-center relative">
                                            <button
                                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                                                title="View Details"
                                                onClick={() => setSelectedEscalation(item)}
                                            >
                                                <ExternalLink size={16} />
                                            </button>

                                            {/* Assignment Dropdown */}
                                            <div className="relative assign-menu">
                                                <button
                                                    className={cn(
                                                        "p-2 hover:bg-zinc-800 rounded-lg transition-colors",
                                                        item.assignedToId === MOCK_USER_ID ? "text-zinc-600 cursor-not-allowed" : "text-emerald-500"
                                                    )}
                                                    title={item.assignedToId === MOCK_USER_ID ? "Assigned to you" : "Assign / Reassign"}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (item.assignedToId !== MOCK_USER_ID) {
                                                            setActiveAssignMenuId(activeAssignMenuId === item.id ? null : item.id);
                                                            setActiveMenuId(null); // Close other menu
                                                        }
                                                    }}
                                                    disabled={item.assignedToId === MOCK_USER_ID}
                                                >
                                                    {item.assignedToId === MOCK_USER_ID ? <CheckCircle2 size={16} /> : <UserPlus size={16} />}
                                                </button>

                                                {activeAssignMenuId === item.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col">
                                                        {item.assignedTo === 'Unassigned' ? (
                                                            <>
                                                                <button
                                                                    className="px-4 py-3 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors border-b border-zinc-900"
                                                                    onClick={(e) => { e.stopPropagation(); handleAction('assign', item, { assigneeId: MOCK_USER_ID }); }}
                                                                >
                                                                    Assign to me
                                                                </button>
                                                                <button
                                                                    className="px-4 py-3 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setUserDialogTarget(item);
                                                                        setIsUserDialogOpen(true);
                                                                        setActiveAssignMenuId(null);
                                                                    }}
                                                                >
                                                                    Assign...
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                className="px-4 py-3 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setUserDialogTarget(item);
                                                                    setIsUserDialogOpen(true);
                                                                    setActiveAssignMenuId(null);
                                                                }}
                                                            >
                                                                Reassign
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="relative action-menu">
                                                <button
                                                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === item.id ? null : item.id);
                                                        setActiveAssignMenuId(null); // Close assign menu
                                                    }}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {activeMenuId === item.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col">
                                                        <button
                                                            className="px-4 py-3 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors border-b border-zinc-900"
                                                            onClick={(e) => { e.stopPropagation(); handleAction('escalate_department', item); }}
                                                        >
                                                            Escalate to Team
                                                        </button>
                                                        <button
                                                            className="px-4 py-3 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors border-b border-zinc-900"
                                                            onClick={(e) => { e.stopPropagation(); handleAction('ai_override', item); }}
                                                        >
                                                            Reclassify
                                                        </button>
                                                        <button
                                                            className="px-4 py-3 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors border-b border-zinc-900"
                                                            onClick={(e) => { e.stopPropagation(); handleAction('snooze', item); }}
                                                        >
                                                            Snooze
                                                        </button>
                                                        <button
                                                            className="px-4 py-3 text-left text-sm text-rose-500 hover:bg-rose-500/10 transition-colors"
                                                            onClick={(e) => { e.stopPropagation(); handleAction('false_escalation', item); }}
                                                        >
                                                            Mark False Escalation
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Context Panel (Side Sheet) */}
            {selectedEscalation && (
                <div className="fixed inset-y-0 right-0 w-[450px] bg-zinc-950 border-l border-zinc-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Escalation Details</h3>
                        <button onClick={() => setSelectedEscalation(null)} className="text-zinc-500 hover:text-zinc-50">
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* AI Context */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-500">
                                <AlertCircle size={18} />
                                <span className="text-sm font-bold uppercase tracking-wider">AI Forensics</span>
                            </div>
                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500">Confidence Score</span>
                                    <span className="text-sm font-bold text-emerald-500">{(selectedEscalation.confidence * 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${selectedEscalation.confidence * 100}%` }} />
                                </div>
                                <p className="text-sm text-zinc-300 leading-relaxed italic">
                                    "{selectedEscalation.aiReason}"
                                </p>
                            </div>
                        </div>

                        {/* Email Content */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <MessageSquare size={18} />
                                <span className="text-sm font-bold uppercase tracking-wider">Original Message</span>
                            </div>
                            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                    {selectedEscalation.content}
                                </p>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl">
                                <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Department</div>
                                <div className="text-sm text-zinc-300">{selectedEscalation.department}</div>
                            </div>
                            <div className="p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl">
                                <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Reason</div>
                                <div className="text-sm text-zinc-300">{selectedEscalation.reason}</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="p-6 border-t border-zinc-800 grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleAction('false_escalation', selectedEscalation)}
                            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black py-3 rounded-xl font-bold transition-all"
                        >
                            <CheckCircle2 size={18} />
                            Resolve
                        </button>
                        <button
                            onClick={() => handleAction('assign', selectedEscalation)}
                            className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-50 py-3 rounded-xl font-bold transition-all"
                        >
                            <UserPlus size={18} />
                            {selectedEscalation.assignedTo === 'Unassigned' ? 'Assign to Me' : 'Reassign'}
                        </button>
                    </div>
                </div>
            )}

            {/* User Selection Dialog */}
            <UserSelectionDialog
                isOpen={isUserDialogOpen}
                onClose={() => {
                    setIsUserDialogOpen(false);
                    setUserDialogTarget(null);
                }}
                onSelect={(userId) => {
                    if (userDialogTarget) {
                        handleAction('assign', userDialogTarget, { assigneeId: userId });
                    }
                }}
                currentAssigneeId={userDialogTarget?.assignedToId === 'Unassigned' ? undefined : userDialogTarget?.assignedToId}
                title={userDialogTarget?.assignedToId === 'Unassigned' ? "Assign Escalation" : "Reassign Escalation"}
            />
        </div>
    );
}
