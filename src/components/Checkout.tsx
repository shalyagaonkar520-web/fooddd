import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useBulkOrderStore } from '../store/bulkOrderStore';
import { useLocationStore } from '../store/locationStore';
import { motion } from 'framer-motion';
import { Send, MapPin, Ticket, Calendar, ShieldCheck, Truck, ChevronLeft, ChevronRight, Loader2, Compass, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCityStore } from '../store/cityStore';
import { calculateDeliveryCharge } from '../types';
import { useSystemStore } from '../store/systemStore';
import { playSound, SOUNDS } from '../utils/audio';
import { useSEO } from '../utils/seo';
import { useAuthStore } from '../store/authStore';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { haversineDistance } from '../lib/location';

import DeliveryAnimation from './DeliveryAnimation';

const TELEGRAM_BOT_TOKEN = '8410372745:AAFSmmk7sBujLmfI0QZFAg_Qh-qZwhKnmxM';
const TELEGRAM_CHAT_ID   = '-1003803637741';
const WHATSAPP_BULK_NUMBER = '917483187572';
const WHATSAPP_FOOD_NUMBER = '919606001790';

const escHtml = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Sends a Telegram message. Tries server proxy first, falls back to direct API call.
async function sendTelegramMessage(text: string): Promise<void> {
  const payload = JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' });

  const direct = () =>
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    }).then(async (r) => {
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error((d as any).description || 'Telegram direct error');
      }
    });

  // Wrap proxy in a manual timeout (avoids AbortSignal.timeout which crashes on Safari iOS)
  const proxyWithTimeout = (): Promise<boolean> =>
    new Promise((resolve) => {
      const timer = setTimeout(() => resolve(false), 8000);
      fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        keepalive: true,
      })
        .then((r) => { clearTimeout(timer); resolve(r.ok); })
        .catch(() => { clearTimeout(timer); resolve(false); });
    });

  try {
    const proxyOk = await proxyWithTimeout();
    if (!proxyOk) {
      console.warn('⚠️ Proxy failed, using direct Telegram call');
      await direct();
    } else {
      console.log('✅ Telegram sent via proxy');
    }
  } catch {
    try {
      await direct();
      console.log('✅ Telegram sent via direct call');
    } catch (e) {
      console.error('❌ Both Telegram paths failed:', e);
    }
  }
}

const DECORATION_PRICES = { balloons: 150, spray: 50, candles: 30 };

export default function Checkout() {
  useSEO('Checkout', 'Finalize delivery details and confirm your order at Mintoo.');
  const navigate = useNavigate();
  const isBulkOrder = localStorage.getItem('moms_magic_order_type') === 'bulk';

  const { items: cartItems, total: cartTotal, clearCart } = useCartStore();
  const bulkStore = useBulkOrderStore();
  const { bulkItems, getGrandTotal: getBulkTotal, cake, decoration, additionalServices, resetBulkOrder } = bulkStore;

  const { selectedCity } = useCityStore();
  const { 
    deliveryLocation, 
    openLocationPicker, 
    isLoading, 
    detectLocation, 
    setDeliveryLocation, 
    restaurantLocation, 
    maxDeliveryRange 
  } = useLocationStore();

  const [isManualInputOpen, setIsManualInputOpen] = useState(false);
  const [manualSearchQuery, setManualSearchQuery] = useState('');
  const [manualSearchResults, setManualSearchResults] = useState<any[]>([]);
  const [isManualSearching, setIsManualSearching] = useState(false);

  const handleManualSearch = async (query: string) => {
    setManualSearchQuery(query);
    if (query.trim().length < 3) {
      setManualSearchResults([]);
      return;
    }
    setIsManualSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setManualSearchResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsManualSearching(false);
    }
  };

  const selectManualSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    const dist = haversineDistance(restaurantLocation.lat, restaurantLocation.lng, lat, lon);
    
    setDeliveryLocation({ 
      lat, 
      lng: lon, 
      address: result.display_name, 
      distance: parseFloat(dist.toFixed(1)), 
      isDeliverable: dist <= maxDeliveryRange 
    });
    
    toast.success('Location updated!');
    setIsManualInputOpen(false);
    setManualSearchQuery('');
    setManualSearchResults([]);
  };

  const useCustomTypedAddress = () => {
    if (!manualSearchQuery.trim()) return;
    setDeliveryLocation({
      lat: restaurantLocation.lat,
      lng: restaurantLocation.lng,
      address: manualSearchQuery,
      distance: 2.0, // standard default deliverable distance
      isDeliverable: true
    });
    toast.success('Custom address saved!');
    setIsManualInputOpen(false);
    setManualSearchQuery('');
    setManualSearchResults([]);
  };

  const [formData, setFormData] = useState({ name: '', phone: '', additionalMessage: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const settings = useSystemStore((s) => s.settings);

  const { user, profile, deductWalletBalance } = useAuthStore();
  const [useWallet, setUseWallet] = useState(false);
  const [customWalletAmount, setCustomWalletAmount] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const activeItems = isBulkOrder
    ? [...bulkItems, ...cartItems.map((item) => ({ ...item, finalQuantity: item.quantity } as any))]
    : cartItems;
  const subtotal = isBulkOrder ? getBulkTotal() + cartTotal : cartTotal;

  const handleApplyCoupon = () => {
    const inputUpper = couponInput.trim().toUpperCase();
    const activeCoupons = settings.coupons || [];
    const matchedCoupon = activeCoupons.find(c => c.code.toUpperCase() === inputUpper && c.isActive);

    if (matchedCoupon) {
      if (subtotal >= matchedCoupon.minOrderValue) {
        setAppliedCoupon(matchedCoupon.code.toUpperCase());
        let msg = `${matchedCoupon.code} applied! `;
        if (matchedCoupon.type === 'free_delivery') msg += 'Free Delivery!';
        else if (matchedCoupon.type === 'fixed_discount') msg += `₹${matchedCoupon.value} off!`;
        else if (matchedCoupon.type === 'percent_discount') msg += `${matchedCoupon.value}% off!`;
        toast.success(msg);
      } else {
        toast.error(`${matchedCoupon.code} is valid only for orders above ₹${matchedCoupon.minOrderValue}`);
      }
    } else {
      setAppliedCoupon('');
      toast.error('Invalid or expired promo code');
    }
  };

  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  // Check store open / restore saved user info
  React.useEffect(() => {
    const adminToken = localStorage.getItem('moms_magic_admin_token');
    const userPhone  = localStorage.getItem('moms_magic_user_phone');
    const isAdmin =
      adminToken === 'mock-jwt-admin-token-123456' ||
      userPhone === '+917483187572' ||
      userPhone === '+919606001790' ||
      userPhone === '7483187572' ||
      userPhone === '9606001790';

    const isStoreOpen = () => { return true; };
    if (!isStoreOpen() && !isAdmin) {
      toast.error('Ordering is closed! Redirecting to menu.', { id: 'ordering-closed' });
      navigate('/home');
      return;
    }
    const savedName  = localStorage.getItem('moms_magic_user_name');
    const savedPhone = localStorage.getItem('moms_magic_user_phone');
    if (savedName || savedPhone) {
      setFormData((prev) => ({ ...prev, name: savedName || '', phone: savedPhone || '' }));
    }
  }, [settings, navigate]);


  const distanceKm      = deliveryLocation?.distance ?? 0;
  const baseDeliveryCharge = calculateDeliveryCharge(distanceKm);

  // Free delivery before 2:00 PM every day
  const now = new Date();
  const isBeforeTwo = now.getHours() < 14;
  const activeCoupons = settings.coupons || [];
  const appliedCouponDetails = appliedCoupon ? activeCoupons.find(c => c.code.toUpperCase() === appliedCoupon) : null;

  const isTillJuly1st = new Date() < new Date('2026-07-02T00:00:00');
  const isFreeDelivery  = (appliedCouponDetails?.type === 'free_delivery') || isBeforeTwo || isTillJuly1st;
  const freeDeliveryReason = appliedCouponDetails?.type === 'free_delivery' ? `${appliedCouponDetails.code} Promo` : isTillJuly1st ? 'Free Delivery till July 1st 🎉' : isBeforeTwo ? 'Free Before 2 PM 🎉' : '';
  const deliveryCharge  = isFreeDelivery ? 0 : baseDeliveryCharge;
  const rainySeasonFee = 5;

  let couponDiscount = 0;
  if (appliedCouponDetails) {
    if (appliedCouponDetails.type === 'fixed_discount') {
      couponDiscount = appliedCouponDetails.value;
    } else if (appliedCouponDetails.type === 'percent_discount') {
      couponDiscount = (subtotal * appliedCouponDetails.value) / 100;
    }
  }

  const grandTotal      = Math.max(0, subtotal + deliveryCharge + rainySeasonFee - couponDiscount);

  const maxWalletDeduction = user && profile ? Math.min(profile.walletBalance, grandTotal) : 0;
  
  // Calculate final wallet deduction used
  let walletDeduction = 0;
  if (user && profile && useWallet) {
    const inputAmount = parseFloat(customWalletAmount);
    if (!isNaN(inputAmount) && inputAmount > 0) {
      walletDeduction = Math.min(inputAmount, maxWalletDeduction);
    } else if (customWalletAmount === '') {
      walletDeduction = maxWalletDeduction;
    }
  }

  const payableAmount = Math.max(0, grandTotal - walletDeduction);

  const handleUseWalletToggle = (checked: boolean) => {
    setUseWallet(checked);
    if (checked && profile) {
      const maxPossible = Math.min(profile.walletBalance, grandTotal);
      setCustomWalletAmount(maxPossible.toString());
    } else {
      setCustomWalletAmount('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate store open
    const isStoreOpen = () => { return true; };
    const adminToken = localStorage.getItem('moms_magic_admin_token');
    const isAdmin = adminToken === 'mock-jwt-admin-token-123456';

    if (!isStoreOpen() && !isAdmin) {
      toast.error('Ordering is temporarily closed!');
      return;
    }
    if (!formData.name.trim())                      { toast.error('Please enter your name'); return; }
    if (!formData.phone.trim() || formData.phone.length < 10) { toast.error('Please enter a valid phone number'); return; }
    if (!deliveryLocation)                          { toast.error('Please select a delivery location'); openLocationPicker(); return; }
    if (deliveryLocation.distance > 12)             { toast.error('Sorry, not deliverable (location is >12km)'); return; }
    
    

    localStorage.setItem('moms_magic_user_name',  formData.name.trim());
    localStorage.setItem('moms_magic_user_phone', formData.phone.trim());

    // ── CRITICAL FIX: Open the WhatsApp window BEFORE any async work ──
    // Mobile browsers block window.open() called after an await. Opening it here
    // (synchronously inside the click/submit handler) ensures it is never blocked.
    const mapsViewLink = `https://www.google.com/maps?q=${deliveryLocation.lat},${deliveryLocation.lng}`;
    const mapsNavLink  = `https://www.google.com/maps/dir/?api=1&destination=${deliveryLocation.lat},${deliveryLocation.lng}`;

    const buildWaMessage = (paymentId?: string) => {
      let orderDetails = '';
      if (isBulkOrder) {
        const decos = [
          decoration.balloons > 0 && `${decoration.balloons}x Balloons`,
          decoration.spray    > 0 && `${decoration.spray}x Spray`,
          decoration.candles  > 0 && `${decoration.candles}x Candles`,
        ].filter(Boolean).join(', ');
        orderDetails = [
          `🛒 *FOOD ITEMS:*`,
          bulkItems.map((i) => `• ${i.name} (${i.finalQuantity} units)`).join('\n'),
          cake.required ? `🎂 *Cake:* ${cake.size} - "${cake.text}"` : '',
          decos         ? `🎈 *Decorations:* ${decos}` : '',
          additionalServices.disposablePlates ? `🍽️ Disposable plates added` : '',
          additionalServices.setupServing     ? `👨‍🍳 Setup & Serving team added` : '',
        ].filter(Boolean).join('\n');
      } else {
        orderDetails = `🛒 *ITEMS:*\n` + cartItems.map((item) => {
          let line = `• ${item.quantity}x ${item.name}`;
          if (item.items?.length) line += `\n  (${item.items.join(', ')})`;
          return line;
        }).join('\n');
      }
      return [
        isBulkOrder ? `🎉 *NEW BULK / PARTY ORDER!* 🎉` : `📦 *NEW ORDER!* 📦`,
        ``,
        `👤 *Name:* ${formData.name.trim()}`,
        `📞 *Phone:* ${formData.phone.trim()}`,
        `📍 *City:* ${selectedCity?.name || 'Unknown'}`,
        `🏠 *Address:* ${deliveryLocation.address}`,
        `📏 *Distance:* ${distanceKm}km`,
        ``,
        orderDetails,
        ``,
        `💰 *Subtotal:* ₹${subtotal}`,
        `🌧️ *Rainy Season Fee:* ₹${rainySeasonFee}`,
        `🚚 *Delivery:* ${isFreeDelivery ? `₹0 (${freeDeliveryReason})` : `₹${deliveryCharge}`}`,
        couponDiscount > 0 ? `🎟️ *Coupon Discount:* -₹${couponDiscount}` : '',
        walletDeduction > 0 ? `🎁 *Wallet Used:* -₹${walletDeduction.toFixed(2)}` : '',
        `💵 *GRAND TOTAL:* ₹${payableAmount.toFixed(2)}`,
        paymentId ? `✅ *PAYMENT DONE:* ${paymentId}` : `⚠️ *PAYMENT:* Cash on Delivery`,
        ``,
        `🗺️ *View Map:* ${mapsViewLink}`,
        `🚗 *Navigate:* ${mapsNavLink}`,
        formData.additionalMessage.trim() ? `📝 *Note:* ${formData.additionalMessage.trim()}` : '',
        ``,
        `━━━━━━━━━━━━━━━━`,
        `🚀 *WANT TO ORDER AGAIN?*`,
        `👉 https://momsmagic.shop`,
        `━━━━━━━━━━━━━━━━`,
      ].filter((l) => l !== '').join('\n');
    };

    const buildTgMessage = (paymentId?: string) => {
      let tgDetails = '';
      if (isBulkOrder) {
        const decos = [
          decoration.balloons > 0 && `${decoration.balloons}x Balloons`,
          decoration.spray    > 0 && `${decoration.spray}x Spray`,
          decoration.candles  > 0 && `${decoration.candles}x Candles`,
        ].filter(Boolean).join(', ');
        tgDetails = [
          `🛒 <b>FOOD ITEMS:</b>`,
          bulkItems.map((i) => `• ${escHtml(i.name)} (${i.finalQuantity} units)`).join('\n'),
          cake.required ? `🎂 <b>Cake:</b> ${escHtml(cake.size)} - "${escHtml(cake.text)}"` : '',
          decos         ? `🎈 <b>Decorations:</b> ${escHtml(decos)}` : '',
          additionalServices.disposablePlates ? `🍽️ Disposable plates added` : '',
          additionalServices.setupServing     ? `👨‍🍳 Setup &amp; Serving team added` : '',
        ].filter(Boolean).join('\n');
      } else {
        tgDetails = `🛒 <b>ITEMS:</b>\n` + cartItems.map((item) => {
          let line = `• ${item.quantity}x ${escHtml(item.name)}`;
          if (item.items?.length) line += `\n  (${item.items.map(escHtml).join(', ')})`;
          return line;
        }).join('\n');
      }
      return [
        isBulkOrder ? `🎉 <b>NEW BULK / PARTY ORDER!</b> 🎉` : `📦 <b>NEW ORDER!</b> 📦`,
        ``,
        `👤 <b>Name:</b> ${escHtml(formData.name.trim())}`,
        `📞 <b>Phone:</b> ${escHtml(formData.phone.trim())}`,
        `📍 <b>City:</b> ${escHtml(selectedCity?.name || 'Unknown')}`,
        `🏠 <b>Address:</b> ${escHtml(deliveryLocation.address)}`,
        `📏 <b>Distance:</b> ${distanceKm}km`,
        ``,
        tgDetails,
        ``,
        `💰 <b>Subtotal:</b> ₹${subtotal}`,
        `🌧️ <b>Rainy Season Fee:</b> ₹${rainySeasonFee}`,
        `${isFreeDelivery ? `<b>Delivery Fee:</b> ₹0 (${freeDeliveryReason})` : `<b>Delivery Fee:</b> ₹${deliveryCharge}`}`,
        `${couponDiscount ? `<b>Coupon Discount:</b> -₹${couponDiscount}` : ''}`,
        `${walletDeduction ? `<b>Wallet Used:</b> -₹${walletDeduction.toFixed(2)}` : ''}`,
        `💵 <b>GRAND TOTAL:</b> ₹${payableAmount.toFixed(2)}`,
        paymentId ? `✅ <b>PAYMENT DONE:</b> ${escHtml(paymentId)}` : `⚠️ <b>PAYMENT:</b> Cash on Delivery`,
        ``,
        `🗺️ <b>View Map:</b> ${escHtml(mapsViewLink)}`,
        `🚗 <b>Navigate:</b> ${escHtml(mapsNavLink)}`,
        formData.additionalMessage.trim() ? `📝 <b>Note:</b> ${escHtml(formData.additionalMessage.trim())}` : '',
        ``,
        `━━━━━━━━━━━━━━━━`,
        `🚀 <b>WANT TO ORDER AGAIN?</b>`,
        `👉 https://momsmagic.shop`,
        `━━━━━━━━━━━━━━━━`,
      ].filter((l) => l !== '').join('\n');
    };

    const completeOrder = async (paymentId?: string) => {
      const orderId = Date.now().toString();
      
      // Deduct from wallet if logged in and using wallet
      if (user && walletDeduction > 0) {
        await deductWalletBalance(walletDeduction, orderId);
      }

      const waMsg    = buildWaMessage(paymentId);
      const tgMsg    = buildTgMessage(paymentId);
      const waNumber = isBulkOrder ? WHATSAPP_BULK_NUMBER : WHATSAPP_FOOD_NUMBER;
      const waUrl    = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`;

      // Save order locally and in Firestore
      try {
        const order = {
          id: orderId,
          userId: user?.uid || null,
          userName: formData.name.trim(),
          userPhone: formData.phone.trim().replace(/\D/g, '').slice(-10),
          orderType: isBulkOrder ? 'bulk' : 'regular',
          items: activeItems,
          subtotal,
          rainySeasonFee,
          deliveryCharge,
          grandTotal,
          walletAmountUsed: walletDeduction,
          payableAmount,
          paymentMethod: payableAmount === 0 ? 'wallet' : paymentMethod,
          paymentId: paymentId || null,
          deliveryLocation,
          status: 'pending',
          createdAt: new Date().toISOString(),
          instructions: formData.additionalMessage.trim(),
        };

        // Save to Firestore (max wait 1.5s so it doesn't block redirection on slow internet)
        await Promise.race([
          setDoc(doc(db, 'orders', orderId), order),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);

        // Save locally
        const existing = JSON.parse(localStorage.getItem('moms_magic_orders') || '[]');
        existing.push(order);
        localStorage.setItem('moms_magic_orders', JSON.stringify(existing));
      } catch (err) {
        console.error('Failed to save order:', err);
      }

      // Send Telegram (fire and don't block redirect)
      sendTelegramMessage(tgMsg).catch(console.error);

      // Clear cart / bulk order
      if (isBulkOrder) {
        resetBulkOrder();
        localStorage.removeItem('moms_magic_order_type');
      } else {
        clearCart();
      }

      playSound(SOUNDS.ORDER_SUCCESS);
      toast.success('🎉 Order placed successfully!');
      setTimeout(() => navigate('/track/' + orderId), 500);
    };

    if (payableAmount > 0 && paymentMethod === 'online') {
      // Load Razorpay
      const loadRazorpay = () =>
        new Promise<boolean>((resolve) => {
          const script  = document.createElement('script');
          script.src    = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

      setIsSubmitting(true);
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Failed to load Razorpay. Check your connection.');
        setIsSubmitting(false);
        return;
      }

      const options = {
        key: 'rzp_live_T1Y1yu09Jbjo6b',
        amount: Math.round(payableAmount * 100),
        currency: 'INR',
        name: 'Mintoo',
        description: 'Food Order',
        handler: async (response: any) => {
          await completeOrder(response.razorpay_payment_id);
          setIsSubmitting(false);
        },
        prefill: { name: formData.name, contact: formData.phone },
        theme: { color: '#FC8019' },
        modal: { ondismiss: () => setIsSubmitting(false) },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (r: any) => {
        toast.error('Payment Failed: ' + r.error.description);
        setIsSubmitting(false);
      });
      rzp.open();
    } else {
      setIsSubmitting(true);
      try {
        await completeOrder(undefined);
      } catch (err) {
        console.error(err);
        toast.error('Failed to place order. Please try again.');
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-gray-500 font-black uppercase tracking-[3px] text-[10px] hover:text-orange-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Menu
        </motion.button>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
          {isBulkOrder ? 'Bulk ' : ''}Checkout
        </h1>
        <p className="text-gray-500 font-bold uppercase tracking-[2px] text-[10px]">
          Confirm your order details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── User Info ── */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">Your Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Name</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-orange-500/40 outline-none font-bold text-gray-900 text-sm transition-all placeholder:text-gray-500"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-orange-500/50 uppercase tracking-[3px]">WhatsApp No.</label>
              <input
                required
                type="tel"
                inputMode="numeric"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-orange-500/40 outline-none font-bold text-gray-900 text-sm transition-all placeholder:text-gray-500"
                placeholder="+91 XXXXXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Delivery Location */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-orange-500/50 uppercase tracking-[3px]">Delivery Location</label>
            {deliveryLocation ? (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-gray-900 font-bold text-sm leading-relaxed">{deliveryLocation.address}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-[10px] font-black uppercase text-gray-500 border border-gray-200">
                    {distanceKm} KM
                  </div>
                  <div className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border bg-orange-500/10 text-orange-500 border-orange-500/20">
                    ₹{deliveryCharge} Delivery
                  </div>
                </div>
                <button
                  type="button"
                  onClick={openLocationPicker}
                  className="w-full py-3 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500/10 hover:text-orange-500 transition-all flex items-center justify-center gap-2 text-gray-500"
                >
                  <MapPin className="w-3.5 h-3.5" /> Change Location
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <div>
                    <h3 className="text-sm font-black text-gray-800">Set Delivery Address</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Select location to calculate delivery charges</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Auto-Detect Button */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={async () => {
                      const loadId = toast.loading('Detecting your location...');
                      try {
                        await detectLocation();
                        toast.dismiss(loadId);
                        toast.success('Location detected successfully!');
                      } catch (err) {
                        toast.dismiss(loadId);
                        toast.error('Could not auto-detect location. Please use manual entry.');
                        setIsManualInputOpen(true);
                      }
                    }}
                    className="relative overflow-hidden p-4 bg-orange-50 hover:bg-orange-100/80 border border-orange-200 hover:border-orange-300 rounded-xl transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer text-center"
                  >
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
                    ) : (
                      <Compass className="w-6 h-6 text-orange-600 group-hover:rotate-45 transition-transform duration-300" />
                    )}
                    <span className="text-xs font-black text-orange-700 uppercase tracking-wider">Auto-Detect</span>
                    <span className="text-[9px] text-orange-600/70 font-bold uppercase tracking-wide">Using GPS</span>
                  </button>

                  {/* Manual Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualInputOpen(!isManualInputOpen);
                    }}
                    className={`p-4 border rounded-xl transition-all flex flex-col items-center justify-center gap-2 text-center ${
                      isManualInputOpen 
                        ? 'bg-orange-500/10 border-orange-500 text-orange-600' 
                        : 'bg-white hover:bg-gray-100/60 border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Search className="w-6 h-6 text-gray-500" />
                    <span className="text-xs font-black uppercase tracking-wider">Add Manual</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Type address or area</span>
                  </button>
                </div>

                {/* Inline Manual Form and Search */}
                {isManualInputOpen && (
                  <div className="pt-2 space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search area (or type custom address directly)..."
                        value={manualSearchQuery}
                        onChange={(e) => handleManualSearch(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-400"
                      />
                      {isManualSearching && (
                        <div className="absolute right-3 top-3.5">
                          <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Results dropdown */}
                    {manualSearchResults.length > 0 && (
                      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-h-48 overflow-y-auto z-10 relative">
                        {manualSearchResults.map((res: any, idx: number) => (
                          <div
                            key={idx}
                            onClick={() => selectManualSearchResult(res)}
                            className="px-4 py-3 border-b border-gray-50 hover:bg-orange-50 cursor-pointer flex flex-col"
                          >
                            <span className="font-bold text-xs text-gray-900 truncate">{res.display_name.split(',')[0]}</span>
                            <span className="text-[10px] text-gray-500 truncate mt-0.5">{res.display_name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Button to use custom typed address */}
                    {manualSearchQuery.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={useCustomTypedAddress}
                        className="w-full py-3 bg-gray-200/60 hover:bg-gray-200 text-gray-700 font-black uppercase tracking-wider rounded-xl text-[10px] transition-colors flex items-center justify-center gap-1.5"
                      >
                        Use "{manualSearchQuery}" Directly
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-orange-500/50 uppercase tracking-[3px]">Special Instructions</label>
            <textarea
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-orange-500/40 outline-none font-bold text-gray-900 text-sm transition-all placeholder:text-gray-500 resize-none"
              placeholder="E.g., Extra hot, gate code, ring the bell..."
              value={formData.additionalMessage}
              onChange={(e) => setFormData({ ...formData, additionalMessage: e.target.value })}
            />
          </div>
        </div>

        {/* ── Order Items ── */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Ticket className="w-4 h-4 text-orange-500" /> {isBulkOrder ? 'Event' : 'Order'} Items
            </h2>
            {isBulkOrder && (
              <div className="px-3 py-1.5 bg-orange-500/10 rounded-full text-[10px] font-black uppercase text-orange-500 border border-orange-500/20 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Bulk
              </div>
            )}
          </div>

          <div className="space-y-3">
            {activeItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                {item.image && (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      alt={item.name}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 truncate">{item.name}</h4>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">
                    {isBulkOrder ? (item as any).finalQuantity : (item as any).quantity} Unit(s)
                  </p>
                  {item.items?.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {item.items.map((sub: string, i: number) => (
                        <li key={i} className="text-gray-500 text-[10px] flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-orange-500 shrink-0" />
                          {sub}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="text-base sm:text-lg font-black text-gray-900 shrink-0">
                  ₹{item.price * (isBulkOrder ? (item as any).finalQuantity : (item as any).quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Summary, Coupon, Payment ── */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          {/* Free Delivery Before 2 PM Banner */}
          {isTillJuly1st ? (
            <div className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
              <span className="text-xl">🎉</span>
              <div>
                <p className="text-orange-500 font-black text-xs uppercase tracking-widest">Free Delivery Active!</p>
                <p className="text-orange-300/70 text-[11px] font-medium">Free delivery is on us till July 1st!</p>
              </div>
            </div>
          ) : isBeforeTwo ? (
            <div className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
              <span className="text-xl">🎉</span>
              <div>
                <p className="text-orange-500 font-black text-xs uppercase tracking-widest">Free Delivery Active!</p>
                <p className="text-orange-300/70 text-[11px] font-medium">Orders before 2:00 PM get free delivery today</p>
              </div>
            </div>
          ) : null}
          {/* Promo Code */}
          <div className="space-y-3 pb-6 border-b border-gray-200">
            <h3 className="text-[10px] font-black text-orange-500/50 uppercase tracking-[3px]">Promo Code</h3>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-orange-500/40 outline-none font-bold text-gray-900 uppercase text-sm transition-all placeholder:text-gray-500 min-w-0"
                placeholder="ENTER CODE"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-5 py-3 bg-orange-500/10 text-orange-500 rounded-xl border border-orange-500/20 font-black uppercase tracking-widest text-[11px] hover:bg-orange-500/20 transition-all shrink-0"
              >
                Apply
              </button>
            </div>
            {isFreeDelivery && (
              <p className="text-orange-500 text-xs font-bold">✅ Free Delivery — {freeDeliveryReason}</p>
            )}
          </div>

          {/* Wallet Balance Integration */}
          {user && profile && profile.walletBalance > 0 && (
            <div className="space-y-4 pb-6 border-b border-gray-200 text-left">
              <h3 className="text-[10px] font-black text-orange-500/50 uppercase tracking-[3px]">Wallet Balance</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="use-wallet-cb"
                    checked={useWallet}
                    onChange={(e) => handleUseWalletToggle(e.target.checked)}
                    className="w-4.5 h-4.5 accent-[#FC8019] cursor-pointer"
                  />
                  <label htmlFor="use-wallet-cb" className="text-xs font-black uppercase text-gray-900 select-none cursor-pointer tracking-wider">
                    Use Wallet Cash (Available: <span className="text-orange-500">₹{profile.walletBalance}</span>)
                  </label>
                </div>

                {useWallet && (
                  <div className="space-y-2 mt-1">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Amount to Deduct (₹)</p>
                    <input
                      type="number"
                      max={maxWalletDeduction}
                      min={0}
                      value={customWalletAmount}
                      onChange={(e) => setCustomWalletAmount(e.target.value)}
                      placeholder={`Max deduction: ₹${maxWalletDeduction}`}
                      className="w-full bg-[#111] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 font-bold outline-none focus:border-orange-200"
                    />
                    {walletDeduction > 0 && (
                      <p className="text-orange-500 text-[9px] font-black uppercase tracking-wider">
                        Applied Wallet Deduction: -₹{walletDeduction}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="space-y-3 pb-6 border-b border-gray-200">
            <div className="flex justify-between items-center text-gray-500 font-bold text-xs uppercase tracking-[3px]">
              <span>Subtotal</span>
              <span className="text-gray-900 text-lg font-black">₹{subtotal}</span>
            </div>
            <div className="flex justify-between items-center text-gray-500 font-bold text-xs uppercase tracking-[3px]">
              <span>Rainy Season Fee</span>
              <span className="text-gray-900 text-lg font-black">₹{rainySeasonFee}</span>
            </div>
            <div className="flex justify-between items-center text-gray-500 font-bold text-xs uppercase tracking-[3px]">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-orange-500" />
                <span>Delivery</span>
              </div>
              <span className="text-lg font-black text-gray-900">
                {isFreeDelivery ? (
                  <div className="text-right">
                    <div>
                      <span className="line-through text-gray-500 mr-2 text-sm">₹{baseDeliveryCharge}</span>
                      <span className="text-orange-500">FREE</span>
                    </div>
                    <p className="text-orange-500/60 text-[10px] font-bold">{freeDeliveryReason}</p>
                  </div>
                ) : `₹${deliveryCharge}`}
              </span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between items-center text-orange-500 font-bold text-xs uppercase tracking-[3px]">
                <span>Coupon Discount</span>
                <span className="text-lg font-black">-₹{couponDiscount}</span>
              </div>
            )}
            {walletDeduction > 0 && (
              <div className="flex justify-between items-center text-orange-500 font-bold text-xs uppercase tracking-[3px]">
                <span>Wallet Discount</span>
                <span className="text-lg font-black">-₹{walletDeduction}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end pb-2">
            <div>
              <p className="text-orange-500/40 text-[10px] font-black uppercase tracking-[4px] mb-1">
                {walletDeduction > 0 ? 'Payable Amount' : 'Grand Total'}
              </p>
              <p className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter text-gray-900">
                ₹{payableAmount}
              </p>
              {walletDeduction > 0 && (
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-wider mt-1 text-left">
                  (Grand Total: ₹{grandTotal})
                </p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          {payableAmount > 0 ? (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Payment Method</h3>
              <div className="space-y-2">
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'online'
                      ? 'bg-orange-50/50 border-orange-500 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'online'}
                    onChange={() => toast.error('Pay Online is coming soon!')}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">Pay Online</p>
                    <p className="text-xs text-gray-500">UPI, Cards, NetBanking</p>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'bg-orange-50/50 border-orange-500 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay with cash when your order arrives</p>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-3.5 rounded-2xl text-orange-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
              🎉 100% Covered By Wallet cash
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white h-14 sm:h-16 rounded-2xl text-base font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                Place Order
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 mt-4 text-gray-500 font-bold text-[10px]">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            Secure Encrypted Checkout
          </div>
        </div>
      </form>
    </div>
  );
}
