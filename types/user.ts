export interface User {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'manager' | 'agent';
    department_id: string | null;
    department_name?: string;
    tenant_id: string;
    created_at: string;
    updated_at: string;
}

export interface TeamApiResponse {
    data: User[];
}
