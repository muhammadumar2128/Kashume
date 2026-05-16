import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, profile, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center text-charcoal/10">
        <Loader2 size={40} className="animate-spin mb-6" />
        <span className="text-[10px] uppercase tracking-[0.6em] animate-pulse">Verifying Identity...</span>
      </div>
    );
  }

  if (!user || !profile?.is_admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
