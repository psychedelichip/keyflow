import { useRef, useCallback, useEffect, useState } from 'react';
import type { MechvibesConfig } from '@/types/sounds';

interface UseKeyboardSoundOptions {
  enabled?: boolean;
  volume?: number;
  soundPackPath?: string; // empty string for synthetic
}

// Cherry MX Black with ABS keycaps sound simulation (fallback)
function createSyntheticSound(
  audioContext: AudioContext,
  gainNode: GainNode,
  type: 'keydown' | 'backspace' = 'keydown'
): void {
  const now = audioContext.currentTime;
  const pitchVar = 0.9 + Math.random() * 0.2;
  const volVar = 0.85 + Math.random() * 0.3;

  if (type === 'keydown') {
    // Bottom-out thock
    const thockOsc = audioContext.createOscillator();
    const thockGain = audioContext.createGain();
    const thockFilter = audioContext.createBiquadFilter();

    thockFilter.type = 'lowpass';
    thockFilter.frequency.value = 350;
    thockFilter.Q.value = 3;

    thockOsc.type = 'sine';
    thockOsc.frequency.setValueAtTime(180 * pitchVar, now);
    thockOsc.frequency.exponentialRampToValueAtTime(60, now + 0.06);

    thockGain.gain.setValueAtTime(0.5 * volVar, now);
    thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    thockOsc.connect(thockFilter);
    thockFilter.connect(thockGain);
    thockGain.connect(gainNode);

    thockOsc.start(now);
    thockOsc.stop(now + 0.12);

    // ABS keycap impact
    const absOsc = audioContext.createOscillator();
    const absGain = audioContext.createGain();
    const absFilter = audioContext.createBiquadFilter();

    absFilter.type = 'bandpass';
    absFilter.frequency.value = 2800 * pitchVar;
    absFilter.Q.value = 2;

    absOsc.type = 'triangle';
    absOsc.frequency.setValueAtTime(3200 * pitchVar, now);
    absOsc.frequency.exponentialRampToValueAtTime(1800, now + 0.008);

    absGain.gain.setValueAtTime(0.25 * volVar, now);
    absGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    absOsc.connect(absFilter);
    absFilter.connect(absGain);
    absGain.connect(gainNode);

    absOsc.start(now);
    absOsc.stop(now + 0.025);

    // Noise burst
    const bufferSize = Math.floor(audioContext.sampleRate * 0.025);
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 150);
    }

    const noiseSource = audioContext.createBufferSource();
    const noiseGain = audioContext.createGain();
    const noiseFilter = audioContext.createBiquadFilter();

    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 4000;
    noiseFilter.Q.value = 1;

    noiseSource.buffer = noiseBuffer;
    noiseGain.gain.setValueAtTime(0.18 * volVar, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gainNode);

    noiseSource.start(now);
  } else {
    // Backspace sound
    const thockOsc = audioContext.createOscillator();
    const thockGain = audioContext.createGain();

    thockOsc.type = 'sine';
    thockOsc.frequency.setValueAtTime(140 * pitchVar, now);
    thockOsc.frequency.exponentialRampToValueAtTime(50, now + 0.04);

    thockGain.gain.setValueAtTime(0.35 * volVar, now);
    thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    thockOsc.connect(thockGain);
    thockGain.connect(gainNode);

    thockOsc.start(now);
    thockOsc.stop(now + 0.07);

    const absOsc = audioContext.createOscillator();
    const absGain = audioContext.createGain();

    absOsc.type = 'triangle';
    absOsc.frequency.setValueAtTime(2400 * pitchVar, now);
    absOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.01);

    absGain.gain.setValueAtTime(0.15 * volVar, now);
    absGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    absOsc.connect(absGain);
    absGain.connect(gainNode);

    absOsc.start(now);
    absOsc.stop(now + 0.02);
  }
}

// Key codes for common keys (simplified mapping)
const KEY_TO_SCANCODE: Record<string, number> = {
  // Numbers row
  '`': 41, '1': 2, '2': 3, '3': 4, '4': 5, '5': 6, '6': 7, '7': 8, '8': 9, '9': 10, '0': 11, '-': 12, '=': 13,
  // QWERTY row
  'q': 16, 'w': 17, 'e': 18, 'r': 19, 't': 20, 'y': 21, 'u': 22, 'i': 23, 'o': 24, 'p': 25, '[': 26, ']': 27,
  // ASDF row
  'a': 30, 's': 31, 'd': 32, 'f': 33, 'g': 34, 'h': 35, 'j': 36, 'k': 37, 'l': 38, ';': 39, "'": 40, '\\': 43,
  // ZXCV row
  'z': 44, 'x': 45, 'c': 46, 'v': 47, 'b': 48, 'n': 49, 'm': 50, ',': 51, '.': 52, '/': 53,
  // Special keys
  'backspace': 14, 'tab': 15, 'enter': 28, 'shift': 42, 'ctrl': 29, 'alt': 56, ' ': 57, 'space': 57,
  'capslock': 58, 'escape': 1,
};

export function useKeyboardSound(options: UseKeyboardSoundOptions = {}) {
  const { enabled = true, volume = 0.5, soundPackPath = '' } = options;

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const mainBufferRef = useRef<AudioBuffer | null>(null);
  const multiBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const configRef = useRef<MechvibesConfig | null>(null);
  const loadingRef = useRef<boolean>(false);
  const currentPackPathRef = useRef<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;

    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }

      if (!gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.gain.value = volume;
        gainNodeRef.current.connect(audioContextRef.current.destination);
      }

      return audioContextRef.current;
    } catch (error) {
      console.warn('Failed to initialize audio context:', error);
      return null;
    }
  }, [volume]);

  // Load sound pack
  useEffect(() => {
    if (!soundPackPath || soundPackPath === currentPackPathRef.current) {
      if (!soundPackPath) {
        setIsLoaded(true);
      }
      return;
    }

    const loadSoundPack = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setIsLoaded(false);

      try {
        const ctx = initAudioContext();
        if (!ctx) {
          loadingRef.current = false;
          return;
        }

        // Load config.json
        const configResponse = await fetch(`${soundPackPath}/config.json`);
        if (!configResponse.ok) throw new Error('Failed to load config.json');

        const config: MechvibesConfig = await configResponse.json();
        configRef.current = config;

        if (config.key_define_type === 'single') {
          // Load single audio file
          const audioResponse = await fetch(`${soundPackPath}/${config.sound}`);
          if (!audioResponse.ok) throw new Error('Failed to load audio file');

          const arrayBuffer = await audioResponse.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          mainBufferRef.current = audioBuffer;
          multiBuffersRef.current.clear();
        } else {
          // Load multiple audio files
          mainBufferRef.current = null;
          multiBuffersRef.current.clear();

          // Get unique filenames from defines
          const uniqueFiles = new Set<string>();
          for (const value of Object.values(config.defines)) {
            if (typeof value === 'string') {
              uniqueFiles.add(value);
            }
          }

          // Load each unique file
          const loadPromises = Array.from(uniqueFiles).map(async (filename) => {
            try {
              const response = await fetch(`${soundPackPath}/${filename}`);
              if (!response.ok) return;

              const arrayBuffer = await response.arrayBuffer();
              const buffer = await ctx.decodeAudioData(arrayBuffer);
              multiBuffersRef.current.set(filename, buffer);
            } catch (e) {
              console.warn(`Failed to load ${filename}:`, e);
            }
          });

          await Promise.all(loadPromises);
        }

        currentPackPathRef.current = soundPackPath;
        setIsLoaded(true);
      } catch (error) {
        console.warn('Failed to load sound pack:', error);
        configRef.current = null;
        mainBufferRef.current = null;
        multiBuffersRef.current.clear();
      }

      loadingRef.current = false;
    };

    loadSoundPack();
  }, [soundPackPath, initAudioContext]);

  // Update volume when it changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  // Play a portion of the buffer (for single-file packs)
  const playSingleSound = useCallback((ctx: AudioContext, offset: number, duration: number) => {
    if (!mainBufferRef.current || !gainNodeRef.current) return;

    const source = ctx.createBufferSource();
    source.buffer = mainBufferRef.current;
    source.connect(gainNodeRef.current);

    // Convert ms to seconds
    const startTime = offset / 1000;
    const durationSec = duration / 1000;

    source.start(0, startTime, durationSec);
  }, []);

  // Play a multi-file sound
  const playMultiSound = useCallback((ctx: AudioContext, filename: string) => {
    const buffer = multiBuffersRef.current.get(filename);
    if (!buffer || !gainNodeRef.current) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNodeRef.current);
    source.start(0);
  }, []);

  // Main play function
  const playKeySound = useCallback(
    (type: 'keydown' | 'backspace' = 'keydown', key?: string) => {
      if (!enabled) return;

      let ctx = audioContextRef.current;

      if (!ctx) {
        ctx = initAudioContext();
        if (!ctx) return;
      }

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Use synthetic sound if no pack loaded
      if (!soundPackPath || !configRef.current) {
        if (gainNodeRef.current) {
          createSyntheticSound(ctx, gainNodeRef.current, type);
        }
        return;
      }

      const config = configRef.current;

      // Get scancode for the key
      let scancode: number;
      if (type === 'backspace') {
        scancode = 14;
      } else if (key) {
        scancode = KEY_TO_SCANCODE[key.toLowerCase()] || KEY_TO_SCANCODE[key];
        if (!scancode) {
          // Random key sound as fallback
          const randomCodes = [30, 31, 32, 33, 34, 35, 36, 37, 38]; // a-l
          scancode = randomCodes[Math.floor(Math.random() * randomCodes.length)];
        }
      } else {
        // Random key for general keydown
        const randomCodes = [30, 31, 32, 33, 34, 35, 36, 37, 38];
        scancode = randomCodes[Math.floor(Math.random() * randomCodes.length)];
      }

      const define = config.defines[String(scancode)];

      if (!define) {
        // Fallback to synthetic
        if (gainNodeRef.current) {
          createSyntheticSound(ctx, gainNodeRef.current, type);
        }
        return;
      }

      if (config.key_define_type === 'single' && Array.isArray(define)) {
        const [offset, duration] = define;
        playSingleSound(ctx, offset, duration);
      } else if (config.key_define_type === 'multi' && typeof define === 'string') {
        playMultiSound(ctx, define);
      } else {
        // Fallback
        if (gainNodeRef.current) {
          createSyntheticSound(ctx, gainNodeRef.current, type);
        }
      }
    },
    [enabled, soundPackPath, initAudioContext, playSingleSound, playMultiSound]
  );

  return {
    playKeySound,
    isLoaded,
  };
}
