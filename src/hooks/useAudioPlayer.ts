import { useState, useEffect, useRef, useCallback } from 'react';
import { Ayah } from '../types/quran';
import { getAyahAudioUrl } from '../services/quranApi';

export interface PlayingState {
  ayah: Ayah;
  surahNumber: number;
  surahName: string;
  surahAyahs?: Ayah[];
  currentIndex?: number;
}

export function useAudioPlayer(reciterId = 'ar.alafasy') {
  const [playingState, setPlayingState] = useState<PlayingState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    
    const onTimeUpdate = () => {
      if (audio.duration && audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('تعذر تشغيل التلاوة الصوتية، يرجى المحاولة لاحقاً');
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Play audio for a specific Ayah
  const playAyah = useCallback((
    ayah: Ayah,
    surahNumber: number,
    surahName: string,
    surahAyahs?: Ayah[]
  ) => {
    if (!audioRef.current) return;

    setError(null);
    setIsLoading(true);

    const currentIndex = surahAyahs ? surahAyahs.findIndex(a => a.numberInSurah === ayah.numberInSurah) : -1;
    setPlayingState({
      ayah,
      surahNumber,
      surahName,
      surahAyahs,
      currentIndex: currentIndex >= 0 ? currentIndex : undefined,
    });

    const audioUrl = getAyahAudioUrl(ayah.number, reciterId);
    audioRef.current.src = audioUrl;
    audioRef.current.load();
    audioRef.current.play().catch(e => {
      console.warn('Autoplay prevented or audio load error:', e);
      setIsLoading(false);
      setIsPlaying(false);
    });
  }, [reciterId]);

  // Next Ayah handler
  const playNext = useCallback(() => {
    if (!playingState || !playingState.surahAyahs || playingState.currentIndex === undefined) return;
    const nextIdx = playingState.currentIndex + 1;
    if (nextIdx < playingState.surahAyahs.length) {
      const nextAyah = playingState.surahAyahs[nextIdx];
      playAyah(nextAyah, playingState.surahNumber, playingState.surahName, playingState.surahAyahs);
    } else {
      // Reached end of surah
      setIsPlaying(false);
      setPlayingState(null);
    }
  }, [playingState, playAyah]);

  // Prev Ayah handler
  const playPrev = useCallback(() => {
    if (!playingState || !playingState.surahAyahs || playingState.currentIndex === undefined) return;
    const prevIdx = playingState.currentIndex - 1;
    if (prevIdx >= 0) {
      const prevAyah = playingState.surahAyahs[prevIdx];
      playAyah(prevAyah, playingState.surahNumber, playingState.surahName, playingState.surahAyahs);
    }
  }, [playingState, playAyah]);

  // Handle auto-advance when audio finishes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (playingState && playingState.surahAyahs && playingState.currentIndex !== undefined) {
        playNext();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('ended', onEnded);
    };
  }, [playingState, playNext]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !playingState) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.warn);
    }
  }, [isPlaying, playingState]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setPlayingState(null);
    setProgress(0);
  }, []);

  return {
    playingState,
    isPlaying,
    isLoading,
    error,
    progress,
    playAyah,
    playNext,
    playPrev,
    togglePlayPause,
    stopAudio,
  };
}
