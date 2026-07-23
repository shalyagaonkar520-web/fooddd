import { create } from 'zustand';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  signInWithCredential,
  sendPasswordResetEmail,
  signInWithRedirect
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  runTransaction, 
  collection, 
  addDoc, 
  deleteDoc,
  serverTimestamp, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { useCartStore } from './cartStore';
import { formatAuthError } from '../utils/firebaseErrors';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  walletBalance: number;
  rewardPoints: number;
  addresses: Array<{
    id: string;
    label: string;
    address: string;
    lat: number;
    lng: number;
  }>;
  welcomeBonusClaimed: boolean;
  createdAt: any;
  fcmToken?: string;
}

interface AuthStore {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  addAddress: (label: string, address: string, lat: number, lng: number) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  deductWalletBalance: (amount: number, orderId: string) => Promise<void>;
  addWalletBalance: (amount: number, reason: string) => Promise<void>;
}

// Helper to check if credentials/UID have been permanently deleted
const checkIsBlacklisted = async (identifier: string, uid?: string): Promise<boolean> => {
  try {
    if (uid) {
      const snapUid = await getDoc(doc(db, 'blacklistedDeletedAccounts', uid));
      if (snapUid.exists()) return true;
    }
    if (identifier) {
      const cleanKey = identifier.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
      if (cleanKey) {
        const snapId = await getDoc(doc(db, 'blacklistedDeletedAccounts', cleanKey));
        if (snapId.exists()) return true;
      }
    }
  } catch (e) {
    console.warn("Blacklist check error:", e);
  }
  return false;
};

export const useAuthStore = create<AuthStore>((set, get) => {
  // Sync profile document with Firestore and credit ₹50 welcome bonus atomically
  const syncProfile = async (firebaseUser: User) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    
    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        
        if (!userDoc.exists()) {
          // New User Registration - Setup welcome profile and welcome bonus
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Guest User',
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '',
            walletBalance: 50, // ₹50 welcome bonus
            rewardPoints: 0,
            addresses: [],
            welcomeBonusClaimed: true,
            createdAt: new Date().toISOString()
          };

          transaction.set(userDocRef, newProfile);

          // Add transaction log
          const transRef = doc(collection(db, 'walletTransactions'));
          transaction.set(transRef, {
            userId: firebaseUser.uid,
            amount: 50,
            type: 'welcome_bonus',
            description: 'One-time welcome bonus credited! 🎁',
            createdAt: new Date().toISOString()
          });

          set({ profile: newProfile });
        } else {
          // Existing User - Retrieve profile
          const data = userDoc.data() as UserProfile;
          set({ profile: data });
        }
      });
    } catch (error) {
      console.error('Error syncing profile document:', error);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        set({ profile: docSnap.data() as UserProfile });
      }
    }
  };

  // Listen to Auth State
  onAuthStateChanged(auth, async (firebaseUser) => {
    set({ loading: true });
    if (firebaseUser) {
      // Reject if account was deleted
      const isBlacklisted = await checkIsBlacklisted(firebaseUser.email || firebaseUser.phoneNumber || '', firebaseUser.uid);
      if (isBlacklisted) {
        await signOut(auth);
        localStorage.clear();
        sessionStorage.clear();
        set({ user: null, profile: null, loading: false, initialized: true });
        return;
      }

      if (firebaseUser.phoneNumber) {
        localStorage.setItem('moms_magic_user_phone', firebaseUser.phoneNumber);
      }
      set({ user: firebaseUser });
      await syncProfile(firebaseUser);
    } else {
      set({ user: null, profile: null });
    }
    set({ loading: false, initialized: true });
  });

  return {
    user: null,
    profile: null,
    loading: true,
    initialized: false,

    loginWithGoogle: async () => {
      set({ loading: true });
      try {
        if (Capacitor.isNativePlatform()) {
          try {
            const user = await GoogleAuth.signIn();
            const idToken = user.authentication?.idToken;
            if (idToken) {
              const credential = GoogleAuthProvider.credential(idToken);
              const cred = await signInWithCredential(auth, credential);
              
              const isBlacklisted = await checkIsBlacklisted(cred.user.email || '', cred.user.uid);
              if (isBlacklisted) {
                await signOut(auth);
                throw new Error("This account has been deleted. Please register with a new account.");
              }
              return;
            }
          } catch (nativeErr: any) {
            if (nativeErr.message?.includes('deleted')) throw nativeErr;
            console.warn('Native Google Auth failed, trying web popup fallback', nativeErr);
          }
        }
        
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        try {
          const cred = await signInWithPopup(auth, provider);
          const isBlacklisted = await checkIsBlacklisted(cred.user.email || '', cred.user.uid);
          if (isBlacklisted) {
            await signOut(auth);
            throw new Error("This account has been deleted. Please register with a new account.");
          }
        } catch (popupError: any) {
          if (popupError.message?.includes('deleted')) throw popupError;
          const errorCode = popupError.code || '';
          const errorMsg = popupError.message || '';
          
          if (
            errorCode === 'auth/popup-blocked' || 
            errorCode === 'auth/missing-initial-state' ||
            errorMsg.toLowerCase().includes('missing initial state') ||
            errorMsg.toLowerCase().includes('cross-origin')
          ) {
            await signInWithRedirect(auth, provider);
            return new Promise(() => {});
          }
          throw popupError;
        }
      } catch (error: any) {
        console.error('Google sign-in error:', error);
        throw new Error(formatAuthError(error));
      } finally {
        set({ loading: false });
      }
    },

    loginWithEmail: async (email, password) => {
      set({ loading: true });
      try {
        // Pre-check blacklist
        const isBlacklistedBefore = await checkIsBlacklisted(email);
        if (isBlacklistedBefore) {
          throw new Error("This account has been deleted. Please register with a new account.");
        }

        const cred = await signInWithEmailAndPassword(auth, email, password);
        
        // Post-check blacklist with UID
        const isBlacklistedAfter = await checkIsBlacklisted(email, cred.user.uid);
        if (isBlacklistedAfter) {
          await signOut(auth);
          throw new Error("This account has been deleted. Please register with a new account.");
        }
      } catch (error: any) {
        console.error('Email login error:', error);
        throw new Error(formatAuthError(error));
      } finally {
        set({ loading: false });
      }
    },

    signUpWithEmail: async (email, password, name) => {
      set({ loading: true });
      try {
        // Clear old blacklist entry if registering fresh account
        const cleanKey = email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
        if (cleanKey) {
          await deleteDoc(doc(db, 'blacklistedDeletedAccounts', cleanKey)).catch(() => {});
        }

        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });
        await syncProfile(credential.user);
      } catch (error: any) {
        console.error('Email sign up error:', error);
        throw new Error(formatAuthError(error));
      } finally {
        set({ loading: false });
      }
    },

    resetPassword: async (email) => {
      set({ loading: true });
      try {
        const isBlacklisted = await checkIsBlacklisted(email);
        if (isBlacklisted) {
          throw new Error("This account has been deleted.");
        }
        await sendPasswordResetEmail(auth, email);
      } catch (error: any) {
        console.error('Password reset error:', error);
        throw new Error(formatAuthError(error));
      } finally {
        set({ loading: false });
      }
    },

    logout: async () => {
      set({ loading: true });
      try {
        await signOut(auth);
        localStorage.removeItem('moms_magic_user_phone');
        useCartStore.getState().clearCart();
        set({ user: null, profile: null });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        set({ loading: false });
      }
    },

    addAddress: async (label, address, lat, lng) => {
      const { user, profile } = get();
      if (!user || !profile) throw new Error('Must be logged in to add address');

      const newAddress = {
        id: Date.now().toString(),
        label,
        address,
        lat,
        lng
      };

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        addresses: arrayUnion(newAddress)
      });

      set({
        profile: {
          ...profile,
          addresses: [...profile.addresses, newAddress]
        }
      });
    },

    deleteAddress: async (addressId) => {
      const { user, profile } = get();
      if (!user || !profile) return;

      const addressToDelete = profile.addresses.find(a => a.id === addressId);
      if (!addressToDelete) return;

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        addresses: arrayRemove(addressToDelete)
      });

      set({
        profile: {
          ...profile,
          addresses: profile.addresses.filter(a => a.id !== addressId)
        }
      });
    },

    deductWalletBalance: async (amount, orderId) => {
      const { user, profile } = get();
      if (!user || !profile) return;

      const newBalance = Math.max(0, profile.walletBalance - amount);
      const userDocRef = doc(db, 'users', user.uid);
      
      await updateDoc(userDocRef, {
        walletBalance: newBalance
      });

      await addDoc(collection(db, 'walletTransactions'), {
        userId: user.uid,
        amount: -amount,
        type: 'order_payment',
        orderId,
        description: `Order #${orderId.slice(0, 8)} payment discount 🍽️`,
        createdAt: new Date().toISOString()
      });

      set({
        profile: {
          ...profile,
          walletBalance: newBalance
        }
      });
    },

    addWalletBalance: async (amount, reason) => {
      const { user, profile } = get();
      if (!user || !profile) return;

      const newBalance = profile.walletBalance + amount;
      const userDocRef = doc(db, 'users', user.uid);

      await updateDoc(userDocRef, {
        walletBalance: newBalance
      });

      await addDoc(collection(db, 'walletTransactions'), {
        userId: user.uid,
        amount: amount,
        type: 'admin_adjustment',
        description: reason,
        createdAt: new Date().toISOString()
      });

      set({
        profile: {
          ...profile,
          walletBalance: newBalance
        }
      });
    }
  };
});
