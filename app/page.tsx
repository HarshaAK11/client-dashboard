"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import UnifiedDashboard from '@/components/dashboard/unified-dashboard';
import TeamView from '@/components/dashboard/team-view';
import AnalyticsView from '@/components/dashboard/analytics-view';
import EscalationsView from '@/components/dashboard/escalations-view';
import SettingsView from '@/components/dashboard/settings-view';
import { useAuth } from '@/contexts/UserContext';

export default function Home() {
  const [view, setView] = useState('Dashboard');
  const { user } = useAuth();

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

