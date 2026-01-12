"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { isDevMode, getDevMockUser } from '@/lib/dev-auth';

export type Role = 'admin' | 'manager' | 'agent';

export interface User {
    id: string;
    email: string;
    role: Role;
    tenant_id: string;
    tenant_name: string;
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

// Initialize the browser client once for the client-side context
const supabase = createSupabaseBrowserClient();

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [devRole, setDevRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);

    const isDev = isDevMode;

    useEffect(() => {
        let isMounted = true;

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;

            if (session) {
                console.log(`🔐 Auth: Event [${event}]. Fetching user data for ${session.user.email}`);
                await fetchUserData(session.user.email!);
            } else {
                if (isDev) {
                    console.warn(`🚧 Auth: Event [${event}]. No session. Falling back to DEV MOCK.`);
                    setUser(getDevMockUser());
                } else {
                    console.log(`🔐 Auth: Event [${event}]. No session. User is null.`);
                    setUser(null);
                }
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Removed redundant checkUser() as onAuthStateChange fires INITIAL_SESSION in v2

    // checkUser is now handled by onAuthStateChange(INITIAL_SESSION)
    // but kept as a no-op to avoid breaking other potential calls
    async function checkUser() {
        // No-op
    }

    async function fetchUserData(email: string) {
        try {
            // Query by email which is the reliable unique identifier in this schema
            const { data, error } = await supabase
                .from('users')
                .select('id, email, role, tenant_id, department_id, full_name')
                .eq('email', email)
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                console.error(`User profile not found for email: ${email}`);
                throw new Error('User not found in database');
            }

            setUser({
                id: data.id,
                email: data.email,
                role: data.role as Role,
                tenant_id: data.tenant_id,
                department_id: data.department_id,
                full_name: data.full_name,
                tenant_name: 'Tenant', // Placeholder or fetch separately if needed
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
            setUser(null);
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
                .eq('auth_user_id', data.user.id)
                .maybeSingle();

            // Store role snapshot in session metadata
            if (userData) {
                await supabase.auth.updateUser({
                    data: { role: userData.role }
                });
            }

            await fetchUserData(data.user.email!);
            // If a real user signs in, clear any dev-only role override
            setDevRole(null);
        } catch (error: any) {
            console.error('Error signing in:', error);

            // Provide clearer error for network/connectivity problems
            const networkMsg = 'Failed to reach Supabase. Check that your Supabase instance is running and that NEXT_PUBLIC_SUPABASE_URL in .env.local is correct.';
            const errMsg = String(error?.message || error?.name || '').toLowerCase();
            const isNetwork = errMsg.includes('fetch') || errMsg.includes('connectionrefused') || errMsg.includes('ecoff') || errMsg.includes('authretryablefetcherror');

            // No mock fallback here - signIn is for real authentication only
            if (isNetwork) {
                throw new Error(`${networkMsg} (${error?.message || error?.name})`);
            }

            throw error;
        }
    }

    async function signOut() {
        try {
            // Create a race between the actual signOut and a timeout
            // This ensures we don't hang forever if the network is down
            const signOutPromise = supabase.auth.signOut();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('SignOut timeout')), 5000)
            );

            await Promise.race([signOutPromise, timeoutPromise]);
        } catch (error) {
            console.error('Error signing out (or timeout):', error);
            // We ignore the error and proceed to clear local state
            // forcing a "logout" from the UI perspective
        } finally {
            // ALWAYS clear local state
            setUser(null);
            setDevRole(null);
            setLoading(false);
        }
    }

    // Development mode: override role only for authenticated users
    // Dev role switcher requires a user (mock or real)
    const devOverrideRole = isDev && user
        ? (role: Role) => setDevRole(role)
        : undefined;

    const effectiveUser = user && isDev && devRole
        ? { ...user, role: devRole }
        : user;

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
