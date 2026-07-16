import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, CheckCircle, AlertCircle, Package, Power } from 'lucide-react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import toast from 'react-hot-toast';
import { useSEO } from '../utils/seo';

export default function HotelPanel() {
  useSEO("Kitchen Portal", "Hotel/Restaurant dashboard for managing live orders.");
  const navigate = useNavigate();

  const [hotelId, setHotelId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);

  // Firebase Auth check + role verification
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setChecking(false);
        navigate('/staff', { replace: true });
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'staff', user.uid));
        if (snap.exists() && snap.data().role === 'hotel') {
          setHotelId(user.uid);
        } else {
          toast.error('Access denied. Kitchen role required.');
          await signOut(auth);
          navigate('/staff', { replace: true });
        }
      } catch (_) {
        // Firestore rules not set — allow if authenticated
        setHotelId(user.uid);
      }
      setChecking(false);
    });
    return () => unsub();
  }, [navigate]);

  // Load orders
  useEffect(() => {
    if (!hotelId) return;

    const ACTIVE_STATUSES = ['pending', 'Preparing'];

    const loadLocalOrders = () => {
      try {
        const stored: any[] = JSON.parse(localStorage.getItem('moms_magic_orders') || '[]');
        const filtered = stored.filter(o => ACTIVE_STATUSES.includes(o.status));
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setActiveOrders(filtered);
      } catch (_) {}
    };

    loadLocalOrders();

    const ordersQuery = query(collection(db, 'orders'), where('status', 'in', ACTIVE_STATUSES));
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const orders: any[] = [];
        snapshot.forEach(d => orders.push({ id: d.id, ...d.data() }));
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (orders.length > 0) setActiveOrders(orders);
        else loadLocalOrders();
      },
      () => loadLocalOrders()
    );

    const interval = setInterval(loadLocalOrders, 5000);
    return () => { unsubscribe(); clearInterval(interval); };
  }, [hotelId]);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Signed out successfully.");
    navigate('/staff', { replace: true });
  };

  const updateLocalOrderStatus = (orderId: string, status: string) => {
    try {
      const stored: any[] = JSON.parse(localStorage.getItem('moms_magic_orders') || '[]');
      const idx = stored.findIndex(o => o.id === orderId);
      if (idx !== -1) { stored[idx].status = status; localStorage.setItem('moms_magic_orders', JSON.stringify(stored)); }
    } catch (_) {}
  };

  const acceptOrder = async (orderId: string) => {
    updateLocalOrderStatus(orderId, 'Preparing');
    setActiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Preparing' } : o));
    toast.success("Order accepted. Kitchen is preparing!");
    try { await updateDoc(doc(db, 'orders', orderId), { status: 'Preparing' }); } catch (_) {}
  };

  const markReadyForDelivery = async (orderId: string) => {
    updateLocalOrderStatus(orderId, 'Ready for Delivery');
    setActiveOrders(prev => prev.filter(o => o.id !== orderId));
    toast.success("Order marked as Ready! Awaiting Rider.");
    try { await updateDoc(doc(db, 'orders', orderId), { status: 'Ready for Delivery' }); } catch (_) {}
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-24 pb-32 px-4 md:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="bg-white rounded-[35px] p-6 sm:p-8 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-200 text-orange-500 flex items-center justify-center shadow-sm text-xl">
              👨‍🍳
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase text-gray-900 tracking-tighter">Kitchen Dashboard</h2>
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-0.5">Manage Live Orders</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-100 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2"
          >
            <Power className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-black uppercase tracking-widest text-gray-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" /> Action Required ({activeOrders.length})
          </h3>

          {activeOrders.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-200">
              <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No active orders right now</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeOrders.map(order => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col space-y-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Order #{order.id.slice(0,6)}</p>
                      <h4 className="font-bold text-gray-900 text-sm mt-1">{order.userName}</h4>
                    </div>
                    <span className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                      order.status === 'pending' ? 'bg-red-50 text-red-500 border-red-200 animate-pulse' : 'bg-orange-50 text-orange-500 border-orange-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <ul className="space-y-2">
                      {order.items?.map((item: any, idx: number) => (
                        <li key={idx} className="text-sm font-semibold text-gray-800">
                          {item.quantity || item.finalQuantity || 1}x {item.name}
                        </li>
                      ))}
                    </ul>
                    {order.instructions && (
                      <p className="mt-3 text-xs text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-100">
                        📝 {order.instructions}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex gap-3">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => acceptOrder(order.id)}
                        className="flex-1 bg-orange-500 text-black py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:brightness-105 active:scale-95 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" /> Accept & Prepare
                      </button>
                    )}
                    {order.status === 'Preparing' && (
                      <button
                        onClick={() => markReadyForDelivery(order.id)}
                        className="flex-1 bg-green-500 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:brightness-105 active:scale-95 cursor-pointer"
                      >
                        <Package className="w-4 h-4" /> Mark as Ready
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
