import React, { useState } from 'react';
import { SearchMatchAyah } from '../../types/quran';
import { toArabicDigits, formatAyahSymbol, getHighlightedSegments } from '../../utils/arabicUtils';
import { Play, Pause, BookOpen, Share2, Copy, Check, Sparkles, Volume2, Bookmark, BookmarkCheck } from 'lucide-react';

interface AyahCardProps {
  match: SearchMatchAyah;
  query: string;
  isHero?: boolean;
  onOpenTafsir: (match: SearchMatchAyah) => void;
  onPlayAudio: (match: SearchMatchAyah) => void;
  isPlaying?: boolean;
  onOpenInMushaf: (surahNumber: number, ayahNumber: number, page?: number) => void;
  onToggleBookmark?: (match: SearchMatchAyah) => void;
  isBookmarked?: boolean;
}

export const AyahCard: React.FC<AyahCardProps> = ({
  match,
  query,
  isHero = false,
  onOpenTafsir,
  onPlayAudio,
  isPlaying = false,
  onOpenInMushaf,
  onToggleBookmark,
  isBookmarked = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // Uthmani text if available, fallback to simple text
  const displayText = match.uthmaniText || match.text;

  // Segments for highlighting
  const segments = getHighlightedSegments(displayText, query);

  const handleCopy = async () => {
    try {
      const shareContent = `﴿${displayText}﴾ [سورة ${match.surah.name} - الآية ${match.numberInSurah}]`;
      await navigator.clipboard.writeText(shareContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy text', e);
    }
  };

  const handleShare = async () => {
    const shareContent = `﴿${displayText}﴾ [سورة ${match.surah.name} - الآية ${match.numberInSurah}] - عبر تطبيق نوران`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `آية من سورة ${match.surah.name}`,
          text: shareContent,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch (e) {
        // Ignored or dismissed
      }
    }
    // Fallback copy
    handleCopy();
  };

  const isMeccan = match.surah.revelationType === 'Meccan';

  return (
    <article
      className={`relative rounded-3xl transition-all duration-300 overflow-hidden ${
        isHero
          ? 'bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 dark:from-[#11241c] dark:via-[#0e1a14] dark:to-[#1a1c12] border-2 border-emerald-500/40 shadow-xl shadow-emerald-950/10 dark:shadow-black/40 ring-4 ring-emerald-500/10'
          : 'bg-white dark:bg-[#121c17] border border-emerald-900/10 dark:border-emerald-500/10 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Hero Badge Banner */}
      {isHero && (
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-amber-600 text-white px-4 py-2 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            <span className="text-xs font-bold font-sans tracking-wide">
              تم العثور على الآية بنجاح!
            </span>
          </div>
          {match.similarity && (
            <span className="text-[11px] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full font-sans font-medium">
              تطابق: {Math.round(match.similarity * 100)}%
            </span>
          )}
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Top Meta Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs font-bold">
              {toArabicDigits(match.surah.number)}
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans">
                سورة {match.surah.name}
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                الآية {toArabicDigits(match.numberInSurah)} من {toArabicDigits(match.surah.numberOfAyahs)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span
              className={`px-2 py-0.5 rounded-full font-medium ${
                isMeccan
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              }`}
            >
              {isMeccan ? 'مكية' : 'مدنية'}
            </span>
            {match.juz && (
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                الجزء {toArabicDigits(match.juz)}
              </span>
            )}
            {match.page && (
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                ص {toArabicDigits(match.page)}
              </span>
            )}
          </div>
        </div>

        {/* Verse Text (Uthmani with Highlight) */}
        <div className="py-2 px-1">
          <p
            className={`font-quran leading-[2.2] text-right text-slate-900 dark:text-slate-50 select-text ${
              isHero ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}
            dir="rtl"
          >
            {segments.map((seg, idx) =>
              seg.isMatch ? (
                <mark
                  key={idx}
                  className="bg-amber-200/90 dark:bg-amber-500/30 text-amber-950 dark:text-amber-100 px-1 py-0.5 rounded mx-0.5 font-bold shadow-xs border-b border-amber-400"
                >
                  {seg.text}
                </mark>
              ) : (
                <span key={idx}>{seg.text}</span>
              )
            )}
            <span className="text-emerald-700 dark:text-emerald-400 text-lg mr-2 inline-block font-sans select-none">
              {formatAyahSymbol(match.numberInSurah)}
            </span>
          </p>
        </div>

        {/* Tafsir Preview (if loaded) */}
        {match.tafsir && (
          <div className="mt-3.5 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/40 dark:border-emerald-800/30 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 ml-1">التفسير الميسر:</span>
            <span>{match.tafsir}</span>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Tafsir Bottom Sheet Button */}
            <button
              onClick={() => onOpenTafsir(match)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-sm focus:outline-none"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>التفسير الكامل</span>
            </button>

            {/* Audio Listen */}
            <button
              onClick={() => onPlayAudio(match)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors focus:outline-none ${
                isPlaying
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800/60'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'إيقاف' : 'استماع'}</span>
            </button>

            {/* Open in Mushaf */}
            <button
              onClick={() => onOpenInMushaf(match.surah.number, match.numberInSurah, match.page)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="فتح هذه الآية في المصحف الشريف"
            >
              <span>فتح بالمصحف</span>
            </button>
          </div>

          {/* Quick utility buttons (Copy, Share, Bookmark) */}
          <div className="flex items-center gap-1">
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(match)}
                className={`p-2 rounded-xl transition-colors focus:outline-none ${
                  isBookmarked
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isBookmarked ? 'إزالة من العلامات' : 'إضافة للعلامات المرجعية'}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={handleCopy}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              title="نسخ الآية"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              title="مشاركة الآية"
            >
              {shared ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
