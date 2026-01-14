import { useQuery } from '@tanstack/react-query';

async function fetchUsers() {
    const response = await fetch('/api/users');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });
}
