import React, { useState, useEffect } from 'react';
import { Download, Volume2, X } from 'lucide-react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showSound, setShowSound] = useState(false);

  useEffect(() => {
    // Check if user already dismissed install
    const dismissedInstall = localStorage.getItem('pwa_install_dismissed');
    
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (dismissedInstall !== 'true') {
        setShowInstall(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setShowInstall(false);
      setDeferredPrompt(null);
    });

    // Sound permission check
    const soundEnabled = sessionStorage.getItem('sound_enabled');
    if (!soundEnabled) {
      setShowSound(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismissInstall = () => {
    setShowInstall(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  const handleEnableSound = () => {
    // Play a tiny silent sound to unlock audio context for subsequent alarms
    const audio = new Audio('/siren.mp3');
    audio.volume = 0.01; // barely audible
    audio.play().catch(() => {});
    
    sessionStorage.setItem('sound_enabled', 'true');
    setShowSound(false);
  };

  if (!showInstall && !showSound) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] flex flex-col">
      {showInstall && (
        <div className="w-full bg-black text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold shadow-md">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-orange-400" />
            <span>Install App for faster access</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleInstallClick} className="bg-white text-black px-4 py-1.5 rounded-full uppercase tracking-widest text-[9px] hover:bg-gray-200 transition-colors active:scale-95 shadow-sm">
              Install
            </button>
            <button onClick={handleDismissInstall} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showSound && (
        <div className="w-full bg-orange-500 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold shadow-md">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            <span>Enable Sound Alerts</span>
          </div>
          <button onClick={handleEnableSound} className="bg-black text-white px-4 py-1.5 rounded-full uppercase tracking-widest text-[9px] hover:bg-gray-900 transition-colors active:scale-95 shadow-sm">
            Enable
          </button>
        </div>
      )}
    </div>
  );
}
