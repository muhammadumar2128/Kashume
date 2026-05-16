import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId, isRetry = false) => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }

      // Retry once for new signups
      if (!data && isRetry) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const { data: retryData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        return retryData;
      }

      return data;
    } catch (err) {
      console.error('Unexpected profile fetch error:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. Initial Session Check (Standard way to handle startup)
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted && session?.user) {
          setUser(session.user);
          const p = await fetchProfile(session.user.id);
          if (mounted) setProfile(p);
        }
      } catch (err) {
        console.error('Init session error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // 2. Auth State Listener (Handles login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth Event:', event, session?.user?.email);
      
      if (session?.user) {
        setUser(session.user);
        
        // Fetch profile if we don't have it or if it's a new login/signup
        if (event === 'SIGNED_IN' || event === 'SIGNED_UP' || !profile) {
          const p = await fetchProfile(session.user.id, event === 'SIGNED_UP');
          if (mounted) setProfile(p);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      
      // Always ensure loading is false after any event
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, password, fullName, phone) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setProfile(null);
      setLoading(false);
      window.location.href = '/';
    }
  };

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, updatePassword, refreshProfile: () => fetchProfile(user?.id) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
