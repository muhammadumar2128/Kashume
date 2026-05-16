import React, { createContext, useContext, useEffect, useState } from 'react';

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
      // We MUST perform a real sign-in so the database (RLS) allows us to see data.
      // Because we are using 'supabaseAdmin', this session is LOCKED to the admin box
      // and will NEVER show up in the main shop.
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
      
      if (error) throw error;

      // Verify they are actually an admin in the profiles table
      const { data: profileData } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', data.user.id).maybeSingle();
      
      if (!profileData?.is_admin) {
        await supabaseAdmin.auth.signOut();
        throw new Error('Access Denied: You do not have Sanctum privileges.');
      }

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
