import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';

export default function CapacitorBackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const setupListener = async () => {
      const listener = await CapApp.addListener('backButton', (data) => {
        // If the user is on the auth page / login page or home page, we should exit the app
        if (location.pathname === '/' || location.pathname === '/home') {
          CapApp.exitApp();
        } else {
          // Otherwise, navigate back in the React Router history
          navigate(-1);
        }
      });

      return listener;
    };

    const listenerPromise = setupListener();

    return () => {
      listenerPromise.then((l) => l.remove());
    };
  }, [location, navigate]);

  return null;
}
