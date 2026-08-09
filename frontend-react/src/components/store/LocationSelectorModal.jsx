import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Navigation, Search, X, Compass, AlertCircle, 
  ArrowRight, Sparkles, Building2, Check
} from 'lucide-react';
import { useStore, POPULAR_CITIES } from '../../context/StoreContext';

export default function LocationSelectorModal() {
  const { 
    isModalOpen, 
    closeStoreModal, 
    userLocation, 
    detectLocation, 
    setManualLocation,
    isDetectingLocation,
    locationError 
  } = useStore();

  const [inputQuery, setInputQuery] = useState('');

  if (!isModalOpen) return null;

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    setManualLocation(inputQuery.trim());
    setInputQuery('');
  };

  const handleSelectCity = (cityObj) => {
    setManualLocation(cityObj);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeStoreModal}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-[var(--bg-elevated)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden my-auto z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-subtle)]/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center shadow-md shadow-[var(--accent)]/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[var(--text)] tracking-tight">
                    Set Your Location
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                    Currently set to: <strong className="text-[var(--accent)]">{userLocation?.displayName || 'Kolkata, WB'}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={closeStoreModal}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2 Main Options Body */}
          <div className="p-6 space-y-6">
            
            {/* OPTION 1: GPS Auto-Detect */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider block">
                Option 1: Auto Detection
              </span>
              
              <button
                type="button"
                onClick={detectLocation}
                disabled={isDetectingLocation}
                className="w-full p-4 rounded-2xl bg-[var(--accent-subtle)] border-2 border-[var(--accent)]/30 hover:border-[var(--accent)] text-left flex items-center justify-between gap-4 transition-all group cursor-pointer disabled:opacity-60 shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-sm shadow-[var(--accent)]/30 group-hover:scale-105 transition-transform">
                    <Navigation className={`w-5 h-5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <span className="text-sm font-black text-[var(--text)] block">
                      {isDetectingLocation ? 'Detecting your device GPS...' : 'Auto-Detect My Location (GPS)'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-medium">
                      Uses high-accuracy browser geolocation
                    </span>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-[var(--accent)] group-hover:translate-x-1 transition-transform" />
              </button>

              {locationError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{locationError}</span>
                </div>
              )}
            </div>

            {/* DIVIDER */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-[var(--border)] w-full" />
              <span className="bg-[var(--bg-elevated)] px-3 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider absolute">
                OR
              </span>
            </div>

            {/* OPTION 2: Enter Location Manually */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider block">
                Option 2: Enter Location Manually
              </span>

              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Enter city, locality or pincode (e.g. Kolkata, Delhi)..."
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    className="w-full bg-[var(--bg)] border border-[var(--border-strong)] rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputQuery.trim()}
                  className="px-5 py-3 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-black transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm"
                >
                  Set
                </button>
              </form>

              {/* Popular City Quick Chips */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-[var(--text-muted)] block mb-2">
                  Popular Hub Cities:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_CITIES.filter(c => c.popular).map((cityObj) => {
                    const isCurrent = userLocation?.city?.toLowerCase() === cityObj.city.toLowerCase();
                    return (
                      <button
                        key={cityObj.city}
                        type="button"
                        onClick={() => handleSelectCity(cityObj)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isCurrent
                            ? 'bg-[var(--accent)] text-white shadow-xs'
                            : 'bg-[var(--bg)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text)]'
                        }`}
                      >
                        <Building2 className="w-3 h-3 opacity-60" />
                        <span>{cityObj.city}</span>
                        {isCurrent && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

          {/* Footer Note */}
          <div className="p-3.5 border-t border-[var(--border)] bg-[var(--bg-subtle)]/40 text-center">
            <p className="text-[11px] text-[var(--text-muted)] font-medium">
              💡 Equipment catalog and nearest physical hubs will adapt automatically to this location.
            </p>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
