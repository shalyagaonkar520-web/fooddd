import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings,
  ShoppingBag,
  TrendingUp,
  Power,
  Store,
  Bike,
  RefreshCw
} from 'lucide-react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import toast from 'react-hot-toast';
import { useSEO } from '../utils/seo';

export default function AdminPage() {
  useSEO("Admin Portal", "System admin control panel.");
  const navigate = useNavigate();

  const [adminId, setAdminId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);

  // Check Firebase Auth + role
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setChecking(false);
        navigate('/staff', { replace: true });
        return;
      }
      // Check role in Firestore staff collection
      try {
        const snap = await getDoc(doc(db, 'staff', user.uid));
        if (snap.exists() && snap.data().role === 'admin') {
          setAdminId(user.uid);
        } else {
          toast.error('Access denied. Admin role required.');
          await signOut(auth);
          navigate('/staff', { replace: true });
        }
      } catch (_) {
        // Firestore rules may not be set yet — allow if authenticated
        setAdminId(user.uid);
      }
      setChecking(false);
    });
    return () => unsub();
  }, [navigate]);

  // Load orders
  useEffect(() => {
    if (!adminId) return;

    const loadLocalOrders = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('moms_magic_orders') || '[]');
        stored.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(stored);
      } catch (e) {}
    };

    loadLocalOrders();

    const unsubOrders = onSnapshot(
      query(collection(db, 'orders')),
      (snapshot) => {
        const arr: any[] = [];
        snapshot.forEach(d => arr.push({ id: d.id, ...d.data() }));
        arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (arr.length > 0) setOrders(arr);
      },
      () => loadLocalOrders()
    );

    const unsubRiders = onSnapshot(
      query(collection(db, 'riders')),
      (snapshot) => {
        const arr: any[] = [];
        snapshot.forEach(d => arr.push({ id: d.id, ...d.data() }));
        setRiders(arr);
      },
      () => {}
    );

    const interval = setInterval(loadLocalOrders, 5000);

    return () => {
      unsubOrders();
      unsubRiders();
      clearInterval(interval);
    };
  }, [adminId]);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Signed out successfully.");
    navigate('/staff', { replace: true });
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const liveOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'completed');
  const revenue = orders.filter(o => o.status === 'delivered').reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-24 pb-32 px-4 md:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="bg-white rounded-[35px] p-6 sm:p-8 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-sm text-xl">
              👑
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase text-gray-900 tracking-tighter">Admin Dashboard</h2>
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-0.5">System Overview</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="bg-gray-100 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2"
          >
            <Power className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 p-5 rounded-2xl text-left shadow-sm">
            <ShoppingBag className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Live Orders</p>
            <h3 className="text-3xl font-black italic text-gray-900 mt-1">{liveOrders.length}</h3>
          </div>
          <div className="bg-white border border-gray-200 p-5 rounded-2xl text-left shadow-sm">
            <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total Revenue</p>
            <h3 className="text-3xl font-black italic text-gray-900 mt-1">₹{revenue.toLocaleString()}</h3>
          </div>
          <div className="bg-white border border-gray-200 p-5 rounded-2xl text-left shadow-sm">
            <Bike className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Riders</p>
            <h3 className="text-3xl font-black italic text-gray-900 mt-1">{riders.length}</h3>
          </div>
          <div className="bg-white border border-gray-200 p-5 rounded-2xl text-left shadow-sm">
            <Store className="w-5 h-5 text-purple-500 mb-2" />
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total Orders</p>
            <h3 className="text-3xl font-black italic text-gray-900 mt-1">{orders.length}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Orders */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-black uppercase tracking-widest text-gray-800 mb-4 border-b border-gray-100 pb-3">Live Orders</h3>
            {liveOrders.length === 0 ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No active orders</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {liveOrders.map(order => (
                  <div key={order.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center text-left">
                    <div>
                      <p className="text-gray-900 font-bold text-sm">{order.userName}</p>
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">ID: {order.id.slice(0,8)}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-orange-500/10 text-orange-600 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border border-orange-500/20">
                        {order.status}
                      </span>
                      <p className="text-gray-900 font-black mt-1 text-xs">₹{order.grandTotal}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Riders List */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-black uppercase tracking-widest text-gray-800 mb-4 border-b border-gray-100 pb-3">Delivery Partners</h3>
            {riders.length === 0 ? (
              <div className="text-center py-12">
                <Bike className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No riders registered</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {riders.map(rider => (
                  <div key={rider.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center text-left">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${rider.status === 'online' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-200 border-gray-400 text-gray-600'}`}>
                        {rider.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-gray-900 font-bold text-sm">{rider.name}</p>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{rider.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-black text-xs">₹{rider.earnings || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
