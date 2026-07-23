import { useState, useEffect } from 'react';

/**
 * Perform a real-time internet connectivity probe.
 * Checks navigator.onLine and pings a fast lightweight URL to confirm actual internet access.
 */
export async function checkIsOnline(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Try a HEAD request to a reliable online resource
    await fetch(`https://www.google.com/favicon.ico?_=${Date.now()}`, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return true;
  } catch (_) {
    // Fallback probe against app server origin
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        await fetch(`${window.location.origin}/manifest.webmanifest?_=${Date.now()}`, {
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return true;
      } catch (err) {
        return false;
      }
    }
    return false;
  }
}

/**
 * React hook to listen for online/offline events dynamically.
 */
export function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState<boolean>(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const handleOnline = async () => {
      const online = await checkIsOnline();
      setIsOffline(!online);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial probe check on mount
    checkIsOnline().then((online) => setIsOffline(!online));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOffline, setIsOffline, checkIsOnline };
}
