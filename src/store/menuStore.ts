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

      const cachedDeleted = localStorage.getItem('moms_magic_deleted_menu');
      let deletedIds: string[] = [];
      if (cachedDeleted) {
        try { deletedIds = JSON.parse(cachedDeleted); } catch (_) {}
      }

      const itemMap = new Map<string, Product>();

      // 1. Start with default fallback menu items
      for (const item of FALLBACK_MENU) {
        if (!deletedIds.includes(item.id)) {
          itemMap.set(item.id, item);
        }
      }

      // 2. Merge items from Firestore (overriding existing by ID or adding new)
      for (const item of firestoreItems) {
        if (!deletedIds.includes(item.id)) {
          itemMap.set(item.id, item);
        }
      }

      // 3. Merge custom items from local storage
      for (const item of customItems) {
        if (!deletedIds.includes(item.id)) {
          itemMap.set(item.id, item);
        }
      }

      return Array.from(itemMap.values()).map(item => ({
        ...item,
        hotelId: item.hotelId || 'hotel1@minto.com'
      }));
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
      const cachedCustom = localStorage.getItem('moms_magic_custom_menu');
      let customItems: Product[] = [];
      if (cachedCustom) {
        try { customItems = JSON.parse(cachedCustom); } catch (_) {}
      }
      const existingIdx = customItems.findIndex(i => i.id === item.id);
      if (existingIdx !== -1) {
        customItems[existingIdx] = item;
      } else {
        customItems.push(item);
      }
      localStorage.setItem('moms_magic_custom_menu', JSON.stringify(customItems));

      const cachedDeleted = localStorage.getItem('moms_magic_deleted_menu');
      if (cachedDeleted) {
        try {
          const deletedIds: string[] = JSON.parse(cachedDeleted).filter((id: string) => id !== item.id);
          localStorage.setItem('moms_magic_deleted_menu', JSON.stringify(deletedIds));
        } catch (_) {}
      }

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
      const currentItems = get().menuItems;
      const targetItem = currentItems.find(i => i.id === id);
      if (targetItem) {
        const updatedItem = { ...targetItem, ...updates };
        const cachedCustom = localStorage.getItem('moms_magic_custom_menu');
        let customItems: Product[] = [];
        if (cachedCustom) {
          try { customItems = JSON.parse(cachedCustom); } catch (_) {}
        }
        const existingIdx = customItems.findIndex(i => i.id === id);
        if (existingIdx !== -1) {
          customItems[existingIdx] = updatedItem;
        } else {
          customItems.push(updatedItem);
        }
        localStorage.setItem('moms_magic_custom_menu', JSON.stringify(customItems));
      }

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
      const cachedDeleted = localStorage.getItem('moms_magic_deleted_menu');
      let deletedIds: string[] = [];
      if (cachedDeleted) {
        try { deletedIds = JSON.parse(cachedDeleted); } catch (_) {}
      }
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem('moms_magic_deleted_menu', JSON.stringify(deletedIds));
      }

      const cachedCustom = localStorage.getItem('moms_magic_custom_menu');
      if (cachedCustom) {
        try {
          const arr = JSON.parse(cachedCustom).filter((i: any) => i.id !== id);
          localStorage.setItem('moms_magic_custom_menu', JSON.stringify(arr));
        } catch (_) {}
      }

      const currentStoreItems = get().menuItems.filter(i => i.id !== id);
      set({ menuItems: currentStoreItems });

      const docRef = doc(db, 'menu', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Error deleting menu item:", error);
      return false;
    }
  }
}));
