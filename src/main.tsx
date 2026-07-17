import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

GoogleAuth.initialize({
  clientId: import.meta.env.VITE_FIREBASE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID',
  scopes: ['profile', 'email'],
  grantOfflineAccess: true,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
