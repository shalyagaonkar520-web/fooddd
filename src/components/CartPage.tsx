import React from 'react';
import { useCartStore } from '../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, Truck, ChevronLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocationStore } from '../store/locationStore';
import { calculateDeliveryCharge } from '../types';
import { useSystemStore } from '../store/systemStore';
import toast from 'react-hot-toast';
import { useSEO } from '../utils/seo';

export default function CartPage() {
  useSEO("Your Cart", "Review your selected items and complete your order at Mintoo.");
  const { items, updateQuantity, removeItem, total } = useCartStore();
  const navigate = useNavigate();
  const { deliveryLocation } = useLocationStore();
  const settings = useSystemStore(state => state.settings);
  const distanceKm = deliveryLocation?.distance ?? 0;
  const deliveryCharge = calculateDeliveryCharge(distanceKm);
  const grandTotal = total + deliveryCharge;

  const adminToken = localStorage.getItem('moms_magic_admin_token');
  const userPhone = localStorage.getItem('moms_magic_user_phone');
  const isAdmin = adminToken === 'mock-jwt-admin-token-123456' || 
                  (userPhone && (settings.adminPhones || []).includes(userPhone));

  const isOrderingPaused = (settings.websiteStatus === 'OFF' || settings.emergencyStop) && !isAdmin;

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="text-sm font-medium text-gray-500">
            Looks like you haven't added anything to your cart yet. Explore our menu to start ordering!
          </p>
        </div>
        <button 
          onClick={() => navigate('/home')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-md hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Browse Menu</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-20 pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Menu
          </button>
          <div className="text-right">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Your Cart</h1>
            <p className="text-xs text-gray-500 font-medium">{items.length} Item{items.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cart Items List */}
          <div className="lg:col-span-7 space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-gray-200/80 rounded-2xl p-3.5 sm:p-4 shadow-sm flex items-center gap-3.5 sm:gap-4 hover:border-gray-300 transition-all"
                >
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-100 shrink-0" 
                      referrerPolicy="no-referrer" 
                    />
                  )}

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                          {item.category}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug truncate">
                          {item.name}
                        </h3>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id!)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors shrink-0"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.items && item.items.length > 0 && (
                      <p className="text-xs text-gray-500 font-medium truncate">
                        {item.items.join(', ')}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-sm sm:text-base font-bold text-emerald-600">
                        ₹{item.price * item.quantity}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200/60">
                        <button 
                          onClick={() => updateQuantity(item.id!, item.quantity - 1)}
                          className="w-7 h-7 rounded-md bg-white text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors shadow-xs"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-gray-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                          className="w-7 h-7 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center transition-colors shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Bill Summary Column */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-4 sticky top-24">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Bill Summary
              </h3>

              <div className="space-y-2.5 text-xs text-gray-600 font-medium">
                <div className="flex justify-between items-center">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Delivery Fee</span>
                  </div>
                  <span className="font-semibold text-gray-900">₹{deliveryCharge}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Hotel Charges</span>
                  <span className="text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">FREE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Platform Fee</span>
                  <span className="text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">FREE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Handling Charges</span>
                  <span className="text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">FREE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Payment Gateway Charges</span>
                  <span className="text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">FREE</span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-bold text-gray-900">
                  <span>To Pay</span>
                  <span className="text-lg font-bold text-emerald-600">₹{grandTotal}</span>
                </div>
              </div>

              <button 
                disabled={isOrderingPaused}
                onClick={() => {
                  if (isOrderingPaused) {
                    toast.error("Ordering is temporarily closed! Please check operating hours.");
                    return;
                  }
                  navigate('/checkout');
                }}
                className={`w-full h-12 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isOrderingPaused 
                    ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-md hover:shadow-lg'
                }`}
              >
                <span>{isOrderingPaused ? 'Ordering Paused' : 'Proceed to Checkout'}</span>
                {!isOrderingPaused && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-gray-400 text-[10px] font-semibold pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Safe & Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
