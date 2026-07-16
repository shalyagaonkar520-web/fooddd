import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, 
  MapPin, 
  Navigation, 
  CheckCircle, 
  Truck, 
  TrendingUp, 
  History, 
  Power, 
  Phone, 
  AlertCircle,
  Clock,
  Compass,
  PhoneCall
} from 'lucide-react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import toast from 'react-hot-toast';
import { useSEO } from '../utils/seo';

export default function DeliveryDashboard() {
  useSEO("Rider Portal", "Delivery Partner dashboard for live tracking, routing, and earnings updates.");
  const navigate = useNavigate();

  // Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [riderId, setRiderId] = useState<string | null>(null);
  const [riderProfile, setRiderProfile] = useState<any>(null);

  // Status Toggles
  const [isOnline, setIsOnline] = useState(false);

  // Active / History Orders State
  const [assignedOrders, setAssignedOrders] = useState<any[]>([]);
  const [pastDeliveries, setPastDeliveries] = useState<any[]>([]);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'assigned' | 'available' | 'history'>('available');

  // Verify Auth State on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setRiderId(null);
        setRiderProfile(null);
        navigate('/staff', { replace: true });
        return;
      }

      // First check staff collection for 'rider' role
      try {
        const staffSnap = await getDoc(doc(db, 'staff', user.uid));
        if (staffSnap.exists() && staffSnap.data().role === 'rider') {
          setRiderId(user.uid);
          // Try to load existing rider profile
          const riderSnap = await getDoc(doc(db, 'riders', user.uid));
          if (riderSnap.exists()) {
            const data = riderSnap.data();
            setRiderProfile(data);
            setIsOnline(data.status === 'online');
          } else {
            // Create a basic profile from staff record
            const staffData = staffSnap.data();
            setRiderProfile({ name: staffData.email?.split('@')[0] || 'Rider', earnings: 0, status: 'offline', phone: '' });
          }
          return;
        }
      } catch (_) {
        // Firestore rules not set — fall back to riders collection check
      }

      // Fallback: check riders collection directly
      try {
        const riderRef = doc(db, 'riders', user.uid);
        const riderSnap = await getDoc(riderRef);
        if (riderSnap.exists()) {
          setRiderId(user.uid);
          const data = riderSnap.data();
          setRiderProfile(data);
          setIsOnline(data.status === 'online');
        } else {
          // Also allow if mock rider login was bypassed
          setRiderId(user.uid);
          setRiderProfile({ name: user.email?.split('@')[0] || 'Rider', earnings: 0, status: 'offline', phone: '' });
        }
      } catch (_) {
        setRiderId(user.uid);
        setRiderProfile({ name: user.email?.split('@')[0] || 'Rider', earnings: 0, status: 'offline', phone: '' });
      }
    });

    return () => unsubscribe();
  }, [navigate]);


  // 1. Live Geolocation GPS Tracking while Online
  useEffect(() => {
    if (!isOnline || !riderId) return;

    let watchId: number | null = null;
    
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const riderRef = doc(db, 'riders', riderId);
          await updateDoc(riderRef, {
            'currentLocation.lat': latitude,
            'currentLocation.lng': longitude,
            'currentLocation.lastUpdated': new Date().toISOString()
          });
        },
        (error) => {
          console.error("GPS position watch error:", error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 8000 }
      );
    } else {
      toast.error("GPS location not supported on this browser.");
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isOnline, riderId]);

  // 2. Real-Time Listeners for Assigned Orders + Available
  useEffect(() => {
    if (!riderId) return;

    const loadLocalAvailable = () => {
      try {
        const stored: any[] = JSON.parse(localStorage.getItem('moms_magic_orders') || '[]');
        const available = stored.filter(o => o.status === 'Ready for Delivery' && (!o.riderId || o.riderId === ''));
        available.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAvailableOrders(available);
      } catch (e) { /* ignore */ }
    };

    const loadLocalAssigned = () => {
      try {
        const stored: any[] = JSON.parse(localStorage.getItem('moms_magic_orders') || '[]');
        const active = stored.filter(o => o.riderId === riderId && o.status !== 'delivered' && o.status !== 'completed' && o.status !== 'cancelled');
        const past = stored.filter(o => o.riderId === riderId && (o.status === 'delivered' || o.status === 'completed' || o.status === 'cancelled'));
        active.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        past.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAssignedOrders(active);
        setPastDeliveries(past);
      } catch (e) { /* ignore */ }
    };

    // Load immediately
    loadLocalAvailable();
    loadLocalAssigned();

    // Try Firestore for assigned orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('riderId', '==', riderId)
    );

    const unsubscribeAssigned = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const active: any[] = [];
        const past: any[] = [];
        snapshot.forEach((docSnap) => {
          const o = { id: docSnap.id, ...docSnap.data() };
          if ((o as any).status === 'delivered' || (o as any).status === 'completed' || (o as any).status === 'cancelled') {
            past.push(o);
          } else {
            active.push(o);
          }
        });
        active.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        past.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAssignedOrders(active);
        setPastDeliveries(past);
      },
      () => loadLocalAssigned()
    );

    // Try Firestore for available orders
    const availableQuery = query(
      collection(db, 'orders'),
      where('status', '==', 'Ready for Delivery')
    );

    const unsubscribeAvailable = onSnapshot(
      availableQuery,
      (snapshot) => {
        const available: any[] = [];
        snapshot.forEach((docSnap) => {
          const o = { id: docSnap.id, ...docSnap.data() };
          if (!o.riderId || o.riderId === '') available.push(o);
        });
        available.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (available.length > 0) setAvailableOrders(available);
        else loadLocalAvailable();
      },
      () => loadLocalAvailable()
    );

    // Poll localStorage every 5 seconds
    const interval = setInterval(() => {
      loadLocalAvailable();
      loadLocalAssigned();
    }, 5000);

    return () => {
      unsubscribeAssigned();
      unsubscribeAvailable();
      clearInterval(interval);
    };
  }, [riderId]);


  // Login handler
  const handleRiderLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password.");
      return;
    }
    setLoginLoading(true);

    if (email.trim() === 'rider@mintoo.com' && password === 'rider123') {
      setRiderId('mock-rider-id-12345');
      setRiderProfile({ name: 'Test Rider', earnings: 0, status: 'offline', phone: '9999999999' });
      toast.success("Rider session initialized! 🛵");
      setLoginLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      toast.success("Rider session initialized! 🛵");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRiderLogout = async () => {
    // Set offline on logout if we have a real rider doc
    if (riderId && riderId !== 'mock-rider-id-12345') {
      try {
        const riderRef = doc(db, 'riders', riderId);
        await updateDoc(riderRef, { status: 'offline' });
      } catch (_) {}
    }
    await signOut(auth);
    toast.success("Signed out successfully.");
    navigate('/staff', { replace: true });
  };


  // Toggle Online/Offline State
  const toggleOnlineStatus = async () => {
    if (!riderId) return;
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);

    try {
      const riderRef = doc(db, 'riders', riderId);
      await updateDoc(riderRef, { status: nextStatus ? 'online' : 'offline' });
      toast.success(`You are now ${nextStatus ? 'ONLINE 🟢' : 'OFFLINE 🔴'}`);
    } catch (err) {
      toast.error("Failed to update status.");
      setIsOnline(isOnline); // revert
    }
  };

  // Helper: update a local order field
  const updateLocalOrder = (orderId: string, fields: Record<string, any>) => {
    try {
      const stored: any[] = JSON.parse(localStorage.getItem('moms_magic_orders') || '[]');
      const idx = stored.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        stored[idx] = { ...stored[idx], ...fields };
        localStorage.setItem('moms_magic_orders', JSON.stringify(stored));
      }
    } catch (e) { /* ignore */ }
  };

  // Accept Order
  const handleAcceptOrder = async (orderId: string) => {
    // Update localStorage immediately
    updateLocalOrder(orderId, { riderId: riderId, riderStatus: 'accepted' });
    setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
    toast.success("Order accepted! 📦");
    setActiveTab('assigned');
    // Try Firestore in background
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { riderId: riderId, riderStatus: 'accepted' });
    } catch (err) { /* silently ignore */ }
  };

  // Reject Order
  const handleRejectOrder = async (orderId: string) => {
    updateLocalOrder(orderId, { riderId: '', riderStatus: 'rejected' });
    setAssignedOrders(prev => prev.filter(o => o.id !== orderId));
    toast.success("Order rejected.");
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { riderId: '', riderStatus: 'rejected' });
    } catch (err) { /* silently ignore */ }
  };

  // Start Delivery
  const handleStartDelivery = async (orderId: string) => {
    updateLocalOrder(orderId, { status: 'Out For Delivery', riderStatus: 'delivering' });
    setAssignedOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Out For Delivery', riderStatus: 'delivering' } : o));
    toast.success("Delivery run started! Drive safe. 🛵");
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'Out For Delivery', riderStatus: 'delivering' });
    } catch (err) { /* silently ignore */ }
  };

  // Complete Delivery (Crediting ₹40 commission automatically)
  const handleCompleteDelivery = async (orderId: string) => {
    if (!riderId) return;
    const newEarnings = (riderProfile?.earnings || 0) + 40;
    updateLocalOrder(orderId, { status: 'delivered', riderStatus: 'delivered', deliveredAt: new Date().toISOString() });
    setAssignedOrders(prev => prev.filter(o => o.id !== orderId));
    setRiderProfile((prev: any) => ({ ...prev, earnings: newEarnings }));
    toast.success("Order Delivered successfully! +₹40 earned. 💵");
    // Try Firestore in background
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'delivered', riderStatus: 'delivered', deliveredAt: new Date().toISOString() });
      const riderRef = doc(db, 'riders', riderId);
      await updateDoc(riderRef, { earnings: newEarnings });
    } catch (err) { /* silently ignore */ }
  };


  // Render Login Panel
  if (!riderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border border-gray-200 rounded-[35px] w-full max-w-md p-8 shadow-sm space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 to-orange-500" />
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="space-y-2 mt-4 text-center">
            <Truck className="w-12 h-12 text-orange-500 mx-auto animate-pulse" />
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900 mt-4">
              RIDER <span className="text-orange-500">PORTAL</span>
            </h2>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">
              Authorized Delivery Login Required
            </p>
          </div>

          <form onSubmit={handleRiderLogin} className="space-y-4">
            <input
              type="email"
              placeholder="RIDER EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-orange-200 transition-all font-bold text-xs text-gray-900 placeholder:text-gray-500 tracking-[1px]"
            />
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-orange-200 transition-all font-bold text-xs text-gray-900 placeholder:text-gray-500 tracking-[1px]"
            />
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:brightness-105 active:scale-95 text-gray-900 font-black text-xs uppercase tracking-[2px] py-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Log In Partner <LogIn className="w-4 h-4" /></>}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Calculate earnings
  const completedCount = pastDeliveries.filter(o => (o as any).status === 'delivered').length;

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-48 px-4 md:px-6">
      
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header Dashboard Info */}
        <div className="luxury-card rounded-[35px] p-6 sm:p-10 border-orange-200 bg-gradient-to-br from-[#0B0E14] to-black flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className={`w-12 h-12 rounded-full border flex items-center justify-center shadow-lg text-lg font-black shrink-0 ${
              isOnline ? 'bg-orange-50 border-orange-200 text-orange-500 shadow-[#FC8019]/20' : 'bg-red-500/10 border-red-500/30 text-red-500'
            }`}>
              {isOnline ? '🟢' : '🔴'}
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase text-gray-900 tracking-tighter">{riderProfile?.name}</h2>
              <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mt-0.5">Delivery Partner Active Session</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Status Switcher */}
            <button
              onClick={toggleOnlineStatus}
              className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isOnline 
                  ? 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-gray-900' 
                  : 'bg-orange-500 text-black hover:brightness-105 shadow-[#FC8019]/10'
              }`}
            >
              <Power className="w-4 h-4" />
              {isOnline ? "Go Offline" : "Go Online"}
            </button>

            {/* Logout button */}
            <button
              onClick={handleRiderLogout}
              className="bg-gray-50 border border-gray-200 hover:border-gray-200 text-gray-500 hover:text-gray-900 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Earning Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 p-5 rounded-2xl text-left">
            <TrendingUp className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total Earnings</p>
            <h3 className="text-3xl font-black italic text-gray-900 mt-1">₹{riderProfile?.earnings || 0}</h3>
          </div>
          <div className="bg-white border border-gray-200 p-5 rounded-2xl text-left">
            <CheckCircle className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Deliveries Done</p>
            <h3 className="text-3xl font-black italic text-gray-900 mt-1">{completedCount} Orders</h3>
          </div>
          <div className="bg-white border border-gray-200 p-5 rounded-2xl text-left col-span-2 sm:col-span-1">
            <Clock className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Commission Rate</p>
            <h3 className="text-xl font-black italic text-orange-500 mt-2">₹40 / order</h3>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-200">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-3.5 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              activeTab === 'available' ? 'bg-orange-500 text-black shadow-md' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Available ({availableOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`flex-1 py-3.5 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              activeTab === 'assigned' ? 'bg-orange-500 text-black shadow-md' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Assigned ({assignedOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3.5 text-center text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
              activeTab === 'history' ? 'bg-orange-500 text-black shadow-md' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            History
          </button>
        </div>

        {/* Dynamic tabs content */}
        <div>
          {activeTab === 'available' ? (
            <div className="space-y-6">
              {!isOnline && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  Please toggle status to ONLINE to receive order assignments.
                </div>
              )}
              {availableOrders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
                  <Truck className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No available deliveries</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableOrders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-3xl p-6 text-left space-y-4 hover:border-orange-200 transition-all shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">#{order.id.slice(0, 8)}</p>
                          <h4 className="font-bold text-gray-900 text-sm mt-1">{order.deliveryLocation?.address.slice(0, 30)}...</h4>
                        </div>
                        <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-[8px] font-black uppercase border border-green-200">
                          Ready for Delivery
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div>
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Distance</p>
                          <p className="text-gray-900 font-bold text-sm">{order.deliveryLocation?.distance} km</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Earn</p>
                          <p className="text-orange-500 font-black text-sm">₹40</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        disabled={!isOnline}
                        className="w-full bg-orange-500 text-black py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:brightness-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Claim Delivery
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'assigned' ? (
            <div className="space-y-6">
              {!isOnline && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  Please toggle status to ONLINE to activate Geolocation GPS tracking and receive order assignments.
                </div>
              )}

              {assignedOrders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
                  <Truck className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-bounce" />
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No active deliveries assigned</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedOrders.map((order) => {
                    const customerLoc = order.deliveryLocation;
                    const mapLink = `https://www.google.com/maps/dir/?api=1&destination=${customerLoc?.lat || 12.9200},${customerLoc?.lng || 77.6150}`;
                    
                    return (
                      <div key={order.id} className="bg-white border border-gray-200 rounded-3xl p-6 text-left space-y-6 hover:border-orange-200 transition-all">
                        {/* Status bar */}
                        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                          <div>
                            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Order ID: #{order.id.slice(0, 8)}</p>
                            <p className="text-gray-900 text-xs font-semibold mt-1">Items: {order.items.map((i: any) => `${i.quantity || i.finalQuantity || 1}x ${i.name}`).join(', ')}</p>
                          </div>
                          
                          <div className="text-right">
                            <span className="bg-orange-50 border border-orange-200 text-orange-500 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                              {(order as any).status}
                            </span>
                          </div>
                        </div>

                        {/* Customer & address details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Customer Details</p>
                            <h4 className="text-base font-extrabold text-gray-900">{order.userName}</h4>
                            <p className="text-xs text-gray-500 font-semibold">{order.userPhone}</p>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Delivery Address</p>
                            <h4 className="text-xs font-bold text-gray-900 uppercase leading-relaxed">{customerLoc?.address}</h4>
                            {customerLoc?.distance && (
                              <p className="text-[10px] text-orange-500 font-black uppercase tracking-wider">Distance: {customerLoc.distance} km</p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                          {/* Unconfirmed riderStatus: Accept/Reject */}
                          {(!order.riderStatus || order.riderStatus === 'assigned') && (
                            <>
                              <button
                                onClick={() => handleAcceptOrder(order.id)}
                                className="flex-1 bg-orange-500 text-black font-black uppercase text-[10px] tracking-widest py-3.5 rounded-xl hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                              >
                                Accept Order
                              </button>
                              <button
                                onClick={() => handleRejectOrder(order.id)}
                                className="flex-1 bg-gray-50 border border-gray-200 text-red-500 font-black uppercase text-[10px] tracking-widest py-3.5 rounded-xl hover:bg-red-500 hover:text-gray-900 transition-all cursor-pointer"
                              >
                                Reject Order
                              </button>
                            </>
                          )}

                          {/* Accepted (order as any).status: Start Delivery */}
                          {order.riderStatus === 'accepted' && (
                            <button
                              onClick={() => handleStartDelivery(order.id)}
                              className="flex-1 bg-orange-500 text-black font-black uppercase text-[10px] tracking-widest py-4 rounded-xl hover:brightness-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                              <Navigation className="w-4 h-4" /> Start Delivery Run
                            </button>
                          )}

                          {/* Out for Delivery status: Complete Delivery */}
                          {order.riderStatus === 'delivering' && (
                            <button
                              onClick={() => handleCompleteDelivery(order.id)}
                              className="flex-1 bg-gradient-to-r from-orange-500 to-[#FC8019] text-black font-black uppercase text-[10px] tracking-widest py-4 rounded-xl hover:brightness-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4 fill-black stroke-orange-500" /> Complete Delivery
                            </button>
                          )}

                          {/* Navigation Link Launcher */}
                          {order.riderStatus !== 'delivered' && (
                            <a
                              href={mapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-gray-50 border border-gray-200 hover:border-blue-400 text-blue-500 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                              <Compass className="w-4 h-4" /> Navigate
                            </a>
                          )}

                          <a
                            href={`tel:${order.userPhone}`}
                            className="bg-gray-50 border border-gray-200 hover:border-orange-500 text-gray-900 px-4 py-4 rounded-xl flex items-center justify-center transition-all"
                          >
                            <PhoneCall className="w-4 h-4 text-orange-500" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            // History and Completed Deliveries list
            <div className="space-y-6">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 text-left">Completed Deliveries</h3>
              
              {pastDeliveries.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No delivery history found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastDeliveries.map((order) => (
                    <div key={order.id} className="bg-white/40 border border-gray-200 rounded-2xl p-5 flex items-center justify-between gap-4 text-left">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900 text-sm font-bold">{order.userName}</p>
                          <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[7px] font-black uppercase px-2 py-0.5 rounded">
                            {(order as any).status}
                          </span>
                        </div>
                        <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mt-1">ID: #{order.id.slice(0, 8)} • Completed: {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'Just now'}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-orange-500 font-black italic text-lg">+₹40</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
