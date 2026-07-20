import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, Truck, Sparkles, Zap, ShieldCheck, ChevronLeft, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFakeOriginalPrice } from '../data/menuItems';
import { useLocationStore } from '../store/locationStore';
import { calculateDeliveryCharge } from '../types';
import { useSystemStore } from '../store/systemStore';
import toast from 'react-hot-toast';
import { useSEO } from '../utils/seo';

export default function CartPage() {
  useSEO("Your Cart", "Review your selected items, apply promo codes, and complete your order details at Mintoo.");
  const { items, updateQuantity, removeItem, total } = useCartStore();
  const navigate = useNavigate();
  const { deliveryLocation } = useLocationStore();
  const settings = useSystemStore(state => state.settings);
  const distanceKm = deliveryLocation?.distance ?? 0;
  const deliveryCharge = calculateDeliveryCharge(distanceKm);
  const rainySeasonFee = 5;
  const grandTotal = total + deliveryCharge + rainySeasonFee;
  
  const adminToken = localStorage.getItem('moms_magic_admin_token');
  const userPhone = localStorage.getItem('moms_magic_user_phone');
  const isAdmin = adminToken === 'mock-jwt-admin-token-123456' || 
                  (userPhone && (settings.adminPhones || []).includes(userPhone));

  const isOrderingPaused = (settings.websiteStatus === 'OFF' || settings.emergencyStop) && !isAdmin;

  if (items.length === 0) {
    return (
      <div className="relative min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center space-y-12">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-brand/5 blur-[150px] rounded-full animate-pulse" />
        </div>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 w-64 h-64 rounded-[60px] luxury-card flex items-center justify-center border-orange-500/20 shadow-2xl"
        >
          <ShoppingBag className="w-24 h-24 text-orange-500/5" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-orange-500/10 border-dashed rounded-[60px]"
          />
        </motion.div>

        <div className="relative z-10 space-y-4">
          <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Your Plate is <br/><span className="text-luxury-gold">Empty</span></h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[4px] max-w-xs mx-auto">Explore our menu to find your favorites.</p>
        </div>

        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/home')}
          className="relative z-10 btn-luxury-gold px-14"
        >
          ORDER FOOD
        </motion.button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 pt-28 pb-48">
      <div className="max-w-[1400px] mx-auto px-6 space-y-16 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-6">
            <motion.button 
              whileHover={{ x: -5 }}
              onClick={() => navigate('/home')}
              className="flex items-center gap-3 text-gray-500 font-black uppercase tracking-[3px] text-[10px] hover:text-orange-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Back to Selection
            </motion.button>
            <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">
              Review <br/><span className="text-luxury-gold">Cravings</span>
            </h1>
          </div>
          
          <div className="luxury-card p-8 rounded-[40px] border-orange-500/20 flex items-center gap-6">
             <div className="w-16 h-16 rounded-3xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <Sparkles className="w-8 h-8 text-orange-500" />
             </div>
             <div>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[4px]">Cart Total</p>
                <p className="text-gray-900 text-3xl font-black italic tracking-tighter text-luxury-gold">₹{total}</p>
             </div>
          </div>
        </div>

        {/* Cart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="popLayout">
              {items.map((item, idx) => {
                const fakePrice = getFakeOriginalPrice(item.price, item.originalPrice);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative group luxury-card rounded-[50px] p-8 flex flex-col md:flex-row items-center gap-10 border-gray-200 hover:border-orange-500/30"
                  >
                    {item.image && (
                     <div className="w-40 h-40 rounded-[40px] overflow-hidden border border-gray-200 shadow-2xl relative shrink-0 group-hover:scale-105 transition-transform duration-700">
                       <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     </div>
                    )}

                    <div className="flex-1 space-y-6 text-center md:text-left min-w-0">
                      <div>
                        <span className="text-orange-500/40 text-[10px] font-black uppercase tracking-[4px]">{item.category}</span>
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 truncate drop-shadow-sm">{item.name}</h3>

                        {item.items && item.items.length > 0 && (
                          <ul className="mt-3 space-y-1.5 text-left inline-block md:block">
                            {item.items.map((subItem, sIdx) => (
                              <li key={sIdx} className="text-gray-500 text-xs font-semibold flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 shadow-sm" />
                                {subItem}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-10">
                        <div className="flex items-center gap-5 bg-gray-50 p-2 rounded-2xl border border-gray-200 h-16">
                          <button 
                            onClick={() => updateQuantity(item.id!, item.quantity - 1)}
                            className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-orange-500/20 transition-all"
                          >
                            <Minus className="w-5 h-5 text-orange-500" />
                          </button>
                          <span className="text-2xl font-black italic min-w-[35px] text-center text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                            className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-xl shadow-gold/30"
                          >
                            <Plus className="w-5 h-5 text-white" />
                          </button>
                        </div>

                        <button 
                          onClick={() => removeItem(item.id!)}
                          className="flex items-center gap-3 text-gray-500 hover:text-brand transition-all font-black text-[10px] uppercase tracking-[4px] opacity-40 hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" /> Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-center md:text-right space-y-2">
                        <p className="text-5xl font-black italic text-orange-500 drop-shadow-lg">₹{item.price * item.quantity}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="space-y-10">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="luxury-card rounded-[60px] p-12 border-orange-500/10 sticky top-32 space-y-12"
            >
              <div className="space-y-3">
                <h3 className="text-4xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Order <br/><span className="text-luxury-gold">Summary</span></h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[5px] opacity-40">Payment Details</p>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-center text-gray-500 font-bold uppercase text-[11px] tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-gray-900 text-2xl font-black italic tracking-tighter">₹{total}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500 font-bold uppercase text-[11px] tracking-widest">
                  <span>Tax ({settings.taxRate ?? 5}%)</span>
                  <span className="text-gray-900 text-2xl font-black italic tracking-tighter">₹{(total * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500 font-bold uppercase text-[11px] tracking-widest">
                  <span>Rainy Season Fee</span>
                  <span className="text-gray-900 text-2xl font-black italic tracking-tighter">₹{rainySeasonFee}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500 font-bold uppercase text-[11px] tracking-widest">
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-orange-500" />
                    <span>Delivery</span>
                  </div>
                  <span className="text-lg font-black italic tracking-tighter text-gray-900">
                    ₹{deliveryCharge}
                  </span>
                </div>
                <div className="h-[1px] bg-gray-50 shadow-inner" />
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <span className="text-orange-500 font-black uppercase tracking-[6px] text-[11px]">Investment Total</span>
                    <p className="text-7xl font-black italic tracking-tighter text-gray-900 leading-none drop-shadow-xl">₹{grandTotal}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <motion.button 
                  whileHover={!isOrderingPaused ? { scale: 1.02 } : {}}
                  whileTap={!isOrderingPaused ? { scale: 0.98 } : {}}
                  onClick={() => {
                    if (isOrderingPaused) {
                      toast.error("Ordering is temporarily closed! Please check operating hours.", {
                        style: { background: '#161A22', color: '#fff', border: '1px solid #FF4D00' }
                      });
                      return;
                    }
                    navigate('/checkout');
                  }}
                  className={`w-full h-24 rounded-[30px] text-xl tracking-[6px] flex items-center justify-center gap-3 transition-all ${
                    isOrderingPaused 
                      ? 'bg-gray-50 border border-gray-200 text-gray-500 cursor-not-allowed'
                      : 'btn-luxury-gold'
                  }`}
                >
                  {isOrderingPaused ? 'ORDERING PAUSED' : 'ORDER NOW'}
                  {!isOrderingPaused && <Zap className="w-7 h-7 fill-matte-black" />}
                </motion.button>
                <div className="flex items-center justify-center gap-3 text-gray-500 font-black uppercase tracking-[4px] text-[9px] opacity-30">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  Encrypted VIP Transaction
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
