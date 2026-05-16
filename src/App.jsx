import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ScrollToTop from './components/layout/ScrollToTop';
import Home from './pages/Home';
import Vision from './pages/Vision';
import About from './pages/About';
import Contact from './pages/Contact';
import Bundles from './pages/Bundles';
import NewArrivals from './pages/NewArrivals';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import FAQ from './pages/FAQ';
import ShippingPolicy from './pages/ShippingPolicy';
import TermsOfService from './pages/TermsOfService';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminProductManager from './components/admin/AdminProductManager';
import AdminLogin from './pages/admin/Login';
import ProtectedRoute from './components/admin/ProtectedRoute';
import UserProtectedRoute from './components/auth/UserProtectedRoute';
import Footer from './components/layout/Footer';
import Preloader from './components/ui/Preloader';
import WhatsAppFloat from './components/ui/WhatsAppFloat';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reduce artificial loading time to 2 seconds for a snappier feel
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        {loading && <Preloader key="preloader" />}
      </AnimatePresence>
      
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes>
                  <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                  <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
                  <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
                  <Route path="/bundles" element={<PageWrapper><Bundles /></PageWrapper>} />
                  <Route path="/vision" element={<PageWrapper><Vision /></PageWrapper>} />
                  <Route path="/new-arrivals" element={<PageWrapper><NewArrivals /></PageWrapper>} />
                  <Route path="/shop" element={<PageWrapper><Shop /></PageWrapper>} />
                  <Route path="/product/:id" element={<PageWrapper><ProductDetail /></PageWrapper>} />
                  <Route path="/faq" element={<PageWrapper><FAQ /></PageWrapper>} />
                  <Route path="/shipping-policy" element={<PageWrapper><ShippingPolicy /></PageWrapper>} />
                  <Route path="/terms-of-service" element={<PageWrapper><TermsOfService /></PageWrapper>} />
                  <Route path="/checkout" element={<PageWrapper><Checkout /></PageWrapper>} />
                  
                  {/* Auth Routes */}
                  <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
                  <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
                  <Route 
                    path="/account" 
                    element={
                      <UserProtectedRoute>
                        <PageWrapper><Account /></PageWrapper>
                      </UserProtectedRoute>
                    } 
                  />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<PageWrapper><AdminLogin /></PageWrapper>} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute>
                        <PageWrapper><AdminProductManager /></PageWrapper>
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </AnimatePresence>
            </div>
            <Footer />
            {!loading && <WhatsAppFloat />}
          </div>
        </Router>
    </AuthProvider>
  );
}

// Simple wrapper for page transitions
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export default App;
