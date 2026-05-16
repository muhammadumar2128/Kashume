import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simple profile fetcher with a 3-second timeout to prevent hangs
  const fetchProfile = async (userId) => {
    if (!userId) return null;
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await Promise.race([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 3000))
      ]);

      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
      
      console.log('Profile fetch success');
      return data;
    } catch (err) {
      console.warn('Profile fetch stalled or failed:', err.message);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. Initial Session Check (Fast)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          // Fetch profile in background, don't block the UI
          fetchProfile(session.user.id).then(p => {
            if (mounted) setProfile(p);
          });
        }
        // Unlock UI immediately after we know the session status
        setLoading(false);
      }
    });

    // 2. Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth Event:', event, session?.user?.email || 'Guest');
      
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          // Resolve loading immediately if it hasn't been already
          setLoading(false);
          
          const p = await fetchProfile(session.user.id);
          if (mounted) setProfile(p);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    });

    // 3. Safety Fallback: Never let the app hang more than 2 seconds for auth
    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 2000);

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

