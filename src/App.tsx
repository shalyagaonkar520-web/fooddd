import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { useEffect, Suspense, lazy } from 'react';
import { requestForToken, onMessageListener } from './firebase';

// Components
const AuthPage = lazy(() => import('./components/AuthPage'));
const HomePage = lazy(() => import('./components/HomePage'));

const CartPage = lazy(() => import('./components/CartPage'));
const Checkout = lazy(() => import('./components/Checkout'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const TrackingPage = lazy(() => import('./components/TrackingPage'));
const DeliveryDashboard = lazy(() => import('./components/DeliveryDashboard'));
const BulkOrderPage = lazy(() => import('./components/BulkOrderPage'));
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./components/TermsPage'));
const SupportPage = lazy(() => import('./components/SupportPage'));
import BottomNav from './components/BottomNav';
import BottomCartBar from './components/BottomCartBar';
import OperatingHoursGate from './components/OperatingHoursGate';
import MaintenanceGate from './components/MaintenanceGate';
import CityGateway from './components/CityGateway';
import LocationPicker from './components/LocationPicker';
import UndoManager from './components/UndoManager';
import CapacitorBackButtonHandler from './components/CapacitorBackButtonHandler';





const HotelPanel = lazy(() => import('./components/HotelPanel'));
const AdminPage = lazy(() => import('./components/AdminPage'));
const StaffLogin = lazy(() => import('./components/StaffLogin'));
const OrdersPage = lazy(() => import('./components/OrdersPage'));
const ChatPage = lazy(() => import('./components/ChatPage'));
const DeleteAccountPage = lazy(() => import('./components/DeleteAccountPage'));


// Store
import { useSystemStore } from './store/systemStore';
import { useMenuStore } from './store/menuStore';
import { useLocationStore } from './store/locationStore';

function GoldenParticles() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="hidden md:block">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-green-500/20 rounded-full blur-[0.5px]"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0 
            }}
            animate={{ 
              y: [null, "-10%"],
              opacity: [0, 0.4, 0]
            }}
            transition={{ 
              duration: Math.random() * 8 + 8, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>
      {/* Pizza and Biryani Watermark Mix Background */}
      <div className="absolute top-[10%] right-[-100px] w-96 h-96 rounded-full overflow-hidden opacity-[0.025] rotate-12 shrink-0 hidden md:block">
        <img src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80" className="w-full h-full object-cover" alt="Biryani" />
      </div>
      <div className="absolute bottom-[10%] left-[-100px] w-[450px] h-[450px] rounded-full overflow-hidden opacity-[0.025] -rotate-12 shrink-0 hidden md:block">
        <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80" className="w-full h-full object-cover" alt="Pizza" />
      </div>

      {/* Ambient Brand Glow */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-green-500/5 blur-[80px] md:blur-[150px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-green-500/5 blur-[80px] md:blur-[150px] rounded-full" />
    </div>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const listenSettings = useSystemStore(state => state.listenSettings);
  const listenToMenu = useMenuStore(state => state.listenToMenu);
  const { deliveryLocation, openLocationPicker } = useLocationStore();



  // Synchronize dynamic admin settings and menu on app initialization
  useEffect(() => {
    const unsubscribeSettings = listenSettings();
    const unsubscribeMenu = listenToMenu();
    return () => {
      unsubscribeSettings();
      unsubscribeMenu();
    };
  }, [listenSettings, listenToMenu]);

  // Request notification permissions, register service worker, and setup foreground listener on mount
  useEffect(() => {
    // Request permission & save token to Firestore
    requestForToken();

    // Listen for foreground push notifications
    const unsubscribe = onMessageListener((payload) => {
      console.log('Foreground FCM notification received:', payload);
      
      // Render premium Swish-themed notification Toast matching app styles
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            } transition-all duration-300 max-w-md w-full bg-white border border-orange-500/20 shadow-lg rounded-[20px] pointer-events-auto flex p-4 backdrop-blur-[10px]`}
          >
            <div className="flex-1 w-0">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <img
                    className="h-10 w-10 rounded-full object-cover border border-orange-500/20"
                    src={payload.notification?.image || '/logo.png'}
                    alt="Notification Icon"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-orange-500">
                    {payload.notification?.title || 'Order Update'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 font-medium">
                    {payload.notification?.body || 'You have a new notification.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-orange-500/10 pl-3 ml-3 items-center">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-xs font-bold text-gray-500 hover:text-orange-500 transition-colors uppercase tracking-[1px]"
              >
                Dismiss
              </button>
            </div>
          </div>
        ),
        { duration: 6000 }
      );
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <Router>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#111827',
            border: '1px solid #E5E7EB',
            borderRadius: '20px',
            padding: '16px 24px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)',
          }
        }}
      />
      <LocationPicker />
      <UndoManager />
      <CapacitorBackButtonHandler />

      
      <MaintenanceGate>
          <div className="min-h-screen bg-gradient-to-b from-white to-[#d1f2e5] text-gray-900 font-sans relative flex flex-col selection:bg-green-500/30">
            <GoldenParticles />

            <main className="flex-1 relative z-10">
              <PageTransition>
                <Suspense fallback={
                  <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center relative overflow-hidden">
                    <style dangerouslySetInnerHTML={{__html: `
                      @import url('https://api.fontshare.com/v2/css?f[]=clash-display@700&display=swap');
                    `}} />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] max-w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.18),transparent_60%)] pointer-events-none" />
                    <div className="w-auto px-6 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.2)] border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/20 to-transparent mb-8 relative z-10">
                      <span className="text-[#FFD86B] text-3xl font-black italic" style={{ fontFamily: "'Clash Display', sans-serif" }}>Mintoo</span>
                    </div>
                    <div className="flex gap-2 relative z-10">
                      <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-[bounce_1s_infinite_0ms]" />
                      <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-[bounce_1s_infinite_150ms]" />
                      <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-[bounce_1s_infinite_300ms]" />
                    </div>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<AuthPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/cart" element={<Navigate to="/checkout" replace />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/track" element={<TrackingPage />} />
                    <Route path="/track/:orderId" element={<TrackingPage />} />
                    <Route path="/delivery" element={<DeliveryDashboard />} />
                    <Route path="/rider" element={<DeliveryDashboard />} />
                    <Route path="/bulk" element={<BulkOrderPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/hotel" element={<HotelPanel />} />
                    <Route path="/staff" element={<StaffLogin />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/chat/:orderId" element={<ChatPage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/delete-account" element={<DeleteAccountPage />} />
                  </Routes>
                </Suspense>
              </PageTransition>
            </main>

            <BottomCartBar />
            <BottomNav />
          </div>
      </MaintenanceGate>
    </Router>
  );
}
