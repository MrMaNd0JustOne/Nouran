import React, { useState } from 'react';
import { Ayah, SurahMeta } from '../../types/quran';
import { toArabicDigits, formatAyahSymbol } from '../../utils/arabicUtils';
import { BookOpen, Play, Pause, Bookmark, BookmarkCheck, Copy, Check, Share2, X, Compass, CheckCircle2 } from 'lucide-react';

interface AyahActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  ayah: Ayah;
  surah: SurahMeta;
  onOpenTafsir: () => void;
  onPlayAudio: () => void;
  isPlaying?: boolean;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onSaveAsLastRead: () => void;
  isLastRead?: boolean;
}

export const AyahActionMenu: React.FC<AyahActionMenuProps> = ({
  isOpen,
  onClose,
  ayah,
  surah,
  onOpenTafsir,
  onPlayAudio,
  isPlaying = false,
  isBookmarked,
  onToggleBookmark,
  onSaveAsLastRead,
  isLastRead = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [savedLastRead, setSavedLastRead] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      const text = `﴿${ayah.text}﴾ [سورة ${surah.name} - الآية ${ayah.numberInSurah}]`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy error', e);
    }
  };

  const handleShare = async () => {
    const text = `﴿${ayah.text}﴾ [سورة ${surah.name} - الآية ${ayah.numberInSurah}] - عبر تطبيق نوران`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `سورة ${surah.name} - آية ${ayah.numberInSurah}`,
          text,
        });
        return;
      } catch (e) {
        // dismissed
      }
    }
    handleCopy();
  };

  const handleSetLastRead = () => {
    onSaveAsLastRead();
    setSavedLastRead(true);
    setTimeout(() => setSavedLastRead(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className="w-full max-w-lg bg-white dark:bg-[#101b16] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-emerald-900/10 dark:border-emerald-500/20 overflow-hidden flex flex-col max-h-[85vh] animate-slide-up"
        dir="rtl"
      >
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs font-bold font-sans">
              {toArabicDigits(ayah.numberInSurah)}
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-sans">
                سورة {surah.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                الآية {toArabicDigits(ayah.numberInSurah)} • الجزء {toArabicDigits(ayah.juz)} • ص {toArabicDigits(ayah.page)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ayah Verse Excerpt */}
        <div className="p-4 sm:p-5 bg-emerald-50/40 dark:bg-emerald-950/20 border-b border-slate-100 dark:border-slate-800 max-h-40 overflow-y-auto">
          <p className="font-quran text-xl leading-loose text-slate-900 dark:text-slate-100 text-center">
            {ayah.text}
            <span className="text-emerald-700 dark:text-emerald-400 text-base mr-2 inline-block font-sans select-none">
              {formatAyahSymbol(ayah.numberInSurah)}
            </span>
          </p>
        </div>

        {/* Action Menu List */}
        <div className="p-3 sm:p-4 grid grid-cols-2 gap-2 text-xs font-medium">
          {/* Tafsir */}
          <button
            onClick={() => {
              onClose();
              onOpenTafsir();
            }}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-100 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors border border-slate-200/60 dark:border-slate-700/60"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold">تفسير الآية</span>
          </button>

          {/* Audio */}
          <button
            onClick={() => {
              onPlayAudio();
            }}
            className={`flex items-center gap-2.5 p-3 rounded-2xl transition-colors border ${
              isPlaying
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-100 hover:text-emerald-800 dark:hover:text-emerald-300 border-slate-200/60 dark:border-slate-700/60'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isPlaying ? 'bg-amber-600 text-white' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'}`}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </div>
            <span className="font-bold">{isPlaying ? 'إيقاف التلاوة' : 'استماع صوتي'}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={onToggleBookmark}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-100 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors border border-slate-200/60 dark:border-slate-700/60"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
            </div>
            <span className="font-bold">{isBookmarked ? 'إزالة العلامة' : 'علامة مرجعية'}</span>
          </button>

          {/* Last read position */}
          <button
            onClick={handleSetLastRead}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-100 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors border border-slate-200/60 dark:border-slate-700/60"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              {savedLastRead || isLastRead ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Compass className="w-4 h-4" />}
            </div>
            <span className="font-bold">{savedLastRead ? 'تم الحفظ!' : 'آخر موضع قراءة'}</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-100 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors border border-slate-200/60 dark:border-slate-700/60"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </div>
            <span className="font-bold">{copied ? 'تم النسخ' : 'نسخ الآية'}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-100 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors border border-slate-200/60 dark:border-slate-700/60"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <span className="font-bold">مشاركة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
