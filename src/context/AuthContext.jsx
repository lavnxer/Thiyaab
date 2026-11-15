import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch profile from DB
    const fetchProfile = async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (!error && data) {
            setProfile(data);
        }
        return data;
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Sign up with email
    const signUp = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName }
            }
        });
        if (error) return { data, error };

        // If session was not immediately returned by signUp, sign in right away to establish session
        if (!data?.session) {
            const signInRes = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (signInRes.data?.session) {
                setUser(signInRes.data.session.user);
                await fetchProfile(signInRes.data.session.user.id);
                return { data: signInRes.data, error: null };
            }
            if (signInRes.error) {
                return { data, error: signInRes.error };
            }
        } else {
            setUser(data.session.user);
            await fetchProfile(data.session.user.id);
        }

        return { data, error: null };
    };

    // Sign in with email
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
        return { data, error };
    };

    // Sign in with Apple
    const signInWithApple = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'apple',
            options: { redirectTo: window.location.origin }
        });
        return { data, error };
    };

    // Sign out
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            setUser(null);
            setProfile(null);
        }
        return { error };
    };

    // Update profile
    const updateProfile = async (updates) => {
        if (!user) return { error: { message: 'Not authenticated' } };
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();
        if (!error && data) {
            setProfile(data);
        }
        return { data, error };
    };

    // Check if user is admin
    const isAdmin = profile?.role === 'admin' || user?.email === 'admin@thyiaab.com';

    const value = {
        user,
        profile,
        loading,
        isAdmin,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithApple,
        signOut,
        updateProfile,
        fetchProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
