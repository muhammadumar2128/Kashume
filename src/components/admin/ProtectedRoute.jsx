import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center text-charcoal/10">
        <Loader2 size={40} className="animate-spin mb-6" />
        <span className="text-[10px] uppercase tracking-[0.6em] animate-pulse">Verifying Identity...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
