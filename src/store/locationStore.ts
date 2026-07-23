import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { haversineDistance, reverseGeocode, isBTMServiceable, BTM_CENTER, MAX_BTM_RANGE } from '../lib/location';

export interface NearbyRestaurant {
  id: number;
  name: string;
  lat: number;
  lng: number;
  cuisine?: string;
}

export interface DeliveryLocation {
  lat: number;
  lng: number;
  address: string;
  distance: number; // in km
  isDeliverable: boolean;
}

interface LocationStore {
  deliveryLocation: DeliveryLocation | null;
  nearbyRestaurants: NearbyRestaurant[];
  isLocationPickerOpen: boolean;
  restaurantLocation: { lat: number; lng: number };
  maxDeliveryRange: number;
  setDeliveryLocation: (location: DeliveryLocation) => void;
  setNearbyRestaurants: (restaurants: NearbyRestaurant[]) => void;
  openLocationPicker: () => void;
  closeLocationPicker: () => void;
  clearLocation: () => void;
  detectLocation: () => Promise<void>;
  isLoading: boolean;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      deliveryLocation: null,
      nearbyRestaurants: [],
      isLocationPickerOpen: false,
      restaurantLocation: BTM_CENTER,
      maxDeliveryRange: MAX_BTM_RANGE,
      setDeliveryLocation: (location) => {
        const isDeliverable = isBTMServiceable(location.address, location.lat, location.lng);
        set({ deliveryLocation: { ...location, isDeliverable } });
      },
      setNearbyRestaurants: (restaurants) => set({ nearbyRestaurants: restaurants }),
      openLocationPicker: () => set({ isLocationPickerOpen: true }),
      closeLocationPicker: () => set({ isLocationPickerOpen: false }),
      clearLocation: () => set({ deliveryLocation: null, nearbyRestaurants: [] }),
      isLoading: false,
      detectLocation: async () => {
        if (!navigator.geolocation) {
          throw new Error('Geolocation not supported');
        }

        set({ isLoading: true });
        
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const { latitude, longitude } = pos.coords;
                const address = await reverseGeocode(latitude, longitude);
                const distance = haversineDistance(
                  BTM_CENTER.lat, 
                  BTM_CENTER.lng, 
                  latitude, 
                  longitude
                );
                const isDeliverable = isBTMServiceable(address, latitude, longitude);

                set({
                  deliveryLocation: {
                    lat: latitude,
                    lng: longitude,
                    address,
                    distance: parseFloat(distance.toFixed(2)),
                    isDeliverable
                  },
                  isLoading: false
                });
                resolve();
              } catch (err) {
                set({ isLoading: false });
                reject(err);
              }
            },
            (err) => {
              set({ isLoading: false });
              reject(err);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
          );
        });
      }
    }),
    {
      name: 'delivery-location-storage',
      partialize: (state) => ({ deliveryLocation: state.deliveryLocation }),
    }
  )
);
