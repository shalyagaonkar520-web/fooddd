import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X, Loader2, Search, Crosshair } from 'lucide-react';
import { useLocationStore } from '../store/locationStore';
import { haversineDistance, reverseGeocode } from '../lib/location';

import toast from 'react-hot-toast';

export default function LocationPicker() {
  const { isLocationPickerOpen, closeLocationPicker, setDeliveryLocation, deliveryLocation, restaurantLocation, maxDeliveryRange } = useLocationStore();
  
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [showDisclosure, setShowDisclosure] = useState(false);
  
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [building, setBuilding] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');

  useEffect(() => {
    if (!isLocationPickerOpen) {
      setSearchQuery('');
      setSearchResults([]);
    } else if (!deliveryLocation && !isGeolocating) {
      setShowDisclosure(true);
    }
  }, [isLocationPickerOpen, deliveryLocation, isGeolocating]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const fetchLocations = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}&limit=5`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      }
      setIsSearching(false);
    };
    fetchLocations();
  }, [debouncedQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    // Calculate distance
    const dist = haversineDistance(restaurantLocation.lat, restaurantLocation.lng, lat, lon);
    
    setDeliveryLocation({ lat, lng: lon, address: result.display_name, distance: parseFloat(dist.toFixed(1)), isDeliverable: dist <= maxDeliveryRange });
    toast.success('Location updated!');
    closeLocationPicker();
  };

  const handleManualSubmit = () => {
    if (!building || !street) {
      toast.error('Please enter Building and Street.');
      return;
    }
    const address = `${building}, ${street}${landmark ? ', ' + landmark : ''}`;
    // For manual entry, assume it's deliverable or within bounds, or just set 0 distance
    setDeliveryLocation({ 
      lat: restaurantLocation.lat, 
      lng: restaurantLocation.lng, 
      address, 
      distance: 0, 
      isDeliverable: true 
    });
    toast.success('Address saved!');
    closeLocationPicker();
  };

  const handleGeolocate = () => {
    setShowDisclosure(false);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const address = await reverseGeocode(latitude, longitude);
          const dist = haversineDistance(restaurantLocation.lat, restaurantLocation.lng, latitude, longitude);
          setDeliveryLocation({ lat: latitude, lng: longitude, address, distance: parseFloat(dist.toFixed(1)), isDeliverable: dist <= maxDeliveryRange });
          toast.success('Location detected!');
          closeLocationPicker();
        } catch (error) {
          toast.error('Failed to get address. Try manual search.');
        } finally {
          setIsGeolocating(false);
        }
      },
      (err) => {
        setIsGeolocating(false);
        if (err.code === 1) toast.error('Please allow location access.');
        else toast.error('Failed to detect location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (!isLocationPickerOpen) return null;

  return (
    <AnimatePresence>
      {showDisclosure && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Location Access Needed</h2>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              Mintoo collects location data to accurately assign delivery partners, calculate delivery fees, and estimate delivery time to your address even when the app is in the background.
            </p>
            <div className="pt-4 flex gap-3">
              <button onClick={() => setShowDisclosure(false)} className="flex-1 py-3 bg-gray-100 text-gray-900 font-bold uppercase text-xs rounded-xl hover:bg-gray-200">
                Not Now
              </button>
              <button onClick={handleGeolocate} className="flex-1 py-3 bg-orange-500 text-white font-bold uppercase text-xs rounded-xl hover:bg-orange-600 shadow-md">
                I Agree
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={deliveryLocation ? closeLocationPicker : undefined} 
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-orange-500" />
                Delivery Location
              </h2>
              {deliveryLocation && (
                <button onClick={closeLocationPicker} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowDisclosure(true)}
              disabled={isGeolocating}
              className="w-full flex items-center justify-center gap-2 bg-orange-50 text-orange-600 font-bold py-4 rounded-xl border border-orange-200 hover:bg-orange-100 transition-colors mb-6 disabled:opacity-50"
            >
              {isGeolocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
              {isGeolocating ? 'Detecting Location...' : 'Auto-Detect My Location'}
            </button>

            <div className="relative flex items-center mb-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">OR ENTER MANUALLY</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <div className="relative">
              {!isManualEntry ? (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search your area, street, building..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-orange-500 pl-11 transition-colors"
                    />
                    <div className="absolute left-4 top-4 text-gray-400">
                      {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                      {searchResults.map((res: any, idx: number) => (
                        <div
                          key={idx}
                          onClick={() => selectSearchResult(res)}
                          className="px-4 py-3 border-b border-gray-50 hover:bg-orange-50 cursor-pointer flex flex-col"
                        >
                          <span className="font-bold text-sm text-gray-900 truncate">{res.display_name.split(',')[0]}</span>
                          <span className="text-xs text-gray-500 truncate mt-0.5">{res.display_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchQuery.length >= 3 && searchResults.length === 0 && !isSearching && (
                    <div className="mt-2 p-4 text-center text-gray-500 text-sm font-medium">
                        No matching locations found.
                    </div>
                  )}
                  
                  <button 
                    onClick={() => setIsManualEntry(true)}
                    className="w-full mt-4 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    Can't find it? Enter Address Manually
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Building / Flat / House No *</label>
                    <input
                      type="text"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="E.g. Flat 101, Galaxy Apts"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Street / Road / Area *</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="E.g. Main Street, Sector 4"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="E.g. Near City Mall"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsManualEntry(false)}
                      className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleManualSubmit}
                      className="flex-[2] bg-orange-500 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_15px_rgba(249,115,22,0.3)] hover:bg-orange-600 transition-colors"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
