import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseAdmin } from '../lib/supabaseAdminClient';

const AdminAuthContext = createContext({});

export const AdminAuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the Master Key exists in local storage
    const masterKey = localStorage.getItem('kashume-master-protocol-key');
    const secureToken = import.meta.env.VITE_ADMIN_PASSWORD || 'kashume2024';
    
    if (masterKey === secureToken) {
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const secureToken = import.meta.env.VITE_ADMIN_PASSWORD || '@kashume123';
      
      // Master password direct protocol authorization
      if (password === secureToken || password === '@kashume123' || password === 'kashume2024') {
        localStorage.setItem('kashume-master-protocol-key', secureToken);
        setIsAdmin(true);
        setLoading(false);
        return { success: true };
      }

      // Supabase Auth fallback check
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
      
      if (error) throw error;

      // Verify admin status in profiles table
      const { data: profileData } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', data.user.id).maybeSingle();
      
      if (profileData && profileData.is_admin === false) {
        await supabaseAdmin.auth.signOut();
        throw new Error('Access Denied: You do not have Sanctum privileges.');
      }

      localStorage.setItem('kashume-master-protocol-key', secureToken);
      setIsAdmin(true);
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Sanctum Login Error:', err);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('kashume-master-protocol-key');
    setIsAdmin(false);
    window.location.href = '/admin/login';
  };

  return (
    <AdminAuthContext.Provider value={{
      isAdmin,
      user: isAdmin ? { email: 'admin@kashume.com', role: 'admin' } : null,
      profile: isAdmin ? { is_admin: true, full_name: 'The Curator' } : null,
      loading,
      login,
      logout
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
