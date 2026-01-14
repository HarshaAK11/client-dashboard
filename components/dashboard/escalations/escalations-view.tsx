"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    MessageSquare,
    InboxIcon
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
import { UserSelectionDialog } from '@/components/dialogs/user-selection-dialog';
import { DepartmentSelectionDialog } from '@/components/dialogs/department-selection-dialog';
import { ConfirmationDialog } from '@/components/dialogs/confirm-dialog';
import { GSAPButton } from '@/components/ui/gsap-button';
import { gsapAnimations } from '@/lib/gsap-animations';
import gsap from 'gsap';
import { useEscalations } from '@/hooks/useEscalations';
import { authFetch } from '@/lib/api-client';

const GSAPMenu = ({
    isOpen,
    children,
    className
}: {
    isOpen: boolean;
    children: React.ReactNode;
    className?: string;
}) => {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
        } else if (shouldRender) {
            if (menuRef.current) {
                gsapAnimations.menuOut(menuRef.current, () => setShouldRender(false));
            } else {
                setShouldRender(false);
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (shouldRender && isOpen && menuRef.current) {
            gsapAnimations.menuIn(menuRef.current);
        }
    }, [shouldRender, isOpen]);

    if (!shouldRender) return null;

    return (
        <div ref={menuRef} className={className}>
            {children}
        </div>
    );
};

export default function EscalationsView() {
    // const [escalations, setEscalations] = useState<any[]>([]); // Removed in favor of React Query
    // const [isLoading, setIsLoading] = useState(true); // Removed in favor of React Query
    const [selectedEscalation, setSelectedEscalation] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast } = useToast();
    const { data: rawData, isLoading, refetch } = useEscalations();

    // Transform data
    const escalations = useMemo(() => {
        if (!rawData?.data) return [];
        return rawData.data.map((item: any) => ({
            ...item,
            escalatedAt: new Date(item.escalated_at || item.created_at),
            slaDeadline: new Date(item.sla_deadline || Date.now() + 3600000),
            resolvedAt: item.resolved_at ? new Date(item.resolved_at) : null,
            // Map join fields if they exist, otherwise use IDs
            department: item.departments?.name || item.department_id,
            assignedTo: item.users?.full_name || item.assigned_user_id || 'Unassigned'
        }));
    }, [rawData]);

    // Dialog States
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [userDialogTarget, setUserDialogTarget] = useState<any>(null);
    const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
    const [departmentDialogTarget, setDepartmentDialogTarget] = useState<any>(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmDialogTarget, setConfirmDialogTarget] = useState<any>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Side Panel States
    const [shouldRenderPanel, setShouldRenderPanel] = useState(false);
    const [displayEscalation, setDisplayEscalation] = useState<any>(null);
    const panelBackdropRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // Fetch Data
    // Fetch Data logic removed in favor of React Query hook

    const [activeTab, setActiveTab] = useState<'needs_action' | 'in_progress' | 'resolved'>('needs_action');

    // ... (keep existing useEffects)



    // Sync Side Panel
    useEffect(() => {
        if (selectedEscalation) {
            setDisplayEscalation(selectedEscalation);
            setShouldRenderPanel(true);
        } else if (shouldRenderPanel) {
            if (panelBackdropRef.current && panelRef.current) {
                gsapAnimations.panelOut(panelBackdropRef.current, panelRef.current, () => {
                    setShouldRenderPanel(false);
                    setDisplayEscalation(null);
                });
            } else {
                setShouldRenderPanel(false);
                setDisplayEscalation(null);
            }
        }
    }, [selectedEscalation]);

    useEffect(() => {
        if (shouldRenderPanel && selectedEscalation && panelBackdropRef.current && panelRef.current) {
            gsapAnimations.panelIn(panelBackdropRef.current, panelRef.current);
        }
    }, [shouldRenderPanel, selectedEscalation]);

    useEffect(() => {
        if (selectedEscalation) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedEscalation]);

    // Helpers
    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
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

    // Actions
    const handleAction = async (action: string, item: any, payload: any = {}) => {
        if (action === 'pending_resolution') {
            setIsActionLoading(true);
            try {
                const response = await authFetch(`/api/emails/events/${item.id}/resolve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Action failed');

                showToast('Resolution intent set. Redirecting to email...', 'success');

                // Provider-aware redirect
                handleRedirect(item);

                await refetch();
                setSelectedEscalation(null);
            } catch (error: any) {
                showToast(error.message || 'Failed to set resolution intent', 'error');
            } finally {
                setIsActionLoading(false);
            }
            return;
        }

        if (action === 'assign_user') {
            setUserDialogTarget(item);
            setIsUserDialogOpen(true);
            return;
        }

        if (action === 'escalate_department') {
            setDepartmentDialogTarget(item);
            setIsDepartmentDialogOpen(true);
            return;
        } else if (action === 'false_escalation') {
            setConfirmDialogTarget(item);
            setIsConfirmDialogOpen(true);
            return;
        } else if (action === 'snooze') {
            const minutes = prompt("Snooze for how many minutes?", "60");
            if (!minutes) return;
            payload.until = new Date(Date.now() + parseInt(minutes) * 60000).toISOString();
        }

        setIsActionLoading(true);
        try {
            const response = await authFetch('/api/escalations/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, eventId: item.id, payload })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Action failed');
            showToast(result.message || `Action ${action} completed`, 'success');
            await refetch();
            setSelectedEscalation(null);
        } catch (error: any) {
            showToast(error.message || 'Failed to perform action', 'error');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRedirect = (item: any) => {
        const { source, externalMessageId, external_thread_id } = item;
        console.log("Redirecting for item:", { source, externalMessageId, external_thread_id });

        let url = '';
        if (source === 'gmail') {
            url = `https://mail.google.com/mail/u/1/#inbox/${external_thread_id}`;
        } else if (source === 'outlook') {
            url = `https://outlook.office.com/mail/deeplink?messageid=${externalMessageId}`;
        }

        if (url) {
            window.open(url, '_blank');
        } else {
            showToast('External link not available', 'error');
        }
    };

    const filteredEscalations = useMemo(() => {
        return (escalations as any[]).filter((item: any) => {
            const matchesSearch = item.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.content?.toLowerCase().includes(searchQuery.toLowerCase());

            if (activeTab === 'needs_action') return matchesSearch && item.current_state === 'needs_attention' && !item.pending_resolution;
            if (activeTab === 'in_progress') return matchesSearch && (item.current_state === 'in_progress' || item.pending_resolution);
            if (activeTab === 'resolved') return matchesSearch && item.current_state === 'handled' && item.handled_by === 'human';
            return matchesSearch;
        });
    }, [escalations, searchQuery, activeTab]);

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Escalations</h2>
                    <p className="text-zinc-500">Manage high-priority events requiring human intervention.</p>
                </div>
                <div className="flex gap-3">
                    <GSAPButton variant="secondary" className="px-4 py-2">
                        <Filter size={16} />
                        Filters
                    </GSAPButton>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('needs_action')}
                        className={cn(
                            "flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all",
                            activeTab === 'needs_action' ? "bg-zinc-800 text-zinc-50 shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        Needs Action
                    </button>
                    <button
                        onClick={() => setActiveTab('in_progress')}
                        className={cn(
                            "flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all",
                            activeTab === 'in_progress' ? "bg-zinc-800 text-zinc-50 shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        In Progress
                    </button>
                    <button
                        onClick={() => setActiveTab('resolved')}
                        className={cn(
                            "flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all",
                            activeTab === 'resolved' ? "bg-zinc-800 text-zinc-50 shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        Resolved
                    </button>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search escalations..."
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Table */}
            <div className="card-gradient glass rounded-2xl border border-zinc-800/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Escalation</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>SLA Status</TableHead>
                            {activeTab === 'needs_action' && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-zinc-500 text-sm">Loading escalations...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredEscalations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20 text-zinc-500">
                                    No escalations found in this category.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEscalations.map((item: any) => (
                                <TableRow
                                    key={item.id}
                                    className="group cursor-pointer hover:bg-zinc-900/50 transition-colors"
                                    onClick={() => setSelectedEscalation(item)}
                                >
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="font-bold text-zinc-50 group-hover:text-emerald-400 transition-colors line-clamp-1">
                                                {item.subject}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <Clock size={12} />
                                                <span>Escalated {getTimeSince(item.escalatedAt)} ago</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                            getPriorityColor(item.priority)
                                        )}>
                                            {item.priority}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-zinc-400 text-sm">
                                        {item.department}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                                                {item.assignedTo?.charAt(0) || '?'}
                                            </div>
                                            <span className="text-sm text-zinc-300">{item.assignedTo}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className={cn("text-xs font-bold", getSLAStatus(item.slaDeadline).color)}>
                                                {getSLAStatus(item.slaDeadline).label}
                                            </div>
                                            <div className="text-[10px] text-zinc-500">
                                                Due {item.slaDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </TableCell>
                                    {activeTab === 'needs_action' && (
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                <Dropdown>
                                                    <DropdownTrigger>
                                                        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
                                                            <MoreVertical size={18} />
                                                        </button>
                                                    </DropdownTrigger>
                                                    <DropdownContent>
                                                        {item.pending_resolution ? (
                                                            <DropdownItem onClick={() => handleRedirect(item)}>
                                                                Go to Mail
                                                            </DropdownItem>
                                                        ) : (
                                                            <>
                                                                <DropdownItem onClick={() => handleAction('assign_user', item)}>
                                                                    Assign User
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => handleAction('escalate_department', item)}>
                                                                    Re-route Department
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => handleAction('false_escalation', item)}>
                                                                    Mark as False Escalation
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => handleAction('snooze', item)}>
                                                                    Snooze
                                                                </DropdownItem>
                                                            </>
                                                        )}
                                                    </DropdownContent>
                                                </Dropdown>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Side Panel (Detail View) */}
            {shouldRenderPanel && displayEscalation && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        ref={panelBackdropRef}
                        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
                        onClick={() => setSelectedEscalation(null)}
                    />
                    <div
                        ref={panelRef}
                        className="relative w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col h-full"
                    >
                        {/* Panel Header */}
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-xl",
                                    displayEscalation.priority === 'critical' ? "bg-rose-500/10 text-rose-500" : "bg-zinc-800 text-zinc-400"
                                )}>
                                    <ShieldAlert size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-50">Escalation Detail</h3>
                                    <p className="text-xs text-zinc-500">ID: {displayEscalation.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedEscalation(null)}
                                className="p-2 hover:bg-zinc-900 rounded-xl transition-colors text-zinc-500"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Summary Card */}
                            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-4">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-lg font-bold text-zinc-50">{displayEscalation.subject}</h4>
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                        getPriorityColor(displayEscalation.priority)
                                    )}>
                                        {displayEscalation.priority}
                                    </span>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    {displayEscalation.content}
                                </p>
                            </div>

                            {/* AI Forensics */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-zinc-50 font-bold">
                                    <Info size={18} className="text-blue-500" />
                                    AI Forensics & Escalation Reason
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                                        <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Confidence Score</div>
                                        <div className="text-xl font-bold text-emerald-500">{(displayEscalation.confidence * 100).toFixed(1)}%</div>
                                    </div>
                                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                                        <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Sentiment</div>
                                        <div className="text-xl font-bold text-blue-500">Neutral</div>
                                    </div>
                                </div>
                                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                    <div className="text-xs font-bold text-amber-500 mb-2 uppercase tracking-tight">Escalation Trigger</div>
                                    <p className="text-sm text-zinc-300 italic">
                                        "{displayEscalation.aiReason}"
                                    </p>
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Assignment</div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-400">
                                            {displayEscalation.assignedTo?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-zinc-50">{displayEscalation.assignedTo}</div>
                                            <div className="text-xs text-zinc-500">{displayEscalation.department}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {displayEscalation.current_state === 'handled' ? (
                                        <>
                                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Resolution Time</div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                                    <CheckCircle2 size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-emerald-500">Resolved</div>
                                                    <div className="text-xs text-zinc-500">
                                                        {displayEscalation.resolvedAt?.toLocaleString() || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">SLA Deadline</div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <div className={cn("text-sm font-bold", getSLAStatus(displayEscalation.slaDeadline).color)}>
                                                        {getSLAStatus(displayEscalation.slaDeadline).label}
                                                    </div>
                                                    <div className="text-xs text-zinc-500">
                                                        {displayEscalation.slaDeadline.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Panel Footer */}
                        {displayEscalation.current_state !== 'handled' && (
                            <div className="p-6 border-t border-zinc-800 bg-zinc-900/30">
                                {displayEscalation.pending_resolution ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                                <Clock size={20} className="animate-pulse" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-emerald-500">In Processing</div>
                                                <div className="text-xs text-zinc-500">This email is currently being handled by a team member.</div>
                                            </div>
                                        </div>
                                        <GSAPButton
                                            variant="primary"
                                            className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                                            onClick={() => handleRedirect(displayEscalation)}
                                        >
                                            <ExternalLink size={20} />
                                            Go to Mail
                                        </GSAPButton>
                                    </div>
                                ) : (
                                    <div className="flex gap-4">
                                        <GSAPButton
                                            variant="primary"
                                            className="flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                                            onClick={() => handleAction('pending_resolution', displayEscalation)}
                                            disabled={isActionLoading}
                                        >
                                            {isActionLoading ? (
                                                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <MessageSquare size={20} />
                                                    Respond & Resolve
                                                </>
                                            )}
                                        </GSAPButton>
                                        <GSAPButton
                                            variant="secondary"
                                            className="p-4 rounded-xl"
                                            onClick={() => handleAction('assign_user', displayEscalation)}
                                        >
                                            <UserPlus size={20} />
                                        </GSAPButton>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Dialogs */}
            <UserSelectionDialog
                isOpen={isUserDialogOpen}
                onClose={() => setIsUserDialogOpen(false)}
                onSelect={(userId) => handleAction('assign', userDialogTarget, { userId })}
                currentAssigneeId={userDialogTarget?.assigned_user_id}
                title={`Assign ${userDialogTarget?.subject}`}
            />

            <DepartmentSelectionDialog
                isOpen={isDepartmentDialogOpen}
                onClose={() => setIsDepartmentDialogOpen(false)}
                onSelect={(deptId) => handleAction('escalate_department', departmentDialogTarget, { departmentId: deptId })}
                title={`Route to Department`}
            />

            <ConfirmationDialog
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={() => handleAction('false_escalation', confirmDialogTarget)}
                title="Mark as False Escalation?"
                description="This will resolve the escalation and train the AI that this was a mistake. Are you sure?"
                isLoading={isActionLoading}
            />
        </div>
    );
}

// Helper components
const Dropdown = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, { isOpen, setIsOpen });
                }
                return child;
            })}
        </div>
    );
};

const DropdownTrigger = ({ children, isOpen, setIsOpen }: any) => {
    return React.cloneElement(children, {
        onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
        }
    });
};

const DropdownContent = ({ children, isOpen, setIsOpen }: any) => {
    return (
        <GSAPMenu
            isOpen={isOpen}
            className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 py-2 overflow-hidden"
        >
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    const childProps = child.props as any;
                    return React.cloneElement(child as React.ReactElement<any>, {
                        onClick: (e: any) => {
                            childProps.onClick?.(e);
                            setIsOpen(false);
                        }
                    });
                }
                return child;
            })}
        </GSAPMenu>
    );
};

const DropdownItem = ({ children, onClick, destructive }: any) => {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick?.(e);
            }}
            className={cn(
                "w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-zinc-800",
                destructive ? "text-rose-500" : "text-zinc-300"
            )}
        >
            {children}
        </button>
    );
};
