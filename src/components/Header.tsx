import React from 'react';
import { motion } from 'motion/react';
import { Headphones, Settings as SettingsIcon, Wifi, WifiOff } from 'lucide-react';
import { Language } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenFocus: () => void;
  onOpenSettings: () => void;
  isFocusActive: boolean;
  isOnlineMode: boolean;
  onToggleOnlineMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  onOpenFocus,
  onOpenSettings,
  isFocusActive,
  isOnlineMode,
  onToggleOnlineMode,
}) => {
  const languages: { code: Language; label: string; fontClass?: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'si', label: 'සිං', fontClass: 'font-[\'Noto_Sans_Sinhala\']' },
    { code: 'ta', label: 'தமி', fontClass: 'font-[\'Noto_Sans_Tamil\']' },
  ];

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 bg-white/40 backdrop-blur-xl border-b border-white/40 px-4 py-3 max-w-md mx-auto w-full transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-light tracking-tight text-[#3C413D] leading-none">
                Pāra <span className="font-semibold text-xs tracking-widest text-[#7A8B7D] uppercase">Bus</span>
              </span>
              <button
                id="toggle-online-mode-btn"
                onClick={() => {
                  triggerHaptic('tab');
                  onToggleOnlineMode();
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border backdrop-blur-md transition-all duration-300 ${
                  isOnlineMode
                    ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 shadow-xs'
                    : 'bg-white/60 text-[#7A8B7D] border-white/60'
                }`}
                title={isOnlineMode ? 'Online Mode (Live GPS & Headways active)' : 'Offline Mode (Local database active)'}
                aria-label="Toggle Online Mode"
              >
                {isOnlineMode ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <Wifi className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-2.5 h-2.5" />
                    <span>Offline</span>
                  </>
                )}
              </button>
            </div>
            <span className="text-[11px] font-medium text-[#A68A73] tracking-wide mt-0.5">
              Sri Lanka Transit Companion
            </span>
          </div>
        </div>

        {/* Right Actions: Focus, Language & Settings */}
        <div className="flex items-center gap-2">
          {/* Focus Commute Button */}
          <button
            id="header-focus-btn"
            onClick={() => {
              triggerHaptic('selection');
              onOpenFocus();
            }}
            className={`p-2 rounded-2xl border transition-all duration-200 flex items-center justify-center ${
              isFocusActive
                ? 'bg-[#7A8B7D] text-white border-[#7A8B7D] shadow-lg shadow-[#7A8B7D]/20 animate-pulse'
                : 'bg-white/50 text-[#3C413D] hover:text-[#3C413D] border-white/60 hover:bg-white/80 backdrop-blur-md shadow-2xs'
            }`}
            title="Commute Focus & Ambient Audio"
            aria-label="Focus Commute Mode"
          >
            <Headphones className="w-4 h-4" />
          </button>

          {/* Language Switcher Pill */}
          <div
            id="lang-switcher-pill"
            className="flex items-center bg-white/40 backdrop-blur-md rounded-full p-0.5 border border-white/50"
          >
            {languages.map((l) => {
              const isSelected = currentLang === l.code;
              return (
                <button
                  key={l.code}
                  id={`lang-btn-${l.code}`}
                  onClick={() => {
                    triggerHaptic('tab');
                    onLanguageChange(l.code);
                  }}
                  className={`relative px-2.5 py-1 text-xs rounded-full font-semibold transition-colors duration-150 ${
                    l.fontClass || ''
                  } ${
                    isSelected ? 'text-[#3C413D]' : 'text-[#A68A73] hover:text-[#3C413D]'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="langPill"
                      className="absolute inset-0 bg-white/90 backdrop-blur-md rounded-full shadow-xs border border-white/80"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </button>
              );
            })}
          </div>

          {/* Settings Trigger */}
          <button
            id="header-settings-btn"
            onClick={() => {
              triggerHaptic('light');
              onOpenSettings();
            }}
            className="p-2 rounded-2xl bg-white/50 text-[#3C413D] hover:text-[#3C413D] border border-white/60 hover:bg-white/80 backdrop-blur-md shadow-2xs transition-colors"
            title="Settings & Tactile Controls"
            aria-label="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtle delicate accent line */}
      <div className="h-[2px] mt-2.5 rounded-full w-full bg-gradient-to-r from-[#D8E2DC] via-[#7A8B7D] to-[#E9E0D2] opacity-70" />
    </header>
  );
};
