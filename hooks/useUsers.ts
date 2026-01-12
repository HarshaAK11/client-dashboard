import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/queryKeys';
import { TeamApiResponse } from '@/types/user';
import { authFetch } from '@/lib/api-client';

export function useUsers() {
    return useQuery<TeamApiResponse>({
        queryKey: QUERY_KEYS.USERS,
        queryFn: async () => {
            const res = await authFetch('/api/team');
            if (!res.ok) throw new Error('Failed to fetch team');
            return res.json();
        },
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });
}
