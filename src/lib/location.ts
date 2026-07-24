// ═══════════════════════════════════════════════════════════════
// ENTERPRISE LOCATION & GEOCODING ENGINE
// ═══════════════════════════════════════════════════════════════

export interface DetailedAddress {
  id?: string;
  name: string;
  formattedAddress: string;
  address: string; // Alias for formattedAddress
  lat: number;
  lng: number;
  houseNumber?: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  road?: string;
  suburb?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  category: 'apartment' | 'villa' | 'pg' | 'shop' | 'landmark' | 'street' | 'business' | 'other';
  distance?: number; // in km
  isDeliverable: boolean;
  accuracy?: number; // GPS precision in meters
  tag?: 'Home' | 'Work' | 'Other';
  instructions?: string;
}

// BTM Layout Center Coordinates (16th Main Road, BTM 2nd Stage)
export const BTM_CENTER = { lat: 12.9165, lng: 77.6101 };
export const MAX_BTM_RANGE = 4.5; // km radius for primary fast delivery zone

// ═══════════════════════════════════════════════════════════════
// HAVERSINE DISTANCE FORMULA (KM)
// ═══════════════════════════════════════════════════════════════
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
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

// Check if location or address is in BTM Layout / Service area
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
    addrLower.includes('kuvempu nagar') ||
    addrLower.includes('silk board') ||
    addrLower.includes('madiwala') ||
    addrLower.includes('koramangala') ||
    addrLower.includes('hsr');

  const dist = haversineDistance(BTM_CENTER.lat, BTM_CENTER.lng, lat, lng);
  return containsBTM || dist <= MAX_BTM_RANGE;
}

// ═══════════════════════════════════════════════════════════════
// NETWORK RETRY WRAPPER WITH EXPONENTIAL BACKOFF
// ═══════════════════════════════════════════════════════════════
export async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 400): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok && retries > 0) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') throw error;
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, backoff));
    return fetchWithRetry(url, options, retries - 1, backoff * 1.5);
  }
}

// Categorize location based on OSM key-value attributes & name clues
function determineCategory(props: any): DetailedAddress['category'] {
  const name = (props.name || props.street || '').toLowerCase();
  const osmKey = (props.osm_key || '').toLowerCase();
  const osmValue = (props.osm_value || '').toLowerCase();

  if (name.includes('pg') || name.includes('paying guest') || name.includes('hostel') || name.includes('stay')) {
    return 'pg';
  }
  if (name.includes('apartment') || name.includes('apts') || name.includes('residency') || name.includes('heights') || name.includes('prestige') || name.includes('brigade') || name.includes('sobha') || osmValue === 'apartments') {
    return 'apartment';
  }
  if (name.includes('villa') || name.includes('enclave') || name.includes('row house')) {
    return 'villa';
  }
  if (osmKey === 'shop' || osmKey === 'amenity' && ['restaurant', 'cafe', 'fast_food', 'pharmacy', 'bank'].includes(osmValue) || name.includes('store') || name.includes('supermarket') || name.includes('mall')) {
    return 'shop';
  }
  if (osmKey === 'tourism' || osmKey === 'historic' || osmValue === 'park' || name.includes('bridge') || name.includes('circle') || name.includes('junction') || name.includes('gate')) {
    return 'landmark';
  }
  if (osmKey === 'highway' || osmValue === 'residential' || name.includes('road') || name.includes('street') || name.includes('cross') || name.includes('main')) {
    return 'street';
  }
  if (osmKey === 'office' || name.includes('tech park') || name.includes('ltd') || name.includes('inc') || name.includes('solutions')) {
    return 'business';
  }
  return 'landmark';
}

// ═══════════════════════════════════════════════════════════════
// PHOTON & OPENSTREETMAP AUTOCOMPLETE PROVIDER WITH PROXIMITY BIAS
// ═══════════════════════════════════════════════════════════════
export async function searchAddresses(
  query: string, 
  userLat?: number, 
  userLng?: number,
  signal?: AbortSignal
): Promise<DetailedAddress[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const refLat = userLat || BTM_CENTER.lat;
  const refLng = userLng || BTM_CENTER.lng;

  // Local Bangalore Alias Map for instant partial searches
  const aliasLower = trimmed.toLowerCase();
  let searchStr = trimmed;
  if (!aliasLower.includes('bengaluru') && !aliasLower.includes('bangalore')) {
    searchStr = `${trimmed}, Bengaluru`;
  }

  const results: DetailedAddress[] = [];

  // 1. Try Photon API by Komoot (supports location proximity lat/lon bias)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&lat=${refLat}&lon=${refLng}&limit=12&lang=en`;
    const res = await fetchWithRetry(photonUrl, { signal });
    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        for (const feature of data.features) {
          const props = feature.properties || {};
          const coords = feature.geometry?.coordinates || [refLng, refLat];
          const lon = coords[0];
          const lat = coords[1];

          const title = props.name || props.street || props.district || props.city || trimmed;
          const road = props.street || props.name || '';
          const suburb = props.district || props.suburb || props.locality || 'Bengaluru';
          const city = props.city || props.county || 'Bengaluru';
          const state = props.state || 'Karnataka';
          const country = props.country || 'India';
          const postalCode = props.postcode || '';

          const parts = [props.name, props.housenumber, props.street, props.district, props.city, props.state, props.postcode].filter(Boolean);
          const formattedAddress = parts.length > 0 ? Array.from(new Set(parts)).join(', ') : `${title}, Bengaluru`;

          const distance = haversineDistance(refLat, refLng, lat, lon);
          const isDeliverable = isBTMServiceable(formattedAddress, lat, lon);
          const category = determineCategory(props);

          results.push({
            id: `photon-${props.osm_id || Math.random()}`,
            name: title,
            formattedAddress,
            address: formattedAddress,
            lat,
            lng: lon,
            houseNumber: props.housenumber || '',
            road,
            suburb,
            city,
            state,
            country,
            postalCode,
            category,
            distance: parseFloat(distance.toFixed(2)),
            isDeliverable,
          });
        }
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    console.warn('Photon API fetch error, trying Nominatim fallback:', err);
  }

  // 2. Fallback to OpenStreetMap Nominatim if Photon yields few results
  if (results.length < 3) {
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchStr)}&limit=8&addressdetails=1&lat=${refLat}&lon=${refLng}`;
      const res = await fetchWithRetry(nomUrl, { headers: { 'Accept-Language': 'en' }, signal });
      if (res.ok) {
        const nomData = await res.json();
        for (const item of nomData) {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          const addr = item.address || {};
          
          const title = item.display_name.split(',')[0];
          const houseNumber = addr.house_number || addr.building || '';
          const road = addr.road || addr.pedestrian || addr.footway || '';
          const suburb = addr.suburb || addr.neighbourhood || addr.residential || '';
          const city = addr.city || addr.town || addr.municipality || 'Bengaluru';
          const state = addr.state || 'Karnataka';
          const country = addr.country || 'India';
          const postalCode = addr.postcode || '';

          const distance = haversineDistance(refLat, refLng, lat, lon);
          const isDeliverable = isBTMServiceable(item.display_name, lat, lon);
          const category = determineCategory({ name: title, ...addr });

          results.push({
            id: `nom-${item.place_id || Math.random()}`,
            name: title,
            formattedAddress: item.display_name,
            address: item.display_name,
            lat,
            lng: lon,
            houseNumber,
            road,
            suburb,
            city,
            state,
            country,
            postalCode,
            category,
            distance: parseFloat(distance.toFixed(2)),
            isDeliverable,
          });
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
      console.warn('Nominatim fallback failed:', err);
    }
  }

  // Rank nearby results first (Proximity Weighting)
  results.sort((a, b) => (a.distance || 0) - (b.distance || 0));

  // Deduplicate results
  return deduplicateAddresses(results);
}

// ═══════════════════════════════════════════════════════════════
// DUPLICATE ADDRESS DETECTION & REMOVAL
// ═══════════════════════════════════════════════════════════════
export function deduplicateAddresses(addresses: DetailedAddress[]): DetailedAddress[] {
  const seen = new Set<string>();
  const unique: DetailedAddress[] = [];

  for (const addr of addresses) {
    const normName = addr.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const roundedLat = addr.lat.toFixed(3);
    const roundedLng = addr.lng.toFixed(3);
    const key = `${normName}_${roundedLat}_${roundedLng}`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(addr);
    }
  }

  return unique;
}

// ═══════════════════════════════════════════════════════════════
// DETAILED REVERSE GEOCODING (LAT/LNG TO STRUCTURED ADDRESS)
// ═══════════════════════════════════════════════════════════════
export async function reverseGeocodeDetailed(lat: number, lng: number): Promise<DetailedAddress> {
  const distToBtm = haversineDistance(BTM_CENTER.lat, BTM_CENTER.lng, lat, lng);
  const isNearBtm = distToBtm <= MAX_BTM_RANGE;

  let result: Partial<DetailedAddress> = {
    lat,
    lng,
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    postalCode: '560076',
    category: 'landmark',
    distance: parseFloat(distToBtm.toFixed(2)),
    isDeliverable: isBTMServiceable('', lat, lng),
  };

  // 1. Try BigDataCloud Client Geocoder API
  try {
    const bdcRes = await fetchWithRetry(
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
      result.suburb = roadOrSub;
      result.city = bdcData.city || 'Bengaluru';
      result.postalCode = bdcData.postcode || '560076';

      if (isNearBtm) {
        const detailPart = (roadOrSub && !roadOrSub.toLowerCase().includes('btm') && !roadOrSub.toLowerCase().includes('bengaluru'))
          ? `${roadOrSub}, `
          : '';
        result.name = roadOrSub || 'BTM Layout';
        result.formattedAddress = `${detailPart}BTM Layout, Bengaluru, Karnataka ${result.postalCode}`;
        result.address = result.formattedAddress;
        return result as DetailedAddress;
      }
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode failed, using Nominatim:', err);
  }

  // 2. Try Nominatim Reverse Geocoding
  try {
    const nomRes = await fetchWithRetry(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (nomRes.ok) {
      const data = await nomRes.json();
      if (data && data.address) {
        const addr = data.address;
        const houseNo = addr.house_number || addr.building || addr.office || '';
        const road = addr.road || addr.pedestrian || addr.footway || addr.path || '';
        const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || '';
        const city = addr.city || addr.town || addr.municipality || 'Bengaluru';
        const state = addr.state || 'Karnataka';
        const country = addr.country || 'India';
        const postalCode = addr.postcode || '560076';

        const name = houseNo || road || suburb || 'Detected Pin Location';
        const formatted = data.display_name;

        return {
          name,
          formattedAddress: formatted,
          address: formatted,
          lat,
          lng,
          houseNumber: houseNo,
          road,
          suburb,
          city,
          state,
          country,
          postalCode,
          category: determineCategory({ name, ...addr }),
          distance: parseFloat(distToBtm.toFixed(2)),
          isDeliverable: isBTMServiceable(formatted, lat, lng),
        };
      }
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode failed:', err);
  }

  // Default fallback
  const fallbackFormatted = isNearBtm
    ? '16th Main Road, BTM 2nd Stage, BTM Layout, Bengaluru, 560076'
    : 'Bengaluru, Karnataka, India';

  return {
    name: isNearBtm ? 'BTM 2nd Stage' : 'Bengaluru',
    formattedAddress: fallbackFormatted,
    address: fallbackFormatted,
    lat,
    lng,
    road: '16th Main Road',
    suburb: 'BTM 2nd Stage',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    postalCode: '560076',
    category: 'landmark',
    distance: parseFloat(distToBtm.toFixed(2)),
    isDeliverable: isBTMServiceable(fallbackFormatted, lat, lng),
  };
}

// Standard simple reverseGeocode string compatibility wrapper
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const detailed = await reverseGeocodeDetailed(lat, lng);
  return detailed.formattedAddress;
}

// ═══════════════════════════════════════════════════════════════
// TEXT MATCH HIGHLIGHTER HELPER
// ═══════════════════════════════════════════════════════════════
export function highlightTextParts(text: string, query: string): { text: string; isMatch: boolean }[] {
  if (!query || !query.trim()) return [{ text, isMatch: false }];

  const terms = query.trim().split(/\s+/).filter(Boolean);
  const regex = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part) => ({
    text: part,
    isMatch: terms.some((term) => part.toLowerCase() === term.toLowerCase()),
  }));
}
