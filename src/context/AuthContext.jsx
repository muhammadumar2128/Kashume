import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simple profile fetcher - no retries, no blocking
  const fetchProfile = async (userId) => {
    if (!userId) return null;
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      console.log('Profile fetch result:', data, 'Error:', error);
      return data;
    } catch (err) {
      console.error('Profile fetch exception:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Direct listener for all auth changes (including the initial session restore)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth State:', event, session?.user?.email || 'Guest');
      
      if (session?.user) {
        if (mounted) setUser(session.user);
        
        // Sync profile in background
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

    // Forced unblock: if we don't have an answer in 3 seconds, let the user in anyway
    const timer = setTimeout(() => {
      if (mounted) {
        setLoading(prev => {
          if (prev) console.warn('Auth: Forced unlock after timeout');
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
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

  const register = async (email, password, fullName, phone) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone: phone } },
    });
  };

  const logout = async () => {
    try {
      // Forcefully clear session locally even if the server request fails or hangs
      await Promise.race([
        supabase.auth.signOut({ scope: 'local' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Signout timeout')), 2000))
      ]);
    } catch (err) {
      console.warn('Logout network request failed or timed out, clearing local session anyway', err);
    } finally {
      // Nuking Supabase local storage tokens manually as a bulletproof fallback
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
            localStorage.removeItem(key);
          }
        });
      }
      setUser(null);
      setProfile(null);
      // We use a small timeout to let React updates process before the hard redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  };

  const updatePassword = async (newPassword) => {
    return await supabase.auth.updateUser({ password: newPassword });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      login, 
      register, 
      logout, 
      updatePassword, 
      refreshProfile: () => fetchProfile(user?.id).then(setProfile) 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

