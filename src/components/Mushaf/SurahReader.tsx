import React, { useEffect, useState, useRef } from 'react';
import { getSurah } from '../../services/quranApi';
import { Ayah, SurahDetail, SurahMeta } from '../../types/quran';
import { toArabicDigits, formatAyahSymbol, BISMILLAH_TEXT, stripPrefixBasmalah } from '../../utils/arabicUtils';
import { ChevronRight, ChevronLeft, ArrowRight, Play, Pause, AlertCircle, BookOpen, Volume2, Type } from 'lucide-react';

interface SurahReaderProps {
  surahNumber: number;
  initialAyahNumber?: number;
  onBack: () => void;
  onSelectSurah: (num: number, ayahNum?: number) => void;
  onAyahClick: (ayah: Ayah, surah: SurahMeta) => void;
  onPlaySurah: (ayahs: Ayah[], surahNumber: number, surahName: string, startFromAyahNumber?: number) => void;
  isPlaying?: boolean;
  playingAyahNumber?: number;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
}

export const SurahReader: React.FC<SurahReaderProps> = ({
  surahNumber,
  initialAyahNumber,
  onBack,
  onSelectSurah,
  onAyahClick,
  onPlaySurah,
  isPlaying = false,
  playingAyahNumber,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
}) => {
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ayahRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getSurah(surahNumber)
      .then(detail => {
        if (!isMounted) return;
        setSurahDetail(detail);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Failed to load surah', err);
        setError('تعذر تحميل السورة، يرجى التحقق من الاتصال والمحاولة مرة أخرى');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [surahNumber]);

  // Scroll to initial ayah or currently playing ayah
  useEffect(() => {
    if (loading || !surahDetail) return;

    const targetAyahNum = playingAyahNumber
      ? surahDetail.ayahs.find(a => a.number === playingAyahNumber)?.numberInSurah
      : initialAyahNumber;

    if (targetAyahNum && ayahRefs.current.has(targetAyahNum)) {
      const el = ayahRefs.current.get(targetAyahNum);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [loading, playingAyahNumber, initialAyahNumber, surahDetail]);

  const isMeccan = surahDetail?.revelationType === 'Meccan';

  const handlePlayFullSurah = () => {
    if (!surahDetail) return;
    onPlaySurah(surahDetail.ayahs, surahDetail.number, surahDetail.name, 1);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Navigation Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-[#121c17] p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>قائمة السور</span>
        </button>

        {/* Font Controls */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={onDecreaseFontSize}
            className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
            title="تصغير الخط"
          >
            A-
          </button>
          <span className="text-[10px] text-slate-400 font-sans px-1">
            {toArabicDigits(fontSize)}
          </span>
          <button
            onClick={onIncreaseFontSize}
            className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
            title="تكبير الخط"
          >
            A+
          </button>
        </div>

        {/* Next / Prev Surah */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectSurah(surahNumber - 1)}
            disabled={surahNumber <= 1}
            className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="السورة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectSurah(surahNumber + 1)}
            disabled={surahNumber >= 114}
            className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="السورة التالية"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-sans">جاري تحميل السورة الكريمة...</p>
        </div>
      )}

      {error && (
        <div className="py-16 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          <button
            onClick={() => onSelectSurah(surahNumber)}
            className="px-4 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {!loading && !error && surahDetail && (
        <div className="relative bg-[#fffefb] dark:bg-[#0f1713] rounded-3xl border-2 border-emerald-900/15 dark:border-emerald-500/20 shadow-md p-4 sm:p-7 transition-colors">
          {/* Decorative inner golden border */}
          <div className="absolute inset-2 sm:inset-3 border border-amber-600/20 dark:border-amber-400/15 rounded-2xl pointer-events-none" />

          {/* Surah Ornamental Header Card */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-100 via-amber-50 to-emerald-100 dark:from-emerald-950/70 dark:via-[#1a231b] dark:to-emerald-950/70 border border-amber-600/30 text-center select-none shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-sans font-bold bg-white/70 dark:bg-black/30 text-emerald-900 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-700/20">
                سورة رقم {toArabicDigits(surahDetail.number)}
              </span>

              <span className="text-[11px] font-sans font-medium bg-white/70 dark:bg-black/30 text-emerald-900 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-700/20">
                {isMeccan ? 'مكية' : 'مدنية'} • {toArabicDigits(surahDetail.numberOfAyahs)} آية
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 font-sans tracking-wide my-1">
              سورة {surahDetail.name}
            </h2>

            {/* Audio play button for whole surah */}
            <div className="mt-3 flex justify-center">
              <button
                onClick={handlePlayFullSurah}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>تشغيل السورة كاملة بصوت القارئ</span>
              </button>
            </div>

            {/* Basmalah Banner (except Surah At-Tawbah 9) */}
            {surahDetail.number !== 9 && (
              <div className="mt-4 pt-3 border-t border-amber-600/20">
                <p className="font-quran text-xl sm:text-2xl text-emerald-900 dark:text-amber-200 font-bold">
                  {BISMILLAH_TEXT}
                </p>
              </div>
            )}
          </div>

          {/* Ayahs Stream */}
          <div
            className="font-quran leading-[2.6] text-justify text-slate-900 dark:text-slate-100 py-2 select-text"
            style={{ fontSize: `${fontSize}px` }}
            dir="rtl"
          >
            {surahDetail.ayahs.map((ayah) => {
              const isPlayingThisAyah = playingAyahNumber === ayah.number;
              const cleanedText = stripPrefixBasmalah(ayah.text, surahDetail.number, ayah.numberInSurah);

              return (
                <span
                  key={ayah.number}
                  ref={(el) => {
                    if (el) {
                      ayahRefs.current.set(ayah.numberInSurah, el);
                    } else {
                      ayahRefs.current.delete(ayah.numberInSurah);
                    }
                  }}
                  onClick={() => onAyahClick(ayah, surahDetail)}
                  className={`cursor-pointer transition-all px-1 py-0.5 rounded-xl inline leading-loose ${
                    isPlayingThisAyah
                      ? 'bg-amber-300/80 dark:bg-amber-500/30 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400 font-bold shadow-xs'
                      : 'hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40'
                  }`}
                  title="انقر لعرض التفسير والاستماع وخيارات الآية"
                >
                  {cleanedText}
                  <span className="text-emerald-700 dark:text-emerald-400 inline-block font-sans text-base select-none mx-1.5 align-middle">
                    {formatAyahSymbol(ayah.numberInSurah)}
                  </span>
                </span>
              );
            })}
          </div>

          {/* Surah Footer */}
          <div className="mt-8 pt-4 border-t border-amber-600/20 text-center text-xs text-slate-400 font-sans">
            نهاية سورة {surahDetail.name} • الحمد لله رب العالمين
          </div>
        </div>
      )}
    </div>
  );
};
