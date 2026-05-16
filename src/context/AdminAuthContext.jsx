import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseAdmin } from '../lib/supabaseAdminClient';

const AdminAuthContext = createContext({});

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    if (!userId) return null;
    try {
      console.log('Fetching admin profile for user:', userId);
      const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).maybeSingle();
      console.log('Admin profile fetch result:', data, 'Error:', error);
      return data;
    } catch (err) {
      console.error('Admin profile fetch exception:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabaseAdmin.auth.onAuthStateChange(async (event, session) => {
      console.log('Admin Auth State:', event, session?.user?.email || 'Guest');
      
      if (session?.user) {
        if (mounted) setUser(session.user);
        
        const p = await fetchProfile(session.user.id);
        if (mounted) {
          setProfile(p);
          setLoading(false);
        }
      } else {
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    });

    const timer = setTimeout(() => {
      if (mounted) {
        setLoading(prev => {
          if (prev) console.warn('Admin Auth: Forced unlock after timeout');
          return false;
        });
      }
    }, 3000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return { data, error };
    }
    if (data?.user) {
      setUser(data.user);
      const p = await fetchProfile(data.user.id);
      setProfile(p);
    }
    setLoading(false);
    return { data, error };
  };

  const logout = async () => {
    try {
      await Promise.race([
        supabaseAdmin.auth.signOut(), // Global sign out for admin session
        new Promise((_, reject) => setTimeout(() => reject(new Error('Signout timeout')), 3000))
      ]);
    } catch (err) {
      console.warn('Admin logout network request failed or timed out', err);
    } finally {
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.includes('admin-auth-token')) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
      }
      setUser(null);
      setProfile(null);
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 100);
    }
  };

  const updatePassword = async (newPassword) => {
    return await supabaseAdmin.auth.updateUser({ password: newPassword });
  };

  return (
    <AdminAuthContext.Provider value={{
      user,
      profile,
      loading,
      login,
      logout,
      updatePassword,
      refreshProfile: () => fetchProfile(user?.id).then(setProfile)
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
