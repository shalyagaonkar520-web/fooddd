// ═══════════════════════════════════════════════════════════════
// HAVERSINE DISTANCE FORMULA
// ═══════════════════════════════════════════════════════════════
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// BTM Layout Center Coordinates (16th Main Road, BTM 2nd Stage)
export const BTM_CENTER = { lat: 12.9165, lng: 77.6101 };
export const MAX_BTM_RANGE = 3.5; // km radius for BTM Layout service area

// Check if location or address is in BTM Layout
export function isBTMServiceable(address: string, lat: number, lng: number): boolean {
  if (!address) {
    const dist = haversineDistance(BTM_CENTER.lat, BTM_CENTER.lng, lat, lng);
    return dist <= MAX_BTM_RANGE;
  }

  const addrLower = address.toLowerCase();
  const containsBTM = 
    addrLower.includes('btm') || 
    addrLower.includes('btm layout') || 
    addrLower.includes('btm 1st') || 
    addrLower.includes('btm 2nd') || 
    addrLower.includes('btm stage') ||
    addrLower.includes('kuvempu nagar');

  const dist = haversineDistance(BTM_CENTER.lat, BTM_CENTER.lng, lat, lng);
  return containsBTM || dist <= MAX_BTM_RANGE;
}

// ═══════════════════════════════════════════════════════════════
// DETAILED NOMINATIM REVERSE GEOCODING FOR BTM LAYOUT & ROADS
// ═══════════════════════════════════════════════════════════════
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data && data.address) {
      const addr = data.address;
      
      const houseBuilding = addr.house_number || addr.building || addr.office || '';
      const road = addr.road || addr.pedestrian || addr.footway || addr.path || '';
      const mainCross = addr.neighbourhood || addr.suburb || addr.residential || addr.quarter || '';
      const cityDistrict = addr.city_district || addr.district || '';

      const parts = [houseBuilding, road, mainCross, cityDistrict].filter(Boolean);
      let fullAddress = parts.join(', ');

      if (!fullAddress) {
        fullAddress = data.display_name || 'BTM Layout, Bengaluru';
      }

      // If near BTM Layout, append BTM Layout to address for clarity
      const distToBtm = haversineDistance(BTM_CENTER.lat, BTM_CENTER.lng, lat, lng);
      if (distToBtm <= MAX_BTM_RANGE && !fullAddress.toLowerCase().includes('btm')) {
        fullAddress += ', BTM Layout, Bengaluru';
      }

      return fullAddress;
    }
    return data.display_name || 'BTM Layout, Bengaluru';
  } catch {
    return '16th Main Road, BTM Layout, Bengaluru';
  }
}
