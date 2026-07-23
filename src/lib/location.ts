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
// HIGH-ACCURACY DUAL-PROVIDER REVERSE GEOCODING
// ═══════════════════════════════════════════════════════════════
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const distToBtm = haversineDistance(BTM_CENTER.lat, BTM_CENTER.lng, lat, lng);
  const isNearBtm = distToBtm <= MAX_BTM_RANGE;

  // 1. Try BigDataCloud API (Client Geocoding Engine)
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      
      const informatives = bdcData.localityInfo?.informative || [];
      const subLocalityObj = informatives.find((i: any) => 
        i.name && (
          i.name.toLowerCase().includes('btm') || 
          i.name.toLowerCase().includes('stage') || 
          i.name.toLowerCase().includes('layout') ||
          i.name.toLowerCase().includes('road') ||
          i.name.toLowerCase().includes('cross') ||
          i.name.toLowerCase().includes('main')
        )
      );

      const roadOrSub = subLocalityObj?.name || bdcData.locality || bdcData.city || '';
      
      if (isNearBtm) {
        const detailPart = (roadOrSub && !roadOrSub.toLowerCase().includes('btm') && !roadOrSub.toLowerCase().includes('bengaluru')) 
          ? `${roadOrSub}, ` 
          : '';
        return `${detailPart}BTM Layout, Bengaluru`;
      } else if (roadOrSub) {
        const city = bdcData.city || 'Bengaluru';
        return `${roadOrSub}, ${city}`;
      }
    }
  } catch (err) {
    console.warn('BigDataCloud geocode failed, trying Nominatim fallback:', err);
  }

  // 2. OpenStreetMap Nominatim Fallback with strict filters
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
      const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || '';
      
      // Clean noise words like "Bengaluru South taluk"
      const cleanParts = [houseBuilding, road, suburb].filter(p => {
        if (!p) return false;
        const low = p.toLowerCase();
        return !low.includes('taluk') && !low.includes('division') && !low.includes('district') && !low.includes('karnataka') && !low.includes('india');
      });

      let fullAddress = cleanParts.join(', ');

      if (isNearBtm) {
        if (!fullAddress || fullAddress.toLowerCase() === 'bengaluru') {
          fullAddress = '16th Main Road, BTM 2nd Stage';
        }
        if (!fullAddress.toLowerCase().includes('btm')) {
          fullAddress += ', BTM Layout, Bengaluru';
        } else if (!fullAddress.toLowerCase().includes('bengaluru')) {
          fullAddress += ', Bengaluru';
        }
        return fullAddress;
      }

      if (fullAddress) {
        return `${fullAddress}, Bengaluru`;
      }
    }
  } catch (err) {
    console.warn('Nominatim fallback failed:', err);
  }

  // 3. Guaranteed BTM Layout fallback if near BTM
  if (isNearBtm) {
    return '16th Main Road, BTM 2nd Stage, BTM Layout, Bengaluru';
  }

  return 'Bengaluru, Karnataka';
}
