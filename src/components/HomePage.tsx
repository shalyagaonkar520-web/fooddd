import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Plus, Minus, ChevronRight, Star, Clock, Zap, Filter, Heart, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { MENU_ITEMS as menuItems } from '../data/menuItems';
import { useLocationStore } from '../store/locationStore';
import { useNavigate } from 'react-router-dom';
import { playSound, SOUNDS } from '../utils/audio';

const CATEGORIES = [
  { name: "Burger", id: "Burgers & Rolls", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80" },
  { name: "Pizza", id: "Pizzas & Momos", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=150&q=80" },
  { name: "Chinese", id: "Rice & Noodles", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=150&q=80" },
  { name: "Rice", id: "Veg / Gravy", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80" },
  { name: "Biryani", id: "Biryani", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=150&q=80" },
  { name: "Dessert", id: "Drinks", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=150&q=80" },
  { name: "All", id: "All Dishes", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=150&q=80" },
  { name: "Starters", id: "Starters", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=150&q=80" },
];

const SEARCH_PLACEHOLDERS = [
  "What are you craving today?",
  "Search for 'Biryani'",
  "Search for 'Pizza'",
  "Search for 'Noodles'",
  "Craving Fast Food?"
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("All Dishes");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const { items: cartItems, addItem, removeItem, updateQuantity } = useCartStore();
  const { deliveryLocation, openLocationPicker, detectLocation } = useLocationStore();
  const navigate = useNavigate();

  // Redirect to Auth if no guest or phone
  useEffect(() => {
    const isGuest = localStorage.getItem('moms_magic_guest');
    const userPhone = localStorage.getItem('moms_magic_user_phone');
    if (!isGuest && !userPhone) {
      navigate('/');
    }
  }, [navigate]);

  // Auto-detect location on mount
  useEffect(() => {
    const hasRequested = sessionStorage.getItem('has_requested_location');
    if (!deliveryLocation && !hasRequested) {
      sessionStorage.setItem('has_requested_location', 'true');
      detectLocation().catch((err) => {
        console.error("Auto location failed:", err);
      });
    }
  }, [deliveryLocation, detectLocation]);



  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('search') === 'true') {
      setTimeout(() => {
        const input = document.getElementById('home-search-input');
        if (input) {
          input.focus();
        }
      }, 100); // small delay to ensure render
    }
  }, []);

  const handleFilterToggle = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (activeCategory !== "All Dishes") {
      items = items.filter(item => item.category === activeCategory);
    }
    if (searchQuery.trim() !== "") {
      items = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    const showVeg = activeFilters.includes('Veg Only');
    const showNonVeg = activeFilters.includes('Non Veg');
    if (showVeg && !showNonVeg) items = items.filter(i => i.isVeg);
    if (showNonVeg && !showVeg) items = items.filter(i => !i.isVeg);
    if (activeFilters.includes('Bestsellers')) items = items.filter(i => (i as any).fires && (i as any).fires > 0);
    if (activeFilters.includes('Under ₹99')) items = items.filter(i => i.price < 99);
    if (activeFilters.includes('Offers')) items = items.filter(i => i.price < 99); // mock offers

    // Sort low to high
    return items.sort((a, b) => a.price - b.price);
  }, [activeCategory, searchQuery, activeFilters]);

  const getQuantity = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const handleAdd = (item: any) => {
    playSound(SOUNDS.ADD_TO_CART);
    addItem(item);
  };

  const userName = localStorage.getItem('moms_magic_user_name') || 'Guest';



  return (
    <div className="min-h-screen bg-transparent pb-[180px] relative">
      {/* Top Scrolling Marquee */}
      <div className="bg-gradient-to-r from-white to-[#d1f2e5] text-green-900 overflow-hidden py-1">
        <div className="whitespace-nowrap animate-[scroll_20s_linear_infinite] text-[10px] font-black uppercase tracking-widest flex gap-8 items-center">
          <span>✨ 100% FRESH INGREDIENTS</span>
          <span>•</span>
          <span>✨ PREMIUM QUALITY</span>
          <span>•</span>
          <span>✨ 100% FRESH INGREDIENTS</span>
          <span>•</span>
          <span>✨ PREMIUM QUALITY</span>
        </div>
      </div>
      {/* Top Section - Location & Profile */}
      <div className="bg-gradient-to-b from-[#d1f2e5] via-white/80 to-transparent px-4 pt-6 pb-12 relative z-30 -mb-16 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div 
            onClick={() => openLocationPicker()}
            className="flex items-center gap-3 max-w-[85%] cursor-pointer border-2 border-orange-400 bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-[0_4px_15px_rgba(249,115,22,0.15)]"
          >
            <MapPin className="w-6 h-6 text-orange-500 fill-orange-500/20" />
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-black text-gray-900 flex items-center gap-1">
                {deliveryLocation ? 'Deliver To' : 'Select Location'} <ChevronRight className="w-4 h-4 text-orange-500" />
              </span>
              <span className="text-xs font-medium text-gray-800 truncate mt-0.5">
                {deliveryLocation ? deliveryLocation.address : 'Click here to add your location'}
              </span>
            </div>
          </div>
        </div>
      </div>

      
      
      
      {/* Plate Toggle Hero Section */}
      <div className="bg-transparent pb-6 relative z-20 -mt-2 transition-all duration-500">
        <div className="relative w-full aspect-square rounded-none overflow-hidden group shadow-md bg-neutral-900 flex flex-col items-center justify-center p-6">
          
          {/* Dynamic Craving Food Backgrounds */}
          <AnimatePresence mode="wait">
            {(!activeFilters.includes('Veg Only') && !activeFilters.includes('Non Veg')) ? (
              <motion.div
                key="both-bg"
                initial={{ opacity: 0, scale: 1.15, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full select-none pointer-events-none"
              >
                <img
                  src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1000&q=80"
                  alt="Veg Background"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=1000&q=80"
                  alt="Non-Veg Background"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ maskImage: 'linear-gradient(to right, transparent 20%, black 80%)', WebkitMaskImage: 'linear-gradient(to right, transparent 20%, black 80%)' }}
                />
              </motion.div>
            ) : (
              <motion.img
                key={activeFilters.includes('Non Veg') ? 'non-veg' : 'veg'}
                src={
                  activeFilters.includes('Non Veg') 
                  ? "https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=1000&q=80"
                  : "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1000&q=80"
                }
                alt="Craving food"
                initial={{ opacity: 0, scale: 1.15, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Dark Vignette Overlay for excellent text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/70 mix-blend-multiply pointer-events-none z-10" />

          {/* Realistic White Steam rising up */}
          <div className="absolute inset-x-0 bottom-0 h-[60%] overflow-hidden pointer-events-none z-10 flex justify-center space-x-6">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{
                  opacity: [0, 0.4, 0],
                  y: -150,
                  scale: [0.8, 1.8, 2.5],
                  x: i % 2 === 0 ? [0, 20, -15, 0] : [0, -20, 15, 0]
                }}
                transition={{
                  duration: 4.5 + (i % 3),
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeOut"
                }}
                className="w-16 h-16 bg-white rounded-full blur-[20px] mix-blend-screen"
              />
            ))}
          </div>

          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center z-20 mb-8 pointer-events-none"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight max-w-[85%] mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              Craving Something <span className="text-orange-500 animate-pulse">Extraordinary?</span>
            </h2>
            <p className="mt-2 text-sm text-orange-200 font-extrabold tracking-wide drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
              Slide the plate to switch your preference.
            </p>
          </motion.div>

          {/* The Plate Toggle */}
          <div 
            className="relative w-full max-w-[320px] h-[90px] bg-white/60 backdrop-blur-md rounded-[45px] shadow-inner border border-white flex items-center p-2 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              if (x < rect.width / 3) {
                 // Veg
                 setActiveFilters(activeFilters.filter(f => f !== 'Non Veg' && f !== 'Veg Only').concat('Veg Only'));
              } else if (x > (rect.width * 2) / 3) {
                 // Non Veg
                 setActiveFilters(activeFilters.filter(f => f !== 'Veg Only' && f !== 'Non Veg').concat('Non Veg'));
              } else {
                 // Both
                 setActiveFilters(activeFilters.filter(f => f !== 'Veg Only' && f !== 'Non Veg'));
              }
            }}
          >
            {/* Texts */}
            <div className="absolute inset-0 flex items-center justify-between px-6 text-[11px] sm:text-xs font-black tracking-widest uppercase z-10 pointer-events-none">
              <span className={`transition-colors duration-500 ${activeFilters.includes('Veg Only') ? 'text-green-700' : 'text-gray-400'}`}>Veg</span>
              <span className={`transition-colors duration-500 ${(!activeFilters.includes('Veg Only') && !activeFilters.includes('Non Veg')) ? 'text-orange-600' : 'text-gray-400'}`}>Both</span>
              <span className={`transition-colors duration-500 ${activeFilters.includes('Non Veg') ? 'text-red-700' : 'text-gray-400'}`}>Non-Veg</span>
            </div>

            {/* The Rolling Plate */}
            <motion.div
              layout
              drag="x"
              dragConstraints={{ left: 0, right: 230 }}
              dragElastic={0.4}
              onDragEnd={(e, { offset, velocity }) => {
                // If it was Veg
                if (activeFilters.includes('Veg Only')) {
                  if (offset.x > 150 || velocity.x > 300) {
                     setActiveFilters(activeFilters.filter(f => f !== 'Veg Only' && f !== 'Non Veg').concat('Non Veg'));
                  } else if (offset.x > 50 || velocity.x > 100) {
                     setActiveFilters(activeFilters.filter(f => f !== 'Veg Only' && f !== 'Non Veg'));
                  }
                } 
                // If it was Non Veg
                else if (activeFilters.includes('Non Veg')) {
                  if (offset.x < -150 || velocity.x < -300) {
                     setActiveFilters(activeFilters.filter(f => f !== 'Non Veg' && f !== 'Veg Only').concat('Veg Only'));
                  } else if (offset.x < -50 || velocity.x < -100) {
                     setActiveFilters(activeFilters.filter(f => f !== 'Non Veg' && f !== 'Veg Only'));
                  }
                }
                // If it was Both
                else {
                  if (offset.x > 50 || velocity.x > 100) {
                     setActiveFilters(activeFilters.filter(f => f !== 'Veg Only' && f !== 'Non Veg').concat('Non Veg'));
                  } else if (offset.x < -50 || velocity.x < -100) {
                     setActiveFilters(activeFilters.filter(f => f !== 'Non Veg' && f !== 'Veg Only').concat('Veg Only'));
                  }
                }
              }}
              initial={false}
              animate={{
                x: activeFilters.includes('Non Veg') ? 230 : activeFilters.includes('Veg Only') ? 0 : 115, 
                rotate: activeFilters.includes('Non Veg') ? 360 : activeFilters.includes('Veg Only') ? 0 : 180
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute z-20 w-[74px] h-[74px] rounded-full shadow-lg overflow-hidden border-[3px] border-white bg-white cursor-grab active:cursor-grabbing"
            >
              {(!activeFilters.includes('Veg Only') && !activeFilters.includes('Non Veg')) ? (
                <div className="relative w-full h-full">
                  <img
                    src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=200&q=80"
                    alt="Veg Plate"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=200&q=80"
                    alt="Non Veg Plate"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{ maskImage: 'linear-gradient(to right, transparent 20%, black 80%)', WebkitMaskImage: 'linear-gradient(to right, transparent 20%, black 80%)' }}
                  />
                </div>
              ) : (
                <img
                  src={
                    activeFilters.includes('Non Veg') 
                    ? "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=200&q=80"
                    : "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=200&q=80"
                  }
                  alt="Plate"
                  className="w-full h-full object-cover pointer-events-none transition-all duration-300"
                />
              )}
            </motion.div>
          </div>
        </div>
      </div>
{/* Sticky Search Bar */}
      <div className="sticky top-0 z-50 bg-[#d1f2e5]/90 backdrop-blur-md px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all">
        <div className="relative group">
          <div className="absolute inset-0 bg-orange-500/10 blur-xl rounded-2xl opacity-50 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-gradient-to-r from-white via-white to-gray-50 border-2 border-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,1)] flex items-center px-4 py-3.5 z-10 overflow-hidden">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <div className="relative flex-1 h-6 ml-3">
              <input
                id="home-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-sm font-bold text-gray-900 placeholder:text-transparent z-20"
              />
              {!searchQuery && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={placeholderIndex}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -15, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center text-sm font-bold text-gray-400 pointer-events-none"
                  >
                    {SEARCH_PLACEHOLDERS[placeholderIndex]}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0 bg-gray-100 rounded-lg p-1 mx-2">
              <button 
                onClick={() => {
                  if(activeFilters.includes('Veg Only')) setActiveFilters(activeFilters.filter(f => f !== 'Veg Only'));
                  else setActiveFilters([...activeFilters.filter(f => f !== 'Non Veg'), 'Veg Only']);
                }}
                className={`relative overflow-hidden w-8 h-8 rounded-md flex items-center justify-center transition-all duration-300 ${activeFilters.includes('Veg Only') ? 'bg-white shadow-sm border border-green-200 scale-105' : 'hover:bg-gray-200 border border-transparent'}`}
                title="Veg Only"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-green-500" />
                <div className={`w-4 h-4 border ${activeFilters.includes('Veg Only') ? 'border-green-600' : 'border-gray-400'} flex items-center justify-center bg-white mt-[3px]`}>
                  <div className={`w-2 h-2 rounded-full ${activeFilters.includes('Veg Only') ? 'bg-green-600' : 'bg-gray-400'}`} />
                </div>
              </button>

              <button 
                onClick={() => {
                  setActiveFilters(activeFilters.filter(f => f !== 'Veg Only' && f !== 'Non Veg'));
                }}
                className={`relative overflow-hidden w-8 h-8 rounded-md flex items-center justify-center transition-all duration-300 ${(!activeFilters.includes('Veg Only') && !activeFilters.includes('Non Veg')) ? 'bg-white shadow-sm border border-orange-200 scale-105' : 'hover:bg-gray-200 border border-transparent'}`}
                title="Both Veg & Non-Veg"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-green-500 to-red-500" />
                <div className={`w-4 h-4 border ${(!activeFilters.includes('Veg Only') && !activeFilters.includes('Non Veg')) ? 'border-orange-500' : 'border-gray-400'} flex items-center justify-center bg-white mt-[3px] overflow-hidden relative`}>
                  <div className="absolute inset-0 flex">
                    <div className="w-1/2 h-full bg-green-600/10 flex items-center justify-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${(!activeFilters.includes('Veg Only') && !activeFilters.includes('Non Veg')) ? 'bg-green-600' : 'bg-gray-400'}`} />
                    </div>
                    <div className="w-1/2 h-full bg-red-600/10 flex items-center justify-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${(!activeFilters.includes('Veg Only') && !activeFilters.includes('Non Veg')) ? 'bg-red-600' : 'bg-gray-400'}`} />
                    </div>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => {
                  if(activeFilters.includes('Non Veg')) setActiveFilters(activeFilters.filter(f => f !== 'Non Veg'));
                  else setActiveFilters([...activeFilters.filter(f => f !== 'Veg Only'), 'Non Veg']);
                }}
                className={`relative overflow-hidden w-8 h-8 rounded-md flex items-center justify-center transition-all duration-300 ${activeFilters.includes('Non Veg') ? 'bg-white shadow-sm border border-red-200 scale-105' : 'hover:bg-gray-200 border border-transparent'}`}
                title="Non-Veg Only"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500" />
                <div className={`w-4 h-4 border ${activeFilters.includes('Non Veg') ? 'border-red-600' : 'border-gray-400'} flex items-center justify-center bg-white mt-[3px]`}>
                  <div className={`w-2 h-2 rounded-full ${activeFilters.includes('Non Veg') ? 'bg-red-600' : 'bg-gray-400'}`} />
                </div>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="px-4 mt-6 mx-2 mb-20 space-y-8 bg-white/40 backdrop-blur-md relative"
        style={{
          border: '12px solid transparent',
          borderImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M0,12 Q6,0 12,12 T24,12' fill='none' stroke='%23f97316' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 12 round`,
          borderRadius: '24px'
        }}
      >
        
        
        {/* Categories Horizontal */}
        <div className="-mx-4 px-4 overflow-x-auto no-scrollbar pb-4">
          <div className="grid grid-cols-4 gap-y-6 gap-x-2 min-w-full">
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    playSound(SOUNDS.CLICK);
                  }}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shadow-sm border transition-all duration-300 relative ${
                    isSelected 
                      ? 'bg-orange-50 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)] scale-110' 
                      : 'bg-white border-gray-100 group-hover:bg-orange-50 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.2)] group-hover:border-orange-200'
                  }`}>
                    {isSelected && <div className="absolute inset-0 bg-orange-500/30 blur-md rounded-full animate-pulse z-0" />}
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className={`w-full h-full object-cover mix-blend-multiply transition-transform duration-500 relative z-10 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`} 
                    />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider text-center transition-colors ${
                    isSelected ? 'text-orange-500' : 'text-gray-500 group-hover:text-gray-900'
                  }`}>
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max pb-1">
            {['Both', 'Veg Only', 'Non Veg', 'Bestsellers', 'Offers', 'Under ₹99'].map(filter => {
              const isActive = filter === 'Both' 
                ? (!activeFilters.includes('Veg Only') && !activeFilters.includes('Non Veg'))
                : activeFilters.includes(filter);
              return (
                <div 
                  key={filter} 
                  onClick={() => {
                    if (filter === 'Both') {
                      setActiveFilters(prev => prev.filter(f => f !== 'Veg Only' && f !== 'Non Veg'));
                    } else if (filter === 'Veg Only') {
                      setActiveFilters(prev => prev.filter(f => f !== 'Non Veg').includes('Veg Only') 
                        ? prev.filter(f => f !== 'Veg Only') 
                        : [...prev.filter(f => f !== 'Non Veg'), 'Veg Only']
                      );
                    } else if (filter === 'Non Veg') {
                      setActiveFilters(prev => prev.filter(f => f !== 'Veg Only').includes('Non Veg') 
                        ? prev.filter(f => f !== 'Non Veg') 
                        : [...prev.filter(f => f !== 'Veg Only'), 'Non Veg']
                      );
                    } else {
                      handleFilterToggle(filter);
                    }
                  }}
                  className={`px-4 py-2 border rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm cursor-pointer transition-colors ${isActive ? 'bg-orange-50 border-orange-500 text-orange-500' : 'bg-white border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-500'}`}>
                  {filter}
                </div>
              );
            })}
          </div>
        </div>

        {/* Food Items List */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              {searchQuery ? 'Search Results' : activeCategory === 'All Dishes' ? 'Recommended For You' : `Explore ${activeCategory}`}
            </h2>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredItems.length} items</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.id}
                  className="relative bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all duration-300 group flex flex-col"
                >
                  {/* Large edge-to-edge image */}
                  <div className="w-full aspect-[4/3] relative overflow-hidden bg-slate-100 shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    {/* Subtle moving light reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_ease-in-out] pointer-events-none" />
                    

                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      {item.isVeg ? (
                        <div className="w-5 h-5 bg-white/80 backdrop-blur-md rounded-md flex items-center justify-center shadow-sm border border-white/50">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 bg-white/80 backdrop-blur-md rounded-md flex items-center justify-center shadow-sm border border-white/50">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        </div>
                      )}
                      {item.fires && item.fires > 0 && (
                        <div className="bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-black text-orange-500 flex items-center gap-1 shadow-sm border border-white/50">
                          🔥 TOP
                        </div>
                      )}
                      {item.price < 99 && (
                        <div className="bg-red-500/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-black text-gray-900 flex items-center gap-1 shadow-sm border border-red-400/50">
                          % OFFER
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="flex-1 p-3 flex flex-col justify-between bg-white relative z-20">
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight text-[13px] md:text-sm line-clamp-2">{item.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-[9px] font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-orange-500 text-orange-500" /> 4.9</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-1 mt-3">
                      <div className="flex flex-col min-w-0">
                        {item.price < 99 && <span className="text-[8px] text-gray-400 line-through">₹{item.price + 50}</span>}
                        <span className="text-base font-black text-gray-900 tracking-tight leading-none truncate">₹{item.price}</span>
                      </div>
                      
                      <div className="shrink-0 relative">
                        {getQuantity(item.id) === 0 ? (
                          <button
                            onClick={() => handleAdd(item)}
                            className="bg-orange-500 text-white px-3.5 py-1.5 rounded-[10px] font-black text-[10px] uppercase tracking-widest shadow-[0_4px_10px_rgba(249,115,22,0.3)] hover:bg-orange-600 transition-all flex items-center gap-1"
                          >
                            Add <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        ) : (
                          <div className="flex items-center bg-orange-500 text-white rounded-[10px] shadow-[0_4px_10px_rgba(249,115,22,0.3)] overflow-hidden h-7">
                            <button
                              onClick={() => {
                                playSound(SOUNDS.CLICK);
                                updateQuantity(item.id, getQuantity(item.id) - 1);
                              }}
                              className="px-2 h-full hover:bg-white/20 transition-colors flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-4 text-center font-black text-[11px]">
                              {getQuantity(item.id)}
                            </span>
                            <button
                              onClick={() => {
                                playSound(SOUNDS.CLICK);
                                updateQuantity(item.id, getQuantity(item.id) + 1);
                              }}
                              className="px-2 h-full hover:bg-white/20 transition-colors flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredItems.length === 0 && (
              <div className="text-center py-20 col-span-full">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-black text-lg">No items found</p>
                <p className="text-gray-500 text-sm mt-1">Try searching for something else.</p>
              </div>
            )}
          </div>
        </div>
      
        {/* Back to Top */}
        {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-28 right-6 z-50 w-12 h-12 bg-white rounded-full shadow-xl border border-gray-100 flex items-center justify-center text-gray-900 hover:bg-gray-50 transition-all active:scale-95"
        >
          <ChevronRight className="w-6 h-6 -rotate-90" />
        </button>
        )}
      </div>
    </div>
  );
}
