import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sliders,
  Vibrate,
  Volume2,
  Lock,
  Globe,
  Sparkles,
  Info,
  Wifi,
  WifiOff,
  Radio,
} from 'lucide-react';
import { Language } from '../types';
import { triggerHaptic, updateHapticSettings, loadHapticSettings } from '../utils/haptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  isOnlineMode: boolean;
  onToggleOnlineMode: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onLanguageChange,
  isOnlineMode,
  onToggleOnlineMode,
}) => {
  const [vibrateOn, setVibrateOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [audioVol, setAudioVol] = useState(0.7);

  useEffect(() => {
    const current = loadHapticSettings();
    setVibrateOn(current.vibration);
    setAudioOn(current.audio);
    setAudioVol(current.volume);
  }, [isOpen]);

  const handleToggleVibrate = () => {
    const next = !vibrateOn;
    setVibrateOn(next);
    updateHapticSettings({ vibration: next });
    triggerHaptic('switch', { vibration: next });
  };

  const handleToggleAudio = () => {
    const next = !audioOn;
    setAudioOn(next);
    updateHapticSettings({ audio: next });
    triggerHaptic('switch', { audio: next });
  };

  const handleVolumeChange = (vol: number) => {
    setAudioVol(vol);
    updateHapticSettings({ volume: vol });
    triggerHaptic('tick', { audio: true, volume: vol });
  };

  const testHaptic = (type: 'light' | 'selection' | 'success' | 'warning' | 'heavy') => {
    triggerHaptic(type);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="settings-modal-backdrop"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 pt-6 sm:pt-4 overflow-hidden"
      >
        <motion.div
          id="settings-modal-sheet"
          initial={{ y: '100%', opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="bg-[#F2F0ED]/95 backdrop-blur-2xl w-full max-w-lg h-[84vh] max-h-[calc(100%-2.5rem)] sm:h-[82vh] sm:rounded-[36px] rounded-t-[36px] shadow-2xl flex flex-col overflow-hidden border border-white/60"
        >
          {/* Header */}
          <div className="bg-[#3C413D] text-white pt-3 px-5 pb-5 rounded-b-[32px] shrink-0 shadow-sm">
            {/* Top Sheet Drag Pull Indicator */}
            <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-3.5 shrink-0" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#7A8B7D] text-white flex items-center justify-center shadow-sm">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight">
                    Preferences & Tactile Settings
                  </h3>
                  <span className="text-xs text-[#D8E2DC]/80 font-medium">
                    Haptics, sound feedback & privacy
                  </span>
                </div>
              </div>

              <button
                id="close-settings-modal-btn"
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
            {/* Haptics & Vibration Card */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-5 shadow-sm border border-white/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Vibrate className="w-5 h-5 text-[#7A8B7D]" />
                  <div>
                    <h4 className="font-bold text-sm text-[#3C413D]">
                      Hardware Vibration Haptics
                    </h4>
                    <p className="text-xs text-[#A68A73]">
                      Tactile micro-pulses on tabs, buttons & stops
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleToggleVibrate}
                  className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                    vibrateOn ? 'bg-[#7A8B7D]' : 'bg-black/10'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-xs"
                    animate={{ x: vibrateOn ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Audio Taptic Feedback */}
              <div className="pt-3 border-t border-white/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-5 h-5 text-[#7A8B7D]" />
                  <div>
                    <h4 className="font-bold text-sm text-[#3C413D]">
                      Synthesized Taptic Sound Clicks
                    </h4>
                    <p className="text-xs text-[#A68A73]">
                      Mechanical switch audio synthesis
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleToggleAudio}
                  className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                    audioOn ? 'bg-[#7A8B7D]' : 'bg-black/10'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-xs"
                    animate={{ x: audioOn ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Volume Slider */}
              {audioOn && (
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#A68A73] shrink-0">Click Volume:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={audioVol}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full accent-[#7A8B7D] cursor-pointer"
                  />
                  <span className="text-xs font-mono text-[#A68A73] w-8 text-right font-semibold">
                    {Math.round(audioVol * 100)}%
                  </span>
                </div>
              )}

              {/* Test Buttons */}
              <div className="pt-2 border-t border-white/40 space-y-2">
                <span className="text-[11px] font-bold text-[#A68A73] uppercase tracking-wider block">
                  Test Tactile Feedback
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => testHaptic('light')}
                    className="py-2.5 px-2 rounded-xl bg-white/60 hover:bg-white text-[#3C413D] text-xs font-semibold transition-colors border border-white/50 shadow-sm"
                  >
                    Micro Tap
                  </button>
                  <button
                    onClick={() => testHaptic('success')}
                    className="py-2.5 px-2 rounded-xl bg-white/60 hover:bg-white text-[#7A8B7D] text-xs font-bold transition-colors border border-white/50 shadow-sm"
                  >
                    Chime
                  </button>
                  <button
                    onClick={() => testHaptic('heavy')}
                    className="py-2.5 px-2 rounded-xl bg-white/60 hover:bg-white text-[#3C413D] text-xs font-bold transition-colors border border-white/50 shadow-sm"
                  >
                    Heavy Thud
                  </button>
                </div>
              </div>
            </div>

            {/* Connectivity Mode (Online vs Offline) */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-5 shadow-sm border border-white/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {isOnlineMode ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center border border-emerald-500/30">
                      <Wifi className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-white/60 text-[#7A8B7D] flex items-center justify-center border border-white/60">
                      <WifiOff className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#3C413D]">
                        {isOnlineMode ? 'Online Cloud Live Mode' : 'Offline Autonomous Mode'}
                      </h4>
                      {isOnlineMode && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      )}
                    </div>
                    <p className="text-xs text-[#A68A73]">
                      {isOnlineMode
                        ? 'Simulated GPS telematics & cloud live headways enabled'
                        : 'Local SQLite/cached tables · zero data consumption'}
                    </p>
                  </div>
                </div>

                <button
                  id="settings-toggle-online-btn"
                  onClick={() => {
                    triggerHaptic('tab');
                    onToggleOnlineMode();
                  }}
                  className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                    isOnlineMode ? 'bg-emerald-600' : 'bg-black/10'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-xs"
                    animate={{ x: isOnlineMode ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {isOnlineMode && (
                <div className="pt-2 border-t border-white/40 space-y-1.5 text-xs text-[#3C413D]">
                  <div className="flex items-center justify-between text-[11px] font-medium text-[#7A8B7D]">
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                      Live Colombo GPS Telemetry Feed
                    </span>
                    <span className="font-mono bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-md font-semibold">
                      Sync: 15s
                    </span>
                  </div>
                  <p className="text-[#A68A73] text-[11px]">
                    Automatic vehicle positioning, live passenger crowd indicators, and real-time headway recalculation are active.
                  </p>
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-5 shadow-sm border border-white/50 space-y-3">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-[#7A8B7D]" />
                <div>
                  <h4 className="font-bold text-sm text-[#3C413D]">
                    Transit Interface Language
                  </h4>
                  <p className="text-xs text-[#A68A73]">
                    English, සිංහල, and தமிழ்
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { code: 'en' as const, label: 'English' },
                  { code: 'si' as const, label: 'සිංහල' },
                  { code: 'ta' as const, label: 'தமிழ்' },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      triggerHaptic('selection');
                      onLanguageChange(l.code);
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
                      lang === l.code
                        ? 'bg-white/90 text-[#3C413D] border-white/80 shadow-sm font-bold'
                        : 'bg-white/40 hover:bg-white/70 text-[#A68A73] border-white/40'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy & Offline Guarantee */}
            <div className="bg-white/30 backdrop-blur-md rounded-[28px] p-4 border border-white/40 space-y-1.5 text-xs text-[#A68A73]">
              <div className="flex items-center gap-2 text-[#3C413D] font-bold">
                <Lock className="w-4 h-4 text-[#7A8B7D]" />
                <span>100% Privacy & Zero Tracking Guarantee</span>
              </div>
              <p className="leading-relaxed">
                Pāra runs completely offline. Your queries, search history, saved commutes, and trip plans never leave your device.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
