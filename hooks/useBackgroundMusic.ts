import { useEffect, useRef, useState, useCallback } from 'react';

interface UseBackgroundMusicOptions {
  volume?: number;
  loop?: boolean;
  autoPlay?: boolean;
}

const BACKGROUND_MUSIC_PATH = '/sounds/Vibing Over Venus.mp3';

export function useBackgroundMusic(
  musicUrl?: string,
  options: UseBackgroundMusicOptions = {}
) {
  const { volume = 0.3, loop = true, autoPlay = false } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const autoPlayPending = useRef(autoPlay);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(musicUrl || BACKGROUND_MUSIC_PATH);
    audio.loop = loop;
    audio.volume = volume;
    audio.preload = 'auto';

    const handleCanPlay = () => {
      setIsLoaded(true);
    };

    audio.addEventListener('canplaythrough', handleCanPlay);

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
  }, [musicUrl, loop, volume, autoPlay]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Auto-play on first user interaction
  useEffect(() => {
    if (!autoPlay || !autoPlayPending.current) return;

    const tryAutoPlay = () => {
      if (audioRef.current && autoPlayPending.current) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            autoPlayPending.current = false;
          })
          .catch(() => {});
      }
    };

    // Try immediate autoplay
    tryAutoPlay();

    // Fallback: start on first user interaction
    const handleInteraction = () => {
      tryAutoPlay();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [autoPlay, isLoaded]);

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
