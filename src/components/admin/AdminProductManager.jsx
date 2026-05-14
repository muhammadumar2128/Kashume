import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Trash2, Edit, Save, X, Image as ImageIcon, 
  Search, Filter, ArrowLeft, Loader2, CheckCircle2, AlertCircle,
  Package, ShoppingBag, Clock, CheckCircle, Truck, Upload,
  Tag, Settings, LogOut, Key, Hash, LayoutGrid, Database,
  Eye, Droplets, Thermometer, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

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
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    try {
      if (activeTab === 'inventory') {
        // Try fetching products without the join first to see if it's the join causing the 500
        const { data: productsData, error: pError } = await supabase
          .from('products')
          .select('*, categories(name)')
          .order('created_at', { ascending: false });
        
        if (pError) {
          console.error("Products Fetch Error:", pError);
          // Fallback to simple select if join fails
          const { data: simpleData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
          setProducts(simpleData || []);
          showNotification("Product join failed, showing simplified view", "error");
        } else {
          setProducts(productsData || []);
        }

        const { data: catData, error: cError } = await supabase.from('categories').select('*').order('name');
        if (cError) console.error("Categories Fetch Error:", cError);
        setCategories(catData || []);

      } else if (activeTab === 'categories') {
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (error) throw error;
        setCategories(data || []);
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
    }
    setLoading(false);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Modal Logic ---
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
    let table = activeTab === 'inventory' ? 'products' : activeTab === 'promos' ? 'promocodes' : activeTab;
    let payload = { ...formData };
    
    if (activeTab === 'inventory') {
      payload.price = parseFloat(payload.price);
      payload.original_price = payload.original_price ? parseFloat(payload.original_price) : null;
      payload.stock = parseInt(payload.stock);
      delete payload.categories;
    }

    if (activeTab === 'faqs') {
      payload.display_order = parseInt(payload.display_order);
    }

    const { error } = editingItem 
      ? await supabase.from(table).update(payload).eq('id', editingItem.id)
      : await supabase.from(table).insert([payload]);

    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        showNotification("Database schema needs update. Please run migrations.", 'error');
      } else {
        showNotification(error.message, 'error');
      }
    } else {
      showNotification(`${activeTab.slice(0, -1)} saved successfully`);
      setIsModalOpen(false);
      fetchData();
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
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    const newImages = [...(formData.images || [])];

    try {
      for (const file of files) {
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(`essences/${fileName}`, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(`essences/${fileName}`);

        newImages.push(publicUrl);
      }

      setFormData(prev => ({ ...prev, images: newImages }));
      showNotification(`${files.length} Visual(s) captured successfully`);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setUploadingImage(false);
      e.target.value = null; // Reset input
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
    <div className="min-h-screen bg-[#F5F2ED] flex font-sans text-charcoal">
      {/* Sidebar */}
      <aside className="w-64 bg-charcoal text-ivory flex flex-col sticky top-0 h-screen shrink-0 shadow-2xl z-40">
        <div className="p-10 border-b border-white/10">
          <Link to="/" className="text-3xl font-serif italic tracking-widest uppercase block">Kashume</Link>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <p className="text-[8px] uppercase tracking-[0.4em] text-gold font-bold">Command Center</p>
          </div>
        </div>

        <nav className="flex-grow p-6 space-y-3 mt-4">
          {[
            { id: 'inventory', label: 'Inventory', icon: Database },
            { id: 'categories', label: 'Botanical Library', icon: LayoutGrid },
            { id: 'orders', label: 'Order Ledger', icon: ShoppingBag },
            { id: 'promos', label: 'Scent Tokens', icon: Tag },
            { id: 'faqs', label: 'Archives (FAQ)', icon: HelpCircle },
            { id: 'settings', label: 'Sanctum', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${
                activeTab === tab.id 
                ? 'bg-gold text-charcoal font-bold shadow-lg shadow-gold/20 translate-x-2' 
                : 'hover:bg-white/10 text-ivory/70'
              }`}
            >
              <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} /> {tab.label}
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

      {/* Main Content */}
      <main className="flex-grow p-12 overflow-y-auto bg-white/50">
        <header className="mb-16 flex justify-between items-end border-b border-charcoal/20 pb-8">
          <div>
            <h2 className="text-5xl font-serif italic capitalize tracking-tight text-charcoal">{activeTab}</h2>
            <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/80 mt-4 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-charcoal/60" /> Governing the House of Kashume
            </p>
          </div>
          {activeTab !== 'orders' && activeTab !== 'settings' && (
            <button 
              onClick={() => openModal()}
              className="bg-charcoal text-ivory px-10 py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-gold hover:text-charcoal transition-all duration-700 shadow-2xl shadow-charcoal/30"
            >
              Add New {activeTab.slice(0, -1)}
            </button>
          )}
        </header>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-charcoal/20">
            <Loader2 size={40} className="animate-spin mb-6" />
            <span className="text-[10px] uppercase tracking-[0.6em] animate-pulse">Consulting the Archives...</span>
          </div>
        ) : (
          <div className="bg-white border border-charcoal/20 shadow-2xl shadow-charcoal/10 overflow-hidden rounded-xl">
            {/* Inventory View */}
            {activeTab === 'inventory' && (
              <table className="w-full text-left">
                <thead className="bg-[#F5F2ED] border-b border-charcoal/30 text-[9px] uppercase tracking-[0.3em] text-charcoal font-bold">
                  <tr>
                    <th className="p-6">The Essence</th>
                    <th className="p-6">Collection</th>
                    <th className="p-6">Value</th>
                    <th className="p-6">Stock</th>
                    <th className="p-6 text-right">Sanctum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/10 text-sm font-light">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-[#F5F2ED] transition-all duration-300 group text-charcoal">
                      <td className="p-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-20 bg-ivory overflow-hidden ring-1 ring-charcoal/20 group-hover:shadow-xl transition-all rounded-sm flex items-center justify-center">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} className="w-full h-full object-cover grayscale-[10%]" />
                            ) : (
                              <ImageIcon size={20} className="text-charcoal/20" />
                            )}
                          </div>
                          <div>
                            <span className="font-serif italic text-lg block text-charcoal font-bold">{p.name}</span>
                            <div className="flex gap-2 mt-1">
                              {p.is_new_arrival && (
                                <span className="text-[7px] uppercase tracking-widest bg-gold text-charcoal px-1.5 py-0.5 font-bold rounded-sm">
                                  New Arrival
                                </span>
                              )}
                              {p.is_bundle && (
                                <span className="text-[7px] uppercase tracking-widest bg-charcoal text-ivory px-1.5 py-0.5 font-bold rounded-sm">
                                  Bundle
                                </span>
                              )}
                              {!p.is_new_arrival && !p.is_bundle && (
                                <span className="text-[7px] uppercase tracking-widest text-charcoal/80 font-bold">
                                  Classic Collection
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-[10px] uppercase tracking-widest text-charcoal font-bold">{p.categories?.name}</td>
                      <td className="p-6 font-sans font-bold text-charcoal">Rs. {p.price}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${p.stock < 5 ? 'bg-red-600 animate-pulse' : 'bg-green-700'}`} />
                          <span className="font-mono text-xs font-bold text-charcoal">{p.stock} Units</span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal(p)} className="p-2 text-charcoal/60 hover:text-gold transition-colors"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(p.id, 'products')} className="p-2 text-charcoal/60 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Other views remain similarly updated for style... */}
            {activeTab === 'categories' && (
              <table className="w-full text-left">
                <thead className="bg-[#F5F2ED] border-b border-charcoal/30 text-[9px] uppercase tracking-[0.3em] text-charcoal font-bold">
                  <tr>
                    <th className="p-6">Botanical Group</th>
                    <th className="p-6">Digital Slug</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/10 text-sm font-light">
                  {categories.map(c => (
                    <tr key={c.id} className="hover:bg-[#F5F2ED] transition-all duration-300 text-charcoal">
                      <td className="p-6 font-serif italic text-lg font-bold">{c.name}</td>
                      <td className="p-6 font-mono text-xs text-charcoal/80 font-bold">{c.slug}</td>
                      <td className="p-6 text-right">
                        <button onClick={() => openModal(c)} className="p-2 text-charcoal/60 hover:text-gold transition-colors"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(c.id, 'categories')} className="p-2 text-charcoal/60 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Orders View */}
            {activeTab === 'orders' && (
              <table className="w-full text-left">
                <thead className="bg-[#F5F2ED] border-b border-charcoal/10 text-[9px] uppercase tracking-[0.3em] text-charcoal font-bold">
                  <tr>
                    <th className="p-6">Order ID</th>
                    <th className="p-6">Client</th>
                    <th className="p-6">Value</th>
                    <th className="p-6">Status</th>
                    <th className="p-6 text-right">Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/5 text-sm font-light">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-[#F5F2ED]/50 text-charcoal">
                      <td className="p-6 font-mono text-[10px] text-charcoal/60 font-bold">#{o.id.slice(0,8)}</td>
                      <td className="p-6 font-medium">{o.customer_email}</td>
                      <td className="p-6 font-sans font-bold">Rs. {o.total}</td>
                      <td className="p-6">
                        <span className={`text-[8px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold ${
                          o.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gold/20 text-gold-800'
                        }`}>{o.status}</span>
                      </td>
                      <td className="p-6 text-right">
                        <select 
                          className="text-[9px] uppercase tracking-widest bg-white border border-charcoal/20 p-2 focus:outline-none focus:border-gold transition-colors rounded-sm text-charcoal font-bold"
                          onChange={async (e) => {
                            await supabase.from('orders').update({ status: e.target.value }).eq('id', o.id);
                            fetchData();
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

            {/* Scent Tokens (Promos) View */}
            {activeTab === 'promos' && (
              <table className="w-full text-left">
                <thead className="bg-[#F5F2ED] border-b border-charcoal/10 text-[9px] uppercase tracking-[0.3em] text-charcoal font-bold">
                  <tr>
                    <th className="p-6">Secret Code</th>
                    <th className="p-6">Gratuity</th>
                    <th className="p-6">Expiration</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/5 text-sm font-light">
                  {promos.map(p => (
                    <tr key={p.id} className="hover:bg-[#F5F2ED]/50 text-charcoal">
                      <td className="p-6 font-mono font-bold text-gold-700 tracking-widest">{p.code}</td>
                      <td className="p-6 font-bold">{p.discount}% OFF</td>
                      <td className="p-6 text-[10px] text-charcoal/70 uppercase tracking-widest font-bold">{new Date(p.expiry_date).toLocaleDateString('en-GB')}</td>
                      <td className="p-6 text-right">
                        <button onClick={() => handleDelete(p.id, 'promocodes')} className="p-2 text-charcoal/40 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* FAQs View */}
            {activeTab === 'faqs' && (
              <table className="w-full text-left">
                <thead className="bg-[#F5F2ED] border-b border-charcoal/10 text-[9px] uppercase tracking-[0.3em] text-charcoal font-bold">
                  <tr>
                    <th className="p-6">Order</th>
                    <th className="p-6">Question</th>
                    <th className="p-6">Answer</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/5 text-sm font-light">
                  {faqs.map(f => (
                    <tr key={f.id} className="hover:bg-[#F5F2ED]/50 transition-all duration-300 text-charcoal">
                      <td className="p-6 font-mono text-xs text-charcoal/60 font-bold">{f.display_order}</td>
                      <td className="p-6 font-serif italic text-lg">{f.question}</td>
                      <td className="p-6 max-w-xs truncate text-charcoal/70">{f.answer}</td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openModal(f)} className="p-2 text-charcoal/40 hover:text-gold transition-colors"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(f.id, 'faqs')} className="p-2 text-charcoal/40 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Sanctum (Settings) */}
            {activeTab === 'settings' && (
              <div className="p-20 max-w-xl mx-auto">
                <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto mb-6">
                    <Key size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-serif italic text-charcoal">Update Credentials</h3>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/80 mt-4">Security of the Kashume Sanctum</p>
                </div>
                <form onSubmit={handleUpdatePassword} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-charcoal block ml-1 font-black">New Password</label>
                    <input 
                      type="password" 
                      className="w-full border-b-2 border-charcoal/40 p-4 text-sm focus:border-gold outline-none bg-[#F5F2ED] transition-all text-center font-serif text-lg rounded-t-lg text-charcoal font-bold"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-charcoal block ml-1 font-black">Confirm Identity</label>
                    <input 
                      type="password" 
                      className="w-full border-b-2 border-charcoal/40 p-4 text-sm focus:border-gold outline-none bg-[#F5F2ED] transition-all text-center font-serif text-lg rounded-t-lg text-charcoal font-bold"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="w-full bg-charcoal text-ivory py-5 text-[10px] uppercase tracking-[0.4em] hover:bg-gold hover:text-charcoal transition-all duration-700 shadow-2xl font-bold">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8 backdrop-blur-md">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-charcoal/90" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="bg-white w-full max-w-3xl relative z-10 shadow-2xl flex flex-col max-h-[90vh] rounded-3xl overflow-hidden">
              <div className="p-10 border-b border-charcoal/10 flex justify-between items-center bg-[#F5F2ED]">
                <div>
                  <h3 className="text-3xl font-serif italic text-charcoal">{editingItem ? 'Refine Essence' : 'Distill New Essence'}</h3>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-gold mt-2 font-bold">House of Kashume Protocol</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform duration-500 text-charcoal/60 hover:text-charcoal"><X size={24} strokeWidth={1} /></button>
              </div>
              
              <form onSubmit={handleSave} className="p-10 space-y-10 overflow-y-auto custom-scrollbar bg-white">
                {activeTab === 'inventory' && (
                  <div className="space-y-12 text-charcoal">
                    {/* Core Identity */}
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Essence Name</label>
                        <input className="w-full border-b-2 border-charcoal/40 p-3 text-lg font-serif italic focus:border-gold outline-none transition-all bg-[#F5F2ED]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Botanical Group</label>
                        <select className="w-full border-b-2 border-charcoal/40 p-3 text-sm focus:border-gold outline-none transition-all bg-[#F5F2ED] font-bold" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required>
                          <option value="">Select Collection</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Value & Scarcity */}
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Value (PKR)</label>
                        <input type="number" className="w-full border-b-2 border-charcoal/40 p-3 text-sm focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Original Value (PKR)</label>
                        <input type="number" className="w-full border-b-2 border-charcoal/40 p-3 text-sm focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.original_price} onChange={e => setFormData({...formData, original_price: e.target.value})} placeholder="Optional" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Inventory Stock</label>
                        <input type="number" className="w-full border-b-2 border-charcoal/40 p-3 text-sm focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                      </div>
                      <div className="flex flex-wrap gap-6 pt-6 col-span-1">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="newArrival" className="w-5 h-5 accent-gold cursor-pointer" checked={formData.is_new_arrival} onChange={e => setFormData({...formData, is_new_arrival: e.target.checked})} />
                          <label htmlFor="newArrival" className="text-[10px] uppercase tracking-widest text-charcoal font-bold cursor-pointer">New Arrival</label>
                        </div>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="isBundle" className="w-5 h-5 accent-gold cursor-pointer" checked={formData.is_bundle} onChange={e => setFormData({...formData, is_bundle: e.target.checked})} />
                          <label htmlFor="isBundle" className="text-[10px] uppercase tracking-widest text-charcoal font-bold cursor-pointer">Bundle</label>
                        </div>
                      </div>
                    </div>

                    {/* Narrative */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Scent Narrative (Description)</label>
                      <textarea className="w-full border-2 border-charcoal/40 p-4 text-xs font-bold leading-relaxed outline-none focus:border-gold h-32 resize-none italic bg-[#F5F2ED] rounded-xl" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>

                    {/* Olfactory Pyramid */}
                    <div className="space-y-6">
                      <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold border-b-2 border-gold/50 pb-2 flex items-center gap-2">
                        <Droplets size={12} /> Olfactory Pyramid
                      </h4>
                      <div className="grid grid-cols-1 gap-6">
                        {['top', 'heart', 'base'].map(type => (
                          <div key={type} className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest text-charcoal font-bold block capitalize">{type} Notes</label>
                            <input 
                              placeholder="Comma separated: Saffron, Bergamot, Jasmine..."
                              className="w-full border-b-2 border-charcoal/40 p-2 text-xs focus:border-gold outline-none bg-[#F5F2ED] font-bold" 
                              value={formData.scent_notes?.[type]?.join(', ') || ''} 
                              onChange={e => handleNoteChange(type, e.target.value)} 
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Performance Profile */}
                    <div className="space-y-6">
                      <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold border-b-2 border-gold/50 pb-2 flex items-center gap-2">
                        <Thermometer size={12} /> Performance Profile
                      </h4>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest text-charcoal font-bold block">Longevity</label>
                          <select className="w-full border-b-2 border-charcoal/40 p-2 text-xs focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.performance?.longevity} onChange={e => setFormData({...formData, performance: {...formData.performance, longevity: e.target.value}})}>
                            <option value="Moderate">Moderate</option>
                            <option value="Long Lasting">Long Lasting</option>
                            <option value="Eternal">Eternal</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest text-charcoal font-bold block">Sillage</label>
                          <select className="w-full border-b-2 border-charcoal/40 p-2 text-xs focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.performance?.sillage} onChange={e => setFormData({...formData, performance: {...formData.performance, sillage: e.target.value}})}>
                            <option value="Intimate">Intimate</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Strong">Strong</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Intelligence */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Shipping Manifesto</label>
                      <textarea className="w-full border-2 border-charcoal/40 p-4 text-[10px] font-bold leading-relaxed outline-none focus:border-gold h-20 resize-none text-charcoal bg-[#F5F2ED] rounded-xl" value={formData.shipping} onChange={e => setFormData({...formData, shipping: e.target.value})} />
                    </div>
                    
                    {/* Gallery Archives */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] uppercase tracking-[0.4em] text-charcoal font-bold block">Visual Archives</label>
                        <span className="text-[8px] uppercase tracking-widest text-gold font-bold italic">Drag to reorder functionality coming soon • Use arrows to prioritize</span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4">
                        {formData.images?.map((url, i) => (
                          <motion.div 
                            layout
                            key={url} 
                            className="relative aspect-[3/4] ring-2 ring-charcoal/10 group overflow-hidden bg-[#F5F2ED] rounded-xl"
                          >
                            <img src={url} className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700" />
                            
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-charcoal/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                              <div className="flex justify-between">
                                <button type="button" onClick={() => removeImage(i)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg">
                                  <X size={12} strokeWidth={3} />
                                </button>
                                {i === 0 && <span className="text-[7px] uppercase tracking-widest bg-gold text-charcoal px-2 py-1 font-bold rounded-md">Primary</span>}
                              </div>
                              
                              <div className="flex justify-center gap-2 pb-1">
                                <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="p-1.5 bg-white/30 text-white rounded-lg hover:bg-white/50 disabled:opacity-20 transition-all backdrop-blur-sm">
                                  <ArrowLeft size={12} strokeWidth={3} className="rotate-90" />
                                </button>
                                <button type="button" onClick={() => moveImage(i, 1)} disabled={i === formData.images.length - 1} className="p-1.5 bg-white/30 text-white rounded-lg hover:bg-white/50 disabled:opacity-20 transition-all backdrop-blur-sm">
                                  <ArrowLeft size={12} strokeWidth={3} className="-rotate-90" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        
                        <label className={`aspect-[3/4] border-2 border-dashed border-charcoal/30 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F5F2ED] hover:border-gold transition-all duration-500 group rounded-xl ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                          <input type="file" className="hidden" multiple onChange={handleImageUpload} accept="image/*" />
                          {uploadingImage ? (
                            <Loader2 size={24} className="animate-spin text-gold" />
                          ) : (
                            <>
                              <Plus size={24} className="text-charcoal/30 group-hover:text-gold transition-colors mb-2" />
                              <span className="text-[8px] uppercase tracking-widest text-charcoal/60 font-bold">Capture Batch</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'categories' && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Group Name</label>
                      <input className="w-full border-b-2 border-charcoal/40 p-3 text-lg font-serif italic focus:border-gold outline-none bg-[#F5F2ED] text-charcoal font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Botanical Slug</label>
                      <input className="w-full border-b-2 border-charcoal/40 p-3 text-xs font-mono focus:border-gold outline-none text-charcoal bg-[#F5F2ED] font-bold" placeholder="e.g. aromatic-floral" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
                    </div>
                  </div>
                )}

                {activeTab === 'promos' && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Secret Token Code</label>
                      <input className="w-full border-b-2 border-charcoal/40 p-3 text-xl font-mono uppercase tracking-widest text-gold-700 focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Gratuity (%)</label>
                        <input type="number" className="w-full border-b-2 border-charcoal/40 p-3 text-sm focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Soul Expiration</label>
                        <input type="date" className="w-full border-b-2 border-charcoal/40 p-3 text-sm focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} required />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'faqs' && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">The Question</label>
                      <input className="w-full border-b-2 border-charcoal/40 p-3 text-lg font-serif italic focus:border-gold outline-none bg-[#F5F2ED] text-charcoal font-bold" value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">The Answer</label>
                      <textarea className="w-full border-2 border-charcoal/40 p-4 text-xs font-bold leading-relaxed outline-none focus:border-gold h-40 resize-none italic bg-[#F5F2ED] rounded-xl text-charcoal" value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-charcoal font-bold block">Display Priority (Order)</label>
                      <input type="number" className="w-full border-b-2 border-charcoal/40 p-3 text-sm focus:border-gold outline-none bg-[#F5F2ED] font-bold" value={formData.display_order} onChange={e => setFormData({...formData, display_order: e.target.value})} required />
                    </div>
                  </div>
                )}

                <div className="sticky bottom-0 bg-white pt-10 pb-4 border-t border-charcoal/20 mt-10">
                  <button type="submit" className="w-full bg-charcoal text-ivory py-6 text-[10px] uppercase tracking-[0.4em] hover:bg-gold hover:text-charcoal transition-all duration-700 shadow-2xl font-bold">
                    Finalize {activeTab.slice(0, -1)} Protocol
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} className={`fixed bottom-12 right-12 z-[60] px-10 py-5 shadow-2xl flex items-center gap-4 ${notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-charcoal text-gold'}`}>
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple Link component for inside the header if needed
const Link = ({ to, children, className, ...props }) => (
  <a href={to} className={className} {...props}>{children}</a>
);

export default AdminDashboard;
