import React from 'react';
import { motion } from 'motion/react';
import { Compass, Route as RouteIcon, MapPin, Bookmark, Radio } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/busData';

interface GlassNavBarProps {
  activeTab: 'routes' | 'plan' | 'map' | 'saved' | 'stops';
  onTabChange: (tab: 'routes' | 'plan' | 'map' | 'saved' | 'stops') => void;
  lang: Language;
  savedCount: number;
}

export const GlassNavBar: React.FC<GlassNavBarProps> = ({
  activeTab,
  onTabChange,
  lang,
  savedCount,
}) => {
  const t = TRANSLATIONS[lang];

  const navItems = [
    { id: 'routes' as const, label: t.routes, icon: RouteIcon },
    { id: 'plan' as const, label: t.plan, icon: Compass },
    { id: 'stops' as const, label: t.stops, icon: Radio },
    { id: 'map' as const, label: t.map, icon: MapPin },
    { id: 'saved' as const, label: t.saved, icon: Bookmark, badge: savedCount },
  ];

  return (
    <nav
      id="bottom-glass-nav"
      className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-4 pt-2 pointer-events-auto"
      aria-label="Main Navigation"
    >
      <div className="max-w-md mx-auto bg-white/50 backdrop-blur-2xl rounded-[28px] p-1.5 shadow-2xl shadow-black/10 border border-white/60 flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => {
                triggerHaptic('tab');
                onTabChange(item.id);
              }}
              className={`relative flex-1 py-2.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                isActive ? 'text-[#3C413D]' : 'text-[#A68A73] hover:text-[#3C413D]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="navPill"
                  className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-white/80"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}

              <span className="relative z-10 flex flex-col items-center gap-1">
                <span className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.4] text-[#7A8B7D]' : 'stroke-[1.8]'}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-[#7A8B7D] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </span>
                <span className={`text-[11px] tracking-tight truncate max-w-[62px] leading-tight ${isActive ? 'font-bold text-[#3C413D]' : 'font-medium'}`}>
                  {item.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
