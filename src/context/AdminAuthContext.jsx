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
    // Hard-coded check against the environment variable
    const secureEmail = 'kashume@gmail.com';
    const securePassword = import.meta.env.VITE_ADMIN_PASSWORD || 'kashume2024';

    if (email === secureEmail && password === securePassword) {
      localStorage.setItem('kashume-master-protocol-key', securePassword);
      setIsAdmin(true);
      setLoading(false);
      return { success: true };
    } else {
      setLoading(false);
      return { success: false, error: 'Invalid Sanctum Credentials' };
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
