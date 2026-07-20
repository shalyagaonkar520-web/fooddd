import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user already dismissed it
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (dismissed !== 'true') {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Also check if app is already installed
    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[9999]"
      >
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-2xl rounded-3xl p-5 relative">
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col items-center text-center mt-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4 text-white">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-black text-gray-900 text-lg">Install App</h3>
            <p className="text-xs text-gray-500 font-medium mt-1 px-4">
              Install this panel on your device for instant order alerts and a faster experience.
            </p>
            
            <button
              onClick={handleInstallClick}
              className="mt-5 w-full h-12 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg hover:bg-gray-900 active:scale-95 transition-all"
            >
              Install Now
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
