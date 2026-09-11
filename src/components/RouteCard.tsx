import React from 'react';
import { motion } from 'motion/react';
import { Bookmark, Clock, Users, ArrowRight } from 'lucide-react';
import { BusRoute, Language } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface RouteCardProps {
  route: BusRoute;
  lang: Language;
  onSelectRoute: (route: BusRoute) => void;
  isSaved: boolean;
  onToggleSave: (route: BusRoute, e: React.MouseEvent) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  lang,
  onSelectRoute,
  isSaved,
  onToggleSave,
}) => {
  // Badge styling per bus type
  const getTypeBadgeStyle = () => {
    switch (route.type) {
      case 'AC':
        return {
          badgeBg: 'bg-[#7A8B7D] text-white',
          tagBg: 'bg-[#D8E2DC] text-[#3C413D]',
          border: 'border-white/60',
          label: 'AC EXPRESS',
        };
      case 'SEMI-LUX':
        return {
          badgeBg: 'bg-[#A68A73] text-white',
          tagBg: 'bg-[#E9E0D2] text-[#3C413D]',
          border: 'border-white/60',
          label: 'SEMI-LUX',
        };
      case 'EXPRESSWAY':
        return {
          badgeBg: 'bg-[#3C413D] text-white',
          tagBg: 'bg-white/80 text-[#3C413D]',
          border: 'border-white/60',
          label: 'EXPRESSWAY',
        };
      case 'SLTB':
        return {
          badgeBg: 'bg-[#3C413D] text-[#D8E2DC]',
          tagBg: 'bg-[#D8E2DC] text-[#3C413D]',
          border: 'border-white/60',
          label: 'SLTB RED',
        };
      case 'NORMAL':
      default:
        return {
          badgeBg: 'bg-[#7A8B7D] text-white',
          tagBg: 'bg-white/70 text-[#3C413D]',
          border: 'border-white/60',
          label: 'REGULAR',
        };
    }
  };

  const badgeStyle = getTypeBadgeStyle();

  // Crowd text & color
  const getCrowdColor = () => {
    switch (route.liveStatus.crowd) {
      case 'Seats':
        return 'text-[#7A8B7D] bg-[#D8E2DC]/70';
      case 'Busy':
        return 'text-[#3C413D] bg-[#E9E0D2]';
      case 'Standing':
        return 'text-[#3C413D] bg-[#E9E0D2]';
      case 'Full':
        return 'text-[#3C413D] bg-[#D8E2DC]';
      case 'Bookable':
        return 'text-[#7A8B7D] bg-white/80';
      default:
        return 'text-[#A68A73] bg-white/50';
    }
  };

  const displayName = lang === 'si' ? route.nameSi : lang === 'ta' ? route.nameTa : route.name;

  return (
    <motion.div
      id={`route-card-${route.id}`}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        triggerHaptic('selection');
        onSelectRoute(route);
      }}
      className="bg-white/40 backdrop-blur-xl rounded-[28px] p-4 shadow-sm hover:bg-white/60 transition-all duration-200 cursor-pointer border border-white/50 relative overflow-hidden group"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Route Number Pill + Details */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div
            className={`w-14 h-12 rounded-2xl flex items-center justify-center font-bold text-lg tracking-tight shadow-md shadow-black/5 shrink-0 ${badgeStyle.badgeBg}`}
          >
            {route.number}
          </div>

          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-[#3C413D] tracking-tight leading-snug truncate">
                {displayName}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full uppercase ${badgeStyle.tagBg}`}>
                {badgeStyle.label}
              </span>
              <span className="text-xs text-[#A68A73] font-medium truncate">
                {route.corridor}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Next Bus / Headway + Save Button */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            id={`bookmark-btn-${route.id}`}
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic(isSaved ? 'light' : 'success');
              onToggleSave(route, e);
            }}
            className={`p-2 rounded-xl border transition-all ${
              isSaved
                ? 'bg-[#7A8B7D] text-white border-[#7A8B7D] shadow-md shadow-[#7A8B7D]/20'
                : 'bg-white/50 text-[#A68A73] hover:text-[#3C413D] border-white/60 hover:bg-white/80'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save Route'}
            aria-label="Save Route"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <div className="flex flex-col items-end">
            <span className="text-[13px] font-bold text-[#7A8B7D] tracking-tight flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
              {route.liveStatus.nextMinutes} min
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 flex items-center gap-1 border border-white/40 ${getCrowdColor()}`}>
              <Users className="w-2.5 h-2.5" />
              {route.liveStatus.crowd}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="mt-3 pt-2.5 border-t border-white/40 flex items-center justify-between text-xs text-[#A68A73]">
        <span className="font-medium flex items-center gap-1.5 text-[#3C413D]/80">
          <span>{route.distanceKm} km</span>
          <span>·</span>
          <span>{route.stopsOutbound.length} stops</span>
          <span>·</span>
          <span className="font-semibold text-[#7A8B7D]">From Rs 22</span>
        </span>

        <span className="inline-flex items-center gap-1 font-semibold text-[#7A8B7D] group-hover:translate-x-0.5 transition-transform text-[11px]">
          Details <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
};
