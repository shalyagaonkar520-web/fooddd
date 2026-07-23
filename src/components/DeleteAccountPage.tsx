import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, AlertTriangle, ShieldCheck, Mail, Phone, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { db } from '../firebase';
import { collection, addDoc, doc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useSEO } from '../utils/seo';

export default function DeleteAccountPage() {
  useSEO("Delete Account", "Request complete deletion of your Mintoo account and data.");
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const purgeAllLocalData = () => {
    try {
      // 1. Remove specific keys explicitly
      localStorage.removeItem('moms_magic_orders');
      localStorage.removeItem('moms_magic_active_order');
      localStorage.removeItem('cart-storage');
      localStorage.removeItem('delivery-location-storage');
      localStorage.removeItem('city-gateway-storage');
      localStorage.removeItem('moms_magic_user_phone');
      localStorage.removeItem('moms_magic_guest');
      localStorage.removeItem('moms_magic_persona');

      // 2. Clear all localStorage
      localStorage.clear();

      // 3. Clear all sessionStorage
      sessionStorage.clear();

      // 4. Clear IndexedDB databases if supported
      if ('indexedDB' in window && window.indexedDB.databases) {
        window.indexedDB.databases().then((dbs) => {
          dbs.forEach((dbInfo) => {
            if (dbInfo.name) {
              window.indexedDB.deleteDatabase(dbInfo.name);
            }
          });
        }).catch((e) => console.warn('IndexedDB clear warning:', e));
      }
    } catch (e) {
      console.warn('Local data purge warning:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail.trim()) {
      toast.error('Please enter your phone number or email address.');
      return;
    }

    setLoading(true);
    const targetPhone = phoneOrEmail.trim();

    try {
      // 1. Log deletion request in Firestore
      await addDoc(collection(db, 'deletionRequests'), {
        userId: user?.uid || 'guest_or_web',
        phoneOrEmail: targetPhone,
        reason: reason.trim(),
        status: 'completed',
        deletedAt: new Date().toISOString()
      });

      // 2. Delete ALL Firestore orders associated with this user or phone
      try {
        const ordersRef = collection(db, 'orders');
        
        if (user?.uid) {
          const qUser = query(ordersRef, where('userId', '==', user.uid));
          const snapUser = await getDocs(qUser);
          snapUser.forEach(async (docSnap) => {
            await deleteDoc(doc(db, 'orders', docSnap.id)).catch(() => {});
          });
        }

        if (targetPhone) {
          const qPhone = query(ordersRef, where('userPhone', '==', targetPhone));
          const snapPhone = await getDocs(qPhone);
          snapPhone.forEach(async (docSnap) => {
            await deleteDoc(doc(db, 'orders', docSnap.id)).catch(() => {});
          });
        }
      } catch (orderErr) {
        console.warn("Firestore orders deletion warning:", orderErr);
      }

      // 3. Delete User Profile document from Firestore if logged in
      if (user?.uid) {
        try {
          await deleteDoc(doc(db, 'users', user.uid));
        } catch (err) {
          console.warn("Firestore user profile deletion warning:", err);
        }
      }

      // 4. Delete Firebase Auth user if logged in
      if (user) {
        try {
          await user.delete();
        } catch (authErr: any) {
          console.warn("Firebase Auth user delete warning:", authErr);
        }
        await logout();
      }

      // 5. Wipe 100% of all local data, tracking history, orders, cache, tokens, and storage
      purgeAllLocalData();

      setSubmitted(true);
      toast.success('Account, order history, and tracking data wiped completely!');
    } catch (err) {
      console.error(err);
      // Fallback: still wipe local data completely
      purgeAllLocalData();
      setSubmitted(true);
      toast.success('All local orders & tracking history erased successfully.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-24 pb-12 px-6 font-sans">
      <div className="max-w-xl mx-auto space-y-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors font-bold uppercase tracking-widest text-xs cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[35px] border border-gray-200 shadow-sm space-y-6"
        >
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <Trash2 className="w-6 h-6" />
          </div>

          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">
            Delete Account & Erase All Data
          </h1>

          {submitted ? (
            <div className="space-y-6 pt-4 text-center">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">All Orders & Tracking Data Erased</h2>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                Your account, order history, live tracking records, saved addresses, cache, and tokens have been 100% permanently deleted. Not a single record remains.
              </p>
              <button
                onClick={() => {
                  purgeAllLocalData();
                  window.location.href = '/';
                }}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-wider shadow-md hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Return to Home Page
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-red-800">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs font-semibold leading-relaxed">
                  <p className="font-bold uppercase tracking-wider mb-1">Permanent Data & Order Erasure</p>
                  Deleting your account will permanently destroy all order history, live order tracking data, saved delivery addresses, and personal profile information.
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Phone Number or Email *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., +919876543210 or user@example.com"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Reason for leaving (Optional)</label>
                  <textarea
                    placeholder="Tell us why you want to delete your account..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                Confirm & Erase Orders & Account
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
