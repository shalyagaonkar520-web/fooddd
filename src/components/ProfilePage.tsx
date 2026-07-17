import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Wallet, 
  MapPin, 
  Gift, 
  Bell, 
  LogOut, 
  ChevronRight, 
  Trash2, 
  Plus, 
  History, 
  Clock, 
  Map, 
  Compass,
  CheckCircle2,
  PackageSearch,
  Share2,
  FileText
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { useSEO } from '../utils/seo';

interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  orderId?: string;
  description: string;
  createdAt: string;
}

export default function ProfilePage() {
  useSEO("My Profile", "Manage your profile, saved addresses, reward points, and check your wallet balance at Mintoo.");
  const navigate = useNavigate();
  const { user, profile, loading, logout, addAddress, deleteAddress } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>('refer');
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [addressText, setAddressText] = useState('');
  const [addressLat, setAddressLat] = useState('12.9165'); // Default BTM Layout
  const [addressLng, setAddressLng] = useState('77.6101');

  // Push Notifications Settings State
  const [notifOrderUpdates, setNotifOrderUpdates] = useState(true);
  const [notifPromos, setNotifPromos] = useState(true);

  const localPhone = localStorage.getItem('moms_magic_user_phone');
  const isGuest = localStorage.getItem('moms_magic_guest');

  // Re-route if user is not authenticated
  useEffect(() => {
    if (!loading && !user && !localPhone && !isGuest) {
      navigate('/');
    }
  }, [user, loading, localPhone, isGuest, navigate]);

  // Load Wallet Transactions
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    const loadWalletData = async () => {
      setLoadingTransactions(true);
      try {
        const transRef = collection(db, 'walletTransactions');
        const q = query(transRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const list: WalletTransaction[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as WalletTransaction);
        });
        // Sort transactions descending by date
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTransactions(list);
      } catch (err) {
        console.error('Error loading wallet transactions:', err);
      } finally {
        setLoadingTransactions(false);
      }
    };

    loadWalletData();
  }, [user]);

  // Load local order history
  useEffect(() => {
    const loadOrders = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('moms_magic_orders') || '[]');
        const phone = profile?.phone || user?.phoneNumber || localPhone || '';
        
        // Clean utility to match digits
        const clean = (p: string) => p.replace(/\D/g, '').slice(-10);
        
        // Filter orders by phone number or userId (for logged in placements)
        const userOrders = stored.filter((o: any) => {
          const isPhoneMatch = (phone && typeof o.userPhone === 'string') ? clean(o.userPhone) === clean(phone) : false;
          const isUserMatch = user ? o.userId === user.uid : false;
          return isPhoneMatch || isUserMatch;
        });

        userOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(userOrders);
      } catch (err) {
        console.error('Error loading local orders:', err);
      }
    };

    loadOrders();
  }, [user, profile, localPhone]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('moms_magic_user_phone');
      localStorage.removeItem('moms_magic_guest');
      await logout();
      toast.success('Logged out successfully.');
      navigate('/');
    } catch (e) {
      localStorage.removeItem('moms_magic_user_phone');
      localStorage.removeItem('moms_magic_guest');
      toast.error('Logout failed.');
      navigate('/');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      try {
        if (user) {
          // If we had a real backend, we'd call a cloud function here to delete Firestore data too.
          await user.delete();
        }
        localStorage.removeItem('moms_magic_user_phone');
        localStorage.removeItem('moms_magic_guest');
        await logout();
        toast.success('Account deleted successfully.');
        navigate('/');
      } catch (e: any) {
        if (e.code === 'auth/requires-recent-login') {
          toast.error('Please log out and log back in to delete your account.');
        } else {
          toast.error('Failed to delete account. Please try again later.');
        }
      }
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressText.trim() || !addressLabel.trim()) {
      toast.error('Please enter address details.');
      return;
    }
    const lat = parseFloat(addressLat);
    const lng = parseFloat(addressLng);
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Invalid coordinates.');
      return;
    }

    try {
      await addAddress(addressLabel.trim(), addressText.trim(), lat, lng);
      toast.success('Address saved successfully! 📍');
      setAddressText('');
      setShowAddressForm(false);
    } catch (err) {
      toast.error('Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteAddress(id);
      toast.success('Address deleted.');
    } catch (err) {
      toast.error('Failed to delete address.');
    }
  };


  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <span className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-orange-500 mt-4 font-black uppercase tracking-widest text-xs">Loading Profile...</p>
      </div>
    );
  }

  if (!user && !localPhone && !isGuest) return null;

  // Mock profile for local phone session
  const displayProfile = profile || {
    name: 'Guest User',
    email: '',
    phone: localPhone || '',
    walletBalance: 0,
    rewardPoints: 0,
    addresses: []
  };

  if (!displayProfile) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-black uppercase text-red-500 mb-4">Profile Sync Error</h2>
        <p className="text-sm text-gray-500 mb-8 max-w-sm">We couldn't load your profile data. Please check your connection and try again.</p>
        <button
          onClick={handleLogout}
          className="bg-red-600/10 border border-red-600/30 text-red-500 px-6 py-3 rounded-xl font-black uppercase text-xs hover:bg-red-600/20 transition-all cursor-pointer"
        >
          Force Logout
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white text-gray-900 pt-24 pb-48 px-4 md:px-6">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-orange-50 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        
        {/* User Card */}
        <div className="luxury-card rounded-[35px] p-6 sm:p-10 border-orange-200 bg-gradient-to-r from-white/5 to-[#FC8019]/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <User className="w-32 h-32 text-orange-500" />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-3xl text-orange-500 font-black uppercase shadow-lg shadow-[#FC8019]/20">
              {displayProfile.name.charAt(0)}
            </div>
            
            <div className="space-y-1">
              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">
                {displayProfile.name}
              </h1>
              <p className="text-xs text-gray-500 font-medium">{displayProfile.email}</p>
              {displayProfile.phone && <p className="text-xs text-orange-500 font-bold">{displayProfile.phone}</p>}
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-200">
          {[
            { id: 'refer', label: 'Refer & Earn', icon: Share2 },
            { id: 'terms', label: 'T&C / Privacy', icon: FileText },
            { id: 'logout', label: 'Sign Out', icon: LogOut },
            { id: 'delete', label: 'Delete Account', icon: Trash2 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'logout') {
                    handleLogout();
                  } else if (tab.id === 'delete') {
                    handleDeleteAccount();
                  } else {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-orange-500 text-black shadow-lg shadow-[#FC8019]/20' 
                    : tab.id === 'delete' ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* REFER AND EARN TAB */}
              {activeTab === 'refer' && (
                <div className="space-y-8 text-center max-w-md mx-auto py-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-[30px] flex items-center justify-center border border-green-500/30 shadow-sm mx-auto relative">
                    <Share2 className="w-12 h-12 text-green-600" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">Refer & Earn</h3>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Share with friends</p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6">
                    <p className="text-sm font-bold text-gray-900">Your Referral Code</p>
                    <div className="flex items-center justify-center gap-4 mt-4 bg-white border border-gray-200 p-4 rounded-xl">
                      <span className="text-2xl font-black text-gray-900 tracking-widest uppercase">MINT{displayProfile.phone?.slice(-4) || '1234'}</span>
                    </div>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-wider mt-4">
                      Get ₹50 for every friend who signs up and orders!
                    </p>
                    <button onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'Join Mintoo!',
                            text: `Use my code MINT${displayProfile.phone?.slice(-4) || '1234'} to get ₹50 off your first order!`,
                            url: window.location.origin
                          });
                        } else {
                          navigator.clipboard.writeText(`MINT${displayProfile.phone?.slice(-4) || '1234'}`);
                          toast.success('Referral code copied to clipboard!');
                        }
                      }} 
                      className="mt-6 w-full bg-orange-500 text-black px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:brightness-105 transition-all shadow-md"
                    >
                      Share Now
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    When your friend completes their first order, you both get ₹50 credited to your Mintoo Wallet automatically.
                  </p>
                </div>
              )}

              {/* TERMS & CONDITIONS TAB */}
              {activeTab === 'terms' && (
                <div className="space-y-8 text-left py-4">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900">Terms & Privacy</h3>

                  <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                      <h4 className="text-sm font-black uppercase tracking-wide text-gray-900">1. Acceptance of Terms</h4>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        By accessing and using the Mintoo App (available on Google Play Store), you accept and agree to be bound by the terms and provision of this agreement.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-black uppercase tracking-wide text-gray-900">2. Privacy & Data Collection</h4>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        We collect personal information such as name, phone number, and location data to facilitate food delivery. Your data is encrypted and securely stored. We do not sell your personal data to third parties. Our privacy practices comply with the requirements of the Google Play Developer Policy.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-black uppercase tracking-wide text-gray-900">3. Location Services</h4>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        Our app requires access to your device's location to accurately assign delivery partners and estimate delivery times. You can manage these permissions in your device settings.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-black uppercase tracking-wide text-gray-900">4. Payments & Refunds</h4>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        All payments are processed securely. Refunds for cancelled orders (if applicable as per our cancellation policy) will be credited to your original payment method or Mintoo Wallet within 5-7 business days.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-black uppercase tracking-wide text-gray-900">5. Account Deletion</h4>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        You can request the deletion of your account and associated data at any time by contacting our support team or using the "End Session" option to log out and clear local data.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
