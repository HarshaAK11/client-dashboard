"use client";

import React, { useState } from 'react';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Shield,
    UserPlus,
    Building2,
    MoreHorizontal
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
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '@/components/ui/dropdown';
import { GSAPButton } from '@/components/ui/gsap-button';
import { useUsers } from '@/hooks/useUsers';
import { authFetch } from '@/lib/api-client';
import { ConfirmationDialog } from '@/components/dialogs/confirm-dialog';
import { RoleSelectionDialog } from '@/components/dialogs/role-selection-dialog';
import { DepartmentSelectionDialog } from '@/components/dialogs/department-selection-dialog';
import { InviteMemberDialog } from '@/components/dialogs/invite-member-dialog';
import { useToast } from '@/components/ui/toast';

export default function TeamView() {
    const currentUser = { role: 'admin' };
    const [searchQuery, setSearchQuery] = useState('');
    const { data: rawData, isLoading: loading, refetch } = useUsers();
    const { showToast } = useToast();
    const users = rawData?.data || [];

    // Dialog States
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{
        type: 'role' | 'department';
        value: string;
        label?: string;
    } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

    const filteredUsers = users.filter((user: any) =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRoleClick = (user: any) => {
        if (currentUser?.role !== 'admin') return;
        setSelectedUser(user);
        setIsRoleDialogOpen(true);
    };

    const handleDeptClick = (user: any) => {
        if (currentUser?.role !== 'admin') return;
        setSelectedUser(user);
        setIsDeptDialogOpen(true);
    };

    const onRoleSelect = (roleId: string) => {
        setPendingAction({ type: 'role', value: roleId, label: roleId.charAt(0).toUpperCase() + roleId.slice(1) });
        setIsConfirmDialogOpen(true);
    };

    const onDeptSelect = (deptId: string) => {
        setPendingAction({ type: 'department', value: deptId });
        setIsConfirmDialogOpen(true);
    };

    const executeAction = async () => {
        if (!selectedUser || !pendingAction) return;

        setIsProcessing(true);
        try {
            const updates: any = {};
            if (pendingAction.type === 'role') {
                updates.role = pendingAction.value;
            } else {
                updates.department_id = pendingAction.value;
            }

            const res = await authFetch(`/api/users/${selectedUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!res.ok) throw new Error('Failed to update user');

            showToast(`User ${pendingAction.type} updated successfully`, 'success');
            refetch();
        } catch (error) {
            console.error('Update failed:', error);
            showToast('Failed to update user', 'error');
        } finally {
            setIsProcessing(false);
            setIsConfirmDialogOpen(false);
            setPendingAction(null);
            setSelectedUser(null);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
                    <p className="text-zinc-500">Manage your organization's users and their roles.</p>
                </div>
                <GSAPButton variant="primary" onClick={() => setIsInviteDialogOpen(true)}>
                    <UserPlus size={18} />
                    Invite Member
                </GSAPButton>
            </div>

            {/* Filters & Search */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <GSAPButton variant="secondary" className="px-4 py-2.5">
                    <Filter size={16} />
                    Filters
                </GSAPButton>
            </div>

            {/* Users Table */}
            <div className="card-gradient glass rounded-2xl border border-zinc-800/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Joined</TableHead>
                            {currentUser?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={currentUser?.role === 'admin' ? 5 : 4} className="text-center py-12 text-zinc-500">
                                    Loading team members...
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={currentUser?.role === 'admin' ? 5 : 4} className="text-center py-12 text-zinc-500">
                                    No team members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user: any) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-zinc-400 font-bold">{user.full_name?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-zinc-50">{user.full_name}</div>
                                                <div className="text-xs text-zinc-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Shield size={14} className={cn(
                                                user.role === 'admin' ? "text-rose-500" :
                                                    user.role === 'manager' ? "text-amber-500" : "text-emerald-500"
                                            )} />
                                            <span
                                                onClick={() => handleRoleClick(user)}
                                                className={cn(
                                                    "text-xs font-medium px-2 py-1 rounded-full uppercase tracking-wide transition-opacity",
                                                    currentUser?.role === 'admin' ? "cursor-pointer hover:opacity-80" : "cursor-default",
                                                    user.role === 'admin' ? "bg-purple-500/10 text-purple-500" :
                                                        user.role === 'manager' ? "bg-amber-500/10 text-amber-500" :
                                                            "bg-blue-500/10 text-blue-500"
                                                )}
                                            >
                                                {user.role}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div
                                            onClick={() => handleDeptClick(user)}
                                            className={cn(
                                                "flex items-center gap-2 text-zinc-400 transition-colors",
                                                currentUser?.role === 'admin' ? "cursor-pointer hover:text-zinc-200" : "cursor-default"
                                            )}
                                        >
                                            <Building2 size={14} />
                                            <span className="text-sm">{user.department_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-500 text-sm">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </TableCell>
                                    {currentUser?.role === 'admin' && (
                                        <TableCell className="text-right">
                                            <Dropdown>
                                                <DropdownTrigger>
                                                    <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </DropdownTrigger>
                                                <DropdownContent>
                                                    <DropdownItem onClick={() => handleRoleClick(user)}>
                                                        Change Role
                                                    </DropdownItem>
                                                    <DropdownItem onClick={() => handleDeptClick(user)}>
                                                        Change Department
                                                    </DropdownItem>
                                                    <DropdownItem destructive onClick={() => console.log('Deactivate', user.id)}>
                                                        Deactivate member
                                                    </DropdownItem>
                                                </DropdownContent>
                                            </Dropdown>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <RoleSelectionDialog
                isOpen={isRoleDialogOpen}
                onClose={() => setIsRoleDialogOpen(false)}
                onSelect={onRoleSelect}
                currentRole={selectedUser?.role}
                title={`Change Role for ${selectedUser?.full_name}`}
            />

            <DepartmentSelectionDialog
                isOpen={isDeptDialogOpen}
                onClose={() => setIsDeptDialogOpen(false)}
                onSelect={onDeptSelect}
                currentDepartmentId={selectedUser?.department_id}
                title={`Change Department for ${selectedUser?.full_name}`}
                allowCurrentSelection={true}
            />

            <ConfirmationDialog
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={executeAction}
                title={`Confirm ${pendingAction?.type === 'role' ? 'Role' : 'Department'} Change`}
                description={`Are you sure you want to change ${selectedUser?.full_name}'s ${pendingAction?.type} to ${pendingAction?.label || 'the selected department'}?`}
                isLoading={isProcessing}
                variant="primary"
                confirmLabel="Confirm Change"
            />

            <InviteMemberDialog
                isOpen={isInviteDialogOpen}
                onClose={() => setIsInviteDialogOpen(false)}
                onSuccess={() => refetch()}
            />
        </div>
    );
}