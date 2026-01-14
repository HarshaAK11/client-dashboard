import { useQuery } from '@tanstack/react-query';

async function fetchEscalations() {
    const response = await fetch('/api/escalations');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

export function useEscalations() {
    return useQuery({
        queryKey: ['escalations'],
        queryFn: fetchEscalations,
    });
}
