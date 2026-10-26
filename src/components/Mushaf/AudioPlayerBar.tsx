import React from 'react';
import { PlayingState } from '../../hooks/useAudioPlayer';
import { toArabicDigits } from '../../utils/arabicUtils';
import { Play, Pause, SkipForward, SkipBack, X, Volume2 } from 'lucide-react';
import { AVAILABLE_RECITERS } from '../../services/quranApi';

interface AudioPlayerBarProps {
  playingState: PlayingState;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  onTogglePlayPause: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  onStop: () => void;
  reciterId?: string;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  playingState,
  isPlaying,
  isLoading,
  progress,
  onTogglePlayPause,
  onPlayNext,
  onPlayPrev,
  onStop,
  reciterId = 'ar.alafasy',
}) => {
  const reciter = AVAILABLE_RECITERS.find(r => r.id === reciterId) || AVAILABLE_RECITERS[0];

  return (
    <div
      className="fixed bottom-[65px] inset-x-2 sm:inset-x-auto sm:right-1/2 sm:translate-x-1/2 sm:w-[480px] z-30 bg-white/95 dark:bg-[#101c16]/95 backdrop-blur-md rounded-2xl shadow-xl border-2 border-emerald-600/30 dark:border-emerald-500/30 overflow-hidden transition-all animate-slide-up"
      dir="rtl"
    >
      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      <div className="p-3 flex items-center justify-between gap-2">
        {/* Reciter and Verse Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
            <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
          </div>
          <div className="min-w-0 truncate">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate font-sans">
              سورة {playingState.surahName} • آية {toArabicDigits(playingState.ayah.numberInSurah)}
            </h4>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-sans truncate">
              {reciter.name}
            </p>
          </div>
        </div>

        {/* Audio Controls (in RTL, SkipForward moves forward in time, i.e. Next Ayah) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Previous Ayah */}
          <button
            onClick={onPlayPrev}
            className="p-1.5 text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors focus:outline-none"
            title="الآية السابقة"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={onTogglePlayPause}
            className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center hover:bg-emerald-800 active:scale-95 transition-all shadow-sm focus:outline-none"
            title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          >
            {isLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 mr-0.5" />
            )}
          </button>

          {/* Next Ayah */}
          <button
            onClick={onPlayNext}
            className="p-1.5 text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors focus:outline-none"
            title="الآية التالية"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Close / Stop */}
          <button
            onClick={onStop}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-1 focus:outline-none"
            title="إغلاق المشغل"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
