import type { CapacitorConfig } from '@capacitor/cli';
import dotenv from 'dotenv';

dotenv.config();

const config: CapacitorConfig = {
  appId: 'com.minto.food',
  appName: 'Mintoo',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: process.env.VITE_FIREBASE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID',
      forceCodeForRefreshToken: true,
    }
  }
};

export default config;
