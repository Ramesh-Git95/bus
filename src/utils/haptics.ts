// Tactical haptic vibration & Web Audio synthesized taptic feedback

let audioCtx: AudioContext | null = null;
let soundscapeNodes: { oscList: OscillatorNode[]; gainList: GainNode[]; noiseNode?: AudioNode } | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export type HapticType = 'light' | 'selection' | 'success' | 'warning' | 'heavy' | 'tab' | 'switch' | 'tick';

export interface HapticOptions {
  vibration?: boolean;
  audio?: boolean;
  volume?: number;
}

// Global haptic preferences cached in memory / localStorage
let globalHapticSettings = {
  vibration: true,
  audio: true,
  volume: 0.7,
};

export function updateHapticSettings(settings: Partial<typeof globalHapticSettings>) {
  globalHapticSettings = { ...globalHapticSettings, ...settings };
  try {
    localStorage.setItem('para_haptics', JSON.stringify(globalHapticSettings));
  } catch {}
}

export function loadHapticSettings() {
  try {
    const saved = localStorage.getItem('para_haptics');
    if (saved) {
      globalHapticSettings = { ...globalHapticSettings, ...JSON.parse(saved) };
    }
  } catch {}
  return globalHapticSettings;
}

// Initial load
loadHapticSettings();

export function triggerHaptic(type: HapticType = 'light', customOptions?: HapticOptions) {
  const allowVibrate = customOptions?.vibration ?? globalHapticSettings.vibration;
  const allowAudio = customOptions?.audio ?? globalHapticSettings.audio;
  const vol = (customOptions?.volume ?? globalHapticSettings.volume) * 0.15; // Pleasant, subtle gain

  // 1. Hardware Vibration
  if (allowVibrate && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'light':
        case 'tick':
          navigator.vibrate(8);
          break;
        case 'selection':
        case 'tab':
          navigator.vibrate(12);
          break;
        case 'switch':
          navigator.vibrate([8, 20, 8]);
          break;
        case 'success':
          navigator.vibrate([12, 35, 18]);
          break;
        case 'warning':
          navigator.vibrate([25, 40, 25]);
          break;
        case 'heavy':
          navigator.vibrate(28);
          break;
      }
    } catch {}
  }

  // 2. Synthesized Mechanical Taptic Audio Click
  if (allowAudio) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'light' || type === 'tick') {
        // High crisp micro-tap (1200Hz -> 600Hz in 12ms)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.012);
        gain.gain.setValueAtTime(vol * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);
        osc.start(now);
        osc.stop(now + 0.015);
      } else if (type === 'tab' || type === 'selection') {
        // Smooth woody toggle tick (800Hz -> 200Hz in 20ms)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.02);
        gain.gain.setValueAtTime(vol * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
        osc.start(now);
        osc.stop(now + 0.026);
      } else if (type === 'switch') {
        // Double micro-tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);
        gain.gain.setValueAtTime(vol * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.045);
      } else if (type === 'success') {
        // Warm two-tone chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.05); // E5
        gain.gain.setValueAtTime(vol * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.19);
      } else if (type === 'warning') {
        // Subtle muted alert pop
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.linearRampToValueAtTime(160, now + 0.08);
        gain.gain.setValueAtTime(vol * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.11);
      } else if (type === 'heavy') {
        // Low resonance mechanical thud
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);
        gain.gain.setValueAtTime(vol * 0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.065);
      }
    } catch {}
  }
}

// Synthesize soothing deep work ambient audio for commutes
export function startSoundscape(type: 'train' | 'rain' | 'binaural' | 'zen', volume = 0.25) {
  stopSoundscape();
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscList: OscillatorNode[] = [];
    const gainList: GainNode[] = [];

    if (type === 'binaural') {
      // 216Hz and 224Hz (8Hz Alpha wave state for deep work and calm focus)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const g = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.value = 216;
      osc2.type = 'sine';
      osc2.frequency.value = 224;

      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(volume * 0.2, ctx.currentTime + 1.5);

      osc1.connect(g);
      osc2.connect(g);
      g.connect(ctx.destination);

      osc1.start();
      osc2.start();

      oscList.push(osc1, osc2);
      gainList.push(g);
    } else if (type === 'train') {
      // Rhythmic subtle rail drone (low rumble modulated with filter)
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const g = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = 55; // Low A

      filter.type = 'lowpass';
      filter.frequency.value = 180;

      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(volume * 0.22, ctx.currentTime + 1.2);

      osc.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);

      osc.start();
      oscList.push(osc);
      gainList.push(g);
    } else if (type === 'zen') {
      // Warm 432 Hz healing focus hum
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = 432;

      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(volume * 0.12, ctx.currentTime + 1.5);

      osc.connect(g);
      g.connect(ctx.destination);

      osc.start();
      oscList.push(osc);
      gainList.push(g);
    } else if (type === 'rain') {
      // White noise generator filtered to gentle rain
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 650;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(volume * 0.15, ctx.currentTime + 1.5);

      noise.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);

      noise.start();
      soundscapeNodes = { oscList: [], gainList: [g], noiseNode: noise };
      return;
    }

    soundscapeNodes = { oscList, gainList };
  } catch (err) {
    console.warn('Audio soundscape error:', err);
  }
}

export function stopSoundscape() {
  if (!soundscapeNodes) return;
  try {
    soundscapeNodes.oscList.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    if (soundscapeNodes.noiseNode) {
      try {
        (soundscapeNodes.noiseNode as AudioBufferSourceNode).stop();
        soundscapeNodes.noiseNode.disconnect();
      } catch {}
    }
    soundscapeNodes.gainList.forEach((g) => {
      try {
        g.disconnect();
      } catch {}
    });
  } catch {}
  soundscapeNodes = null;
}
