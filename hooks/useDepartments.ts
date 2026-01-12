import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/queryKeys';
import { authFetch } from '@/lib/api-client';

export function useDepartments() {
    return useQuery({
        queryKey: QUERY_KEYS.DEPARTMENTS,
        queryFn: async () => {
            const res = await authFetch('/api/departments');
            if (!res.ok) throw new Error('Failed to fetch departments');
            return res.json();
        },
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
}
