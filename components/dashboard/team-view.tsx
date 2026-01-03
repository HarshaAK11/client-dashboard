"use client";

import React, { useEffect, useState } from 'react';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Shield,
    UserPlus,
    Building2
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
import { GSAPButton } from '@/components/ui/gsap-button';
import { useAuth } from '@/contexts/UserContext';
import { permissions } from '@/lib/permissions';

export default function TeamView() {
    const { user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch('/api/team')
            .then(res => res.json())
            .then(json => {
                if (json.data) {
                    setUsers(json.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching team:', err);
                setLoading(false);
            });
    }, []);

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
                    <p className="text-zinc-500">Manage your organization's users and their roles.</p>
                </div>
                {user && permissions.canManageUsers(user.role) && (
                    <GSAPButton variant="primary">
                        <UserPlus size={18} />
                        Invite Member
                    </GSAPButton>
                )}
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
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-zinc-500">
                                    Loading team members...
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-zinc-500">
                                    No team members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-zinc-400 font-bold">{user.full_name.charAt(0)}</span>
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
                                            <span className="capitalize text-sm">{user.role}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Building2 size={14} />
                                            <span className="text-sm">{user.department_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-500 text-sm">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
                                            <MoreVertical size={18} />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div >
    );
}
