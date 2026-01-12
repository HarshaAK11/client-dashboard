"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useToast } from '@/components/ui/toast';
import { isDevMode } from '@/lib/dev-auth';
import Image from 'next/image';

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
    const router = useRouter();
    const { user, devOverrideRole, signOut } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const isDev = isDevMode;

    const { showToast } = useToast();

    const navigation = [
        { name: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'agent'] },
        { name: 'Escalations', icon: ShieldAlert, roles: ['admin', 'manager'] },
        { name: 'Team', icon: Users, roles: ['admin', 'manager'] },
        { name: 'Analytics', icon: Activity, roles: ['admin', 'manager'] },
        { name: 'Events', icon: Mail, roles: ['agent'] },
        { name: 'Settings', icon: Settings, roles: ['admin', 'agent'] },
    ];

    function showAccessDeniedToast(viewName: string, role?: string) {
        showToast(`Access denied: ${role ?? 'unknown'} cannot access ${viewName}. You have been signed out.`, 'error');
    }

    const filteredNav = navigation.filter(item => user?.role && item.roles.includes(user.role));

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="h-12 border-b border-zinc-800/50 glass flex items-center px-6 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Image src="/logo.png" alt="Logo" width={32} height={32} />
                    <span className='text-zinc-600'>/</span>
                    <span className="text-sm font-medium text-zinc-200">{user?.tenant_name || 'Tenant'}</span>
                    <span className='text-zinc-600'>/</span>
                    <span className="text-sm font-medium">{user?.email}</span>
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

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className={cn(
                    "border-r border-zinc-800/50 glass transition-all duration-300 flex flex-col",
                    isSidebarOpen ? "w-64" : "w-20"
                )}>

                    <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
                        {filteredNav.map((item) => (
                            <button
                                key={item.name}
                                onClick={async () => {
                                    // Enforce strict RBAC: only allow navigation if current authenticated role is allowed
                                    if (!user || !item.roles.includes(user.role)) {
                                        // Show message, sign out and redirect to login
                                        try {
                                            // Use toast if available
                                            // eslint-disable-next-line @typescript-eslint/no-use-before-define
                                            showAccessDeniedToast && showAccessDeniedToast(item.name, user?.role);
                                        } catch (e) {
                                            // ignore
                                        }
                                        setLoggingOut(true);
                                        try {
                                            await signOut();
                                        } catch (e) {
                                            console.error('Error signing out on unauthorized access', e);
                                        }
                                        setLoggingOut(false);
                                        router.push('/login');
                                        return;
                                    }

                                    onViewChange(item.name);
                                }}
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
                    {isDev && devOverrideRole ? (
                        <div className="p-4 border-t border-zinc-800/50 flex flex-col gap-2">
                            {isSidebarOpen && <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold px-2">Dev Mode - Role Switcher</span>}
                            <div className={cn("flex flex-col gap-1", !isSidebarOpen && "items-center")}>
                                {(['admin', 'manager', 'agent'] as Role[]).map((role) => (
                                    <button
                                        key={role}
                                        onClick={async () => {
                                            // Prevent switching to a different role without re-authenticating
                                            if (role !== user?.role) {
                                                showToast('You must sign in with the correct role credentials to switch dashboards. Signing out now.', 'error');
                                                setLoggingOut(true);
                                                try {
                                                    await signOut();
                                                } catch (e) {
                                                    console.error('Error signing out on role change attempt', e);
                                                }
                                                setLoggingOut(false);
                                                router.push('/login');
                                                return;
                                            }

                                            // No-op if it's the same role
                                            if (devOverrideRole) devOverrideRole(role);
                                        }}
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
                    ) : isDev && !user ? (
                        <div className="p-4 border-t border-zinc-800/50">
                            <div className="text-xs text-zinc-500">Sign in to enable the Dev Mode role switcher</div>
                        </div>
                    ) : null}

                    <div className="p-4 border-t border-zinc-800/50">
                        <button
                            onClick={async () => {
                                setLoggingOut(true);
                                try {
                                    await signOut();
                                    router.push('/login');
                                } catch (e) {
                                    console.error('Logout failed', e);
                                } finally {
                                    setLoggingOut(false);
                                }
                            }}
                            disabled={loggingOut}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 w-full rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all",
                                loggingOut && 'opacity-60 cursor-wait'
                            )}
                        >
                            <LogOut className="w-5 h-5" />
                            {isSidebarOpen && <span className="text-sm font-medium">{loggingOut ? 'Logging out...' : 'Logout'}</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden w-full">
                    <div className="flex-1 overflow-y-auto p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
