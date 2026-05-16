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

      // Only retry if it's a new sign-up and we didn't find the profile yet
      if (!data && isRetry) {
        console.log(`Profile not found for ${userId}, retrying once...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
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

    // Supabase fires the first event (INITIAL_SESSION) immediately upon subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth event:', event, session?.user?.email);
      
      if (session?.user) {
        setUser(session.user);
        // We only show the global loading state for the INITIAL_SESSION check
        // Subsequent events (like SIGNED_IN) might already have a user/profile
        const isNewSignUp = event === 'SIGNED_UP';
        
        try {
          const p = await fetchProfile(session.user.id, isNewSignUp);
          if (mounted) {
            setProfile(p);
            // If we have a user but NO profile after retries, it's a ghost/broken session
            if (!p && event === 'INITIAL_SESSION') {
              console.warn('Ghost session detected. Clearing...');
              await supabase.auth.signOut();
              setUser(null);
              setProfile(null);
            }
          }
        } catch (err) {
          console.error('Auth check error:', err);
        } finally {
          if (mounted) setLoading(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    // Safety fallback: if no event fires within 5 seconds, stop loading
    const timer = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth check timed out.');
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      // Don't set global loading here to avoid blocking entire UI, 
      // let the login page handle its own local loading state
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
      // Force immediate state reset and redirect
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
