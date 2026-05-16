import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Trash2, Edit, Save, X, Image as ImageIcon, 
  Search, Filter, ArrowLeft, Loader2, CheckCircle2, AlertCircle,
  Package, ShoppingBag, Clock, CheckCircle, Truck, Upload,
  Tag, Settings, LogOut, Key, Hash, LayoutGrid, Database,
  Eye, Droplets, Thermometer, HelpCircle, Wifi, WifiOff, Menu, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [dbStatus, setDbStatus] = useState('connecting'); // connecting, online, offline
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('products').select('id', { count: 'exact', head: true }).limit(1);
        if (error) throw error;
        setDbStatus('online');
      } catch (err) {
        console.error("DB Status Error:", err);
        setDbStatus('offline');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [promos, setPromos] = useState([]);
  const [faqs, setFaqs] = useState([]);
  
  // Pending orders count
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form States
  const initialProductState = {
    name: '',
    price: '',
    description: '',
    stock: 0,
    category_id: '',
    gender: 'Unisex',
    is_new_arrival: false,
    is_bundle: false,
    original_price: '',
    scent_notes: { top: [], heart: [], base: [] },
    performance: { longevity: 'Long Lasting', sillage: 'Strong' },
    shipping: 'All Over Pakistan Product can take 3-4 days to deliver. Delivery charges are Rs.199. Free delivery for orders above 3000.',
    images: []
  };

  const initialFaqState = {
    question: '',
    answer: '',
    display_order: 0
  };

  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    // Timeout for the entire fetch operation
    const fetchTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        showNotification("Data retrieval is taking longer than expected.", "error");
      }
    }, 8000);

    try {
      if (activeTab === 'inventory') {
        const { data: productsData, error: pError } = await supabase
          .from('products')
          .select('*, categories(name)')
          .order('created_at', { ascending: false });
        
        if (pError) {
          const { data: simpleData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
          setProducts(simpleData || []);
        } else {
          setProducts(productsData || []);
        }

        const { data: catData } = await supabase.from('categories').select('*').order('name');
        setCategories(catData || []);

      } else if (activeTab === 'orders') {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setOrders(data || []);
      } else if (activeTab === 'promos') {
        const { data, error } = await supabase.from('promocodes').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setPromos(data || []);
      } else if (activeTab === 'faqs') {
        const { data, error } = await supabase.from('faqs').select('*').order('display_order');
        if (error) throw error;
        setFaqs(data || []);
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      showNotification(err.message, 'error');
    } finally {
      clearTimeout(fetchTimeout);
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Modal Logic ---
  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    if (activeTab === 'inventory') {
      setFormData(item ? {
        ...initialProductState,
        ...item,
        scent_notes: item.scent_notes || initialProductState.scent_notes,
        performance: item.performance || initialProductState.performance,
        shipping: item.shipping || initialProductState.shipping
      } : initialProductState);
    } else if (activeTab === 'categories') {
      setFormData(item || { name: '', slug: '' });
    } else if (activeTab === 'promos') {
      setFormData(item || { code: '', discount: '', expiry_date: '', usage_limit: 100 });
    } else if (activeTab === 'faqs') {
      setFormData(item || initialFaqState);
    }
    setIsModalOpen(true);
  };

  // --- CRUD Actions ---
  const handleSave = async (e) => {
    e.preventDefault();
    console.log("handleSave called with activeTab:", activeTab, "formData:", formData);
    
    // Manual validation to prevent silent HTML5 validation failures
    if (activeTab === 'inventory') {
      if (!formData.name) return showNotification("Essence Name is required", "error");
      if (!formData.category_id) return showNotification("Botanical Group is required", "error");
      if (!formData.price) return showNotification("Value (PKR) is required", "error");
      if (formData.stock === '' || formData.stock === null || formData.stock === undefined) return showNotification("Inventory Stock is required", "error");
    } else if (activeTab === 'categories') {
      if (!formData.name) return showNotification("Group Name is required", "error");
      if (!formData.slug) return showNotification("Botanical Slug is required", "error");
    } else if (activeTab === 'promos') {
      if (!formData.code) return showNotification("Secret Token Code is required", "error");
      if (!formData.discount) return showNotification("Gratuity (%) is required", "error");
      if (!formData.expiry_date) return showNotification("Soul Expiration is required", "error");
    } else if (activeTab === 'faqs') {
      if (!formData.question) return showNotification("The Question is required", "error");
      if (!formData.answer) return showNotification("The Answer is required", "error");
    }

    setLoading(true);
    
    let table = activeTab === 'inventory' ? 'products' : activeTab === 'promos' ? 'promocodes' : activeTab;
    
    // Create a clean payload copy
    let payload = { ...formData };
    
    // Clean up payload for 'products' table
    if (activeTab === 'inventory') {
      payload.price = parseFloat(payload.price);
      payload.original_price = payload.original_price ? parseFloat(payload.original_price) : null;
      payload.stock = parseInt(payload.stock);
      
      // CRITICAL: Supabase will reject the insert if it sees columns that don't exist
      // like 'categories' which is a joined object from the SELECT query.
      delete payload.categories;
      delete payload.created_at; // Usually handled by DB
      delete payload.updated_at;
    }

    if (activeTab === 'faqs') {
      payload.display_order = parseInt(payload.display_order) || 0;
    }

    try {
      let result;
      if (editingItem) {
        result = await supabase.from(table).update(payload).eq('id', editingItem.id);
      } else {
        result = await supabase.from(table).insert([payload]);
      }

      if (result.error) throw result.error;

      const label = activeTab === 'inventory' ? 'Inventory' : activeTab === 'categories' ? 'Category' : activeTab === 'promos' ? 'Promo' : activeTab === 'faqs' ? 'FAQ' : activeTab;
      showNotification(`${label} saved successfully`);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Save Error:", err);
      if (err.message?.includes('column') && err.message?.includes('does not exist')) {
        showNotification("Database schema mismatch. Please contact engineering.", 'error');
      } else {
        showNotification(err.message || "Failed to save record", 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, table) => {
    if (window.confirm(`Are you sure you want to delete this ${table.slice(0, -1)}?`)) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) showNotification(error.message, 'error');
      else {
        showNotification('Record deleted');
        fetchData();
      }
    }
  };

  // --- Security ---
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showNotification('Passwords do not match', 'error');
    }
    const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
    if (error) showNotification(error.message, 'error');
    else {
      showNotification('Sanctum password updated');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    }
  };

  // --- Visual Archive Protocol (Multi-Image) ---
  const handleImageUpload = async (e) => {
    const inputElement = e.target;
    const files = Array.from(inputElement.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    const newImages = [...(formData.images || [])];

    try {
      const uploadPromises = files.map(async (file) => {
        // Explicit check for allowed formats to provide better feedback
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          console.warn(`File type ${file.type} might not be supported. Attempting upload anyway.`);
        }

        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(`essences/${fileName}`, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(`essences/${fileName}`);

        return publicUrl;
      });

      const results = await Promise.allSettled(uploadPromises);
      
      let successCount = 0;
      for (const result of results) {
        if (result.status === 'fulfilled') {
          newImages.push(result.value);
          successCount++;
        } else {
          console.error("Upload failed for a file:", result.reason);
          showNotification(`A file failed to upload: ${result.reason?.message || 'Unknown error'}`, 'error');
        }
      }

      setFormData(prev => ({ ...prev, images: newImages }));
      if (successCount > 0) {
        showNotification(`${successCount} Visual(s) captured successfully`);
      }
    } catch (error) {
      console.error("Global upload error:", error);
      showNotification(error.message || "Failed to upload images", 'error');
    } finally {
      setUploadingImage(false);
      if (inputElement) inputElement.value = null; // Reset input safely
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    showNotification('Visual removed from archive');
  };

  const moveImage = (index, direction) => {
    const newImages = [...formData.images];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    setFormData({ ...formData, images: newImages });
  };

  const handleNoteChange = (type, value) => {
    const notesArray = value.split(',').map(n => n.trim()).filter(n => n !== '');
    setFormData({
      ...formData,
      scent_notes: {
        ...formData.scent_notes,
        [type]: notesArray
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex flex-col md:flex-row font-sans text-charcoal overflow-x-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-charcoal text-ivory p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg border-b border-white/5">
        <Link to="/" className="text-xl font-serif italic tracking-widest uppercase">Kashume</Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full">
            {dbStatus === 'online' ? <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> : <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
            <span className="text-[8px] uppercase tracking-widest opacity-60 font-bold">{dbStatus}</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 active:scale-90">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-charcoal text-ivory flex-col sticky top-0 h-screen shrink-0 shadow-2xl z-40 border-r border-white/5">
        <div className="p-10 border-b border-white/10">
          <div className="flex justify-between items-start">
            <Link to="/" className="text-3xl font-serif italic tracking-widest uppercase block">Kashume</Link>
            <div className={`mt-1 flex flex-col items-center gap-1 group relative`}>
              {dbStatus === 'online' ? (
                <Wifi size={14} className="text-green-500" />
              ) : dbStatus === 'offline' ? (
                <WifiOff size={14} className="text-red-500 animate-pulse" />
              ) : (
                <Wifi size={14} className="text-gold/40 animate-pulse" />
              )}
              <span className="absolute -top-8 bg-black/80 text-[6px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap">
                DB: {dbStatus}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <p className="text-[8px] uppercase tracking-[0.4em] text-gold font-bold">Command Center</p>
          </div>
        </div>

        <nav className="flex-grow p-6 space-y-3 mt-4">
          {[
            { id: 'inventory', label: 'Inventory', icon: Database },
            { id: 'categories', label: 'Botanical Library', icon: LayoutGrid },
            { id: 'orders', label: 'Order Ledger', icon: ShoppingBag, count: pendingCount },
            { id: 'promos', label: 'Scent Tokens', icon: Tag },
            { id: 'faqs', label: 'Archives (FAQ)', icon: HelpCircle },
            { id: 'settings', label: 'Sanctum', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-4 px-5 py-4 rounded-lg text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${
                activeTab === tab.id 
                ? 'bg-gold text-charcoal font-bold shadow-lg shadow-gold/20 translate-x-2' 
                : 'hover:bg-white/10 text-ivory/70'
              }`}
            >
              <div className="flex items-center gap-4">
                <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} /> {tab.label}
              </div>
              {tab.id === 'orders' && tab.count > 0 && (
                <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black ${
                  activeTab === 'orders' ? 'bg-charcoal text-gold' : 'bg-gold text-charcoal'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut size={14} /> Leave Command
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 bg-charcoal text-ivory flex flex-col z-[70] md:hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center">
                <Link to="/" className="text-2xl font-serif italic tracking-widest uppercase">Kashume</Link>
                <div className={`flex items-center gap-1`}>
                  {dbStatus === 'online' ? <Wifi size={12} className="text-green-500" /> : <WifiOff size={12} className="text-red-500" />}
                </div>
              </div>

              <nav className="flex-grow p-6 space-y-2 mt-4">
                {[
                  { id: 'inventory', label: 'Inventory', icon: Database },
                  { id: 'categories', label: 'Botanical Library', icon: LayoutGrid },
                  { id: 'orders', label: 'Order Ledger', icon: ShoppingBag, count: pendingCount },
                  { id: 'promos', label: 'Scent Tokens', icon: Tag },
                  { id: 'faqs', label: 'Archives (FAQ)', icon: HelpCircle },
                  { id: 'settings', label: 'Sanctum', icon: Settings },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-4 px-5 py-4 rounded-lg text-[10px] uppercase tracking-[0.2em] transition-all ${
                      activeTab === tab.id ? 'bg-gold text-charcoal font-bold' : 'text-ivory/70'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <tab.icon size={16} /> {tab.label}
                    </div>
                    {tab.id === 'orders' && tab.count > 0 && (
                      <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black bg-gold text-charcoal">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="p-8 border-t border-white/10">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 text-[10px] uppercase tracking-widest text-red-400"
                >
                  <LogOut size={14} /> Leave Command
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-12 overflow-y-auto bg-white/50">
        <header className="mb-8 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-charcoal/20 pb-8 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif italic capitalize tracking-tight text-charcoal flex items-center gap-4">
              {activeTab}
              {activeTab === 'orders' && pendingCount > 0 && (
                <span className="bg-gold text-charcoal text-sm font-black px-3 py-1 rounded-full flex items-center gap-2">
                  <Clock size={16} /> {pendingCount} Pending
                </span>
              )}
            </h2>
            <p className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-charcoal/80 mt-2 md:mt-4 flex items-center gap-2">
              <span className="w-4 md:w-8 h-[1px] bg-charcoal/60" /> Governing the House of Kashume
            </p>
          </div>
          {activeTab !== 'orders' && activeTab !== 'settings' && (
            <button 
              onClick={() => openModal()}
              className="w-full md:w-auto bg-charcoal text-ivory px-6 md:px-10 py-3 md:py-4 text-[9px] md:text-[10px] uppercase tracking-[0.3em] hover:bg-gold hover:text-charcoal transition-all duration-700 shadow-xl shadow-charcoal/20"
            >
              Add New {activeTab.slice(0, -1)}
            </button>
          )}
        </header>

        {loading ? (
          <div className="h-64 md:h-96 flex flex-col items-center justify-center text-charcoal/20">
            <Loader2 size={32} className="animate-spin mb-6" />
            <span className="text-[8px] md:text-[10px] uppercase tracking-[0.6em] animate-pulse">Consulting the Archives...</span>
          </div>
        ) : (
          <div className="bg-white border border-charcoal/20 shadow-2xl shadow-charcoal/10 overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              {/* Inventory View */}
              {activeTab === 'inventory' && (
                <table className="w-full text-left min-w-[600px] md:min-w-0">
                  <thead className="bg-[#F5F2ED] border-b border-charcoal/30 text-[8px] md:text-[9px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-charcoal font-bold">
                    <tr>
                      <th className="p-4 md:p-6">The Essence</th>
                      <th className="p-4 md:p-6 hidden lg:table-cell">Collection</th>
                      <th className="p-4 md:p-6 hidden sm:table-cell">Target</th>
                      <th className="p-4 md:p-6">Value</th>
                      <th className="p-4 md:p-6">Stock</th>
                      <th className="p-4 md:p-6 text-right">Sanctum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/10 text-xs md:text-sm font-light">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-[#F5F2ED] transition-all duration-300 group text-charcoal">
                        <td className="p-4 md:p-6">
                          <div className="flex items-center gap-3 md:gap-5">
                            <div className="w-10 h-14 md:w-14 md:h-20 bg-ivory overflow-hidden ring-1 ring-charcoal/20 group-hover:shadow-xl transition-all rounded-sm flex items-center justify-center">
                              {p.images?.[0] ? (
                                <img src={p.images[0]} className="w-full h-full object-cover grayscale-[10%]" />
                              ) : (
                                <ImageIcon size={16} className="text-charcoal/20" />
                              )}
                            </div>
                            <div>
                              <span className="font-serif italic text-sm md:text-lg block text-charcoal font-bold">{p.name}</span>
                              <div className="flex flex-wrap gap-1 md:gap-2 mt-1">
                                {p.is_new_arrival && (
                                  <span className="text-[6px] md:text-[7px] uppercase tracking-widest bg-gold text-charcoal px-1 md:px-1.5 py-0.5 font-bold rounded-sm whitespace-nowrap">
                                    New
                                  </span>
                                )}
                                <span className="lg:hidden text-[6px] md:text-[7px] uppercase tracking-widest text-charcoal/60 font-bold italic">
                                  {p.categories?.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 md:p-6 text-[9px] md:text-[10px] uppercase tracking-widest text-charcoal font-bold hidden lg:table-cell">{p.categories?.name}</td>
                        <td className="p-4 md:p-6 text-[9px] md:text-[10px] uppercase tracking-widest text-gold font-bold hidden sm:table-cell">{p.gender}</td>
                        <td className="p-4 md:p-6 font-sans font-bold text-charcoal text-[10px] md:text-sm whitespace-nowrap">Rs. {p.price}</td>
                        <td className="p-4 md:p-6">
                          <div className="flex items-center gap-2">
                            <div className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${p.stock < 5 ? 'bg-red-600 animate-pulse' : 'bg-green-700'}`} />
                            <span className="font-mono text-[10px] md:text-xs font-bold text-charcoal whitespace-nowrap">{p.stock} Units</span>
                          </div>
                        </td>
                        <td className="p-4 md:p-6 text-right">
                          <div className="flex justify-end gap-1 md:gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openModal(p)} className="p-1.5 md:p-2 text-charcoal/60 hover:text-gold transition-colors"><Edit size={16} className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                            <button onClick={() => handleDelete(p.id, 'products')} className="p-1.5 md:p-2 text-charcoal/60 hover:text-red-600 transition-colors"><Trash2 size={16} className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Botanical Library View */}
              {activeTab === 'categories' && (
                <table className="w-full text-left">
                  <thead className="bg-[#F5F2ED] border-b border-charcoal/30 text-[8px] md:text-[9px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-charcoal font-bold">
                    <tr>
                      <th className="p-4 md:p-6">Botanical Group</th>
                      <th className="p-4 md:p-6">Digital Slug</th>
                      <th className="p-4 md:p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/10 text-xs md:text-sm font-light">
                    {categories.map(c => (
                      <tr key={c.id} className="hover:bg-[#F5F2ED] transition-all duration-300 text-charcoal">
                        <td className="p-4 md:p-6 font-serif italic text-base md:text-lg font-bold">{c.name}</td>
                        <td className="p-4 md:p-6 font-mono text-[10px] text-charcoal/80 font-bold">{c.slug}</td>
                        <td className="p-4 md:p-6 text-right">
                          <div className="flex justify-end gap-1 md:gap-2">
                            <button onClick={() => openModal(c)} className="p-1.5 md:p-2 text-charcoal/60 hover:text-gold transition-colors"><Edit size={16} className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                            <button onClick={() => handleDelete(c.id, 'categories')} className="p-1.5 md:p-2 text-charcoal/60 hover:text-red-600 transition-colors"><Trash2 size={16} className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Order Ledger View */}
              {activeTab === 'orders' && (
                <table className="w-full text-left min-w-[600px] md:min-w-0">
                  <thead className="bg-[#F5F2ED] border-b border-charcoal/10 text-[8px] md:text-[9px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-charcoal font-bold">
                    <tr>
                      <th className="p-4 md:p-6">Order ID</th>
                      <th className="p-4 md:p-6">Client</th>
                      <th className="p-4 md:p-6">Address</th>
                      <th className="p-4 md:p-6">Value</th>
                      <th className="p-4 md:p-6">Status</th>
                      <th className="p-4 md:p-6 text-right">Protocol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/5 text-xs md:text-sm font-light">
                    {orders.map(o => (
                      <tr 
                        key={o.id} 
                        onClick={() => openOrderModal(o)}
                        className="hover:bg-[#F5F2ED] text-charcoal cursor-pointer transition-colors duration-300"
                      >
                        <td className="p-4 md:p-6 font-mono text-[9px] md:text-[10px] text-charcoal/60 font-bold">#{o.id.slice(0,8)}</td>
                        <td className="p-4 md:p-6 font-medium">
                          <div className="font-bold text-sm">{o.customer_name}</div>
                          <div className="text-[10px] opacity-60">{o.customer_email}</div>
                          <div className="text-[10px] opacity-60 font-mono">{o.phone}</div>
                        </td>
                        <td className="p-4 md:p-6 font-medium max-w-[200px]">
                          <div className="text-[10px] md:text-xs leading-relaxed italic">{o.shipping_address}</div>
                        </td>
                        <td className="p-4 md:p-6 font-sans font-bold whitespace-nowrap">Rs. {o.total}</td>
                        <td className="p-4 md:p-6">
                          <span className={`text-[7px] md:text-[8px] uppercase tracking-widest px-2 md:px-3 py-1 md:py-1.5 rounded-full font-bold whitespace-nowrap ${
                            o.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gold/20 text-gold-800'
                          }`}>{o.status}</span>
                        </td>
                        <td className="p-4 md:p-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <select 
                            className="text-[8px] md:text-[9px] uppercase tracking-widest bg-white border border-charcoal/20 p-1.5 md:p-2 focus:outline-none focus:border-gold transition-colors rounded-sm text-charcoal font-bold max-w-[90px] md:max-w-none"
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', o.id);
                              if (!error) {
                                // Trigger email notification via Vercel Serverless Function
                                await fetch('/api/send-email', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    order: { ...o, status: newStatus },
                                    type: 'order_status_update'
                                  })
                                });
                                fetchData();
                              }
                            }}
                            value={o.status}
                          >
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Scent Tokens View */}
              {activeTab === 'promos' && (
                <table className="w-full text-left">
                  <thead className="bg-[#F5F2ED] border-b border-charcoal/10 text-[8px] md:text-[9px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-charcoal font-bold">
                    <tr>
                      <th className="p-4 md:p-6">Secret Code</th>
                      <th className="p-4 md:p-6">Gratuity</th>
                      <th className="p-4 md:p-6 hidden sm:table-cell">Expiration</th>
                      <th className="p-4 md:p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/5 text-xs md:text-sm font-light">
                    {promos.map(p => (
                      <tr key={p.id} className="hover:bg-[#F5F2ED]/50 text-charcoal">
                        <td className="p-4 md:p-6 font-mono font-bold text-gold-700 tracking-widest">{p.code}</td>
                        <td className="p-4 md:p-6 font-bold">{p.discount}% OFF</td>
                        <td className="p-4 md:p-6 text-[9px] md:text-[10px] text-charcoal/70 uppercase tracking-widest font-bold hidden sm:table-cell">{new Date(p.expiry_date).toLocaleDateString('en-GB')}</td>
                        <td className="p-4 md:p-6 text-right">
                          <button onClick={() => handleDelete(p.id, 'promocodes')} className="p-1.5 md:p-2 text-charcoal/40 hover:text-red-500 transition-colors"><Trash2 size={16} className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* FAQ View */}
              {activeTab === 'faqs' && (
                <table className="w-full text-left min-w-[500px] md:min-w-0">
                  <thead className="bg-[#F5F2ED] border-b border-charcoal/10 text-[8px] md:text-[9px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-charcoal font-bold">
                    <tr>
                      <th className="p-4 md:p-6">Order</th>
                      <th className="p-4 md:p-6">Question</th>
                      <th className="p-4 md:p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/5 text-xs md:text-sm font-light">
                    {faqs.map(f => (
                      <tr key={f.id} className="hover:bg-[#F5F2ED]/50 transition-all duration-300 text-charcoal">
                        <td className="p-4 md:p-6 font-mono text-[10px] text-charcoal/60 font-bold">{f.display_order}</td>
                        <td className="p-4 md:p-6 font-serif italic text-base md:text-lg">{f.question}</td>
                        <td className="p-4 md:p-6 text-right">
                          <div className="flex justify-end gap-1 md:gap-2">
                            <button onClick={() => openModal(f)} className="p-1.5 md:p-2 text-charcoal/40 hover:text-gold transition-colors"><Edit size={16} className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(f.id, 'faqs')} className="p-1.5 md:p-2 text-charcoal/40 hover:text-red-500 transition-colors"><Trash2 size={16} className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Sanctum (Settings) */}
            {activeTab === 'settings' && (
              <div className="p-8 md:p-20 max-w-xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto mb-4 md:mb-6">
                    <Key size={32} className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif italic text-charcoal">Update Credentials</h3>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-charcoal/80 mt-2 md:mt-4">Security of the Kashume Sanctum</p>
                </div>
                <form onSubmit={handleUpdatePassword} className="space-y-6 md:space-y-8">
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-widest text-charcoal block ml-1 font-black">New Password</label>
                    <input 
                      type="password" 
                      className="w-full border-b-2 border-charcoal/40 p-3 md:p-4 text-sm focus:border-gold outline-none bg-[#F5F2ED] transition-all text-center font-serif text-base md:text-lg rounded-t-lg text-charcoal font-bold"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-widest text-charcoal block ml-1 font-black">Confirm Identity</label>
                    <input 
                      type="password" 
                      className="w-full border-b-2 border-charcoal/40 p-3 md:p-4 text-sm focus:border-gold outline-none bg-[#F5F2ED] transition-all text-center font-serif text-base md:text-lg rounded-t-lg text-charcoal font-bold"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="w-full bg-charcoal text-ivory py-4 md:py-5 text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] hover:bg-gold hover:text-charcoal transition-all duration-700 shadow-xl font-bold">
                    Rekey the Sanctum
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Dynamic Modal - Enhanced for Product Details */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-8 backdrop-blur-md">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-charcoal/90" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="bg-white w-full h-full md:h-auto md:max-w-3xl relative z-10 shadow-2xl flex flex-col md:max-h-[90vh] md:rounded-3xl overflow-hidden">
              <div className="p-6 md:p-10 border-b border-charcoal/10 flex justify-between items-center bg-[#F5F2ED]">
                <div>
                  <h3 className="text-xl md:text-3xl font-serif italic text-charcoal">{editingItem ? 'Refine Essence' : 'Distill New Essence'}</h3>
                  <p className="text-[7px] md:text-[9px] uppercase tracking-[0.3em] text-gold mt-1 md:mt-2 font-bold">House of Kashume Protocol</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform duration-500 text-charcoal/60 hover:text-charcoal"><X size={24} strokeWidth={1} /></button>
              </div>
              
              <form onSubmit={handleSave} className="p-6 md:p-10 space-y-8 md:space-y-10 overflow-y-auto custom-scrollbar bg-white flex-grow">
                {activeTab === 'inventory' && (
                  <div className="space-y-10 md:space-y-12 text-charcoal">
                    {/* Core Identity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Essence Name</label>
                        <input className="w-full border-b-2 border-charcoal/40 p-2 md:p-3 text-base md:text-lg font-serif italic focus:border-gold outline-none transition-all bg-[#F5F2ED]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Botanical Group</label>
                        <select className="w-full border-b-2 border-charcoal/40 p-2 md:p-3 text-xs md:text-sm focus:border-gold outline-none transition-all bg-[#F5F2ED] font-bold" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                          <option value="">Select Collection</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Target Gender</label>
                        <select className="w-full border-b-2 border-charcoal/40 p-2 md:p-3 text-xs md:text-sm focus:border-gold outline-none transition-all bg-[#F5F2ED] font-bold" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                          <option value="Men">Men</option>
                          <option value="Women">Women</option>
                          <option value="Unisex">Unisex</option>
                        </select>
                      </div>
                    </div>

                    {/* Value & Scarcity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Value (PKR)</label>
                        <input type="number" className="w-full border-b-2 border-charcoal/40 p-2 md:p-3 text-xs md:text-sm focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Original Value (PKR)</label>
                        <input type="number" className="w-full border-b-2 border-charcoal/40 p-2 md:p-3 text-xs md:text-sm focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.original_price} onChange={e => setFormData({...formData, original_price: e.target.value})} placeholder="Optional" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Inventory Stock</label>
                        <input type="number" className="w-full border-b-2 border-charcoal/40 p-2 md:p-3 text-xs md:text-sm focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                      </div>
                      <div className="flex flex-wrap gap-4 md:gap-6 pt-2 md:pt-6 col-span-1">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="newArrival" className="w-4 h-4 md:w-5 md:h-5 accent-gold cursor-pointer" checked={formData.is_new_arrival} onChange={e => setFormData({...formData, is_new_arrival: e.target.checked})} />
                          <label htmlFor="newArrival" className="text-[9px] md:text-[10px] uppercase tracking-widest text-charcoal font-bold cursor-pointer">New Arrival</label>
                        </div>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="isBundle" className="w-4 h-4 md:w-5 md:h-5 accent-gold cursor-pointer" checked={formData.is_bundle} onChange={e => setFormData({...formData, is_bundle: e.target.checked})} />
                          <label htmlFor="isBundle" className="text-[9px] md:text-[10px] uppercase tracking-widest text-charcoal font-bold cursor-pointer">Bundle</label>
                        </div>
                      </div>
                    </div>

                    {/* Narrative */}
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Scent Narrative (Description)</label>
                      <textarea className="w-full border-2 border-charcoal/40 p-3 md:p-4 text-[10px] md:text-xs font-bold leading-relaxed outline-none focus:border-gold h-32 resize-none italic bg-[#F5F2ED] rounded-xl" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>

                    {/* Olfactory Pyramid */}
                    <div className="space-y-6">
                      <h4 className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-bold text-gold border-b-2 border-gold/50 pb-2 flex items-center gap-2">
                        <Droplets size={12} /> Olfactory Pyramid
                      </h4>
                      <div className="grid grid-cols-1 gap-4 md:gap-6">
                        {['top', 'heart', 'base'].map(type => (
                          <div key={type} className="space-y-2">
                            <label className="text-[8px] md:text-[9px] uppercase tracking-widest text-charcoal font-bold block capitalize">{type} Notes</label>
                            <input 
                              placeholder="Comma separated: Saffron, Bergamot, Jasmine..."
                              className="w-full border-b-2 border-charcoal/40 p-2 text-[10px] md:text-xs focus:border-gold outline-none bg-[#F5F2ED] font-bold" 
                              value={formData.scent_notes?.[type]?.join(', ') || ''} 
                              onChange={e => handleNoteChange(type, e.target.value)} 
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Performance Profile */}
                    <div className="space-y-6">
                      <h4 className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-bold text-gold border-b-2 border-gold/50 pb-2 flex items-center gap-2">
                        <Thermometer size={12} /> Performance Profile
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-2">
                          <label className="text-[8px] md:text-[9px] uppercase tracking-widest text-charcoal font-bold block">Longevity</label>
                          <select className="w-full border-b-2 border-charcoal/40 p-2 text-[10px] md:text-xs focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.performance?.longevity} onChange={e => setFormData({...formData, performance: {...formData.performance, longevity: e.target.value}})}>
                            <option value="Moderate">Moderate</option>
                            <option value="Long Lasting">Long Lasting</option>
                            <option value="Eternal">Eternal</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] md:text-[9px] uppercase tracking-widest text-charcoal font-bold block">Sillage</label>
                          <select className="w-full border-b-2 border-charcoal/40 p-2 text-[10px] md:text-xs focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.performance?.sillage} onChange={e => setFormData({...formData, performance: {...formData.performance, sillage: e.target.value}})}>
                            <option value="Intimate">Intimate</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Strong">Strong</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Intelligence */}
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Shipping Manifesto</label>
                      <textarea className="w-full border-2 border-charcoal/40 p-3 md:p-4 text-[9px] md:text-[10px] font-bold leading-relaxed outline-none focus:border-gold h-20 resize-none text-charcoal bg-[#F5F2ED] rounded-xl" value={formData.shipping} onChange={e => setFormData({...formData, shipping: e.target.value})} />
                    </div>
                    
                    {/* Gallery Archives */}
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
                        <label className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-charcoal font-bold block">Visual Archives</label>
                        <span className="text-[7px] md:text-[8px] uppercase tracking-widest text-gold font-bold italic">Arrows to prioritize • Primary is first</span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                        {formData.images?.map((url, i) => (
                          <motion.div 
                            layout
                            key={url} 
                            className="relative aspect-[3/4] ring-2 ring-charcoal/10 group overflow-hidden bg-[#F5F2ED] rounded-xl"
                          >
                            <img src={url} className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700" />
                            
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-charcoal/80 md:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                              <div className="flex justify-between">
                                <button type="button" onClick={() => removeImage(i)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg">
                                  <X size={12} className="w-2.5 h-2.5 md:w-3 md:h-3" strokeWidth={3} />
                                </button>
                                {i === 0 && <span className="text-[6px] md:text-[7px] uppercase tracking-widest bg-gold text-charcoal px-1.5 py-0.5 md:px-2 md:py-1 font-bold rounded-md">Primary</span>}
                              </div>
                              
                              <div className="flex justify-center gap-2 pb-1">
                                <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="p-1.5 bg-white/30 text-white rounded-lg hover:bg-white/50 disabled:opacity-20 transition-all backdrop-blur-sm">
                                  <ArrowLeft size={12} className="w-2.5 h-2.5 md:w-3 md:h-3 rotate-90" strokeWidth={3} />
                                </button>
                                <button type="button" onClick={() => moveImage(i, 1)} disabled={i === formData.images.length - 1} className="p-1.5 bg-white/30 text-white rounded-lg hover:bg-white/50 disabled:opacity-20 transition-all backdrop-blur-sm">
                                  <ArrowLeft size={12} className="w-2.5 h-2.5 md:w-3 md:h-3 -rotate-90" strokeWidth={3} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        
                        <label className={`aspect-[3/4] border-2 border-dashed border-charcoal/30 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F5F2ED] hover:border-gold transition-all duration-500 group rounded-xl ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                          <input type="file" className="hidden" multiple onChange={handleImageUpload} accept="image/*" />
                          {uploadingImage ? (
                            <Loader2 size={24} className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gold" />
                          ) : (
                            <>
                              <Plus size={24} className="w-5 h-5 md:w-6 md:h-6 text-charcoal/30 group-hover:text-gold transition-colors mb-2" />
                              <span className="text-[7px] md:text-[8px] uppercase tracking-widest text-charcoal/60 font-bold">Add Images</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'categories' && (
                  <div className="space-y-6 md:space-y-8">
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Group Name</label>
                      <input className="w-full border-b-2 border-charcoal/40 p-2 md:p-3 text-base md:text-lg font-serif italic focus:border-gold outline-none bg-[#F5F2ED] text-charcoal font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Botanical Slug</label>
                      <input className="w-full border-b-2 border-charcoal/40 p-2 md:p-3 text-[10px] md:text-xs font-mono focus:border-gold outline-none text-charcoal bg-[#F5F2ED] font-bold" placeholder="e.g. aromatic-floral" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
                    </div>
                  </div>
                )}

                {activeTab === 'promos' && (
                  <div className="space-y-6 md:space-y-8">
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Secret Token Code</label>
                      <input className="w-full border-b-2 border-charcoal/40 p-2 md:p-3 text-lg md:text-xl font-mono uppercase tracking-widest text-gold-700 focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Gratuity (%)</label>
                        <input type="number" className="w-full border-b-2 border-charcoal/40 p-2 md:p-3 text-xs md:text-sm focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Soul Expiration</label>
                        <input type="date" className="w-full border-b-2 border-charcoal/40 p-2 md:p-3 text-xs md:text-sm focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} required />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'faqs' && (
                  <div className="space-y-6 md:space-y-8">
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">The Question</label>
                      <input className="w-full border-b-2 border-charcoal/40 p-2 md:p-3 text-base md:text-lg font-serif italic focus:border-gold outline-none bg-[#F5F2ED] text-charcoal font-bold" value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">The Answer</label>
                      <textarea className="w-full border-2 border-charcoal/40 p-3 md:p-4 text-[10px] md:text-xs font-bold leading-relaxed outline-none focus:border-gold h-40 resize-none italic bg-[#F5F2ED] rounded-xl text-charcoal" value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Display Priority (Order)</label>
                      <input type="number" className="w-full border-b-2 border-charcoal/40 p-2 md:p-3 text-xs md:text-sm focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.display_order} onChange={e => setFormData({...formData, display_order: e.target.value})} required />
                    </div>
                  </div>
                )}

                <div className="sticky bottom-0 bg-white pt-6 md:pt-10 pb-4 border-t border-charcoal/20 mt-6 md:mt-10">
                  <button type="submit" className="w-full bg-charcoal text-ivory py-4 md:py-6 text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] hover:bg-gold hover:text-charcoal transition-all duration-700 shadow-2xl font-bold">
                    Finalize {activeTab === 'inventory' ? 'Inventory' : activeTab === 'categories' ? 'Category' : activeTab === 'promos' ? 'Promo' : activeTab === 'faqs' ? 'FAQ' : activeTab} Protocol
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Details Modal */}
      <AnimatePresence>
        {isOrderModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 backdrop-blur-md">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOrderModalOpen(false)} className="absolute inset-0 bg-charcoal/90" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="bg-white w-full max-w-2xl relative z-10 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 md:p-8 border-b border-charcoal/10 flex justify-between items-center bg-[#F5F2ED]">
                <div>
                  <h3 className="text-xl md:text-2xl font-serif italic text-charcoal font-bold">Order Details</h3>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-gold mt-1 font-bold italic">Reference: #{selectedOrder.id.slice(0, 8)}</p>
                </div>
                <button onClick={() => setIsOrderModalOpen(false)} className="text-charcoal/60 hover:text-charcoal"><X size={24} /></button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-8">
                {/* Client Information */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold flex items-center gap-2">
                      <User size={14} /> Client Identity
                    </h4>
                    <div className="space-y-1">
                      <p className="text-base font-bold text-charcoal">{selectedOrder.customer_name}</p>
                      <p className="text-xs text-charcoal/60 font-medium">{selectedOrder.customer_email}</p>
                      <p className="text-xs text-charcoal/60 font-mono">{selectedOrder.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold flex items-center gap-2">
                      <Truck size={14} /> Shipping Protocol
                    </h4>
                    <p className="text-xs leading-relaxed italic text-charcoal/80 font-medium">{selectedOrder.shipping_address}</p>
                  </div>
                </section>

                {/* Selection Ledger */}
                <section className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold flex items-center gap-2">
                    <ShoppingBag size={14} /> Selection Ledger
                  </h4>
                  <div className="space-y-3">
                    {Object.values(selectedOrder.items || {}).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-[#F5F2ED] p-3 rounded-xl border border-charcoal/5">
                        <div className="w-12 h-16 bg-white overflow-hidden rounded-lg border border-charcoal/10 flex-shrink-0">
                          <img src={item.image} className="w-full h-full object-cover grayscale-[10%]" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-bold text-charcoal font-serif italic">{item.name}</p>
                          <p className="text-[10px] text-charcoal/40 uppercase tracking-widest font-black">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-sans font-black text-charcoal">Rs. {item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Financial Summary */}
                <section className="pt-6 border-t border-charcoal/10 flex justify-between items-end">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40 font-bold">Exchange Protocol</p>
                    <p className="text-xs font-bold text-gold uppercase tracking-widest">{selectedOrder.payment_method}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40 font-bold">Total Valuation</p>
                    <p className="text-2xl font-serif italic font-black text-charcoal">Rs. {selectedOrder.total.toLocaleString()}</p>
                  </div>
                </section>
              </div>
              
              <div className="p-6 bg-[#F5F2ED] border-t border-charcoal/10 flex justify-end">
                <button onClick={() => setIsOrderModalOpen(false)} className="bg-charcoal text-white px-8 py-3 text-[10px] uppercase tracking-[0.4em] hover:bg-gold transition-all duration-700 font-bold">
                  Close Archive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 50, scale: 0.9 }} 
            className={`fixed bottom-6 md:bottom-12 left-6 right-6 md:left-auto md:right-12 z-[100] px-6 md:px-10 py-4 md:py-5 shadow-2xl flex items-center justify-center md:justify-start gap-4 ${notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-charcoal text-gold'}`}
          >
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold text-center md:text-left">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
