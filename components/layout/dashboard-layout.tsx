"use client";

import React, { useState } from 'react';
import {
    LayoutDashboard,
    ShieldAlert,
    Users,
    Settings,
    LogOut,
    Mail,
    Activity,
    UserCircle
} from 'lucide-react';
import { cn } from '@/components/ui/dashboard-components';
import { useAuth, Role } from '@/contexts/UserContext';

interface DashboardLayoutProps {
    children: React.ReactNode;
    currentView: string;
    onViewChange: (view: string) => void;
}

export default function DashboardLayout({
    children,
    currentView,
    onViewChange
}: DashboardLayoutProps) {
    const { user, devOverrideRole } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

    const navigation = [
        { name: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'agent'] },
        { name: 'Escalations', icon: ShieldAlert, roles: ['admin', 'manager'] },
        { name: 'Team', icon: Users, roles: ['admin', 'manager'] },
        { name: 'Analytics', icon: Activity, roles: ['admin', 'manager'] },
        { name: 'Events', icon: Mail, roles: ['agent'] },
        { name: 'Settings', icon: Settings, roles: ['admin', 'agent'] },
    ];

    const filteredNav = navigation.filter(item => user?.role && item.roles.includes(user.role));

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 flex">
            {/* Sidebar */}
            <aside className={cn(
                "border-r border-zinc-800/50 glass transition-all duration-300 flex flex-col",
                isSidebarOpen ? "w-64" : "w-20"
            )}>
                <div className="p-6 flex items-center gap-3">
                    {isSidebarOpen && <span className="font-bold tracking-tight text-lg">Stemlyn</span>}
                </div>

                <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
                    {filteredNav.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => onViewChange(item.name)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all group",
                                currentView === item.name
                                    ? "bg-zinc-50 text-zinc-950"
                                    : "hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-50"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                        </button>
                    ))}
                </nav>


                {/* Role Switcher (Development Mode Only) */}
                {isDev && devOverrideRole && (
                    <div className="p-4 border-t border-zinc-800/50 flex flex-col gap-2">
                        {isSidebarOpen && <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold px-2">Dev Mode - Role Switcher</span>}
                        <div className={cn("flex flex-col gap-1", !isSidebarOpen && "items-center")}>
                            {(['admin', 'manager', 'agent'] as Role[]).map((role) => (
                                <button
                                    key={role}
                                    onClick={() => devOverrideRole(role)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                                        user?.role === role
                                            ? "bg-emerald-500 text-black font-bold"
                                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                                    )}
                                >
                                    {isSidebarOpen ? role : role[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="p-4 border-t border-zinc-800/50">
                    <button className={cn(
                        "flex items-center gap-3 px-3 py-2 w-full rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    )}>
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b border-zinc-800/50 glass flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-medium text-zinc-400 capitalize">{user?.role || 'User'} Dashboard</h2>
                        {isDev && <span className="text-[10px] px-2 py-1 rounded bg-amber-500/10 text-amber-500 font-bold uppercase tracking-wider">Dev Mode</span>}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-medium text-zinc-50">{user?.full_name || 'User'}</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{user?.role || 'guest'}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                            <UserCircle className="w-5 h-5 text-zinc-400" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
