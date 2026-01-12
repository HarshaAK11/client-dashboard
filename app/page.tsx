"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import UnifiedDashboard from '@/components/dashboard/unified-dashboard';
import TeamView from '@/components/dashboard/team-view';
import AnalyticsView from '@/components/dashboard/analytics-view';
import EscalationsView from '@/components/dashboard/escalations-view';
import SettingsView from '@/components/dashboard/settings-view';
import { useAuth } from '@/contexts/UserContext';
import { createSupabaseBrowserClient } from '@/lib/supabase';

// Initialize browser client for the dashboard guard
const supabase = createSupabaseBrowserClient();
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';

export default function Home() {
  const [view, setView] = useState('Dashboard');
  const { user, signOut, loading } = useAuth();

  const router = useRouter();
  const { showToast } = useToast();

  const viewRoleMap: Record<string, string[]> = {
    'Dashboard': ['admin', 'manager', 'agent'],
    'Escalations': ['admin', 'manager'],
    'Team': ['admin', 'manager'],
    'Analytics': ['admin', 'manager'],
    'Events': ['agent'],
    'Settings': ['admin', 'agent'],
  };

  // GUARD: Ensure user is authenticated and has completed onboarding
  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;

      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login');
        return;
      }

      // Check if user needs password setup (onboarding)
      const isInvitedWithoutPassword =
        authUser.user_metadata?.invited_at &&
        !authUser.user_metadata?.password_set;

      if (isInvitedWithoutPassword) {
        router.push('/setup-password');
        return;
      }
    };

    checkAuth();
  }, [user, loading, router]);

  // Enforce strict RBAC: if the current view is not allowed for the signed-in user, sign out and redirect
  useEffect(() => {
    if (!user) return;
    const allowed = viewRoleMap[view] ?? ['admin', 'manager', 'agent'];
    if (!allowed.includes(user.role)) {
      showToast(`Access denied: ${user.role} cannot access ${view}. You will be signed out.`, 'error');
      (async () => {
        try {
          await signOut();
        } catch (e) {
          console.error('Error signing out on unauthorized access', e);
        }
        router.push('/login');
      })();
    }
  }, [user, view]);

  const renderContent = () => {
    if (view === 'Team') {
      return <TeamView />;
    }
    if (view === 'Analytics') {
      return <AnalyticsView />;
    }
    if (view === 'Escalations') {
      return <EscalationsView role={user?.role || 'agent'} />;
    }
    if (view === 'Settings') {
      return <SettingsView />;
    }

    // Default: Dashboard view
    return <UnifiedDashboard />;
  };

  return (
    <DashboardLayout
      currentView={view}
      onViewChange={setView}
    >
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}

