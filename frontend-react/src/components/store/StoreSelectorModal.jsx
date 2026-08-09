import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Navigation, Search, X, Check, Clock, Phone, 
  Building2, Sparkles, ChevronRight, AlertCircle, Compass, CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const CITIES = [
  { id: 'All', label: 'All Cities' },
  { id: 'Kolkata', label: 'Kolkata' },
  { id: 'New Delhi', label: 'New Delhi' },
  { id: 'Mumbai', label: 'Mumbai' },
  { id: 'Bengaluru', label: 'Bengaluru' },
];

export default function StoreSelectorModal() {
  const { 
    isModalOpen, 
    closeStoreModal, 
    allStores, 
    selectedStore, 
    selectStore, 
    detectLocation, 
    isDetectingLocation,
    userCoords,
    locationCity,
    locationError 
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  // Filter and sort stores
  const filteredStores = useMemo(() => {
    let list = [...allStores];

    // City filter
    if (selectedCity !== 'All') {
      list = list.filter(s => s.city.toLowerCase() === selectedCity.toLowerCase());
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.pincode.includes(q) ||
        s.code.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allStores, searchTerm, selectedCity]);

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeStoreModal}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[var(--bg-elevated)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-auto z-10"
        >
          {/* Top Header */}
          <div className="p-5 sm:p-6 border-b border-[var(--border)] bg-[var(--bg-subtle)]/60">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center shadow-md shadow-[var(--accent)]/20 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[var(--text)] tracking-tight">
                    Select Your Pickup Hub
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                    Browse inventory and pick up orders at an authorized store near you.
                  </p>
                </div>
              </div>

              <button
                onClick={closeStoreModal}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Auto-Detect Banner */}
            <div className="mt-4 p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  userCoords ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                }`}>
                  <Compass className={`w-4.5 h-4.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-[var(--text)] flex items-center gap-1.5">
                    {userCoords ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>GPS Location Active</span>
                      </>
                    ) : (
                      'Find Hub Nearest to You'
                    )}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">
                    {userCoords 
                      ? `Sorting stores by precise distance from your device.`
                      : `Allow browser location to auto-rank closest stores.`
                    }
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={detectLocation}
                disabled={isDetectingLocation}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-black shadow-sm shadow-[var(--accent)]/20 transition-all cursor-pointer disabled:opacity-60 shrink-0"
              >
                <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                <span>{isDetectingLocation ? 'Detecting...' : userCoords ? 'Re-detect GPS' : 'Auto-Detect (GPS)'}</span>
              </button>
            </div>

            {locationError && (
              <div className="mt-2.5 flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{locationError}</span>
              </div>
            )}

            {/* Search Input & City Filter Chips */}
            <div className="mt-3.5 space-y-2.5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search city, locality, pincode or store name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl pl-9.5 pr-8 py-2.5 text-xs font-medium text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* City Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CITIES.map(c => {
                  const isCityActive = selectedCity === c.id;
                  const count = c.id === 'All' 
                    ? allStores.length 
                    : allStores.filter(s => s.city.toLowerCase() === c.id.toLowerCase()).length;

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCity(c.id);
                        setSearchTerm('');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        isCityActive
                          ? 'bg-[var(--accent)] text-white shadow-xs'
                          : 'bg-[var(--bg)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text)]'
                      }`}
                    >
                      <span>{c.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isCityActive ? 'bg-white/20 text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stores List */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
            {filteredStores.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <MapPin className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-30" />
                <p className="text-sm font-bold text-[var(--text)]">No stores found in {selectedCity}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Try selecting "All Cities" or checking another search term.
                </p>
              </div>
            ) : (
              filteredStores.map((store, index) => {
                const isSelected = selectedStore?.id === store.id;
                const isNearest = index === 0 && store.distance_km !== null && store.distance_km < 100;

                return (
                  <motion.div
                    key={store.id}
                    layout
                    onClick={() => selectStore(store)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[var(--accent-subtle)] border-[var(--accent)] shadow-xs ring-1 ring-[var(--accent)]/30'
                        : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      
                      {/* Left: Info */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-[var(--text)]">
                            {store.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-muted)] uppercase">
                            {store.code}
                          </span>
                          
                          {/* Distance Badge */}
                          {store.distance_km !== null && store.distance_km !== undefined && (
                            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              isNearest
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            }`}>
                              {isNearest ? '⚡ Nearest • ' : '📍 '}{store.distance_km} km away
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {store.address}, {store.city} – {store.pincode}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border)]/60">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-[var(--accent)]" /> {store.opening_time} – {store.closing_time}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" /> {store.phone}
                          </span>
                        </div>
                      </div>

                      {/* Right: Select Action Pill */}
                      <div className="shrink-0 self-end sm:self-center">
                        {isSelected ? (
                          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-black shadow-xs">
                            <Check className="w-4 h-4 stroke-[3]" /> Selected Hub
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-xs font-bold text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer shadow-2xs"
                          >
                            Select Store <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-3.5 border-t border-[var(--border)] bg-[var(--bg-subtle)]/40 text-center">
            <p className="text-[11px] text-[var(--text-muted)] font-medium">
              🔒 Selected store inventory and pickup verification will apply to your rental orders.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
