import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/queryKeys';
import { authFetch } from '@/lib/api-client';

export function useEmails() {
    return useQuery({
        queryKey: [...QUERY_KEYS.EMAIL_EVENTS, 'all'],
        queryFn: async () => {
            const res = await authFetch('/api/emails');
            if (!res.ok) throw new Error('Failed to fetch emails');
            return res.json();
        },
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
}
