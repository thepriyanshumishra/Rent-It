import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStores, getStoreStocks } from '../api/stores';
import { lookupPincode } from '../data/pincodesData';

const StoreContext = createContext();

const LOCAL_STORAGE_KEY = 'rentit_selected_store';
const USER_LOCATION_KEY = 'rentit_user_location';

// Comprehensive Indian cities & hubs dictionary with coordinates
export const POPULAR_CITIES = [
  { city: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639, popular: true },
  { city: 'New Delhi', state: 'Delhi NCR', latitude: 28.6139, longitude: 77.2090, popular: true },
  { city: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777, popular: true },
  { city: 'Bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946, popular: true },
  { city: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867, popular: true },
  { city: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567, popular: true },
  { city: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, popular: true },
  { city: 'Noida', state: 'Uttar Pradesh', latitude: 28.5355, longitude: 77.3910, popular: false },
  { city: 'Gurugram', state: 'Haryana', latitude: 28.4595, longitude: 77.0266, popular: false },
  { city: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714, popular: false },
  { city: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873, popular: false },
  { city: 'Chandigarh', state: 'Punjab', latitude: 30.7333, longitude: 76.7794, popular: false },
];

// Client-side Haversine distance formula in km
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371.0;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

export const StoreProvider = ({ children }) => {
  const [selectedStore, setSelectedStore] = useState(null);
  const [allStores, setAllStores] = useState([]);
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_LOCATION_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading saved location', e);
    }
    // Default fallback: Kolkata (user's current location)
    return {
      displayName: 'Kolkata, West Bengal',
      city: 'Kolkata',
      state: 'West Bengal',
      latitude: 22.5726,
      longitude: 88.3639,
      isGps: false,
    };
  });

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Enrich stores with distance from current userLocation
  const enrichAndSortStores = useCallback((stores, loc) => {
    if (!stores || stores.length === 0) return [];
    
    let enriched = stores.map(store => {
      let distance_km = null;
      if (loc?.latitude && loc?.longitude && store.latitude && store.longitude) {
        distance_km = calculateDistanceKm(
          loc.latitude,
          loc.longitude,
          parseFloat(store.latitude),
          parseFloat(store.longitude)
        );
      }
      return {
        ...store,
        distance_km,
      };
    });

    // Sort by distance (nearest first)
    enriched.sort((a, b) => {
      if (a.distance_km === null) return 1;
      if (b.distance_km === null) return -1;
      return a.distance_km - b.distance_km;
    });

    return enriched;
  }, []);

  // Fetch stores from API
  const fetchStores = useCallback(async (loc = null) => {
    try {
      const activeLoc = loc || userLocation;
      const params = {};
      if (activeLoc?.latitude && activeLoc?.longitude) {
        params.lat = activeLoc.latitude;
        params.lng = activeLoc.longitude;
      }
      const res = await getStores(params);
      const rawStores = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      const enriched = enrichAndSortStores(rawStores, activeLoc);
      setAllStores(enriched);

      // Auto select nearest store
      if (enriched.length > 0) {
        setSelectedStore(enriched[0]);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(enriched[0]));
      }

      return enriched;
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      return [];
    }
  }, [userLocation, enrichAndSortStores]);

  // Set location manually by city, pincode or area
  const setManualLocation = useCallback(async (cityObjOrName) => {
    let loc = null;
    if (typeof cityObjOrName === 'object' && cityObjOrName.latitude) {
      loc = {
        displayName: `${cityObjOrName.city}, ${cityObjOrName.state || 'India'}`,
        city: cityObjOrName.city,
        state: cityObjOrName.state || '',
        latitude: cityObjOrName.latitude,
        longitude: cityObjOrName.longitude,
        isGps: false,
      };
    } else {
      const query = String(cityObjOrName).trim();
      
      // 1. Check Offline Pincode Database (19,258+ Indian PIN codes)
      const pinResult = lookupPincode(query);
      if (pinResult) {
        loc = pinResult;
      } else {
        // 2. Check Popular Cities List
        const queryLower = query.toLowerCase();
        const found = POPULAR_CITIES.find(c => 
          c.city.toLowerCase().includes(queryLower) || queryLower.includes(c.city.toLowerCase())
        );
        if (found) {
          loc = {
            displayName: `${found.city}, ${found.state}`,
            city: found.city,
            state: found.state,
            latitude: found.latitude,
            longitude: found.longitude,
            isGps: false,
          };
        } else {
          // 3. Fallback default coordinates (Kolkata)
          loc = {
            displayName: `${query}, India`,
            city: query,
            state: 'India',
            latitude: 22.5726,
            longitude: 88.3639,
            isGps: false,
          };
        }
      }
    }

    setUserLocation(loc);
    localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(loc));
    setLocationError(null);
    setIsModalOpen(false);
    await fetchStores(loc);
  }, [fetchStores]);

  // Request browser GPS
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Find closest known city for clean display name
        let closestCity = POPULAR_CITIES[0];
        let minCityDist = 99999;
        POPULAR_CITIES.forEach(c => {
          const d = calculateDistanceKm(coords.latitude, coords.longitude, c.latitude, c.longitude);
          if (d !== null && d < minCityDist) {
            minCityDist = d;
            closestCity = c;
          }
        });

        // Snap to city center coordinates if user is within 30 km of a metropolitan center to avoid minor GPS fluctuations
        const shouldSnap = minCityDist < 30;
        const finalLat = shouldSnap ? closestCity.latitude : coords.latitude;
        const finalLng = shouldSnap ? closestCity.longitude : coords.longitude;

        const newLoc = {
          displayName: `${closestCity.city}, ${closestCity.state}`,
          city: closestCity.city,
          state: closestCity.state,
          latitude: finalLat,
          longitude: finalLng,
          isGps: true,
        };

        setUserLocation(newLoc);
        localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(newLoc));
        setIsDetectingLocation(false);
        setIsModalOpen(false);

        await fetchStores(newLoc);
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setIsDetectingLocation(false);
        if (error.code === 1) {
          setLocationError('Location permission denied. Please enter your location manually.');
        } else {
          setLocationError('Unable to detect location. Please enter your location manually.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, [fetchStores]);

  const [stocks, setStocks] = useState([]);

  const fetchStocksList = useCallback(async () => {
    try {
      const res = await getStoreStocks({ limit: 100 });
      const results = res.data?.results || res.data || [];
      setStocks(results);
    } catch (err) {
      console.error('Failed to load store stocks:', err);
    }
  }, []);

  // Initial mount
  useEffect(() => {
    fetchStores(userLocation);
    fetchStocksList();
  }, []);

  const selectStore = (store) => {
    setSelectedStore(store);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
    setIsModalOpen(false);
  };

  const getClosestStoreWithStock = useCallback((productId) => {
    const activeStocks = stocks.filter(s => (s.product === productId || s.product?.id === productId) && s.available_quantity > 0);
    if (activeStocks.length === 0) return null;
    
    // Find the first store in allStores (which is sorted nearest-first) that matches
    const closest = allStores.find(st => activeStocks.some(s => (s.store === st.id || s.store?.id === st.id)));
    return closest || null;
  }, [stocks, allStores]);

  const openStoreModal = () => setIsModalOpen(true);
  const closeStoreModal = () => setIsModalOpen(false);

  return (
    <StoreContext.Provider
      value={{
        selectedStore,
        allStores,
        userLocation,
        isDetectingLocation,
        isModalOpen,
        locationError,
        stocks,
        detectLocation,
        setManualLocation,
        selectStore,
        getClosestStoreWithStock,
        openStoreModal,
        closeStoreModal,
        fetchStores,
        refreshStocks: fetchStocksList
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
