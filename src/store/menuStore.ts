import { create } from 'zustand';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { Product } from '../types';
import { MENU_ITEMS as FALLBACK_MENU } from '../data/menuItems';

interface MenuState {
  menuItems: Product[];
  isLoading: boolean;
  error: string | null;
  
  listenToMenu: () => () => void;
  seedMenuIfEmpty: () => Promise<boolean>;
  addMenuItem: (item: Product) => Promise<boolean>;
  updateMenuItem: (id: string, updates: Partial<Product>) => Promise<boolean>;
  deleteMenuItem: (id: string) => Promise<boolean>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menuItems: [...FALLBACK_MENU],
  isLoading: true,
  error: null,

  listenToMenu: () => {
    const loadMergedMenu = (firestoreItems: Product[] = []) => {
      const cachedCustom = localStorage.getItem('moms_magic_custom_menu');
      let customItems: Product[] = [];
      if (cachedCustom) {
        try { customItems = JSON.parse(cachedCustom); } catch (_) {}
      }
      
      let base = firestoreItems.length > 0 ? firestoreItems : [...FALLBACK_MENU];
      
      const merged = [...base];
      for (const item of customItems) {
        const idx = merged.findIndex(i => i.id === item.id);
        if (idx !== -1) {
          merged[idx] = item;
        } else {
          merged.push(item);
        }
      }
      return merged;
    };

    // Set initial merged menu
    set({ menuItems: loadMergedMenu(), isLoading: false });

    const colRef = collection(db, 'menu');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        const merged = loadMergedMenu(items);
        set({ menuItems: merged, isLoading: false, error: null });
        localStorage.setItem('moms_magic_menu_cache', JSON.stringify(items));
      } else {
        set({ menuItems: loadMergedMenu(), isLoading: false });
      }
    }, (error) => {
      console.warn("Firestore menu rules blocked real-time listener, using cache:", error.message);
      set({ menuItems: loadMergedMenu(), isLoading: false });
    });
    return unsubscribe;
  },

  seedMenuIfEmpty: async () => {
    try {
      const colRef = collection(db, 'menu');
      console.log("Seeding menu to Firestore...");
      for (const item of FALLBACK_MENU) {
        const docRef = doc(db, 'menu', item.id);
        await setDoc(docRef, item, { merge: true });
      }
      console.log("Menu seeded successfully.");
      return true;
    } catch (error) {
      console.error("Failed to seed menu:", error);
      return false;
    }
  },

  addMenuItem: async (item: Product) => {
    try {
      const docRef = doc(db, 'menu', item.id);
      await setDoc(docRef, item);
      return true;
    } catch (error) {
      console.error("Error adding menu item:", error);
      return false;
    }
  },

  updateMenuItem: async (id: string, updates: Partial<Product>) => {
    try {
      const docRef = doc(db, 'menu', id);
      await setDoc(docRef, updates, { merge: true });
      return true;
    } catch (error) {
      console.error("Error updating menu item:", error);
      return false;
    }
  },

  deleteMenuItem: async (id: string) => {
    try {
      const docRef = doc(db, 'menu', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Error deleting menu item:", error);
      return false;
    }
  }
}));
