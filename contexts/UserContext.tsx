"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type Role = 'admin' | 'manager' | 'agent';

export interface User {
    id: string;
    email: string;
    role: Role;
    tenant_id: string;
    department_id?: string;
    full_name: string;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    // Development mode only
    devOverrideRole?: (role: Role) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [devRole, setDevRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);

    const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

    useEffect(() => {
        // Check active session on mount
        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                fetchUserData(session.user.id);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function checkUser() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await fetchUserData(session.user.id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error checking user:', error);
            setLoading(false);
        }
    }

    async function fetchUserData(userId: string) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, email, role, tenant_id, department_id, full_name')
                .eq('id', userId)
                .single();

            if (error) throw error;

            setUser(data as User);
        } catch (error) {
            console.error('Error fetching user data:', error);
            // If user doesn't exist in public.users, create a mock user for development
            if (isDev) {
                setUser({
                    id: userId,
                    email: 'dev@example.com',
                    role: 'admin',
                    tenant_id: 'dev-tenant',
                    full_name: 'Development User',
                });
            }
        } finally {
            setLoading(false);
        }
    }

    async function signIn(email: string, password: string) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Fetch user role
            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .single();

            // Store role snapshot in session metadata
            if (userData) {
                await supabase.auth.updateUser({
                    data: { role: userData.role }
                });
            }

            await fetchUserData(data.user.id);
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    }

    async function signOut() {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setDevRole(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }

    // Development mode: override role without changing database
    // If user is null but devRole is set, create a mock user
    const effectiveUser = isDev && devRole
        ? (user
            ? { ...user, role: devRole }
            : {
                id: 'dev-mock-user',
                email: 'dev@example.com',
                role: devRole,
                tenant_id: 'dev-tenant',
                full_name: 'Dev User',
                department_id: devRole === 'manager' ? 'dev-dept-001' : undefined
            } as User)
        : user;

    const devOverrideRole = isDev
        ? (role: Role) => setDevRole(role)
        : undefined;

    return (
        <UserContext.Provider
            value={{
                user: effectiveUser,
                loading,
                signIn,
                signOut,
                devOverrideRole,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within UserProvider');
    }
    return context;
}
