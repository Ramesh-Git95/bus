import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Compass,
  MapPin,
  Moon,
  CreditCard,
  Radio,
  Sparkles,
} from 'lucide-react';
import { BusRoute, Language, SavedCommute } from './types';
import { BUS_ROUTES, TRANSLATIONS } from './data/busData';
import { triggerHaptic } from './utils/haptics';
import { Header } from './components/Header';
import { GlassNavBar } from './components/GlassNavBar';
import { RouteCard } from './components/RouteCard';
import { RouteDetailModal } from './components/RouteDetailModal';
import { TripPlannerView } from './components/TripPlannerView';
import { CorridorMapView } from './components/CorridorMapView';
import { StopLiveBoardView } from './components/StopLiveBoardView';
import { SavedAndAlertsView } from './components/SavedAndAlertsView';
import { FocusCommuteModal } from './components/FocusCommuteModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // State
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'routes' | 'plan' | 'map' | 'saved' | 'stops'>('routes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [isFocusOpen, setIsFocusOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [focusTargetStop, setFocusTargetStop] = useState<string>('Homagama');
  const [isOnlineMode, setIsOnlineMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('para_online_mode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Dynamic Bus Routes state that updates with live telematics in Online Mode
  const [liveRoutes, setLiveRoutes] = useState<BusRoute[]>(BUS_ROUTES);

  // Toggle online mode handler
  const handleToggleOnlineMode = () => {
    setIsOnlineMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('para_online_mode', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Live telematics simulation when in Online mode
  useEffect(() => {
    if (!isOnlineMode) return;

    const interval = setInterval(() => {
      setLiveRoutes((prev) =>
        prev.map((route) => {
          // Dynamic jitter to ETA minutes (1 to 12 min)
          const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
          const nextMins = Math.max(1, Math.min(15, route.liveStatus.nextMinutes + delta));
          const crowds: ('Seats' | 'Busy' | 'Standing' | 'Full')[] = ['Seats', 'Busy', 'Standing', 'Full'];
          const randomCrowd = crowds[Math.floor(Math.random() * crowds.length)];
          const newSpeed = Math.floor(22 + Math.random() * 18);

          return {
            ...route,
            liveStatus: {
              ...route.liveStatus,
              nextMinutes: nextMins,
              crowd: Math.random() > 0.6 ? randomCrowd : route.liveStatus.crowd,
              speedKmh: newSpeed,
            },
          };
        })
      );
    }, 12000);

    return () => clearInterval(interval);
  }, [isOnlineMode]);

  // Saved Commutes State (with LocalStorage)
  const [savedCommutes, setSavedCommutes] = useState<SavedCommute[]>(() => {
    try {
      const saved = localStorage.getItem('para_saved_commutes');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Initial defaults
    return [
      {
        id: 'sc-138',
        title: 'Pettah — Homagama',
        customTag: 'Home to Work',
        routeId: '138-homagama',
        routeNo: '138',
        origin: 'Pettah Central',
        destination: 'Homagama Town',
        direction: 'out',
        createdAt: Date.now(),
      },
      {
        id: 'sc-1',
        title: 'Colombo — Kandy',
        customTag: 'Weekend Route',
        routeId: '1-kandy',
        routeNo: '1',
        origin: 'Colombo Bastian Mawatha',
        destination: 'Kandy Goodshed',
        direction: 'out',
        createdAt: Date.now(),
      },
    ];
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('para_saved_commutes', JSON.stringify(savedCommutes));
    } catch {}
  }, [savedCommutes]);

  const t = TRANSLATIONS[lang];

  // Filtered bus routes
  const filteredRoutes = useMemo(() => {
    let list = isOnlineMode ? liveRoutes : BUS_ROUTES;

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.number.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.origin.toLowerCase().includes(q) ||
          r.destination.toLowerCase().includes(q) ||
          r.via.toLowerCase().includes(q) ||
          r.corridor.toLowerCase().includes(q) ||
          (r.nameSi && r.nameSi.toLowerCase().includes(q)) ||
          (r.nameTa && r.nameTa.toLowerCase().includes(q))
      );
    }

    // 2. Filter Tab
    if (filterType === 'AC') {
      list = list.filter((r) => r.type === 'AC');
    } else if (filterType === 'Semi') {
      list = list.filter((r) => r.type === 'SEMI-LUX');
    } else if (filterType === 'SLTB') {
      list = list.filter((r) => r.type === 'SLTB');
    } else if (filterType === 'Night') {
      list = list.filter((r) => r.isNightRoute);
    } else if (filterType === 'Express') {
      list = list.filter((r) => r.type === 'EXPRESSWAY' || r.type === 'AC');
    }

    return list;
  }, [searchQuery, filterType, isOnlineMode, liveRoutes]);

  // Saved toggle helper
  const handleToggleSave = (route: BusRoute) => {
    const exists = savedCommutes.some((c) => c.routeId === route.id);
    if (exists) {
      setSavedCommutes((prev) => prev.filter((c) => c.routeId !== route.id));
    } else {
      const newCommute: SavedCommute = {
        id: `sc-${Date.now()}`,
        title: route.name,
        customTag: 'Daily Commute',
        routeId: route.id,
        routeNo: route.number,
        origin: route.origin,
        destination: route.destination,
        direction: 'out',
        createdAt: Date.now(),
      };
      setSavedCommutes((prev) => [newCommute, ...prev]);
    }
  };

  const isRouteSaved = (routeId: string) => {
    return savedCommutes.some((c) => c.routeId === routeId);
  };

  const handleSelectRouteNumber = (no: string) => {
    const found = (isOnlineMode ? liveRoutes : BUS_ROUTES).find((r) => r.number === no || r.number.startsWith(no));
    if (found) {
      setSelectedRoute(found);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F0ED] text-[#3C413D] flex flex-col items-center justify-start p-0 sm:py-6 relative overflow-x-hidden selection:bg-[#D8E2DC] selection:text-[#3C413D]">
      {/* Diffuse Ambient Blurs from Frosted Glass Design */}
      <div className="fixed top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#D8E2DC] rounded-full blur-[120px] opacity-70 pointer-events-none z-0" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#E9E0D2] rounded-full blur-[120px] opacity-70 pointer-events-none z-0" />

      {/* Outer Mobile Frame Container for Desktop/Tablet Elegance */}
      <div className="w-full max-w-md bg-white/30 backdrop-blur-2xl sm:rounded-[40px] min-h-screen sm:min-h-[860px] sm:max-h-[920px] shadow-2xl shadow-black/5 border-0 sm:border sm:border-white/60 flex flex-col overflow-hidden relative z-10">
        {/* Sticky Header */}
        <Header
          currentLang={lang}
          onLanguageChange={(l) => setLang(l)}
          onOpenFocus={() => setIsFocusOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isFocusActive={isFocusOpen}
          isOnlineMode={isOnlineMode}
          onToggleOnlineMode={handleToggleOnlineMode}
        />

        {/* Main Content Area (Scrollable) */}
        <main id="main-content" className="flex-1 overflow-y-auto px-4 pt-3 pb-24 no-scrollbar">
          <AnimatePresence mode="wait">
            {/* VIEW 1: ROUTES (EXPLORE / HOME) */}
            {activeTab === 'routes' && (
              <motion.div
                key="routes-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Greeting & Search Card */}
                <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-5 shadow-sm border border-white/50 space-y-4 relative overflow-hidden">
                  <div>
                    <h1 className="text-2xl font-light tracking-tight text-[#3C413D] leading-snug">
                      {t.greeting.split(' ')[0]} <span className="font-semibold">{t.greeting.split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="text-[#A68A73] text-xs font-semibold uppercase tracking-widest mt-1">
                      {t.subGreeting}
                    </p>
                  </div>

                  {/* Search Input with Tactile Action */}
                  <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-2xl p-1.5 pl-3.5 border border-white/60 focus-within:border-[#7A8B7D] focus-within:bg-white/80 transition-all shadow-xs">
                    <Search className="w-4 h-4 text-[#A68A73] shrink-0" />
                    <input
                      id="transit-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="w-full bg-transparent text-sm font-medium text-[#3C413D] placeholder:text-[#A68A73]/70 outline-none py-2"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          setSearchQuery('');
                        }}
                        className="p-1.5 rounded-full hover:bg-black/5 text-[#A68A73]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => triggerHaptic('selection')}
                      className="px-4 py-2 rounded-xl bg-[#7A8B7D] hover:bg-[#68786b] text-white font-medium text-xs shadow-lg shadow-[#7A8B7D]/20 active:scale-95 transition-all shrink-0"
                    >
                      {t.go}
                    </button>
                  </div>

                  {/* Quick Route Shortcut Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                    {['138', '100', '187 Airport', '1 Kandy', 'EX1 Matara', '122'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          triggerHaptic('light');
                          setSearchQuery(tag.split(' ')[0]);
                        }}
                        className="px-3 py-1.5 rounded-full bg-white/50 hover:bg-white/80 text-[#3C413D] text-xs font-semibold shrink-0 transition-colors border border-white/60 shadow-2xs"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4 Interactive Feature Action Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Card 1: Planner */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      triggerHaptic('tab');
                      setActiveTab('plan');
                    }}
                    className="p-4 rounded-[28px] bg-white/40 backdrop-blur-xl border border-white/50 text-left flex flex-col justify-between gap-3 shadow-sm hover:bg-white/60 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#7A8B7D] text-white flex items-center justify-center shadow-md shadow-[#7A8B7D]/20">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-[#3C413D] block leading-tight">
                        {t.planTitle}
                      </span>
                      <span className="text-[11px] font-medium text-[#A68A73] block mt-0.5 uppercase tracking-wide">
                        {t.planSub}
                      </span>
                    </div>
                  </motion.button>

                  {/* Card 2: Live Corridor Map */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      triggerHaptic('tab');
                      setActiveTab('map');
                    }}
                    className="p-4 rounded-[28px] bg-white/40 backdrop-blur-xl border border-white/50 text-left flex flex-col justify-between gap-3 shadow-sm hover:bg-white/60 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#3C413D] text-white flex items-center justify-center shadow-md shadow-[#3C413D]/20">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-[#3C413D] block leading-tight">
                        {t.mapTitle}
                      </span>
                      <span className="text-[11px] font-medium text-[#A68A73] block mt-0.5 uppercase tracking-wide">
                        {t.mapSub}
                      </span>
                    </div>
                  </motion.button>

                  {/* Card 3: Night Owl Buses */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      triggerHaptic('selection');
                      setFilterType(filterType === 'Night' ? 'All' : 'Night');
                    }}
                    className={`p-4 rounded-[28px] border text-left flex flex-col justify-between gap-3 transition-all ${
                      filterType === 'Night'
                        ? 'bg-[#3C413D] text-white border-white/40 shadow-xl shadow-[#3C413D]/25 ring-2 ring-[#7A8B7D]'
                        : 'bg-[#3C413D] text-white border-white/20 shadow-lg shadow-[#3C413D]/15'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-xs backdrop-blur-sm">
                      <Moon className="w-4 h-4 text-[#D8E2DC]" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-white block leading-tight">
                        {t.nightTitle}
                      </span>
                      <span className="text-[11px] font-medium text-[#D8E2DC] block mt-0.5 uppercase tracking-wide">
                        {t.nightSub}
                      </span>
                    </div>
                  </motion.button>

                  {/* Card 4: Fares Stage by Stage */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      triggerHaptic('selection');
                      setSelectedRoute(BUS_ROUTES[0]);
                    }}
                    className="p-4 rounded-[28px] bg-[#7A8B7D] text-white text-left flex flex-col justify-between gap-3 shadow-xl shadow-[#7A8B7D]/20 hover:bg-[#6e7f71] transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-xs backdrop-blur-sm">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-white block leading-tight">
                        {t.fareTitle}
                      </span>
                      <span className="text-[11px] font-medium text-[#D8E2DC] block mt-0.5 uppercase tracking-wide">
                        {t.fareSub}
                      </span>
                    </div>
                  </motion.button>
                </div>

                {/* Filter Pills Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {[
                    { id: 'All', label: t.filterAll },
                    { id: 'AC', label: t.filterAC },
                    { id: 'Semi', label: t.filterSemi },
                    { id: 'SLTB', label: t.filterSLTB },
                    { id: 'Night', label: t.filterNight },
                    { id: 'Express', label: t.filterExpress },
                  ].map((f) => {
                    const isSelected = filterType === f.id;
                    return (
                      <button
                        key={f.id}
                        id={`filter-pill-${f.id}`}
                        onClick={() => {
                          triggerHaptic('tab');
                          setFilterType(f.id);
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide shrink-0 transition-all border ${
                          isSelected
                            ? 'bg-[#3C413D] text-white border-[#3C413D] shadow-sm'
                            : 'bg-white/40 backdrop-blur-md text-[#A68A73] hover:text-[#3C413D] hover:bg-white/70 border-white/50'
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>

                {/* Bus Routes List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#A68A73]">
                      {searchQuery ? `Results (${filteredRoutes.length})` : t.recent}
                    </span>
                    <span className="text-xs font-semibold text-[#7A8B7D]">
                      {filteredRoutes.length} Routes
                    </span>
                  </div>

                  {filteredRoutes.length === 0 ? (
                    <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-8 text-center space-y-2 border border-white/50 shadow-sm">
                      <p className="font-semibold text-sm text-[#3C413D]">
                        No matching bus route found for &quot;{searchQuery}&quot;
                      </p>
                      <p className="text-xs text-[#A68A73]">
                        Try searching for 138, 100, Kottawa, Kandy, Airport, or Dehiwala.
                      </p>
                    </div>
                  ) : (
                    filteredRoutes.map((r) => (
                      <RouteCard
                        key={r.id}
                        route={r}
                        lang={lang}
                        onSelectRoute={(route) => setSelectedRoute(route)}
                        isSaved={isRouteSaved(r.id)}
                        onToggleSave={(route) => handleToggleSave(route)}
                      />
                    ))
                  )}
                </div>

                {/* Nearby Bus Stops Showcase */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#A68A73]">
                      {t.nearby}
                    </span>
                    <button
                      onClick={() => {
                        triggerHaptic('tab');
                        setActiveTab('stops');
                      }}
                      className="text-xs font-semibold text-[#7A8B7D] hover:underline"
                    >
                      Live Board →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { name: 'Nugegoda Supermarket / Junction', dist: '120 m', routes: ['138', '155', '176', '+8'] },
                      { name: 'Delkanda High Level Rd', dist: '450 m', routes: ['138', '122', '118'] },
                      { name: 'Kirulapone Bridge', dist: '850 m', routes: ['138', '141', '176'] },
                    ].map((stop, idx) => (
                      <motion.div
                        key={idx}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          triggerHaptic('selection');
                          setActiveTab('stops');
                        }}
                        className="glass-card rounded-[24px] p-3.5 shadow-sm hover:bg-white/60 border border-white/50 flex items-center justify-between gap-3 cursor-pointer transition-all"
                      >
                        <div className="space-y-0.5">
                          <span className="text-sm font-medium text-[#3C413D] block">
                            {stop.name}
                          </span>
                          <span className="text-xs text-[#A68A73]">
                            {stop.dist} · Frequent corridor
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {stop.routes.map((rt, rIdx) => (
                            <span
                              key={rIdx}
                              className="px-2 py-0.5 rounded-lg bg-white/70 text-[#3C413D] font-bold text-[11px] border border-white/60"
                            >
                              {rt}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="p-3.5 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 text-center text-[11px] text-[#A68A73] font-medium leading-relaxed">
                  {t.disclaimer}
                </div>
              </motion.div>
            )}

            {/* VIEW 2: TRIP PLANNER */}
            {activeTab === 'plan' && (
              <motion.div
                key="plan-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TripPlannerView
                  lang={lang}
                  onSelectRouteNumber={handleSelectRouteNumber}
                />
              </motion.div>
            )}

            {/* VIEW 3: LIVE STOPS BOARD */}
            {activeTab === 'stops' && (
              <motion.div
                key="stops-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <StopLiveBoardView
                  lang={lang}
                  onSelectRoute={(route) => setSelectedRoute(route)}
                />
              </motion.div>
            )}

            {/* VIEW 4: CORRIDOR MAP & SIMULATOR */}
            {activeTab === 'map' && (
              <motion.div
                key="map-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CorridorMapView
                  lang={lang}
                  onSelectRouteId={(id) => {
                    const r = BUS_ROUTES.find((b) => b.id === id);
                    if (r) setSelectedRoute(r);
                  }}
                />
              </motion.div>
            )}

            {/* VIEW 5: SAVED & SERVICE ALERTS */}
            {activeTab === 'saved' && (
              <motion.div
                key="saved-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SavedAndAlertsView
                  lang={lang}
                  savedCommutes={savedCommutes}
                  onRemoveCommute={(id) => {
                    setSavedCommutes((prev) => prev.filter((c) => c.id !== id));
                  }}
                  onSelectRoute={(route) => setSelectedRoute(route)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Floating Glassmorphic Navigation Bar */}
        <GlassNavBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          lang={lang}
          savedCount={savedCommutes.length}
        />

        {/* Full Route Details Modal Sheet */}
        {selectedRoute && (
          <RouteDetailModal
            route={selectedRoute}
            onClose={() => setSelectedRoute(null)}
            lang={lang}
            isSaved={isRouteSaved(selectedRoute.id)}
            onToggleSave={handleToggleSave}
            onSetFocusTargetStop={(stop) => {
              setFocusTargetStop(stop);
              setIsFocusOpen(true);
            }}
          />
        )}

        {/* Focus Commute Companion Modal */}
        <FocusCommuteModal
          isOpen={isFocusOpen}
          onClose={() => setIsFocusOpen(false)}
          targetStopName={focusTargetStop}
        />

        {/* Settings & Tactile Preferences Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          lang={lang}
          onLanguageChange={(l) => setLang(l)}
          isOnlineMode={isOnlineMode}
          onToggleOnlineMode={handleToggleOnlineMode}
        />
      </div>
    </div>
  );
}
