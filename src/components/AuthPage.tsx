import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, ChevronRight } from 'lucide-react';
import { useSEO } from '../utils/seo';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import toast from 'react-hot-toast';

const FloatingFood = ({ src, delay, className, size = "w-24 h-24" }: { src: string, delay: number, className: string, size?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 30 }}
    animate={{ 
      opacity: [0, 0.85, 0.85], 
      scale: [0.8, 1, 1], 
      y: [30, 0, -15, 0],
      rotate: [0, 8, -4, 0]
    }}
    transition={{
      opacity: { delay, duration: 2, ease: "easeOut" },
      scale: { delay, duration: 2, ease: "easeOut" },
      y: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: delay + 1 },
      rotate: { duration: 12, repeat: Infinity, ease: "easeInOut", delay: delay + 1 }
    }}
    style={{ willChange: 'transform, opacity' }}
    className={`absolute rounded-full overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-white/5 ${className} ${size}`}
  >
    <img src={src} alt="Premium Gourmet Food" className="w-full h-full object-cover" />
    {/* Soft inner shadow for spherical feel */}
    <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none" />
  </motion.div>
);

const GoldenParticles = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1, duration: 2 }}
    className="absolute inset-0 overflow-hidden pointer-events-none z-10"
  >
    {[...Array(15)].map((_, i) => {
      const size = Math.random() * 3 + 1;
      const color = Math.random() > 0.5 ? '#D4AF37' : '#FFD86B';
      return (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size + 'px',
            height: size + 'px',
            backgroundColor: color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 ${size * 2}px ${color}`,
            willChange: 'transform, opacity'
          }}
          initial={{ opacity: 0, y: 0, x: 0 }}
          animate={{
            y: [0, Math.random() * -200 - 100],
            x: [0, (Math.random() - 0.5) * 50],
            opacity: [0, Math.random() * 0.6 + 0.2, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: 1 + Math.random() * 5
          }}
        />
      );
    })}
  </motion.div>
);

export default function AuthPage() {
  useSEO("MINTOO - Luxury Dining", "Freshly crafted. Delivered beautifully.");
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    const isGuest = localStorage.getItem('moms_magic_guest');
    const userPhone = localStorage.getItem('moms_magic_user_phone');
    if (isGuest || userPhone) {
      navigate('/home');
    }
  }, [navigate]);

  useEffect(() => {
    if (showLogin && !(window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {
            // reCAPTCHA solved
          }
        });
      } catch (err) {
        console.error("Recaptcha init failed", err);
      }
    }
  }, [showLogin]);

  const handleLogin = async () => {
    if (phone.length < 10) return;
    setIsLoading(true);
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const phoneNumber = `+91${phone}`;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setShowOTP(true);
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to send OTP.');
      // Reset recaptcha if error
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.render().then((widgetId: any) => {
          (window as any).grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6 || !confirmationResult) return;
    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
      localStorage.setItem('moms_magic_user_phone', phone);
      localStorage.removeItem('moms_magic_guest');
      toast.success('Login successful!');
      navigate('/home');
    } catch (error: any) {
      console.error(error);
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    localStorage.setItem('moms_magic_guest', 'true');
    localStorage.removeItem('moms_magic_user_phone');
    navigate('/home');
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Save user info locally
      localStorage.setItem('moms_magic_user_phone', user.phoneNumber || user.email || user.uid);
      localStorage.removeItem('moms_magic_guest');
      toast.success(`Welcome, ${user.displayName || 'there'}! 🍽️`);
      navigate('/home');
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Google sign-in was cancelled.');
      } else {
        toast.error(error.message || 'Google sign-in failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!showLogin) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center relative overflow-hidden">
        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500&family=Poppins:wght@600&display=swap');
          @import url('https://api.fontshare.com/v2/css?f[]=clash-display@700&display=swap');
          
          .font-clash { font-family: 'Clash Display', sans-serif; }
          .font-inter { font-family: 'Inter', sans-serif; }
          .font-poppins { font-family: 'Poppins', sans-serif; }
        `}} />

        {/* Soft spotlight from top center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] max-w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.18),transparent_60%)] pointer-events-none" />
        
        {/* Cinematic vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#080808_90%)] pointer-events-none z-20" />
        
        {/* Subtle grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

        <GoldenParticles />

        {/* Main Visual: Floating Gourmet Food */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none max-w-4xl mx-auto w-full">
          {/* Burger */}
          <FloatingFood src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80" delay={2} className="top-[15%] left-[5%] md:left-[15%]" size="w-24 h-24 md:w-36 md:h-36" />
          {/* Sushi */}
          <FloatingFood src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80" delay={2.2} className="top-[25%] -right-[5%] md:right-[15%]" size="w-28 h-28 md:w-40 md:h-40" />
          {/* Pizza */}
          <FloatingFood src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80" delay={2.4} className="bottom-[25%] -left-[10%] md:left-[10%]" size="w-32 h-32 md:w-48 md:h-48" />
          {/* Dessert/Cake */}
          <FloatingFood src="https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=400&q=80" delay={2.6} className="bottom-[20%] -right-[5%] md:right-[10%]" size="w-24 h-24 md:w-32 md:h-32" />
        </div>

        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ delay: 3, duration: 1.5, ease: "easeOut" }}
          className="relative z-30 flex flex-col items-center mt-[-8vh]"
        >
          {/* Soft Gold Illumination behind logo */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5, duration: 3 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[200%] bg-[#D4AF37]/15 blur-[60px] rounded-full pointer-events-none" 
          />

          <div className="flex items-center gap-1.5 md:gap-2.5 relative">
            <span className="text-white text-[56px] md:text-[84px] font-clash tracking-[0.1em] leading-none mix-blend-plus-lighter">
              MINT
            </span>
            
            {/* First O: Golden Dinner Plate */}
            <div className="relative w-[50px] h-[50px] md:w-[75px] md:h-[75px] rounded-full border-[3px] md:border-[4px] border-[#D4AF37] shadow-[inset_0_0_20px_rgba(212,175,55,0.7),0_0_20px_rgba(212,175,55,0.5)] bg-gradient-to-br from-[#1A1A1A] to-[#080808] flex items-center justify-center">
               <div className="w-[65%] h-[65%] rounded-full border-[1.5px] border-[#D4AF37]/40 shadow-[inset_0_0_15px_rgba(212,175,55,0.3)]" />
               <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent rounded-full" />
            </div>

            {/* Second O: Bowl of Noodles */}
            <div className="relative w-[50px] h-[50px] md:w-[75px] md:h-[75px] rounded-full shadow-[0_5px_20px_rgba(0,0,0,0.8)] border-2 border-white/10 z-20">
              <img src="https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=200&q=80" alt="Gourmet Bowl" className="w-full h-full object-cover rounded-full" />
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_25px_rgba(0,0,0,0.8)] pointer-events-none" />
              
              {/* Rising Steam */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4, duration: 2 }}
                className="absolute -top-12 md:-top-16 inset-x-0 h-16 md:h-20 flex justify-center gap-1.5 pointer-events-none z-30"
              >
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -30, -50],
                      x: i % 2 === 0 ? [0, 10, -5, 0] : [0, -10, 5, 0],
                      opacity: [0, 0.6, 0],
                      scale: [1, 2, 3]
                    }}
                    transition={{
                      duration: 3 + i * 0.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.6
                    }}
                    className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/50 blur-[4px] md:blur-[5px] rounded-full"
                  />
                ))}
              </motion.div>
            </div>

            {/* Light Sweep Effect */}
            <motion.div 
              initial={{ left: '-100%', opacity: 0 }}
              animate={{ left: '200%', opacity: 0.35 }}
              transition={{ delay: 5.5, duration: 2, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-25deg] mix-blend-overlay pointer-events-none z-40"
            />
          </div>

          {/* Tagline */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.5, duration: 1.5, ease: "easeOut" }}
            className="mt-8 md:mt-12 flex flex-col items-center"
          >
            <p className="font-inter text-[#A5A5A5] text-[13px] md:text-[15px] font-medium tracking-[0.25em] uppercase text-center leading-[1.8]">
              Freshly Crafted.<br />
              <span className="text-[#FFD86B] font-semibold drop-shadow-[0_0_10px_rgba(255,216,107,0.3)]">Delivered Beautifully.</span>
            </p>
          </motion.div>
        </motion.div>

        {/* Start Ordering Button */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 6, duration: 1.5, ease: "easeOut" }}
          className="absolute bottom-12 md:bottom-20 z-40 w-full px-8 flex justify-center"
        >
          <button
            onClick={() => setShowLogin(true)}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD86B] px-12 py-4.5 shadow-[0_15px_40px_rgba(212,175,55,0.25)] hover:shadow-[0_20px_50px_rgba(212,175,55,0.4)] transition-all duration-500 hover:scale-[1.03] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <span className="font-poppins relative z-10 text-[#080808] font-semibold text-[15px] tracking-[1.5px] uppercase flex items-center gap-3">
              Start Ordering
              <svg className="w-5 h-5 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center relative overflow-hidden px-6">
      <div className="absolute top-0 right-0 w-[80%] h-[60%] bg-[#D4AF37]/10 blur-[150px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md bg-[#141414] border border-white/10 rounded-[40px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative z-10"
      >
        <div id="recaptcha-container"></div>
        <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.2)] border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/20 to-transparent mb-8">
          <span className="text-[#FFD86B] text-3xl font-black italic" style={{ fontFamily: "'Clash Display', sans-serif" }}>M</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white text-center mb-2 tracking-wide" style={{ fontFamily: "'Clash Display', sans-serif" }}>Mintoo</h1>
        <p className="text-center text-[#A5A5A5] text-sm font-medium mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
          {showOTP ? 'Enter the OTP sent to your phone' : 'Enter your phone number to continue'}
        </p>
        
        <div className="space-y-4" style={{ fontFamily: "'Inter', sans-serif" }}>
          {!showOTP ? (
            <>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <span className="text-white font-bold border-r border-white/20 pr-3">+91</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter mobile number"
                  className="w-full pl-[4.5rem] pr-5 py-4 bg-[#080808] border border-white/10 rounded-2xl focus:outline-none focus:bg-[#0A0A0A] focus:border-[#D4AF37] transition-all font-bold text-white placeholder:text-gray-600 text-lg shadow-inner"
                />
              </div>
              
              <button
                onClick={handleLogin}
                disabled={phone.length < 10 || isLoading}
                className="w-full h-14 bg-gradient-to-r from-[#D4AF37] to-[#FFD86B] text-[#080808] rounded-2xl font-bold text-[13px] uppercase tracking-[2px] hover:shadow-[0_10px_30px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-[#080808]/30 border-t-[#080808] rounded-full animate-spin" /> : 'Continue'}
              </button>
            </>
          ) : (
            <>
              <div className="relative group">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-5 py-4 bg-[#080808] border border-white/10 rounded-2xl focus:outline-none focus:bg-[#0A0A0A] focus:border-[#D4AF37] transition-all font-bold text-white text-center tracking-[0.5em] placeholder:text-gray-600 text-xl shadow-inner placeholder:tracking-normal"
                />
              </div>
              
              <button
                onClick={handleVerifyOTP}
                disabled={otp.length < 6 || isLoading}
                className="w-full h-14 bg-gradient-to-r from-[#D4AF37] to-[#FFD86B] text-[#080808] rounded-2xl font-bold text-[13px] uppercase tracking-[2px] hover:shadow-[0_10px_30px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-[#080808]/30 border-t-[#080808] rounded-full animate-spin" /> : 'Verify OTP'}
              </button>
            </>
          )}
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center"><span className="px-4 text-[10px] text-[#A5A5A5] font-bold uppercase tracking-widest bg-[#141414]">Or Continue With</span></div>
          </div>
          
          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-14 bg-white hover:bg-gray-50 active:scale-95 text-gray-800 rounded-2xl font-bold text-[13px] uppercase tracking-[1.5px] transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 cursor-pointer"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={handleGuest}
            className="w-full h-14 bg-[#080808] border border-white/10 text-white rounded-2xl font-bold text-[12px] uppercase tracking-[2px] hover:border-[#D4AF37]/50 hover:bg-[#1A1A1A] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <User className="w-4 h-4 text-[#D4AF37]" /> Guest
          </button>
        </div>
      </motion.div>
    </div>
  );
}

