// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, MapPin, Phone, Truck, Clock, Store, Navigation, 
  ShieldCheck, Share2, RefreshCw, CheckCircle2, AlertTriangle, MessageSquare
} from 'lucide-react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { useSEO } from '../utils/seo';

// Haversine distance calculator
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// ----------------------------------------------------
// Sub-component: RoutePolyline
// Renders the route line between points
// ----------------------------------------------------
const drawRoute = (map: L.Map, points: Array<[number, number]>, polylineRef: React.MutableRefObject<L.Polyline | null>) => {
  if (polylineRef.current) {
    polylineRef.current.setLatLngs(points);
  } else {
    polylineRef.current = L.polyline(points, {
      color: '#10B981', // Emerald-500 (Swiggy Green Accent)
      weight: 5,
      opacity: 0.8,
      dashArray: '10, 10'
    }).addTo(map);
  }
};

// ----------------------------------------------------
// Sub-component: TrackMap
// Manages the Leaflet Map instance & updating markers
// ----------------------------------------------------
interface TrackMapProps {
  order: any;
  rider: any;
  mapError: string | null;
}

const TrackMap: React.FC<TrackMapProps> = ({ order, rider, mapError }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylineRef = useRef<L.Polyline | null>(null);
  const hasFitBounds = useRef(false);
  const lastOrderId = useRef<string | null>(null);

  // 1. Initialize Map
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      try {
        // Start centered on kitchen
        mapInstance.current = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView([12.9165, 77.6101], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(mapInstance.current);

        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
      } catch (err) {
        console.error("Leaflet initialization error:", err);
      }
    }

    return () => {
      try {
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
      } catch (err) {
        console.error("Leaflet map cleanup error:", err);
      }
    };
  }, []);

  // 2. Update Map Markers dynamically
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !order) return;

    try {
      if (lastOrderId.current !== order.id) {
        hasFitBounds.current = false;
        lastOrderId.current = order.id;
      }

      const restCoords: [number, number] = [12.9165, 77.6101]; // Kitchen Coordinates (BTM Layout)
      const custCoords: [number, number] = [
        order.deliveryLocation?.lat || 12.9200,
        order.deliveryLocation?.lng || 77.6150
      ];
      const riderCoords: [number, number] | null = rider?.currentLocation?.lat && rider?.currentLocation?.lng
        ? [rider.currentLocation.lat, rider.currentLocation.lng]
        : null;

      // Custom circular Tailwind-compatible HTML Icons (Swiggy/Zomato style)
      const restaurantIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-emerald-600 border-4 border-white shadow-xl flex items-center justify-center text-white text-base">🏪</div>
            <div class="absolute -bottom-1 w-3 h-3 bg-emerald-600 rotate-45 border-r border-b border-white"></div>
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [40, 44],
        iconAnchor: [20, 44]
      });

      const customerIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-gray-900 border-4 border-white shadow-xl flex items-center justify-center text-white text-base font-bold">🏠</div>
            <div class="absolute -bottom-1 w-3 h-3 bg-gray-900 rotate-45 border-r border-b border-white"></div>
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [40, 44],
        iconAnchor: [20, 44]
      });

      const riderIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-12 h-12 rounded-full bg-emerald-50 border-4 border-white shadow-2xl flex items-center justify-center text-white text-lg animate-[riderBounce_2s_infinite_ease-in-out]">
              <div class="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping"></div>
              🛵
            </div>
          </div>
        `,
        className: 'custom-div-icon rider-smooth-move',
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      // Handle Restaurant Marker
      if (!markersRef.current['restaurant']) {
        markersRef.current['restaurant'] = L.marker(restCoords, { icon: restaurantIcon }).addTo(map)
          .bindPopup('<b>Mintoo Kitchen</b><br/>Your food is prepared here.');
      } else {
        markersRef.current['restaurant'].setLatLng(restCoords);
      }

      // Handle Customer Marker
      if (!markersRef.current['customer']) {
        markersRef.current['customer'] = L.marker(custCoords, { icon: customerIcon }).addTo(map)
          .bindPopup(`<b>Your Address</b><br/>${order.deliveryLocation?.address || ''}`);
      } else {
        markersRef.current['customer'].setLatLng(custCoords);
      }

      // Handle Rider Marker
      if (riderCoords) {
        if (!markersRef.current['rider']) {
          markersRef.current['rider'] = L.marker(riderCoords, { icon: riderIcon }).addTo(map)
            .bindPopup(`<b>Delivery Partner: ${rider.name}</b>`);
        } else {
          markersRef.current['rider'].setLatLng(riderCoords);
        }
      } else if (markersRef.current['rider']) {
        markersRef.current['rider'].remove();
        delete markersRef.current['rider'];
      }

      // Draw routing Polyline
      const routePoints: Array<[number, number]> = [];
      routePoints.push(restCoords);
      if (riderCoords) {
        routePoints.push(riderCoords);
      }
      routePoints.push(custCoords);

      drawRoute(map, routePoints, polylineRef);

      // Zoom/Center Map to keep all points visible (only once to prevent annoying jumps during tracking)
      if (!hasFitBounds.current) {
        const bounds = L.latLngBounds(routePoints);
        map.fitBounds(bounds, { padding: [80, 80] });
        hasFitBounds.current = true;
      }
    } catch (err) {
      console.error("Leaflet marker updates error:", err);
    }

  }, [order, rider]);

  if (mapError) {
    return (
      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-6 text-center space-y-3">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">Map Loading Failed</h3>
        <p className="text-gray-500 text-sm max-w-xs">{mapError}</p>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full absolute inset-0 z-0" />;
};

// ----------------------------------------------------
// Sub-component: TrackingProgress
// Displays horizontal stepper progress bar
// ----------------------------------------------------
interface TrackingProgressProps {
  status: string;
}

const TrackingProgress: React.FC<TrackingProgressProps> = ({ status }) => {
  const steps = [
    { label: 'Confirmed', key: 'pending' },
    { label: 'Preparing', key: 'Preparing' },
    { label: 'Picked Up', key: 'Ready for Delivery' },
    { label: 'On the Way', key: 'Out For Delivery' },
    { label: 'Delivered', key: 'delivered' }
  ];

  const getStepIndex = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 0;
      case 'Preparing': return 1;
      case 'Ready for Delivery': return 2;
      case 'Out For Delivery': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-4 px-2">
      <div className="flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute top-[14px] left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full" />
        <div 
          className="absolute top-[14px] left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-700" 
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isActive = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-7 h-7 rounded-full border-4 flex items-center justify-center text-[10px] font-black transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-emerald-500 border-white text-white shadow-lg' 
                    : 'bg-white border-gray-100 text-gray-400'
                } ${isActive ? 'scale-110 ring-4 ring-emerald-500/20' : ''}`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-wider mt-2 transition-colors duration-300 ${
                isActive ? 'text-emerald-600 font-bold' : isCompleted ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// Sub-component: OrderStatusCard
// Swiggy-style sliding details bottom sheet
// ----------------------------------------------------
interface OrderStatusCardProps {
  order: any;
  rider: any;
  metrics: { distance: number; eta: number };
  onRefresh: () => void;
}

const OrderStatusCard: React.FC<OrderStatusCardProps> = ({ order, rider, metrics, onRefresh }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white border border-gray-100 rounded-t-[35px] shadow-[0_-15px_40px_rgba(0,0,0,0.06)] p-6 space-y-5 relative z-20 backdrop-blur-lg">
      {/* Top Slide Handle */}
      <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto -mt-3 mb-2" />

      {/* Top Header Row */}
      <div className="flex justify-between items-start text-left">
        <div>
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">ORDER ID: #{order.id}</p>
          <h2 className="text-xl font-black text-gray-900 leading-none mt-1">
            {order.status === 'delivered' ? 'Feast Delivered!' : 
             order.status === 'Out For Delivery' ? 'On the way to you' : 
             order.status === 'Preparing' ? 'Chef is cooking' : 'Confirming order'}
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-1">Mintoo Kitchen • BTM Layout</p>
        </div>
        
        {/* Estimated Arrival Details */}
        <div className="flex flex-col items-end text-right shrink-0">
          <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="text-xs font-black text-emerald-800">
              {order.status === 'delivered' ? 'Arrived' : `${metrics.eta} mins`}
            </span>
          </div>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">
            {order.status === 'delivered' ? '0.0 km left' : `${metrics.distance} km away`}
          </span>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Interactive horizontal steps */}
      <TrackingProgress status={order.status} />

      <div className="h-px bg-gray-100" />

      {/* Rider contact block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {rider ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg text-emerald-600 font-black">
                {rider.name ? rider.name.charAt(0).toUpperCase() : 'R'}
              </div>
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Delivery Partner</p>
                <h4 className="text-sm font-black text-gray-900 mt-0.5">{rider.name || 'Delivery Partner'}</h4>
                <p className="text-[10px] text-emerald-600 font-extrabold">★ 4.9 Super Rider</p>
              </div>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <a 
                href={rider.phone ? `tel:${rider.phone}` : '#'}
                className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-500 hover:text-white flex items-center justify-center text-emerald-600 transition-all shadow-sm active:scale-95"
              >
                <Phone className="w-4 h-4 fill-current" />
              </a>
            </div>
          </div>
        ) : (
          <div className="text-left py-1">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Delivery Partner</p>
            <h4 className="text-sm font-black text-gray-800 mt-1">Assigning delivery agent... 🛵</h4>
            <p className="text-[10px] text-gray-400 leading-normal mt-0.5">Your food is baking. We are matching a delivery executive to hand off your hot meal.</p>
          </div>
        )}
      </div>

      <div className="h-px bg-gray-100" />

      {/* Secured by System */}
      <div className="flex items-center justify-center gap-1 text-gray-400 font-black uppercase tracking-[3px] text-[8px] pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SECURE LIVE SATELLITE TRACKING
      </div>
    </div>
  );
};

// ----------------------------------------------------
// Main Page: TrackingPage
// ----------------------------------------------------
export default function TrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  useSEO("Track Order", "Live order and rider tracking screen.");

  const [order, setOrder] = useState<any>(null);
  const [rider, setRider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // 1. Real-time Firebase listeners
  useEffect(() => {
    if (!orderId) {
      // Fallback: Check if there's any active local order
      try {
        const stored = JSON.parse(localStorage.getItem('moms_magic_orders') || '[]');
        const activeOrders = stored.filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled');
        if (activeOrders.length > 0) {
          activeOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          navigate(`/track/${activeOrders[0].id}`, { replace: true });
        } else {
          setMapError("No active orders found.");
          setLoading(false);
        }
      } catch (err) {
        setMapError("Failed to fetch local order data.");
        setLoading(false);
      }
      return;
    }

    // Helper: load order from localStorage by id
    const loadLocalOrder = (id: string) => {
      try {
        const stored: any[] = JSON.parse(localStorage.getItem('moms_magic_orders') || '[]');
        return stored.find(o => o.id === id) || null;
      } catch { return null; }
    };

    // Try local first for instant render
    const localOrder = loadLocalOrder(orderId);
    if (localOrder) {
      setOrder(localOrder);
      setLoading(false);
    }

    // Set up Firebase Firestore Listener
    const orderDocRef = doc(db, 'orders', orderId);
    const unsubscribeOrder = onSnapshot(orderDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const orderData = { id: docSnap.id, ...docSnap.data() };
        setOrder(orderData);
        setLoading(false);
      } else if (!localOrder) {
        setMapError("Order not found.");
        setLoading(false);
      }
    }, (error) => {
      console.warn("Firestore order blocked, using local cache:", error.message);
      if (!localOrder) {
        setMapError("Could not load order. Check your connection.");
        setLoading(false);
      }
    });

    return () => unsubscribeOrder();
  }, [orderId, navigate]);

  // 2. Rider Listener (dependent on order.riderId)
  useEffect(() => {
    if (!order || !order.riderId || order.riderId === '') {
      return;
    }

    const riderDocRef = doc(db, 'riders', order.riderId);
    const unsubscribeRider = onSnapshot(riderDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setRider(docSnap.data());
      }
    }, (error) => {
      console.error("Rider subscription error:", error);
    });

    return () => unsubscribeRider();
  }, [order]);

  // 3. Estimate metrics (Distance & ETA)
  const getTrackingMetrics = () => {
    if (!order) return { distance: 0, eta: 0 };
    
    const lat1 = rider?.currentLocation?.lat || 12.9165; 
    const lon1 = rider?.currentLocation?.lng || 77.6101;
    const lat2 = order.deliveryLocation?.lat || 12.9200;
    const lon2 = order.deliveryLocation?.lng || 77.6150;

    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    const speedKmh = 22; // Typical city delivery speed
    const eta = Math.ceil((distance / speedKmh) * 60) + 3; // Add 3-min buffer

    return {
      distance: parseFloat(distance.toFixed(1)),
      eta: order.status === 'delivered' ? 0 : eta
    };
  };

  const handleManualRefresh = () => {
    toast.success("Location synchronized! 🛰️");
    // This will trigger re-fetch on Firestore snapshot if active
  };

  const handleShareTracking = () => {
    const link = `${window.location.origin}/track/${order?.id || 'MOCK'}`;
    navigator.clipboard.writeText(link)
      .then(() => toast.success("Tracking link copied to clipboard! 🔗"))
      .catch(() => toast.error("Failed to copy link."));
  };

  const metrics = getTrackingMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-emerald-500"></div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Locating satellites...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 gap-6">
        <div className="text-5xl">📦</div>
        <h2 className="text-2xl font-black italic uppercase text-gray-900 text-center">Order Not Found</h2>
        <p className="text-gray-500 text-sm font-medium text-center max-w-xs">
          {mapError || "We couldn't find this order. It may have been placed on a different device."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-3 bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-emerald-600 transition-colors"
          >
            My Orders
          </button>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-gray-100 text-gray-900 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-gray-200 transition-colors"
          >
            Home
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      <style>{`
        .rider-smooth-move {
          transition: transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        @keyframes riderBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      {/* Full-width Map Container */}
      <div className="flex-1 w-full relative min-h-[45vh] md:min-h-[55vh] bg-gray-100">
        <TrackMap order={order} rider={rider} mapError={mapError} />
        
        {/* Floating Top Header Overlay */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <button 
            onClick={() => navigate('/profile')}
            className="pointer-events-auto w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-900 shadow-md hover:border-emerald-500 transition-all active:scale-95 shrink-0 cursor-pointer"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button 
            onClick={handleManualRefresh}
            className="pointer-events-auto px-4 py-2.5 rounded-full bg-white border border-gray-100 flex items-center gap-1.5 text-gray-900 shadow-md hover:border-emerald-500 transition-all active:scale-95 text-xs font-black uppercase tracking-wider cursor-pointer"
            title="Refresh Location"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Floating sliding Bottom Sheet with Details */}
      <OrderStatusCard 
        order={order} 
        rider={rider} 
        metrics={metrics} 
        onRefresh={handleManualRefresh} 
      />
    </div>
  );
}
