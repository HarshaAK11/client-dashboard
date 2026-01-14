"use client";

import React, { useState, useEffect } from 'react';
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
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userData, setUserData] = useState<{
        email: string;
        fullName: string;
        role: string;
        tenantName: string;
    } | null>(null);

    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        async function loadUserData() {
            // TEMP AUTH WORKAROUND – Fetch user data from database using mock user ID
            const mockUserId = process.env.NEXT_PUBLIC_MOCK_USER_ID;
            const mockTenantId = process.env.NEXT_PUBLIC_MOCK_TENANT_ID;

            if (mockUserId && mockTenantId) {
                try {
                    // Fetch user profile from database
                    const { data: profile, error: profileError } = await supabase
                        .from('users')
                        .select('full_name, email, role, tenant_id, department_id')
                        .eq('id', mockUserId)
                        .single();

                    if (profileError) {
                        console.error('Error fetching user profile:', profileError);
                        return;
                    }

                    if (profile) {
                        // Fetch tenant name
                        const { data: tenant, error: tenantError } = await supabase
                            .from('tenants')
                            .select('name')
                            .eq('id', profile.tenant_id)
                            .single();

                        if (tenantError) {
                            console.error('Error fetching tenant:', tenantError);
                        }

                        setUserData({
                            email: profile.email || '',
                            fullName: profile.full_name || 'User',
                            role: profile.role || 'agent',
                            tenantName: tenant?.name || 'Unknown Tenant'
                        });
                    }
                } catch (error) {
                    console.error('Error loading user data:', error);
                }
            }
        }

        loadUserData();
    }, [supabase]);


    const navigation = [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Escalations', icon: ShieldAlert },
        { name: 'Team', icon: Users },
        /*{ name: 'Analytics', icon: Activity },
        { name: 'Settings', icon: Settings },*/
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <header className="h-12 border-b border-zinc-800/50 glass flex items-center px-6 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Image src="/logo.png" alt="Logo" width={32} height={32} />
                    <span className='text-zinc-600'>/</span>
                    <span className="text-sm font-medium text-zinc-200">{userData?.tenantName || 'Loading...'}</span>
                    <span className='text-zinc-600'>/</span>
                    <span className="text-sm font-medium">{userData?.email || 'Loading...'}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-medium text-zinc-50">{userData?.fullName || 'User'}</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{userData?.role || 'role'}</span>
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
                        {navigation.map((item) => (
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

                    <div className="p-4 border-t border-zinc-800/50">
                        <button
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 w-full rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            )}
                        >
                            <LogOut className="w-5 h-5" />
                            {isSidebarOpen && <span className="text-sm font-medium">Logout (Disabled)</span>}
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
