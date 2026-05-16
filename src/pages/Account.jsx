import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Package, 
  MapPin, 
  LogOut, 
  Plus, 
  Trash2, 
  Check, 
  ChevronRight, 
  Loader2,
  Calendar,
  CreditCard,
  MapPinned,
  Droplets,
  Sparkles
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const Account = () => {
  const { user, profile, logout, refreshProfile, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scentProfile, setScentProfile] = useState({ topNotes: [], recommendation: '' });
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // Security States
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || ''
  });

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    title: 'Home',
    full_name: '',
    phone: '',
    street_address: '',
    city: '',
    province: 'Punjab',
    is_default: false
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, addressesRes] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false })
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (addressesRes.error) throw addressesRes.error;

      setOrders(ordersRes.data);
      setAddresses(addressesRes.data);
      
      if (ordersRes.data.length > 0) {
        calculateScentProfile(ordersRes.data);
      }
    } catch (error) {
      console.error('Error fetching account data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateScentProfile = (orderHistory) => {
    const noteCounts = {};
    orderHistory.forEach(order => {
      Object.values(order.items || {}).forEach(item => {
        const allNotes = [
          ...(item.scent_notes?.top || []),
          ...(item.scent_notes?.heart || []),
          ...(item.scent_notes?.base || [])
        ];
        allNotes.forEach(note => {
          noteCounts[note] = (noteCounts[note] || 0) + item.quantity;
        });
      });
    });

    const sortedNotes = Object.entries(noteCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([note]) => note);

    let recommendation = "You haven't explored enough essences yet for a recommendation.";
    if (sortedNotes.length > 0) {
      if (sortedNotes.some(n => ['Oud', 'Saffron', 'Leather'].includes(n))) {
        recommendation = "You lean towards Bold & Oriental essences. Consider exploring our 'Intense' collection.";
      } else if (sortedNotes.some(n => ['Bergamot', 'Lemon', 'Marine'].includes(n))) {
        recommendation = "You prefer Fresh & Vibrating notes. Our 'Aromatic' library would suit you well.";
      } else {
        recommendation = "You have a balanced olfactory palette. We recommend trying our latest 'Discovery Set'.";
      }
    }

    setScentProfile({ topNotes: sortedNotes, recommendation });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      setEditingProfile(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('addresses')
        .insert([{ ...addressForm, user_id: user.id }]);

      if (error) throw error;
      setShowAddressForm(false);
      fetchData();
      setAddressForm({
        title: 'Home',
        full_name: '',
        phone: '',
        street_address: '',
        city: '',
        province: 'Punjab',
        is_default: false
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const toggleDefaultAddress = async (address) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', address.id);
      
      if (error) throw error;
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordStatus('loading');
    try {
      await updatePassword(newPassword);
      setPasswordStatus('success');
      setNewPassword('');
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordStatus('');
      }, 3000);
    } catch (error) {
      alert(error.message);
      setPasswordStatus('');
    }
  };

  const toggleNewsletter = async () => {
    setIsUpdatingNewsletter(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ newsletter_subscribed: !profile?.newsletter_subscribed })
        .eq('id', user.id);
      
      if (error) throw error;
      await refreshProfile();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsUpdatingNewsletter(false);
    }
  };

  const tabs = [
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'security', label: 'Security', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-8">
            <div className="space-y-2">
              <h2 className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">The House of Kashume</h2>
              <p className="text-2xl font-serif italic text-charcoal">{profile?.full_name || 'Valued Client'}</p>
              <p className="text-[10px] text-charcoal/40 tracking-wider uppercase">{user?.email}</p>
            </div>

            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-4 px-4 py-4 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 border-l-2 ${
                    activeTab === tab.id 
                      ? 'bg-white border-gold text-charcoal shadow-sm' 
                      : 'border-transparent text-charcoal/40 hover:text-charcoal hover:bg-white/50'
                  }`}
                >
                  <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
                  {tab.label}
                </button>
              ))}
              <button
                onClick={logout}
                className="flex items-center gap-4 px-4 py-4 text-[10px] uppercase tracking-[0.3em] text-red-400 hover:text-red-600 transition-colors border-l-2 border-transparent"
              >
                <LogOut size={16} strokeWidth={1.5} />
                Sign Out
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-end mb-8">
                    <h3 className="text-xl font-serif italic text-charcoal">Order History</h3>
                    <p className="text-[9px] uppercase tracking-widest text-charcoal/40">{orders.length} Purchases</p>
                  </div>

                  {loading ? (
                    <div className="py-20 flex flex-col items-center text-charcoal/20">
                      <Loader2 className="animate-spin mb-4" size={32} />
                      <span className="text-[10px] uppercase tracking-widest">Retrieving Archives...</span>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white border border-ivory p-12 text-center space-y-4">
                      <Package size={40} className="mx-auto text-gold/20" strokeWidth={1} />
                      <p className="text-sm text-charcoal/60">No orders found in our collection yet.</p>
                      <a href="/shop" className="inline-block text-[10px] uppercase tracking-[0.3em] text-gold font-bold border-b border-gold pb-1">Begin Your Journey</a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white border border-ivory p-6 md:p-8 hover:shadow-xl transition-shadow duration-700">
                          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                            <div>
                              <p className="text-[9px] uppercase tracking-widest text-charcoal/40 mb-1">Order Ref: #{order.id.slice(0, 8)}</p>
                              <div className="flex items-center gap-2 text-charcoal">
                                <Calendar size={14} className="text-gold/60" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">
                                  {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-[8px] uppercase tracking-[0.3em] px-3 py-1 border ${
                                order.status === 'delivered' ? 'border-green-200 text-green-600 bg-green-50' : 
                                order.status === 'shipped' ? 'border-blue-200 text-blue-600 bg-blue-50' :
                                'border-gold/20 text-gold bg-gold/5'
                              }`}>
                                {order.status}
                              </span>
                              <p className="text-lg font-serif mt-2 text-charcoal">Rs. {order.total.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-end mb-8">
                    <h3 className="text-xl font-serif italic text-charcoal">Address Book</h3>
                    <button 
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="text-[9px] uppercase tracking-[0.3em] text-gold font-bold flex items-center gap-2 hover:text-charcoal transition-colors"
                    >
                      {showAddressForm ? 'Cancel' : <><Plus size={14} /> Add New Address</>}
                    </button>
                  </div>

                  {showAddressForm && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-white border border-gold/20 p-8 mb-8 overflow-hidden"
                    >
                      <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[9px] uppercase tracking-widest text-charcoal/40">Label (e.g. Home, Office)</label>
                          <input 
                            required 
                            className="w-full border-b border-ivory py-2 outline-none focus:border-gold transition-colors text-sm"
                            value={addressForm.title}
                            onChange={e => setAddressForm({...addressForm, title: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest text-charcoal/40">Full Name</label>
                          <input 
                            required 
                            className="w-full border-b border-ivory py-2 outline-none focus:border-gold transition-colors text-sm"
                            value={addressForm.full_name}
                            onChange={e => setAddressForm({...addressForm, full_name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest text-charcoal/40">Phone Number</label>
                          <input 
                            required 
                            className="w-full border-b border-ivory py-2 outline-none focus:border-gold transition-colors text-sm"
                            value={addressForm.phone}
                            onChange={e => setAddressForm({...addressForm, phone: e.target.value})}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[9px] uppercase tracking-widest text-charcoal/40">Street Address</label>
                          <input 
                            required 
                            className="w-full border-b border-ivory py-2 outline-none focus:border-gold transition-colors text-sm"
                            value={addressForm.street_address}
                            onChange={e => setAddressForm({...addressForm, street_address: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest text-charcoal/40">City</label>
                          <input 
                            required 
                            className="w-full border-b border-ivory py-2 outline-none focus:border-gold transition-colors text-sm"
                            value={addressForm.city}
                            onChange={e => setAddressForm({...addressForm, city: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest text-charcoal/40">Province</label>
                          <select 
                            className="w-full border-b border-ivory py-2 outline-none focus:border-gold transition-colors text-sm bg-transparent"
                            value={addressForm.province}
                            onChange={e => setAddressForm({...addressForm, province: e.target.value})}
                          >
                            <option value="Punjab">Punjab</option>
                            <option value="Sindh">Sindh</option>
                            <option value="KPK">KPK</option>
                            <option value="Balochistan">Balochistan</option>
                            <option value="Islamabad">Islamabad</option>
                          </select>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-3 py-4">
                          <input 
                            type="checkbox" 
                            id="is_default"
                            className="accent-gold"
                            checked={addressForm.is_default}
                            onChange={e => setAddressForm({...addressForm, is_default: e.target.checked})}
                          />
                          <label htmlFor="is_default" className="text-[10px] uppercase tracking-widest text-charcoal/60 cursor-pointer">Set as default delivery address</label>
                        </div>
                        <button type="submit" className="md:col-span-2 bg-charcoal text-white py-4 text-[10px] uppercase tracking-[0.4em] hover:bg-gold transition-all duration-700">
                          Save Address
                        </button>
                      </form>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`bg-white border p-8 relative group transition-all duration-700 ${addr.is_default ? 'border-gold shadow-md' : 'border-ivory hover:border-gold/40'}`}>
                        {addr.is_default && (
                          <div className="absolute top-0 right-0 bg-gold text-white px-3 py-1 text-[8px] uppercase tracking-[0.2em]">Default</div>
                        )}
                        <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-4">{addr.title}</h4>
                        <div className="space-y-1 text-sm text-charcoal/80 mb-6">
                          <p className="font-bold text-charcoal">{addr.full_name}</p>
                          <p>{addr.phone}</p>
                          <p className="text-xs leading-relaxed">{addr.street_address}, {addr.city}</p>
                          <p className="text-xs uppercase tracking-widest text-charcoal/40">{addr.province}</p>
                        </div>
                        <div className="flex items-center gap-6 pt-6 border-t border-ivory">
                          {!addr.is_default && (
                            <button onClick={() => toggleDefaultAddress(addr)} className="text-[8px] uppercase tracking-widest text-charcoal/40 hover:text-gold transition-colors">Set Default</button>
                          )}
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-[8px] uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors flex items-center gap-2">
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-end mb-8">
                    <h3 className="text-xl font-serif italic text-charcoal">Security Protocols</h3>
                  </div>

                  <div className="bg-white border border-ivory p-8 md:p-12">
                    <h4 className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold mb-6">Credential Management</h4>
                    <p className="text-xs text-charcoal/40 mb-8 leading-relaxed">Ensure the sanctity of your sanctuary by updating your access key.</p>
                    
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-charcoal/40 block">New Password</label>
                        <input 
                          type="password"
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full max-w-sm border-b border-ivory py-2 outline-none focus:border-gold transition-colors text-sm"
                          placeholder="Minimum 6 characters"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={passwordStatus === 'loading'}
                        className="bg-charcoal text-white px-8 py-4 text-[9px] uppercase tracking-[0.3em] hover:bg-gold transition-all font-bold"
                      >
                        {passwordStatus === 'loading' ? 'Processing...' : passwordStatus === 'success' ? 'Protocol Updated' : 'Update Access Key'}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Account;
