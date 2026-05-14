import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './components/layout/ScrollToTop';
import Home from './pages/Home';
import Vision from './pages/Vision';
import NewArrivals from './pages/NewArrivals';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import FAQ from './pages/FAQ';
import Checkout from './pages/Checkout';
import AdminProductManager from './components/admin/AdminProductManager';
import Login from './pages/admin/Login';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Footer from './components/layout/Footer';
import Preloader from './components/ui/Preloader';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <AnimatePresence mode="wait">
          {loading && <Preloader key="preloader" />}
        </AnimatePresence>
        
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/vision" element={<Vision />} />
                <Route path="/new-arrivals" element={<NewArrivals />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/checkout" element={<Checkout />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<Login />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <AdminProductManager />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
