import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/queryKeys';
import { authFetch } from '@/lib/api-client';

export function useEscalations() {
    return useQuery({
        queryKey: [...QUERY_KEYS.EMAIL_EVENTS, 'escalations'],
        queryFn: async () => {
            // Corrected from /api/email-events to /api/escalations based on existing route
            const res = await authFetch('/api/escalations?include_handled=true');
            if (!res.ok) throw new Error('Failed');
            return res.json();
        },
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
}
