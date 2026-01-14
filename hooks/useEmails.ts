import { useQuery } from '@tanstack/react-query';

async function fetchEmails() {
    const response = await fetch('/api/emails');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

export function useEmails() {
    return useQuery({
        queryKey: ['emails'],
        queryFn: fetchEmails,
    });
}
