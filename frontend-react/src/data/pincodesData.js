// Offline Indian Pincode GPS Coordinates Lookup Engine
// Powered by 19,258+ Verified Indian Pincodes

import allPincodes from './all_india_pincodes.json';

export const PINCODE_DATABASE = allPincodes;

/**
 * Searches for a 6-digit Pincode in the offline 19,258+ All-India database.
 * Returns formatted location object with exact latitude and longitude.
 */
export const lookupPincode = (query) => {
  if (!query) return null;
  
  // Extract 6 digit numbers from search input string if present
  const pinMatch = String(query).match(/\b\d{6}\b/);
  const pin = pinMatch ? pinMatch[0] : String(query).trim();

  // 1. Direct exact 6-digit Pincode match in 19,258+ All India Pincodes Database
  if (allPincodes[pin]) {
    const [district, state, lat, lng] = allPincodes[pin];
    return {
      displayName: `Pin ${pin} (${district}, ${state})`,
      city: district,
      state: state,
      latitude: lat,
      longitude: lng,
      pincode: pin,
      isGps: false,
    };
  }

  // 2. Regional 3-digit Pincode Prefix Pattern Matching Fallback
  if (/^411/.test(pin)) return { displayName: `Pin ${pin} (Pune Region)`, city: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567, pincode: pin, isGps: false };
  if (/^400/.test(pin)) return { displayName: `Pin ${pin} (Mumbai Region)`, city: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777, pincode: pin, isGps: false };
  if (/^700/.test(pin)) return { displayName: `Pin ${pin} (Kolkata Region)`, city: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639, pincode: pin, isGps: false };
  if (/^110/.test(pin)) return { displayName: `Pin ${pin} (Delhi Region)`, city: 'Delhi', state: 'Delhi', latitude: 28.6139, longitude: 77.2090, pincode: pin, isGps: false };
  if (/^122/.test(pin)) return { displayName: `Pin ${pin} (Gurugram Region)`, city: 'Gurugram', state: 'Haryana', latitude: 28.4595, longitude: 77.0266, pincode: pin, isGps: false };
  if (/^201/.test(pin)) return { displayName: `Pin ${pin} (Noida Region)`, city: 'Noida', state: 'Uttar Pradesh', latitude: 28.5355, longitude: 77.3910, pincode: pin, isGps: false };
  if (/^560/.test(pin)) return { displayName: `Pin ${pin} (Bengaluru Region)`, city: 'Bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946, pincode: pin, isGps: false };
  if (/^500/.test(pin)) return { displayName: `Pin ${pin} (Hyderabad Region)`, city: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867, pincode: pin, isGps: false };
  if (/^600/.test(pin)) return { displayName: `Pin ${pin} (Chennai Region)`, city: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, pincode: pin, isGps: false };

  return null;
};
