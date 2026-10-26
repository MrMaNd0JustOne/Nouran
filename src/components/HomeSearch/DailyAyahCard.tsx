import React, { useEffect, useState } from 'react';
import { getTodayAyahInfo, DailyAyahInfo } from '../../data/dailyAyahs';
import { getAyahWithTafsir } from '../../services/quranApi';
import { Ayah, SearchMatchAyah } from '../../types/quran';
import { formatAyahSymbol, toArabicDigits } from '../../utils/arabicUtils';
import { Sparkles, BookOpen, Play, Pause, Copy, Check, Share2, Compass } from 'lucide-react';

interface DailyAyahCardProps {
  onOpenTafsir: (match: SearchMatchAyah) => void;
  onPlayAudio: (ayah: Ayah, surahNumber: number, surahName: string) => void;
  isPlaying?: boolean;
  onOpenInMushaf: (surahNumber: number, ayahNumber: number, page?: number) => void;
}

export const DailyAyahCard: React.FC<DailyAyahCardProps> = ({
  onOpenTafsir,
  onPlayAudio,
  isPlaying = false,
  onOpenInMushaf,
}) => {
  const [dailyInfo] = useState<DailyAyahInfo>(getTodayAyahInfo);
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [tafsir, setTafsir] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAyahWithTafsir(dailyInfo.surahNumber, dailyInfo.ayahNumber)
      .then(res => {
        if (!mounted) return;
        setAyah(res.uthmani);
        setTafsir(res.tafsirText);
      })
      .catch(err => {
        console.warn('Failed to load daily ayah', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [dailyInfo]);

  const handleCopy = async () => {
    if (!ayah) return;
    try {
      const text = `﴿${ayah.text}﴾ [سورة ${dailyInfo.surahName} - الآية ${dailyInfo.ayahNumber}] - آية اليوم في نوران`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn(e);
    }
  };

  const toSearchMatch = (): SearchMatchAyah => {
    return {
      number: ayah ? ayah.number : 1,
      text: ayah ? ayah.text : '',
      uthmaniText: ayah ? ayah.text : '',
      tafsir,
      numberInSurah: dailyInfo.ayahNumber,
      surah: {
        number: dailyInfo.surahNumber,
        name: dailyInfo.surahName,
        englishName: '',
        englishNameTranslation: '',
        numberOfAyahs: 0,
        revelationType: 'Meccan',
      },
      page: ayah?.page,
      juz: ayah?.juz,
      edition: {
        identifier: 'quran-uthmani',
        language: 'ar',
        name: 'المصحف الشريف',
        englishName: 'Uthmani',
        format: 'text',
        type: 'quran',
      },
    };
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-[#062c21] text-white p-5 shadow-xl shadow-emerald-950/20 border border-emerald-500/30 overflow-hidden">
      {/* Decorative Islamic geometric subtle rings */}
      <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full border border-emerald-500/10 pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full border border-amber-500/10 pointer-events-none" />

      {/* Header Row */}
      <div className="relative flex items-center justify-between gap-2 mb-3 border-b border-emerald-800/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide text-amber-300 font-sans flex items-center gap-1.5">
              آيــة اليــوم
              <span className="text-[10px] text-emerald-200/70 font-normal font-sans">
                {dailyInfo.theme}
              </span>
            </h3>
          </div>
        </div>

        <span className="text-[11px] bg-emerald-800/80 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-700/60 font-sans">
          سورة {dailyInfo.surahName} • آية {toArabicDigits(dailyInfo.ayahNumber)}
        </span>
      </div>

      {/* Ayah Content */}
      {loading ? (
        <div className="py-6 space-y-3 animate-pulse">
          <div className="h-5 bg-emerald-800/50 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-emerald-800/30 rounded w-1/2 mx-auto" />
        </div>
      ) : ayah ? (
        <div className="relative py-2">
          <p className="font-quran text-2xl sm:text-3xl leading-[2.3] text-center text-amber-50 drop-shadow-xs">
            {ayah.text}
            <span className="text-amber-400 text-lg mr-2 font-sans inline-block">
              {formatAyahSymbol(dailyInfo.ayahNumber)}
            </span>
          </p>

          {tafsir && (
            <p className="mt-3 text-xs text-emerald-200/90 leading-relaxed text-center line-clamp-2 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40 font-sans">
              <span className="font-bold text-amber-300 ml-1">الميسر:</span>
              {tafsir}
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-emerald-300/80 text-center py-4">
          ﴿{dailyInfo.theme}﴾ [سورة {dailyInfo.surahName}]
        </p>
      )}

      {/* Actions */}
      <div className="relative mt-4 pt-3 border-t border-emerald-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          {ayah && (
            <button
              onClick={() => onPlayAudio(ayah, dailyInfo.surahNumber, dailyInfo.surahName)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                isPlaying
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/40'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'إيقاف' : 'استماع'}</span>
            </button>
          )}

          <button
            onClick={() => onOpenTafsir(toSearchMatch())}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/50 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>التفسير</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenInMushaf(dailyInfo.surahNumber, dailyInfo.ayahNumber, ayah?.page)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-emerald-200 hover:text-white bg-emerald-900/50 hover:bg-emerald-800/60 transition-colors text-[11px]"
          >
            <span>في المصحف</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition-colors"
            title="نسخ الآية"
          >
            {copied ? <Check className="w-4 h-4 text-amber-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
