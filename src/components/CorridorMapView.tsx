import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Bus, Info, CheckCircle, Radio } from 'lucide-react';
import { Language } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface CorridorMapViewProps {
  lang: Language;
  onSelectRouteId?: (routeId: string) => void;
}

export const CorridorMapView: React.FC<CorridorMapViewProps> = ({
  onSelectRouteId,
}) => {
  const [activeCorridor, setActiveCorridor] = useState<'highlevel' | 'gallerd' | 'expressway'>('highlevel');
  const [selectedStop, setSelectedStop] = useState<string | null>('Nugegoda');
  const [busProgress, setBusProgress] = useState(38); // 0 to 100%

  // Animate simulated vehicle along corridor
  useEffect(() => {
    const timer = setInterval(() => {
      setBusProgress((prev) => (prev >= 96 ? 4 : prev + 1.2));
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const corridorData = {
    highlevel: {
      name: 'High Level Road Corridor (A4)',
      meta: '28.4 km · Pettah Central to Homagama',
      activeBuses: 24,
      gpsCoverage: 'Simulated headway (NTC Master Schedule)',
      stops: [
        { name: 'Pettah Central', stage: 'S0', km: 0, x: 30, y: 40, connects: 'Rail + Coastal' },
        { name: 'Town Hall', stage: 'S2', km: 4.2, x: 75, y: 70, connects: '155, 176' },
        { name: 'Thummulla', stage: 'S3', km: 6.8, x: 120, y: 110, connects: '120, 154' },
        { name: 'Nugegoda', stage: 'S5', km: 11.5, x: 175, y: 160, connects: '119, 155, 176' },
        { name: 'Maharagama', stage: 'S7', km: 16.2, x: 235, y: 210, connects: '119, 122' },
        { name: 'Kottawa', stage: 'S9', km: 21.0, x: 295, y: 250, connects: '128, MMC' },
        { name: 'Makumbura MMC', stage: 'S10', km: 23.5, x: 330, y: 275, connects: 'E01 Expressway' },
        { name: 'Homagama', stage: 'S12', km: 28.4, x: 370, y: 305, connects: '128, 697' },
      ],
    },
    gallerd: {
      name: 'Galle Road Coastal Corridor (A2)',
      meta: '27.2 km · Fort to Panadura Bus Stand',
      activeBuses: 32,
      gpsCoverage: 'Live GPS active on 100/101 fleet',
      stops: [
        { name: 'Colombo Fort', stage: 'S0', km: 0, x: 40, y: 35, connects: 'Central' },
        { name: 'Galle Face', stage: 'S1', km: 2.1, x: 85, y: 70, connects: '100' },
        { name: 'Kollupitiya', stage: 'S2', km: 4.5, x: 130, y: 115, connects: '177' },
        { name: 'Bambalapitiya', stage: 'S3', km: 7.0, x: 180, y: 160, connects: '154' },
        { name: 'Dehiwala', stage: 'S4', km: 11.8, x: 240, y: 210, connects: '155, 176' },
        { name: 'Mount Lavinia', stage: 'S5', km: 14.5, x: 290, y: 245, connects: '100' },
        { name: 'Moratuwa', stage: 'S6', km: 20.2, x: 335, y: 280, connects: 'Train' },
        { name: 'Panadura Stand', stage: 'S7', km: 27.2, x: 370, y: 310, connects: 'South Link' },
      ],
    },
    expressway: {
      name: 'Southern & Airport Expressways (E01/E03)',
      meta: '142 km · Makumbura MMC to Matara / Airport',
      activeBuses: 18,
      gpsCoverage: 'Full Real-time Telemetry Active',
      stops: [
        { name: 'Colombo Fort (E03)', stage: 'S0', km: 0, x: 40, y: 50, connects: 'Airport 187' },
        { name: 'Airport BIA Gate', stage: 'S2', km: 33.5, x: 120, y: 50, connects: 'Flights' },
        { name: 'Makumbura MMC (E01)', stage: 'S0', km: 0, x: 180, y: 180, connects: 'EX1 Hub' },
        { name: 'Dodangoda Exit', stage: 'S1', km: 45.0, x: 240, y: 220, connects: 'Kalutara' },
        { name: 'Kurundugaha Exit', stage: 'S2', km: 78.0, x: 290, y: 250, connects: 'Elpitiya' },
        { name: 'Galle Pinnaduwa', stage: 'S3', km: 114.0, x: 330, y: 280, connects: 'Galle City' },
        { name: 'Matara Godagama', stage: 'S4', km: 142.0, x: 375, y: 310, connects: 'Matara Stand' },
      ],
    },
  };

  const current = corridorData[activeCorridor];

  return (
    <div id="corridor-map-view" className="space-y-4 pb-24 max-w-md mx-auto">
      {/* Corridor Switcher Bar */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-5 shadow-sm border border-white/50 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#A68A73] uppercase tracking-widest flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#7A8B7D]" />
            Transit Corridor Visualizer
          </span>
          <span className="text-[11px] font-semibold text-[#7A8B7D] bg-white/70 px-2.5 py-0.5 rounded-full border border-white/60 flex items-center gap-1.5">
            <Radio className="w-2.5 h-2.5 animate-pulse text-[#7A8B7D]" />
            Live Grid
          </span>
        </div>

        {/* 3 Corridor Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-white/40 backdrop-blur-md p-1 rounded-2xl border border-white/50">
          <button
            onClick={() => {
              triggerHaptic('tab');
              setActiveCorridor('highlevel');
              setSelectedStop('Nugegoda');
            }}
            className={`py-2 px-1 text-xs font-semibold rounded-xl transition-all ${
              activeCorridor === 'highlevel'
                ? 'bg-white/90 text-[#3C413D] shadow-sm font-bold'
                : 'text-[#A68A73] hover:text-[#3C413D]'
            }`}
          >
            High Level
          </button>
          <button
            onClick={() => {
              triggerHaptic('tab');
              setActiveCorridor('gallerd');
              setSelectedStop('Dehiwala');
            }}
            className={`py-2 px-1 text-xs font-semibold rounded-xl transition-all ${
              activeCorridor === 'gallerd'
                ? 'bg-white/90 text-[#3C413D] shadow-sm font-bold'
                : 'text-[#A68A73] hover:text-[#3C413D]'
            }`}
          >
            Galle Road
          </button>
          <button
            onClick={() => {
              triggerHaptic('tab');
              setActiveCorridor('expressway');
              setSelectedStop('Makumbura MMC (E01)');
            }}
            className={`py-2 px-1 text-xs font-semibold rounded-xl transition-all ${
              activeCorridor === 'expressway'
                ? 'bg-white/90 text-[#3C413D] shadow-sm font-bold'
                : 'text-[#A68A73] hover:text-[#3C413D]'
            }`}
          >
            Expressway
          </button>
        </div>
      </div>

      {/* SVG Interactive Canvas Card */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-5 shadow-sm border border-white/50 space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#3C413D]">
              {current.name}
            </h3>
            <p className="text-[11px] text-[#A68A73] font-medium">
              {current.meta}
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-white/70 border border-white/60 px-2.5 py-1 rounded-xl text-[#7A8B7D]">
            {current.activeBuses} active
          </span>
        </div>

        {/* SVG Drawing Canvas */}
        <div className="relative bg-white/50 rounded-2xl border border-white/60 p-2 overflow-hidden h-[330px]">
          <svg className="w-full h-full" viewBox="0 0 400 340">
            <defs>
              <linearGradient id="corridorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3C413D" />
                <stop offset="50%" stopColor="#7A8B7D" />
                <stop offset="100%" stopColor="#A68A73" />
              </linearGradient>
            </defs>

            {/* Background grid lines */}
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E9E0D2" strokeWidth="0.8" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Corridor Path Line */}
            {(() => {
              const pts = current.stops.map((s) => `${s.x},${s.y}`).join(' L ');
              return (
                <>
                  <path
                    d={`M ${pts}`}
                    fill="none"
                    stroke="#D8E2DC"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={`M ${pts}`}
                    fill="none"
                    stroke="url(#corridorGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              );
            })()}

            {/* Virtual Bus Marker 1 */}
            {(() => {
              // Interpolate approximate point along stops
              const stops = current.stops;
              const idx = Math.min(
                stops.length - 2,
                Math.floor((busProgress / 100) * (stops.length - 1))
              );
              const localT = ((busProgress / 100) * (stops.length - 1)) % 1;
              const p1 = stops[idx];
              const p2 = stops[idx + 1] || p1;
              const bx = p1.x + (p2.x - p1.x) * localT;
              const by = p1.y + (p2.y - p1.y) * localT;

              return (
                <g transform={`translate(${bx}, ${by})`}>
                  <circle r="14" fill="#7A8B7D" opacity="0.3" className="animate-ping" />
                  <circle r="10" fill="#7A8B7D" stroke="#ffffff" strokeWidth="2.5" />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="7"
                    fontWeight="800"
                  >
                    BUS
                  </text>
                </g>
              );
            })()}

            {/* Bus Stop Nodes */}
            {current.stops.map((stop, sIdx) => {
              const isSelected = selectedStop === stop.name;
              return (
                <g
                  key={sIdx}
                  transform={`translate(${stop.x}, ${stop.y})`}
                  onClick={() => {
                    triggerHaptic('selection');
                    setSelectedStop(stop.name);
                  }}
                  className="cursor-pointer"
                >
                  <circle
                    r={isSelected ? '9' : '6'}
                    fill={isSelected ? '#3C413D' : '#ffffff'}
                    stroke={isSelected ? '#ffffff' : '#7A8B7D'}
                    strokeWidth={isSelected ? '2.5' : '2'}
                  />
                  <text
                    x="12"
                    y="4"
                    fill={isSelected ? '#3C413D' : '#7A8B7D'}
                    fontSize={isSelected ? '10' : '9'}
                    fontWeight={isSelected ? '800' : '600'}
                  >
                    {stop.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Stop Details Popover */}
          {selectedStop && (() => {
            const st = current.stops.find((s) => s.name === selectedStop);
            if (!st) return null;
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-sm border border-white/60 flex items-center justify-between"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#7A8B7D]" />
                    <span className="text-xs font-bold text-[#3C413D] truncate">
                      {st.name} ({st.stage})
                    </span>
                  </div>
                  <div className="text-[11px] text-[#A68A73] font-medium">
                    {st.km} km from origin · Transfers: {st.connects}
                  </div>
                </div>

                <button
                  onClick={() => {
                    triggerHaptic('light');
                    if (onSelectRouteId) onSelectRouteId('138-homagama');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#7A8B7D] text-white text-xs font-semibold shrink-0 shadow-sm hover:bg-[#68776b] transition-colors"
                >
                  View Route
                </button>
              </motion.div>
            );
          })()}
        </div>

        {/* Real-time Status Card */}
        <div className="p-3.5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 flex items-start gap-2.5 text-xs text-[#A68A73]">
          <Info className="w-4 h-4 text-[#7A8B7D] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-[#3C413D] block">
              {current.gpsCoverage}
            </span>
            <p className="text-[11px] leading-relaxed">
              Expressway routes (EX1, EX2, 187 Airport) transmit live satellite GPS. Regular suburban routes follow high-frequency master timetables with headway frequency under 5 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
