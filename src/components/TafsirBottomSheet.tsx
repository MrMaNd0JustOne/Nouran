import React, { useState, useEffect } from 'react';
import { X, BookOpen, Volume2, Play, Pause, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { getAyahWithTafsir, AVAILABLE_TAFSIRS } from '../services/quranApi';
import { toArabicDigits, formatAyahSymbol } from '../utils/arabicUtils';

interface TafsirBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  defaultTafsirId?: string;
  onPlayAudio?: (globalAyahNum: number) => void;
  isPlaying?: boolean;
}

export const TafsirBottomSheet: React.FC<TafsirBottomSheetProps> = ({
  isOpen,
  onClose,
  surahNumber,
  ayahNumber,
  surahName,
  defaultTafsirId = 'ar.muyassar',
  onPlayAudio,
  isPlaying = false,
}) => {
  const [selectedTafsirId, setSelectedTafsirId] = useState(defaultTafsirId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uthmaniText, setUthmaniText] = useState<string>('');
  const [tafsirText, setTafsirText] = useState<string>('');
  const [globalAyahNumber, setGlobalAyahNumber] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSelectedTafsirId(defaultTafsirId);
  }, [defaultTafsirId]);

  useEffect(() => {
    if (!isOpen || !surahNumber || !ayahNumber) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    getAyahWithTafsir(surahNumber, ayahNumber, selectedTafsirId)
      .then(res => {
        if (!isMounted) return;
        setUthmaniText(res.uthmani.text);
        setTafsirText(res.tafsirText);
        setGlobalAyahNumber(res.uthmani.number);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Error fetching tafsir:', err);
        setError('تعذر تحميل التفسير، يرجى المحاولة لاحقاً');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, surahNumber, ayahNumber, selectedTafsirId]);

  if (!isOpen) return null;

  const handleCopyBoth = async () => {
    try {
      const activeTafsir = AVAILABLE_TAFSIRS.find(t => t.id === selectedTafsirId);
      const textToCopy = `﴿${uthmaniText}﴾ [سورة ${surahName} - الآية ${ayahNumber}]\n\n📖 ${activeTafsir?.name || 'التفسير'}:\n${tafsirText}\n\n(عبر تطبيق نوران)`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Backdrop tap to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Sheet Modal Container */}
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0f1814] text-slate-900 dark:text-slate-100 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-emerald-900/10 dark:border-emerald-500/20 max-h-[85vh] flex flex-col overflow-hidden animate-slide-up"
        dir="rtl"
      >
        {/* Drag handle for mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Modal Header */}
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                تفسير سورة {surahName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                الآية الكريمة {toArabicDigits(ayahNumber)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onPlayAudio && (
              <button
                onClick={() => onPlayAudio(globalAyahNumber)}
                className={`p-2 rounded-xl transition-colors ${
                  isPlaying
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200'
                }`}
                title="استماع للآية"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={handleCopyBoth}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="نسخ الآية مع التفسير"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tafsir Source Selector Chips */}
        <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 overflow-x-auto scrollbar-none flex gap-2">
          {AVAILABLE_TAFSIRS.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTafsirId(t.id)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-all font-medium ${
                selectedTafsirId === t.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Ayah Card Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-center">
            <p className="font-quran text-2xl sm:text-3xl leading-[2.2] text-slate-900 dark:text-slate-50">
              {uthmaniText || '...'}
              <span className="text-emerald-700 dark:text-emerald-400 text-xl mr-2 font-sans">
                {formatAyahSymbol(ayahNumber)}
              </span>
            </p>
          </div>

          {/* Tafsir Body */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {AVAILABLE_TAFSIRS.find(t => t.id === selectedTafsirId)?.name || 'التفسير'}:
              </span>
            </div>

            {loading ? (
              <div className="space-y-2.5 animate-pulse py-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/6" />
              </div>
            ) : error ? (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs text-center border border-rose-200/50">
                {error}
              </div>
            ) : (
              <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 text-justify">
                {tafsirText}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
