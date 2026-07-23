import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X, Loader2, Search, Crosshair, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import { useLocationStore } from '../store/locationStore';
import { haversineDistance, reverseGeocode, isBTMServiceable, BTM_CENTER, MAX_BTM_RANGE } from '../lib/location';
import toast from 'react-hot-toast';

export default function LocationPicker() {
  const { isLocationPickerOpen, closeLocationPicker, setDeliveryLocation, deliveryLocation, restaurantLocation } = useLocationStore();
  
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
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery + ', Bengaluru')}&limit=5`);
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
    
    const dist = haversineDistance(BTM_CENTER.lat, BTM_CENTER.lng, lat, lon);
    const isDeliverable = isBTMServiceable(result.display_name, lat, lon);

    setDeliveryLocation({ 
      lat, 
      lng: lon, 
      address: result.display_name, 
      distance: parseFloat(dist.toFixed(1)), 
      isDeliverable 
    });

    if (isDeliverable) {
      toast.success('Location updated! BTM Layout 📍');
      closeLocationPicker();
    } else {
      toast.error('Just wait... We are coming to your area soon! Currently serving BTM Layout only.');
    }
  };

  const handleManualSubmit = () => {
    if (!building || !street) {
      toast.error('Please enter Building and Street.');
      return;
    }
    const fullStreet = street.toLowerCase().includes('btm') ? street : `${street}, BTM Layout`;
    const address = `${building}, ${fullStreet}${landmark ? ', ' + landmark : ''}, Bengaluru`;
    
    const isDeliverable = isBTMServiceable(address, BTM_CENTER.lat, BTM_CENTER.lng);

    setDeliveryLocation({ 
      lat: BTM_CENTER.lat, 
      lng: BTM_CENTER.lng, 
      address, 
      distance: 0, 
      isDeliverable 
    });

    if (isDeliverable) {
      toast.success('BTM Layout address saved!');
      closeLocationPicker();
    } else {
      toast.error('Currently serving BTM Layout only.');
    }
  };

  const handleGeolocate = () => {
    setShowDisclosure(false);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your device');
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const address = await reverseGeocode(latitude, longitude);
          const dist = haversineDistance(BTM_CENTER.lat, BTM_CENTER.lng, latitude, longitude);
          const isDeliverable = isBTMServiceable(address, latitude, longitude);

          setDeliveryLocation({ 
            lat: latitude, 
            lng: longitude, 
            address, 
            distance: parseFloat(dist.toFixed(1)), 
            isDeliverable 
          });

          if (isDeliverable) {
            toast.success('BTM Location detected!');
            closeLocationPicker();
          } else {
            toast.error('Just wait... We are coming to your area soon!');
          }
        } catch (error) {
          toast.error('Failed to get address. Try searching BTM Layout.');
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

  const isCurrentNonServiceable = deliveryLocation && !deliveryLocation.isDeliverable;

  return (
    <AnimatePresence>
      {showDisclosure && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-left"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-2">
              <MapPin className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-lg font-extrabold text-gray-900 leading-tight">Location Access Needed</h2>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Mintoo uses your location to auto-detect your street, road & main in BTM Layout and calculate delivery range.
            </p>
            <div className="pt-2 flex gap-2">
              <button onClick={() => setShowDisclosure(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200">
                Not Now
              </button>
              <button onClick={handleGeolocate} className="flex-1 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-md">
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
          className="absolute inset-0 bg-black/75 backdrop-blur-md" 
          onClick={deliveryLocation ? closeLocationPicker : undefined} 
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="p-6 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                  Select Delivery Location
                </h2>
                <p className="text-xs text-emerald-600 font-bold mt-0.5">Currently serving BTM Layout only</p>
              </div>
              {deliveryLocation && (
                <button onClick={closeLocationPicker} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Non-serviceable Banner Notice */}
            {isCurrentNonServiceable && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center space-y-1.5 shadow-sm">
                <div className="text-2xl">🚀</div>
                <h3 className="text-sm font-extrabold text-amber-900">Just wait... We are coming to your area soon!</h3>
                <p className="text-xs text-amber-800 font-medium">
                  Mintoo is currently only serving orders in <b>BTM Layout</b>. Please select a BTM Layout address (1st Stage, 2nd Stage, Main Road) to place your order.
                </p>
              </div>
            )}

            {/* Auto Detect Button */}
            <button
              onClick={() => setShowDisclosure(true)}
              disabled={isGeolocating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3.5 rounded-2xl hover:brightness-105 transition-all disabled:opacity-50 shadow-md text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
            >
              {isGeolocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
              {isGeolocating ? 'Auto-Detecting Location...' : 'Auto-Detect My BTM Location'}
            </button>

            <div className="relative flex items-center my-2">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">OR ENTER MANUALLY</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <div className="relative">
              {!isManualEntry ? (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search BTM Layout, Main Road, Cross, Stage..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:border-emerald-500 pl-10 transition-colors"
                    />
                    <div className="absolute left-3.5 top-3.5 text-gray-400">
                      {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                      {searchResults.map((res: any, idx: number) => (
                        <div
                          key={idx}
                          onClick={() => selectSearchResult(res)}
                          className="px-4 py-3 border-b border-gray-50 hover:bg-emerald-50 cursor-pointer flex flex-col text-left"
                        >
                          <span className="font-bold text-xs sm:text-sm text-gray-900 truncate">{res.display_name.split(',')[0]}</span>
                          <span className="text-[10px] text-gray-500 truncate mt-0.5">{res.display_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchQuery.length >= 3 && searchResults.length === 0 && !isSearching && (
                    <div className="mt-2 p-3 text-center text-gray-500 text-xs font-medium">
                      No matching locations found.
                    </div>
                  )}
                  
                  <button 
                    onClick={() => setIsManualEntry(true)}
                    className="w-full mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    Enter BTM Address Manually (Building, Main & Road)
                  </button>
                </>
              ) : (
                <div className="space-y-3 text-left">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Building / Flat / House No *</label>
                    <input
                      type="text"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-500"
                      placeholder="E.g. Flat 302, Green View Apts"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Road / Main / Cross *</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-500"
                      placeholder="E.g. 16th Main Road, 7th Cross, BTM 2nd Stage"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-500"
                      placeholder="E.g. Near Udupi Garden / Gangothri Bar"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setIsManualEntry(false)}
                      className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors text-xs cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleManualSubmit}
                      className="flex-[2] bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-emerald-700 transition-colors text-xs cursor-pointer"
                    >
                      Save BTM Address
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
