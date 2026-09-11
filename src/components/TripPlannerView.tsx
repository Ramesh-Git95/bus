import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpDown, Footprints, Bus, CheckCircle2 } from 'lucide-react';
import { Language, TripPlan } from '../types';
import { TRIP_PLANS_PRESETS } from '../data/busData';
import { triggerHaptic } from '../utils/haptics';

interface TripPlannerViewProps {
  lang: Language;
  onSelectRouteNumber?: (routeNo: string) => void;
}

export const TripPlannerView: React.FC<TripPlannerViewProps> = ({
  onSelectRouteNumber,
}) => {
  const [origin, setOrigin] = useState<string>('Dehiwala Junction');
  const [destination, setDestination] = useState<string>('Kottawa Central');

  const locationPresets = [
    'Dehiwala Junction',
    'Kottawa Central',
    'Pettah Fort Station',
    'Nugegoda High Level',
    'Bandaranaike Airport BIA',
    'Kandy Goodshed',
    'Maharagama Clock Tower',
    'Panadura Bus Stand',
  ];

  const handleSwap = () => {
    triggerHaptic('switch');
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Filter or return trip plans
  const plans: TripPlan[] = TRIP_PLANS_PRESETS;

  return (
    <div id="trip-planner-view" className="space-y-4 pb-24 max-w-md mx-auto">
      {/* Origin & Destination Card */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-5 shadow-sm border border-white/50 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#A68A73] uppercase tracking-widest">
            Transit Trip Planner
          </span>
          <span className="text-[11px] font-semibold text-[#7A8B7D] bg-white/70 px-2.5 py-0.5 rounded-full border border-white/60">
            Offline Engine
          </span>
        </div>

        {/* Input Inputs with Swap */}
        <div className="relative space-y-2.5">
          {/* Origin */}
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md rounded-2xl p-3.5 border border-white/60">
            <div className="w-3 h-3 rounded-full bg-[#7A8B7D] shrink-0 ring-4 ring-[#7A8B7D]/20" />
            <select
              value={origin}
              onChange={(e) => {
                triggerHaptic('selection');
                setOrigin(e.target.value);
              }}
              className="bg-transparent text-sm font-semibold text-[#3C413D] w-full outline-none cursor-pointer"
            >
              {locationPresets.map((loc) => (
                <option key={loc} value={loc} className="text-black bg-white">
                  From: {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button Absolute */}
          <button
            id="swap-locations-btn"
            onClick={handleSwap}
            className="absolute right-4 top-[40px] z-10 w-8 h-8 rounded-full bg-white text-[#3C413D] border border-white/80 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            title="Swap Origin & Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#7A8B7D]" />
          </button>

          {/* Destination */}
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md rounded-2xl p-3.5 border border-white/60">
            <div className="w-3 h-3 rounded-sm bg-[#3C413D] shrink-0 ring-4 ring-[#3C413D]/20" />
            <select
              value={destination}
              onChange={(e) => {
                triggerHaptic('selection');
                setDestination(e.target.value);
              }}
              className="bg-transparent text-sm font-semibold text-[#3C413D] w-full outline-none cursor-pointer"
            >
              {locationPresets.map((loc) => (
                <option key={loc} value={loc} className="text-black bg-white">
                  To: {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Origin Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-semibold text-[#A68A73] shrink-0">Popular:</span>
          {['Dehiwala → Kottawa', 'Fort → Airport', 'Pettah → Kandy'].map((pair) => {
            const [from, to] = pair.split(' → ');
            return (
              <button
                key={pair}
                onClick={() => {
                  triggerHaptic('light');
                  setOrigin(locationPresets.find((l) => l.includes(from)) || origin);
                  setDestination(locationPresets.find((l) => l.includes(to)) || destination);
                }}
                className="px-3 py-1.5 rounded-full bg-white/50 hover:bg-white/80 text-[#3C413D] text-[11px] font-semibold shrink-0 transition-colors border border-white/60 shadow-2xs"
              >
                {pair}
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested Itineraries */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#A68A73]">
            Available Routes ({plans.length})
          </span>
          <span className="text-xs text-[#7A8B7D] font-semibold">Sorted by efficiency</span>
        </div>

        {plans.map((plan) => {
          const isFastest = plan.badgeType === 'fast';
          const isDirect = plan.badgeType === 'direct';
          const isExpress = plan.badgeType === 'express';

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/40 backdrop-blur-xl rounded-[28px] p-5 shadow-sm border border-white/50 space-y-4"
            >
              {/* Plan Header */}
              <div className="flex items-start justify-between gap-2 border-b border-white/40 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#3C413D] tracking-tight">
                      {plan.totalTimeMin} min
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/50 ${
                        isFastest
                          ? 'bg-[#D8E2DC] text-[#3C413D]'
                          : isDirect
                          ? 'bg-[#E9E0D2] text-[#3C413D]'
                          : isExpress
                          ? 'bg-white/80 text-[#3C413D]'
                          : 'bg-white/70 text-[#A68A73]'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>

                  <span className="text-xs font-medium text-[#A68A73] block">
                    {plan.transferCount === 0 ? 'No transfers needed' : `${plan.transferCount} connection transfer`}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-lg font-bold text-[#7A8B7D]">
                    Rs {plan.totalFare}
                  </span>
                  <span className="text-[10px] font-semibold text-[#A68A73] block uppercase tracking-wider">
                    Total Fare
                  </span>
                </div>
              </div>

              {/* Step by Step Timeline */}
              <div className="space-y-3 pl-1">
                {plan.steps.map((step, sIdx) => {
                  const isBus = step.type === 'BUS';

                  return (
                    <div key={sIdx} className="flex items-start gap-3 relative">
                      {/* Step Icon */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                          isBus
                            ? 'bg-[#7A8B7D] text-white shadow-[#7A8B7D]/20'
                            : 'bg-[#3C413D] text-white'
                        }`}
                      >
                        {isBus ? <Bus className="w-4 h-4" /> : <Footprints className="w-4 h-4" />}
                      </div>

                      {/* Step Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {step.routeNo && (
                            <button
                              onClick={() => {
                                if (onSelectRouteNumber && step.routeNo) {
                                  triggerHaptic('light');
                                  onSelectRouteNumber(step.routeNo.split(' ')[0]);
                                }
                              }}
                              className="px-2 py-0.5 rounded-lg bg-white/80 text-[#3C413D] font-bold text-xs hover:bg-white transition-colors border border-white/60"
                            >
                              Route {step.routeNo}
                            </button>
                          )}
                          <span className="text-xs font-semibold text-[#3C413D] truncate">
                            {step.title}
                          </span>
                        </div>

                        <p className="text-xs text-[#A68A73] font-medium mt-0.5">
                          {step.meta}
                        </p>
                      </div>

                      {/* Step Duration */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-semibold text-[#3C413D]">
                          {step.timeMin}m
                        </span>
                        {step.fare && (
                          <span className="text-[11px] font-semibold text-[#7A8B7D] block">
                            Rs {step.fare}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-white/40 flex items-center justify-between text-xs font-semibold text-[#7A8B7D]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Calculated using verified headway intervals
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
