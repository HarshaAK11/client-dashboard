"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import UnifiedDashboard from '@/components/dashboard/unified-dashboard';
import TeamView from '@/components/dashboard/team/team-view';
import AnalyticsView from '@/components/dashboard/analytics/analytics-view';
import EscalationsView from '@/components/dashboard/escalations/escalations-view';
import SettingsView from '@/components/dashboard/settings/settings-view';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [view, setView] = useState('Dashboard');
  const router = useRouter();

  const renderContent = () => {
    if (view === 'Team') {
      return <TeamView />;
    }
    if (view === 'Analytics') {
      return <AnalyticsView />;
    }
    if (view === 'Escalations') {
      return <EscalationsView />;
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

