import React, { useState } from 'react';
import { SurahMeta } from '../../types/quran';
import { toArabicDigits, normalizeArabic } from '../../utils/arabicUtils';
import { Search, ChevronLeft } from 'lucide-react';

interface SurahListProps {
  surahs: SurahMeta[];
  onSelectSurah: (surahNumber: number) => void;
  lastReadSurahNumber?: number;
}

export const SurahList: React.FC<SurahListProps> = ({
  surahs,
  onSelectSurah,
  lastReadSurahNumber,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredSurahs = surahs.filter((s) => {
    if (!filterQuery.trim()) return true;
    const query = normalizeArabic(filterQuery);
    const normName = normalizeArabic(s.name);
    const normEn = s.englishName.toLowerCase();
    const queryNum = parseInt(filterQuery.trim(), 10);

    return (
      normName.includes(query) ||
      normEn.includes(filterQuery.toLowerCase()) ||
      (!isNaN(queryNum) && s.number === queryNum)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Input for Surahs */}
      <div className="relative">
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="ابحث عن اسم السورة أو رقمها... (مثال: الكهف أو 18)"
          dir="rtl"
          className="w-full bg-white dark:bg-[#121c17] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm rounded-2xl py-3 pr-10 pl-4 border border-slate-200 dark:border-slate-800 focus:border-emerald-600 focus:outline-none shadow-xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Surahs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredSurahs.map((surah) => {
          const isMeccan = surah.revelationType === 'Meccan';
          const isLastRead = lastReadSurahNumber === surah.number;

          return (
            <button
              key={surah.number}
              onClick={() => onSelectSurah(surah.number)}
              className={`flex items-center justify-between p-3.5 rounded-2xl text-right transition-all group focus:outline-none ${
                isLastRead
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-500/60 shadow-sm'
                  : 'bg-white dark:bg-[#121c17] border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Surah Number Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-sans transition-colors ${
                    isLastRead
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 group-hover:bg-emerald-200'
                  }`}
                >
                  {toArabicDigits(surah.number)}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-sans group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      سورة {surah.name}
                    </h3>
                    {isLastRead && (
                      <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                        آخر قراءة
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="font-sans">{surah.englishName}</span>
                    <span>•</span>
                    <span className="font-sans">
                      {toArabicDigits(surah.numberOfAyahs)} آية
                    </span>
                  </div>
                </div>
              </div>

              {/* Revelation Type Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isMeccan
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                  }`}
                >
                  {isMeccan ? 'مكية' : 'مدنية'}
                </span>
                <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:-translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>

      {filteredSurahs.length === 0 && (
        <div className="text-center py-8 text-xs text-slate-400">
          لا توجد سور مطابقة لـ "{filterQuery}"
        </div>
      )}
    </div>
  );
};
