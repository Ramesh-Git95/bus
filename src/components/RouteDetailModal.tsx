import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Bookmark,
  Share2,
  Clock,
  ArrowRightLeft,
  Info,
  Calendar,
  CreditCard,
  MapPin,
  Check,
  Zap,
} from 'lucide-react';
import { BusRoute, Language } from '../types';
import { TRANSLATIONS } from '../data/busData';
import { triggerHaptic } from '../utils/haptics';

interface RouteDetailModalProps {
  route: BusRoute | null;
  onClose: () => void;
  lang: Language;
  isSaved: boolean;
  onToggleSave: (route: BusRoute) => void;
  onSetFocusTargetStop?: (stopName: string) => void;
}

export const RouteDetailModal: React.FC<RouteDetailModalProps> = ({
  route,
  onClose,
  lang,
  isSaved,
  onToggleSave,
  onSetFocusTargetStop,
}) => {
  const [direction, setDirection] = useState<'out' | 'in'>('out');
  const [activeTab, setActiveTab] = useState<'stops' | 'times' | 'fare'>('stops');
  const [copied, setCopied] = useState(false);
  const [selectedStopName, setSelectedStopName] = useState<string | null>(null);

  if (!route) return null;

  const t = TRANSLATIONS[lang];
  const isOutbound = direction === 'out';
  const currentStops = isOutbound
    ? route.stopsOutbound
    : route.stopsInbound.length > 0
    ? route.stopsInbound
    : [...route.stopsOutbound].reverse();

  const currentDepartures = isOutbound
    ? route.departuresOutbound
    : route.departuresInbound.length > 0
    ? route.departuresInbound
    : route.departuresOutbound;

  const handleShare = () => {
    triggerHaptic('success');
    const shareText = `Pāra Route ${route.number}: ${route.name} (${route.distanceKm} km, every ${route.peakHeadway}). Fares from Rs 22.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="route-detail-backdrop"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 pt-6 sm:pt-4 overflow-hidden"
      >
        <motion.div
          id="route-detail-sheet"
          initial={{ y: '100%', opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="bg-[#F2F0ED]/95 backdrop-blur-2xl w-full max-w-lg h-[84vh] max-h-[calc(100%-2.5rem)] sm:h-[82vh] sm:rounded-[36px] rounded-t-[36px] shadow-2xl flex flex-col overflow-hidden border border-white/60 text-[#3C413D]"
        >
          {/* Top Gradient Hero Banner */}
          <div className="bg-[#3C413D] text-white pt-3 px-5 pb-5 rounded-b-[32px] shrink-0 shadow-lg shadow-black/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#7A8B7D] rounded-full blur-3xl opacity-30 pointer-events-none" />

            {/* Top Sheet Drag Pull Indicator */}
            <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-3.5 shrink-0" />

            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between gap-2 mb-3.5 relative z-10">
              <button
                id="close-route-detail-btn"
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  id="share-route-btn"
                  onClick={handleShare}
                  className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 border border-white/15 transition-colors text-white"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#D8E2DC]" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Share'}</span>
                </button>

                <button
                  id="toggle-save-detail-btn"
                  onClick={() => {
                    triggerHaptic('success');
                    onToggleSave(route);
                  }}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isSaved
                      ? 'bg-[#7A8B7D] text-white shadow-md shadow-[#7A8B7D]/20 border border-[#7A8B7D]'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? t.savedRoute : t.saveRoute}</span>
                </button>
              </div>
            </div>

            {/* Route Number and Title */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-2xl px-4 py-2 text-3xl font-bold tracking-tight shadow-sm shrink-0">
                {route.number}
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="text-xl font-semibold tracking-tight leading-tight text-white">
                  {isOutbound ? route.origin : route.destination} → {isOutbound ? route.destination : route.origin}
                </h2>
                <p className="text-xs text-[#D8E2DC] font-medium mt-0.5">
                  {route.distanceKm} km · {currentStops.length} stops · every {route.peakHeadway}
                </p>
              </div>
            </div>

            {/* Direction Selector Switcher */}
            <div className="mt-4 bg-white/10 p-1 rounded-2xl flex items-center gap-1 backdrop-blur-md border border-white/15 relative z-10">
              <button
                id="dir-outbound-btn"
                onClick={() => {
                  triggerHaptic('selection');
                  setDirection('out');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  isOutbound
                    ? 'bg-white/90 text-[#3C413D] shadow-sm font-bold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <span>To {route.destination.split(' ')[0]}</span>
              </button>
              <button
                id="dir-inbound-btn"
                onClick={() => {
                  triggerHaptic('selection');
                  setDirection('in');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  !isOutbound
                    ? 'bg-white/90 text-[#3C413D] shadow-sm font-bold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>To {route.origin.split(' ')[0]}</span>
              </button>
            </div>
          </div>

          {/* Segmented Tab Controls */}
          <div className="px-5 pt-3 pb-2 shrink-0">
            <div className="bg-white/40 backdrop-blur-md p-1 rounded-2xl flex items-center gap-1 border border-white/50">
              <button
                id="tab-stops-btn"
                onClick={() => {
                  triggerHaptic('tab');
                  setActiveTab('stops');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'stops'
                    ? 'bg-white/90 text-[#3C413D] shadow-sm font-bold'
                    : 'text-[#A68A73] hover:text-[#3C413D]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#7A8B7D]" />
                <span>{t.stops}</span>
              </button>

              <button
                id="tab-times-btn"
                onClick={() => {
                  triggerHaptic('tab');
                  setActiveTab('times');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'times'
                    ? 'bg-white/90 text-[#3C413D] shadow-sm font-bold'
                    : 'text-[#A68A73] hover:text-[#3C413D]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-[#7A8B7D]" />
                <span>{t.times}</span>
              </button>

              <button
                id="tab-fare-btn"
                onClick={() => {
                  triggerHaptic('tab');
                  setActiveTab('fare');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === 'fare'
                    ? 'bg-white/90 text-[#3C413D] shadow-sm font-bold'
                    : 'text-[#A68A73] hover:text-[#3C413D]'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-[#7A8B7D]" />
                <span>{t.fare}</span>
              </button>
            </div>
          </div>

          {/* Tab Content Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 no-scrollbar">
            {/* 1. STOPS TAB */}
            {activeTab === 'stops' && (
              <div className="space-y-4">
                <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-4 shadow-sm border border-white/50">
                  <div className="flex items-center justify-between mb-3 px-2 text-xs font-bold uppercase tracking-wider text-[#A68A73]">
                    <span>BUS STOP & TRANSFERS</span>
                    <span>FARE / MIN</span>
                  </div>

                  <div className="relative pl-2">
                    {currentStops.map((stop, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === currentStops.length - 1;
                      const isSelected = selectedStopName === stop.name;

                      return (
                        <div
                          key={`${stop.name}-${idx}`}
                          onClick={() => {
                            triggerHaptic('light');
                            setSelectedStopName(isSelected ? null : stop.name);
                          }}
                          className={`relative flex items-start gap-3.5 py-3 px-2 rounded-2xl cursor-pointer transition-colors ${
                            isSelected ? 'bg-white/70 border border-white/60 shadow-2xs' : 'hover:bg-white/50'
                          }`}
                        >
                          {/* Vertical Transit Line */}
                          <div className="relative flex flex-col items-center shrink-0 w-5">
                            {/* Upper segment */}
                            {!isFirst && (
                              <div className="w-[2px] bg-[#D8E2DC] absolute -top-3 h-6" />
                            )}
                            {/* Lower segment */}
                            {!isLast && (
                              <div className="w-[2px] bg-[#D8E2DC] absolute top-3 h-full" />
                            )}
                            {/* Stop Circle */}
                            <div
                              className={`relative z-10 rounded-full border-2 border-white transition-all ${
                                isFirst || isLast
                                  ? 'w-4 h-4 bg-[#7A8B7D] shadow-sm'
                                  : stop.isStageBoundary
                                  ? 'w-3.5 h-3.5 bg-[#A68A73]'
                                  : 'w-2.5 h-2.5 bg-[#C5BAAF]'
                              }`}
                            />
                          </div>

                          {/* Stop Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <span
                                className={`text-[14px] leading-tight ${
                                  isFirst || isLast
                                  ? 'font-bold text-[#3C413D]'
                                  : stop.isStageBoundary
                                  ? 'font-semibold text-[#3C413D]'
                                  : 'font-medium text-[#3C413D]/80'
                                }`}
                              >
                                {stop.name}
                              </span>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-semibold text-[#7A8B7D]">
                                  {typeof stop.fare === 'number' ? `Rs ${stop.fare}` : stop.fare}
                                </span>
                                <span className="text-[11px] font-medium text-[#A68A73] ml-1.5">
                                  {stop.min}m
                                </span>
                              </div>
                            </div>

                            {/* Connecting route badges */}
                            {stop.connects && stop.connects.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                {stop.connects.map((c, cIdx) => (
                                  <span
                                    key={cIdx}
                                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/70 text-[#3C413D] border border-white/60"
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Expanded Action: Target Stop for Commute Focus Alarm */}
                            {isSelected && onSetFocusTargetStop && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-2.5 pt-2 border-t border-white/40 flex items-center justify-between"
                              >
                                <span className="text-[11px] text-[#7A8B7D] font-semibold">
                                  Set arrival wake-up alert
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    triggerHaptic('success');
                                    onSetFocusTargetStop(stop.name);
                                    alert(`Arrival alarm armed for ${stop.name}. You will be alerted before your stop!`);
                                  }}
                                  className="px-3 py-1 rounded-xl bg-[#7A8B7D] text-white text-[11px] font-semibold flex items-center gap-1 shadow-md shadow-[#7A8B7D]/20"
                                >
                                  <Zap className="w-3 h-3" />
                                  <span>Arm Alert</span>
                                </button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/40 backdrop-blur-md text-xs text-[#A68A73] flex items-start gap-2 border border-white/50">
                  <Info className="w-4 h-4 text-[#7A8B7D] shrink-0 mt-0.5" />
                  <span>
                    Running times are based on normal traffic flow. During peak morning and evening hours on High Level Road & Galle Road, add 15-20 minutes buffer.
                  </span>
                </div>
              </div>
            )}

            {/* 2. TIMETABLE TAB */}
            {activeTab === 'times' && (
              <div className="space-y-4">
                {/* Departures Grid */}
                <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-white/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#A68A73]">
                      Departures from {isOutbound ? route.origin.split(' ')[0] : route.destination.split(' ')[0]}
                    </span>
                    <span className="text-xs font-semibold text-[#7A8B7D] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Next in {route.liveStatus.nextMinutes}m
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {currentDepartures.map((time, idx) => {
                      const isNext = idx === 3;
                      const isPast = idx < 3;
                      return (
                        <div
                          key={idx}
                          className={`py-2.5 px-1 rounded-2xl text-center font-mono text-xs transition-all ${
                            isNext
                              ? 'bg-[#7A8B7D] text-white font-bold shadow-md shadow-[#7A8B7D]/20 scale-105'
                              : isPast
                              ? 'bg-white/20 text-[#A68A73]/70 font-medium'
                              : 'bg-white/60 text-[#3C413D] font-semibold border border-white/60'
                          }`}
                        >
                          {time}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Master Timetable Metadata Cards */}
                <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-4 shadow-sm border border-white/50 space-y-3">
                  <div className="flex items-center justify-between py-1.5 border-b border-white/30 text-xs">
                    <span className="text-[#A68A73] font-medium">{t.firstBus}</span>
                    <span className="font-semibold text-[#3C413D]">{route.firstBus}</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/30 text-xs">
                    <span className="text-[#A68A73] font-medium">{t.lastBus}</span>
                    <span className="font-semibold text-[#3C413D]">{route.lastBus}</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/30 text-xs">
                    <span className="text-[#A68A73] font-medium">{t.peakHeadway}</span>
                    <span className="font-semibold text-[#7A8B7D]">{route.peakHeadway}</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 text-xs">
                    <span className="text-[#A68A73] font-medium">{t.nightService}</span>
                    <span className="font-semibold text-[#3C413D] text-right max-w-[190px]">
                      {route.nightService}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. STAGE FARES TAB */}
            {activeTab === 'fare' && (
              <div className="space-y-4">
                <div className="bg-white/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-sm border border-white/50">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 bg-white/60 p-3 text-[11px] font-bold uppercase tracking-wider text-[#A68A73] border-b border-white/40">
                    <div className="col-span-6">DESTINATION STAGE</div>
                    <div className="col-span-2 text-right text-[#7A8B7D]">REGULAR</div>
                    <div className="col-span-2 text-right text-[#A68A73]">SEMI</div>
                    <div className="col-span-2 text-right text-[#3C413D]">AC</div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-white/30">
                    {route.stageFares.map((f) => (
                      <div key={f.stage} className="grid grid-cols-12 p-3 items-center text-xs">
                        <div className="col-span-6 font-medium text-[#3C413D] truncate pr-2">
                          <span className="text-[#A68A73] font-mono mr-1.5">S{f.stage}</span>
                          {f.to}
                        </div>
                        <div className="col-span-2 text-right font-bold text-[#7A8B7D]">
                          Rs {f.normal}
                        </div>
                        <div className="col-span-2 text-right font-medium text-[#A68A73]">
                          Rs {f.semi}
                        </div>
                        <div className="col-span-2 text-right font-medium text-[#3C413D]">
                          Rs {f.ac}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stage Rules Note */}
                <div className="bg-white/40 backdrop-blur-md rounded-3xl p-4 border border-white/50 text-xs text-[#3C413D] space-y-1.5">
                  <span className="font-semibold block text-sm">Official NTC Fare Rules</span>
                  <p className="leading-relaxed text-[#3C413D]/80">
                    {t.stageInfo}
                  </p>
                  <p className="text-[11px] text-[#A68A73] font-medium pt-1">
                    Minimum stage fare is Rs 22 (Normal). Conductor must issue an official printed electronic ticket upon payment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
