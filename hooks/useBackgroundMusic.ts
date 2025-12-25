import { useEffect, useRef, useState, useCallback } from 'react';

interface UseBackgroundMusicOptions {
  volume?: number;
  loop?: boolean;
}

const BACKGROUND_MUSIC_PATH = '/sounds/Vibing Over Venus.mp3';

export function useBackgroundMusic(
  musicUrl?: string,
  options: UseBackgroundMusicOptions = {}
) {
  const { volume = 0.3, loop = true } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(musicUrl || BACKGROUND_MUSIC_PATH);
    audio.loop = loop;
    audio.volume = volume;
    audio.preload = 'auto';

    audio.addEventListener('canplaythrough', () => {
      setIsLoaded(true);
    });

    audio.addEventListener('ended', () => {
      if (!loop) {
        setIsPlaying(false);
      }
    });

    audio.addEventListener('error', (e) => {
      console.warn('Background music failed to load:', e);
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [musicUrl, loop, volume]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.warn('Failed to play background music:', error);
      });
      setIsPlaying(true);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const setVolumeLevel = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  }, []);

  return {
    isPlaying,
    isLoaded,
    play,
    pause,
    toggle,
    setVolume: setVolumeLevel,
  };
}
