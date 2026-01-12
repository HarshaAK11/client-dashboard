'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';

// Initialize browser client for real-time subscriptions
const supabase = createSupabaseBrowserClient();

import { QUERY_KEYS } from '@/lib/queryKeys';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    useEffect(() => {
        const channel = supabase
            .channel('app_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'email_events' },
                (payload: any) => {
                    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMAIL_EVENTS });
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'users' },
                (payload: any) => {
                    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
