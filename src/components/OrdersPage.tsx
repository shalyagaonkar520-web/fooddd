import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, PackageSearch, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../utils/seo';
import { useAuthStore } from '../store/authStore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface OrderItem {
  name: string;
  price: number;
  quantity?: number;
  finalQuantity?: number;
}

interface Order {
  id: string;
  createdAt: any;
  grandTotal: number;
  status: string;
  items: OrderItem[];
  orderType: string;
  trackingLink?: string;
  userId?: string;
  userPhone?: string;
}

export default function OrdersPage() {
  useSEO("My Orders", "View your past orders from Mintoo.");
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user, profile } = useAuthStore();
  const localPhone = localStorage.getItem('moms_magic_user_phone');
  
  useEffect(() => {
    const normalizePhone = (p: string) => p ? p.replace(/\D/g, '').slice(-10) : '';
    const userPhoneToMatch = normalizePhone(profile?.phone || user?.phoneNumber || localPhone || '');

    // Always load local orders first as instant fallback
    const loadLocalOrders = () => {
      try {
        const stored: Order[] = JSON.parse(localStorage.getItem('moms_magic_orders') || '[]');
        return stored.filter(o => {
          if (user?.uid && o.userId === user.uid) return true;
          if (userPhoneToMatch && o.userPhone && normalizePhone(o.userPhone) === userPhoneToMatch) return true;
          if (!user?.uid && !userPhoneToMatch) return true; // show all local if no auth
          return false;
        });
      } catch { return []; }
    };

    const localOrders = loadLocalOrders();
    if (localOrders.length > 0) {
      localOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(localOrders);
      setLoading(false);
    }

    if (!userPhoneToMatch && (!user || !user.uid)) {
      setLoading(false);
      return;
    }

    let unsubUser: (() => void) | null = null;
    let unsubPhone: (() => void) | null = null;

    let userOrdersList: Order[] = [];
    let phoneOrdersList: Order[] = [];

    const combineAndSet = () => {
      const firestoreOrders = [...userOrdersList, ...phoneOrdersList];
      const allOrders = [...firestoreOrders, ...localOrders];
      const unique = allOrders.filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
      );
      unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(unique);
      setLoading(false);
    };

    if (user && user.uid) {
      const qUser = query(collection(db, 'orders'), where('userId', '==', user.uid));
      unsubUser = onSnapshot(qUser, (snapshot) => {
        const arr: Order[] = [];
        snapshot.forEach(d => arr.push({ id: d.id, ...d.data() } as Order));
        userOrdersList = arr;
        combineAndSet();
      }, (error) => {
        console.warn("Firestore orders blocked, using local cache:", error.message);
        combineAndSet();
      });
    }

    if (userPhoneToMatch) {
      const qPhone = query(collection(db, 'orders'), where('userPhone', '==', userPhoneToMatch));
      unsubPhone = onSnapshot(qPhone, (snapshot) => {
        const arr: Order[] = [];
        snapshot.forEach(d => arr.push({ id: d.id, ...d.data() } as Order));
        phoneOrdersList = arr;
        combineAndSet();
      }, (error) => {
        console.warn("Phone orders fetch blocked, using local cache:", error.message);
        combineAndSet();
      });
    }

    return () => {
      if (unsubUser) unsubUser();
      if (unsubPhone) unsubPhone();
    };
  }, [user, profile, localPhone]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!user && !localPhone) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center space-y-6">
        <PackageSearch className="w-20 h-20 text-orange-500/50" />
        <h2 className="text-xl font-black text-gray-900 italic uppercase text-center">No Order History Found</h2>
        <p className="text-gray-500 text-xs font-bold text-center">Place your first order to start tracking!</p>
        <button onClick={() => navigate('/home')} className="px-8 py-3 bg-orange-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-sm">
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 pb-32">
      <div className="max-w-3xl mx-auto space-y-10 mt-6">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ x: -5 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200 hover:border-orange-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-black italic uppercase text-gray-900 tracking-tighter">My Orders</h1>
            <p className="text-orange-500 text-[10px] font-bold uppercase tracking-widest">{orders.length} Past Order(s)</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-gray-200">
            <PackageSearch className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">No orders found yet</p>
            <button onClick={() => navigate('/home')} className="mt-6 px-6 py-3 bg-gray-100 text-gray-900 font-black uppercase text-[10px] rounded-xl hover:bg-orange-500 hover:text-black transition-colors">
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-[30px] p-6 hover:border-orange-200 transition-colors">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
                  <div>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Order ID: {order.id.slice(0, 8)}</p>
                    <p className="text-gray-900 text-sm font-bold mt-1">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-500 font-black italic text-xl">₹{order.grandTotal}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mt-2 border ${
                      order.status === 'Confirmed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                      order.status === 'Preparing' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      order.status === 'Out For Delivery' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                      order.status === 'Delivered' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      'bg-gray-100 text-gray-900 border-gray-200'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-medium">{item.quantity || item.finalQuantity || 1}x {item.name}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-orange-500/70 text-[10px] font-bold italic mt-2">+ {order.items.length - 3} more items</p>
                  )}
                </div>

                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/track/${order.id}`)}
                      className="w-full text-center py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      📍 Track Order Live
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
