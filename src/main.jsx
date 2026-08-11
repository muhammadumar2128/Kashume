import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/globals.css';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { DiscountProvider } from './context/DiscountContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AdminAuthProvider>
        <DiscountProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </DiscountProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </React.StrictMode>
);
