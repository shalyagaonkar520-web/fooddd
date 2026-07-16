import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Phone, Truck, Clock, Store, Navigation, ShieldCheck } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { useSEO } from '../utils/seo';

// Helper to calculate distance in km via Haversine
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

export default function TrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  useSEO("Live Tracking", "Track your live delivery from Mintoo on our interactive map.");

  const [order, setOrder] = useState<any>(null);
  const [rider, setRider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Leaflet references
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  // 1. Real-time Listener for the Order document
  useEffect(() => {
    if (!orderId) {
      // If no orderId provided, try to find the most recent active local order
      try {
        const stored = JSON.parse(localStorage.getItem('moms_magic_orders') || '[]');
        const activeOrders = stored.filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled');
        if (activeOrders.length > 0) {
          // Redirect to the track page for the most recent active order
          activeOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          navigate(`/track/${activeOrders[0].id}`, { replace: true });
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
      return;
    }

    const orderDocRef = doc(db, 'orders', orderId);
    const unsubscribeOrder = onSnapshot(orderDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const orderData = docSnap.data();
        setOrder(orderData);
        setLoading(false);
      } else {
        // Fallback: check if we have it in localStorage
        try {
          const stored = JSON.parse(localStorage.getItem('moms_magic_orders') || '[]');
          const localOrder = stored.find((o: any) => o.id === orderId);
          if (localOrder) {
            setOrder(localOrder);
            setLoading(false);
          } else {
            toast.error('Order not found.');
            navigate('/profile');
          }
        } catch (e) {
          setLoading(false);
        }
      }
    }, (error) => {
      console.error("Firestore order subscription error:", error);
    });

    return () => unsubscribeOrder();
  }, [orderId, navigate]);

  // 2. Real-time Listener for the Rider document
  useEffect(() => {
    if (!order || !order.riderId || order.riderId === '') {
      setRider(null);
      return;
    }

    const riderDocRef = doc(db, 'riders', order.riderId);
    const unsubscribeRider = onSnapshot(riderDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setRider(docSnap.data());
      }
    });

    return () => unsubscribeRider();
  }, [order]);

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      // Start centered on BTM Layout
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([12.9165, 77.6101], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(mapInstance.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 4. Update Map Markers and Bounds dynamically when coordinates change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !order) return;

    const restCoords: [number, number] = [12.9165, 77.6101]; // Mintoo Kitchen coordinates
    const custCoords: [number, number] = [
      order.deliveryLocation?.lat || 12.9200,
      order.deliveryLocation?.lng || 77.6150
    ];
    const riderCoords: [number, number] | null = rider?.currentLocation?.lat && rider?.currentLocation?.lng
      ? [rider.currentLocation.lat, rider.currentLocation.lng]
      : null;

    // Custom UI icons matching Swish styles
    const restaurantIcon = L.divIcon({
      html: '<div class="w-8 h-8 rounded-full bg-orange-600 border-2 border-white flex items-center justify-center shadow-lg font-bold text-sm">🍳</div>',
      className: 'custom-div-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const customerIcon = L.divIcon({
      html: '<div class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center shadow-lg font-bold text-sm">🏠</div>',
      className: 'custom-div-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const riderIcon = L.divIcon({
      html: '<div class="w-9 h-9 rounded-full bg-orange-500/100 border-2 border-white flex items-center justify-center shadow-2xl font-bold text-sm shadow-[#FC8019]/50 rider-bike-icon">🛵</div>',
      className: 'custom-div-icon rider-smooth-move',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    // Handle Restaurant Marker
    if (!markersRef.current['restaurant']) {
      markersRef.current['restaurant'] = L.marker(restCoords, { icon: restaurantIcon }).addTo(map)
        .bindPopup('<b>Mom\'s Magic Kitchen</b>');
    } else {
      markersRef.current['restaurant'].setLatLng(restCoords);
    }

    // Handle Customer Marker
    if (!markersRef.current['customer']) {
      markersRef.current['customer'] = L.marker(custCoords, { icon: customerIcon }).addTo(map)
        .bindPopup(`<b>Your Location</b><br/>${order.deliveryLocation?.address || ''}`);
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

    // Draw route polyline linking points
    const routePoints: Array<[number, number]> = [];
    routePoints.push(restCoords);
    if (riderCoords) {
      routePoints.push(riderCoords);
    }
    routePoints.push(custCoords);

    if (polylineRef.current) {
      polylineRef.current.setLatLngs(routePoints);
    } else {
      polylineRef.current = L.polyline(routePoints, {
        color: '#FC8019',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8'
      }).addTo(map);
    }

    // Fit map view to wrap all active markers nicely
    const bounds = L.latLngBounds(routePoints);
    map.fitBounds(bounds, { padding: [50, 50] });

  }, [order, rider]);

  // Calculations for remaining distance and ETA
  const getTrackingMetrics = () => {
    if (!order) return { distance: 0, eta: 0 };
    
    // Coordinates
    const lat1 = rider?.currentLocation?.lat || 12.9165; // Rider or Restaurant
    const lon1 = rider?.currentLocation?.lng || 77.6101;
    const lat2 = order.deliveryLocation?.lat || 12.9200;
    const lon2 = order.deliveryLocation?.lng || 77.6150;

    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    
    // Average rider speed is 22 km/h inside town routes
    const speedKmh = 22;
    // Calculate minutes and add 3 mins packaging/traffic buffer
    const eta = Math.ceil((distance / speedKmh) * 60) + 3;

    return {
      distance: parseFloat(distance.toFixed(1)),
      eta: order.status === 'delivered' ? 0 : eta
    };
  };

  const metrics = getTrackingMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
          <MapPin className="w-12 h-12 text-orange-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">No Active Tracking</h2>
        <p className="text-gray-500 text-center mb-8">You don't have any active orders to track right now.</p>
        <button 
          onClick={() => navigate('/home')}
          className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-[0_4px_20px_rgba(249,115,22,0.3)] hover:scale-105 transition-transform"
        >
          Order Now
        </button>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white flex flex-col relative pb-32">
      <style>{`
        .rider-smooth-move {
          transition: transform 1.5s ease-out;
        }
        .rider-bike-icon {
          animation: riderBounce 2s infinite ease-in-out;
        }
        @keyframes riderBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
      {/* 1. Leaflet Interactive Map View */}
      <div className="flex-1 w-full relative z-10 min-h-[50vh] md:min-h-[60vh] bg-gray-100">
        <div ref={mapRef} className="w-full h-full absolute inset-0" />
        
        {/* Floating Back Action */}
        <button 
          onClick={() => navigate('/profile')}
          className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full bg-gray-50/80 border border-gray-200 flex items-center justify-center text-gray-900 backdrop-blur-md cursor-pointer hover:border-orange-500 transition-all active:scale-95 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Order Tracking Status Drawer Sheet */}
      <div className="relative z-20 bg-white border-t border-gray-200 rounded-t-[35px] p-6 space-y-6 -mt-6 backdrop-blur-lg shadow-sm">
        
        {/* ETA & Distance Card */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl flex items-center gap-4 text-left">
            <div className="bg-orange-500/10 p-3 rounded-xl border border-gray-200">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Estimated Arrival</p>
              <h3 className="text-2xl font-black italic text-gray-900 mt-1">
                {order.status === 'delivered' ? 'Arrived' : `${metrics.eta} Mins`}
              </h3>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl flex items-center gap-4 text-left">
            <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
              <Navigation className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Remaining Distance</p>
              <h3 className="text-2xl font-black italic text-gray-900 mt-1">
                {order.status === 'delivered' ? '0.0 km' : `${metrics.distance} km`}
              </h3>
            </div>
          </div>
        </div>

        {/* Step Indicator Panel */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 text-left">
            <div className={`p-2.5 rounded-full shrink-0 ${
              order.status === 'delivered' ? 'bg-orange-500/100 text-black' : 'bg-orange-500/10 text-orange-500 animate-pulse'
            }`}>
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase text-gray-900 tracking-wide">
                {order.status === 'pending' ? 'Waiting for Confirmation' :
                 order.status === 'Preparing' ? 'Kitchen is Cooking Your Feast' :
                 order.status === 'Out For Delivery' ? 'Rider is Out For Delivery' :
                 order.status === 'delivered' ? 'Order Delivered!' : 'Processing Order'}
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                Status: {order.status}
              </p>
            </div>
          </div>

          {/* Simple progress bar */}
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                order.status === 'delivered' ? 'bg-orange-500/100' : 'bg-orange-500/100'
              }`}
              style={{
                width: 
                  order.status === 'pending' ? '15%' :
                  order.status === 'Preparing' ? '50%' :
                  order.status === 'Out For Delivery' ? '85%' :
                  order.status === 'delivered' ? '100%' : '10%'
              }}
            />
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Rider & Address Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {rider ? (
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-gray-200 flex items-center justify-center text-xl text-orange-500 font-black uppercase">
                {rider.name.charAt(0)}
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Assigned Rider</p>
                <h4 className="text-base font-extrabold text-gray-900 mt-0.5">{rider.name}</h4>
                <p className="text-[10px] text-orange-500 font-bold">{rider.phone}</p>
              </div>
              <a
                href={`tel:${rider.phone}`}
                className="ml-4 w-10 h-10 rounded-full bg-gray-50 border border-gray-200 hover:border-orange-500 flex items-center justify-center text-orange-500 transition-colors"
              >
                <Phone className="w-4 h-4 fill-current text-orange-500" />
              </a>
            </div>
          ) : (
            <div className="text-left py-2">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Delivery Partner</p>
              <h4 className="text-sm font-bold text-gray-900 mt-1">Rider assignment in progress... 🛵</h4>
              <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">
                Our kitchen is preparing your box. Once a delivery partner accepts, you will see their details here.
              </p>
            </div>
          )}

          <div className="text-left sm:text-right space-y-1">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Delivery Destination</p>
            <h4 className="text-xs font-bold text-gray-900 truncate max-w-xs">{order.deliveryLocation?.address}</h4>
            <p className="text-[9px] text-orange-500 font-black uppercase tracking-widest mt-1">₹{order.grandTotal} • {order.paymentMethod}</p>
          </div>
        </div>

        {/* Footer badges */}
        <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 font-black uppercase tracking-[3px] text-[8px]">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-500" /> Live GPS Satellite Encrypted
        </div>

      </div>
    </div>
  );
}
