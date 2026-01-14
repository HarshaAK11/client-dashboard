import { useQuery } from '@tanstack/react-query';

async function fetchDepartments() {
    const response = await fetch('/api/departments');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

export function useDepartments() {
    return useQuery({
        queryKey: ['departments'],
        queryFn: fetchDepartments,
    });
}
