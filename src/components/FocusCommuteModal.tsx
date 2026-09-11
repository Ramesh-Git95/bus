import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Bell,
  Sparkles,
  CloudRain,
  Train,
  Waves,
  HeartHandshake,
} from 'lucide-react';
import { triggerHaptic, startSoundscape, stopSoundscape } from '../utils/haptics';

interface FocusCommuteModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStopName?: string;
}

export const FocusCommuteModal: React.FC<FocusCommuteModalProps> = ({
  isOpen,
  onClose,
  targetStopName,
}) => {
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedSoundscape, setSelectedSoundscape] = useState<'train' | 'rain' | 'binaural' | 'zen' | 'none'>('train');
  const [soundPlaying, setSoundPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.3);

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            stopSoundscape();
            setSoundPlaying(false);
            triggerHaptic('heavy');
            // Sound the arrival chime
            alert('🔔 Commute Focus Session Completed! You have arrived or reached your focus milestone.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeftSeconds]);

  // Soundscape toggling
  const handleToggleSoundscape = (type: 'train' | 'rain' | 'binaural' | 'zen' | 'none') => {
    triggerHaptic('selection');
    if (type === 'none' || (selectedSoundscape === type && soundPlaying)) {
      stopSoundscape();
      setSoundPlaying(false);
      setSelectedSoundscape('none');
    } else {
      setSelectedSoundscape(type);
      startSoundscape(type, volume);
      setSoundPlaying(true);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (soundPlaying && selectedSoundscape !== 'none') {
      startSoundscape(selectedSoundscape, newVol);
    }
  };

  const handleSetDuration = (mins: number) => {
    triggerHaptic('tab');
    setDurationMinutes(mins);
    setTimeLeftSeconds(mins * 60);
    setIsRunning(false);
  };

  const handleTogglePlay = () => {
    triggerHaptic(isRunning ? 'light' : 'success');
    if (!isRunning && !soundPlaying && selectedSoundscape !== 'none') {
      startSoundscape(selectedSoundscape, volume);
      setSoundPlaying(true);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    triggerHaptic('warning');
    setIsRunning(false);
    setTimeLeftSeconds(durationMinutes * 60);
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const progressPercent = ((durationMinutes * 60 - timeLeftSeconds) / (durationMinutes * 60)) * 100;

  const soundscapes = [
    { id: 'train' as const, label: 'Rail Drone', icon: Train, desc: 'Rhythmic Ceylon train track hum' },
    { id: 'rain' as const, label: 'Monsoon Rain', icon: CloudRain, desc: 'Gentle tropical storm white noise' },
    { id: 'binaural' as const, label: 'Alpha 8Hz', icon: Waves, desc: 'Binaural focus tone for deep work' },
    { id: 'zen' as const, label: '432 Hz Hum', icon: HeartHandshake, desc: 'Warm calming resonant harmonic' },
  ];

  return (
    <AnimatePresence>
      <div
        id="focus-modal-backdrop"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 pt-6 sm:pt-4 overflow-hidden"
      >
        <motion.div
          id="focus-modal-sheet"
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
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight">
                    Commute Deep Work & Focus
                  </h3>
                  <span className="text-xs text-[#D8E2DC]/80 font-medium">
                    Minimalist focus timer + ambient soundscape
                  </span>
                </div>
              </div>

              <button
                id="close-focus-modal-btn"
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
            {/* Target Arrival Stop Indicator if Set */}
            {targetStopName && (
              <div className="bg-white/50 border border-white/60 p-3.5 rounded-2xl flex items-center justify-between text-[#3C413D] shadow-sm">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#7A8B7D]" />
                  <span className="text-xs font-bold">
                    Arrival wake-up armed: {targetStopName}
                  </span>
                </div>
                <span className="text-[10px] font-semibold bg-white/80 px-2.5 py-0.5 rounded-full border border-white/60 shadow-2xs">
                  Active
                </span>
              </div>
            )}

            {/* Circular / Digital Focus Countdown */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-6 text-center shadow-sm border border-white/50 space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-[#A68A73]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#A68A73]">
                  Productivity Milestone
                </span>
              </div>

              {/* Huge Minimalist Timer */}
              <div className="relative inline-flex items-center justify-center">
                <span className="font-mono text-5xl sm:text-6xl font-extrabold text-[#3C413D] tracking-tighter">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/60 h-2 rounded-full overflow-hidden border border-white/40">
                <motion.div
                  className="bg-[#7A8B7D] h-full rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Play, Pause, Reset Controls */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  id="reset-focus-btn"
                  onClick={handleReset}
                  className="w-12 h-12 rounded-2xl bg-white/60 hover:bg-white text-[#3C413D] flex items-center justify-center transition-colors border border-white/50 shadow-sm"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  id="toggle-focus-run-btn"
                  onClick={handleTogglePlay}
                  className={`px-8 h-12 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 ${
                    isRunning
                      ? 'bg-[#A68A73] hover:bg-[#927863]'
                      : 'bg-[#7A8B7D] hover:bg-[#68776b]'
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isRunning ? 'Pause Focus' : 'Start Focus'}</span>
                </button>
              </div>

              {/* Quick Duration Buttons */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleSetDuration(mins)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      durationMinutes === mins
                        ? 'bg-[#3C413D] text-white shadow-sm font-bold'
                        : 'bg-white/50 text-[#A68A73] hover:text-[#3C413D] border border-white/40'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Ambient Soundscapes */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[32px] p-5 shadow-sm border border-white/50 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#A68A73]">
                  Synthesized Soundscape
                </span>
                <span className="text-xs font-semibold text-[#7A8B7D]">
                  {soundPlaying ? 'Playing' : 'Paused'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {soundscapes.map((snd) => {
                  const isActive = selectedSoundscape === snd.id && soundPlaying;
                  const Icon = snd.icon;

                  return (
                    <button
                      key={snd.id}
                      onClick={() => handleToggleSoundscape(snd.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                        isActive
                          ? 'bg-[#7A8B7D] text-white border-[#7A8B7D] shadow-sm'
                          : 'bg-white/50 hover:bg-white/80 text-[#3C413D] border-white/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="w-4 h-4" />
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-black/5 text-[#A68A73]'}`}>
                          {isActive ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-xs block">{snd.label}</span>
                        <span className={`text-[10px] block leading-tight ${isActive ? 'text-white/80' : 'text-[#A68A73]'}`}>
                          {snd.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Volume Slider */}
              <div className="pt-2 flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-[#A68A73] shrink-0" />
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-[#7A8B7D] cursor-pointer"
                />
                <span className="text-xs font-mono text-[#A68A73] w-8 text-right font-semibold">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
