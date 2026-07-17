import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, ShieldCheck, ChefHat, Bike, Settings } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import toast from 'react-hot-toast';
import { useSEO } from '../utils/seo';

const ROLES = [
  { id: 'admin', label: 'Admin', icon: Settings, color: 'from-gray-800 to-black', accent: 'text-gray-900', bg: 'bg-gray-900', border: 'border-gray-700', desc: 'Full system control' },
  { id: 'hotel', label: 'Kitchen', icon: ChefHat, color: 'from-orange-500 to-orange-600', accent: 'text-orange-500', bg: 'bg-orange-500', border: 'border-orange-300', desc: 'Manage orders & kitchen' },
  { id: 'rider', label: 'Rider', icon: Bike, color: 'from-blue-500 to-blue-600', accent: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-300', desc: 'Delivery partner portal' },
];

export default function StaffLogin() {
  useSEO('Staff Login', 'Login portal for admin, kitchen and delivery staff.');
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to correct panel
  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') {
      navigate('/admin');
      return;
    }
    if (localStorage.getItem('hotel_auth')) {
      navigate('/hotel');
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check staff
          const snap = await getDoc(doc(db, 'staff', user.uid));
          if (snap.exists()) {
            redirectToPanel(snap.data().role);
          } else {
            // Check riders
            const riderSnap = await getDoc(doc(db, 'riders', user.uid));
            if (riderSnap.exists()) {
              redirectToPanel('rider');
            }
          }
        } catch (_) {}
      }
    });
    return () => unsub();
  }, [navigate]);

  const redirectToPanel = (role: string) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'hotel') navigate('/hotel');
    else if (role === 'rider') navigate('/delivery');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    try {
      // 1. Check if hardcoded admin
      if (email.trim() === 'shalyagaonkar@gmail.com' && password.trim() === '-Shalya@2004') {
        localStorage.setItem('admin_auth', 'true');
        toast.success(`Welcome back, Admin! Redirecting... 👑`);
        setTimeout(() => navigate('/admin'), 800);
        return;
      }

      // 2. Check if hotel in Firestore collection or local storage cache
      let hotelData: any = null;
      try {
        const hotelsCol = collection(db, 'hotels');
        const q = query(hotelsCol, where('email', '==', email.trim()), where('password', '==', password.trim()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          const hotelDoc = querySnap.docs[0];
          hotelData = { id: hotelDoc.id, ...hotelDoc.data() };
        }
      } catch (e) {
        console.warn('Firestore hotel query failed, trying local storage cache...', e);
      }

      // Check local cache if Firestore failed/returned empty
      if (!hotelData) {
        const cachedHotelsStr = localStorage.getItem('moms_magic_hotels');
        if (cachedHotelsStr) {
          try {
            const cachedHotels = JSON.parse(cachedHotelsStr);
            const found = cachedHotels.find((h: any) => 
              h.email.toLowerCase() === email.trim().toLowerCase() && 
              h.password === password.trim()
            );
            if (found) {
              hotelData = found;
            }
          } catch (_) {}
        }
      }

      if (hotelData) {
        localStorage.setItem('hotel_auth', JSON.stringify(hotelData));
        toast.success(`Welcome back! Redirecting to Kitchen panel... 🎯`);
        setTimeout(() => navigate('/hotel'), 800);
        return;
      }

      // 3. Fallback to Firebase Auth (for Riders / other pre-existing staff)
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      
      let role: string | null = null;
      
      // Check staff collection first
      const snap = await getDoc(doc(db, 'staff', cred.user.uid));
      if (snap.exists()) {
        role = snap.data().role;
      } else {
        // Fallback: check riders collection directly
        const riderSnap = await getDoc(doc(db, 'riders', cred.user.uid));
        if (riderSnap.exists()) {
          role = 'rider';
        }
      }

      if (role) {
        toast.success(`Welcome back! Redirecting to ${role} panel... 🎯`);
        setTimeout(() => redirectToPanel(role), 800);
      } else {
        // No role record — sign out
        await signOut(auth);
        toast.error('Account not found in staff/rider records. Contact admin.');
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password.');
      } else {
        toast.error(err.message || 'Login failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const activeRole = ROLES.find(r => r.id === selectedRole)!;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeRole.color} flex items-center justify-center mx-auto mb-4 shadow-lg transition-all duration-300`}>
            <activeRole.icon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">
            STAFF <span className="text-orange-500">PORTAL</span>
          </h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
            Mintoo Restaurant System
          </p>
        </div>

        <div className="bg-white rounded-[35px] border border-gray-200 shadow-sm overflow-hidden">
          {/* Top accent bar */}
          <div className={`h-1 bg-gradient-to-r ${activeRole.color} transition-all duration-300`} />

          <div className="p-8 space-y-6">
            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="staff@mintoo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 outline-none focus:border-orange-300 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 pr-12 outline-none focus:border-orange-300 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r ${activeRole.color} text-white font-black text-xs uppercase tracking-[2px] py-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:brightness-110 active:scale-95`}
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Login to Panel
                    <LogIn className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-center gap-2 text-gray-400 text-[9px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
              Secured with Firebase Auth & Firestore
            </div>
          </div>
        </div>

        {/* Quick help */}
        <p className="text-center text-[10px] text-gray-400 font-semibold mt-6">
          Authorized staff only. Contact admin for credentials.
        </p>
      </motion.div>
    </div>
  );
}
