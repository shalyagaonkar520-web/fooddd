import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Eye, EyeOff, ShieldCheck, ChefHat, Bike, Settings } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // If already logged in, redirect to correct panel
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'staff', user.uid));
          if (snap.exists()) {
            const role = snap.data().role;
            redirectToPanel(role);
          }
        } catch (_) {}
      }
    });
    return () => unsub();
  }, []);

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
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      // Fetch role from Firestore
      const snap = await getDoc(doc(db, 'staff', cred.user.uid));
      if (snap.exists()) {
        const role = snap.data().role;
        toast.success(`Welcome back! Redirecting to ${role} panel... 🎯`);
        setTimeout(() => redirectToPanel(role), 800);
      } else {
        // No role record — sign out
        await signOut(auth);
        toast.error('Account not found in staff records. Contact admin.');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
      // Save role to Firestore staff collection
      await setDoc(doc(db, 'staff', cred.user.uid), {
        uid: cred.user.uid,
        email: email.trim(),
        role: selectedRole,
        createdAt: new Date().toISOString(),
      });
      toast.success(`Account created! Welcome to the ${selectedRole} panel. 🎉`);
      setTimeout(() => redirectToPanel(selectedRole), 800);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        toast.error('Email already registered. Please login instead.');
        setTab('login');
      } else {
        toast.error(err.message || 'Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const cred = await signInWithPopup(auth, provider);
      
      // Check if rider/staff record already exists in Firestore
      const snap = await getDoc(doc(db, 'staff', cred.user.uid));
      if (snap.exists()) {
        const role = snap.data().role;
        toast.success(`Welcome back! Redirecting to ${role} panel... 🎯`);
        setTimeout(() => redirectToPanel(role), 800);
      } else {
        // If registering for the first time via Google, we use the selected role in the UI
        await setDoc(doc(db, 'staff', cred.user.uid), {
          uid: cred.user.uid,
          email: cred.user.email || '',
          role: selectedRole,
          createdAt: new Date().toISOString(),
        });
        toast.success(`Account created with Google! Welcome to the ${selectedRole} panel. 🎉`);
        setTimeout(() => redirectToPanel(selectedRole), 800);
      }
    } catch (err: any) {
      toast.error(err.message || 'Google authentication failed.');
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
            {/* Tab switcher */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                  tab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setTab('register')}
                className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                  tab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Role selector — only shown on register */}
            <AnimatePresence>
              {tab === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Select Your Role</p>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map(role => (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                          selectedRole === role.id
                            ? `${role.border} bg-gray-50 shadow-sm`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <role.icon className={`w-5 h-5 mx-auto mb-1 ${selectedRole === role.id ? role.accent : 'text-gray-400'}`} />
                        <p className={`text-[9px] font-black uppercase tracking-widest ${selectedRole === role.id ? 'text-gray-900' : 'text-gray-400'}`}>
                          {role.label}
                        </p>
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-gray-400 font-semibold text-center mt-2">{activeRole.desc}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-4">
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
                    {tab === 'login' ? 'Login to Panel' : 'Create Account'}
                    <LogIn className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <span className="relative px-3 bg-white text-[10px] text-gray-400 font-bold uppercase tracking-widest">or</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-black text-xs uppercase tracking-[2px] py-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 mb-4"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.186 4.114-3.518 0-6.386-2.87-6.386-6.386 0-3.517 2.868-6.386 6.386-6.386 1.622 0 3.097.61 4.237 1.614l3.076-3.076C19.345 2.502 16.035 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.898 0 10.748-4.229 10.748-11.24 0-.768-.076-1.503-.223-1.955H12.24z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Footer */}
            <div className="flex items-center justify-center gap-2 text-gray-400 text-[9px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
              Secured with Firebase Auth
            </div>
          </div>
        </div>

        {/* Quick help */}
        <p className="text-center text-[10px] text-gray-400 font-semibold mt-6">
          First time? Create an account with your role, then login.
        </p>
      </motion.div>
    </div>
  );
}
