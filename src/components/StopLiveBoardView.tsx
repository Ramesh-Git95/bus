import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Radio, Clock, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { BusRoute, Language, StopBoardItem } from '../types';
import { STOP_LIVE_BOARDS, BUS_ROUTES } from '../data/busData';
import { triggerHaptic } from '../utils/haptics';

interface StopLiveBoardViewProps {
  lang: Language;
  onSelectRoute: (route: BusRoute) => void;
}

export const StopLiveBoardView: React.FC<StopLiveBoardViewProps> = ({
  lang,
  onSelectRoute,
}) => {
  const [selectedStopKey, setSelectedStopKey] = useState<string>('nugegoda-0421');
  const [boardItems, setBoardItems] = useState<StopBoardItem[]>(STOP_LIVE_BOARDS['nugegoda-0421']);

  const stopsList = [
    { key: 'nugegoda-0421', name: 'Nugegoda Junction', code: 'Stop 0421', desc: '11 routes · towards Colombo / Maharagama' },
    { key: 'pettah-0001', name: 'Pettah Central Stand', code: 'Stop 0001', desc: 'Islandwide main terminal · Bastian Mawatha' },
    { key: 'kottawa-0450', name: 'Kottawa MMC Hub', code: 'Stop 0450', desc: 'Expressway & High Level interchange' },
  ];

  // Dynamic countdown simulation
  useEffect(() => {
    const raw = STOP_LIVE_BOARDS[selectedStopKey] || STOP_LIVE_BOARDS['nugegoda-0421'];
    setBoardItems(raw);

    const interval = setInterval(() => {
      setBoardItems((prev) =>
        prev.map((item) => {
          if (item.dueMinutes > 1) {
            return { ...item, dueMinutes: item.dueMinutes, dueTime: `${item.dueMinutes} min` };
          }
          return { ...item, dueTime: 'Due now' };
        })
      );
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedStopKey]);

  const getCrowdColor = (crowd: string) => {
    switch (crowd) {
      case 'Seats':
        return 'text-[#00695f] bg-[#dce9e7]';
      case 'Busy':
        return 'text-[#eb7400] bg-[#fff3d6]';
      case 'Standing':
        return 'text-[#b35900] bg-[#ffe6cc]';
      case 'Full':
        return 'text-[#b3122f] bg-[#f9e3e6]';
      default:
        return 'text-[#7d7469] bg-[#f4eee5]';
    }
  };

  return (
    <div id="stop-live-board-view" className="space-y-4 pb-24 max-w-md mx-auto">
      {/* Top Banner with Stop Selector */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-5 shadow-sm border border-white/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7A8B7D] animate-ping" />
            <span className="text-xs font-bold text-[#A68A73] uppercase tracking-widest">
              Live Stop Departure Board
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#7A8B7D] flex items-center gap-1 bg-white/70 px-2.5 py-0.5 rounded-full border border-white/60">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7A8B7D]" />
            NTC Verified
          </span>
        </div>

        {/* Stop Selector Pills */}
        <div className="grid grid-cols-3 gap-1.5 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/50">
          {stopsList.map((stop) => {
            const isSelected = selectedStopKey === stop.key;
            return (
              <button
                key={stop.key}
                id={`stop-selector-${stop.key}`}
                onClick={() => {
                  triggerHaptic('tab');
                  setSelectedStopKey(stop.key);
                }}
                className={`py-2 px-1.5 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-white/90 text-[#3C413D] font-bold shadow-sm'
                    : 'text-[#A68A73] hover:text-[#3C413D] font-semibold text-xs'
                }`}
              >
                <span className="block text-xs truncate">{stop.name.split(' ')[0]}</span>
                <span className={`text-[10px] block opacity-80 ${isSelected ? 'text-[#7A8B7D]' : 'text-[#A68A73]'}`}>
                  {stop.code}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Stop Header Info */}
        {(() => {
          const cur = stopsList.find((s) => s.key === selectedStopKey);
          return (
            <div className="bg-[#3C413D] text-white p-4 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden">
              <div className="space-y-0.5 relative z-10">
                <div className="text-sm font-bold flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-[#D8E2DC]" />
                  {cur?.name}
                </div>
                <div className="text-[11px] text-[#D8E2DC]/80 font-medium">
                  {cur?.desc}
                </div>
              </div>
              <div className="text-right relative z-10">
                <span className="text-xs font-mono font-semibold bg-white/15 px-2.5 py-1 rounded-lg text-white border border-white/20">
                  {cur?.code}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Board List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#A68A73]">
            Approaching Departures
          </span>
          <span className="text-xs text-[#7A8B7D] font-semibold">
            Real-time Headway
          </span>
        </div>

        {boardItems.map((item, idx) => {
          const matchedRoute = BUS_ROUTES.find((r) => r.id === item.routeId) || BUS_ROUTES[0];
          const destName = lang === 'si' ? item.destSi : lang === 'ta' ? item.destTa : item.dest;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => {
                triggerHaptic('selection');
                onSelectRoute(matchedRoute);
              }}
              className="bg-white/40 backdrop-blur-xl rounded-[24px] p-3.5 shadow-sm hover:bg-white/60 border border-white/50 flex items-center justify-between gap-3 cursor-pointer transition-all group"
            >
              {/* Route Badge & Dest */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-10 rounded-xl bg-[#7A8B7D] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                  {item.routeNo}
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm text-[#3C413D] truncate leading-tight group-hover:text-[#7A8B7D] transition-colors">
                    {destName}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {item.platform && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-white/70 text-[#3C413D] border border-white/50">
                        {item.platform}
                      </span>
                    )}
                    <span className="text-[11px] text-[#A68A73] font-medium truncate">
                      {matchedRoute.corridor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time Countdown & Crowd */}
              <div className="flex flex-col items-end shrink-0">
                <span className="text-sm font-bold text-[#7A8B7D] flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                  {item.dueTime}
                </span>

                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 flex items-center gap-1 bg-[#E9E0D2] text-[#3C413D] border border-white/40">
                  <Users className="w-2.5 h-2.5" />
                  {item.crowd}
                </span>
              </div>

              <ArrowRight className="w-4 h-4 text-[#A68A73] group-hover:text-[#3C413D] group-hover:translate-x-0.5 transition-all shrink-0" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
