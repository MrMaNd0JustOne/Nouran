import React from 'react';
import { JUZ_LIST, JuzInfo } from '../../data/juzData';
import { toArabicDigits } from '../../utils/arabicUtils';
import { BookMarked, ChevronLeft } from 'lucide-react';

interface JuzListProps {
  onSelectJuz: (juz: JuzInfo) => void;
}

export const JuzList: React.FC<JuzListProps> = ({ onSelectJuz }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {JUZ_LIST.map((juz) => (
        <button
          key={juz.number}
          onClick={() => onSelectJuz(juz)}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#121c17] border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 text-right transition-all group focus:outline-none shadow-2xs hover:shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center justify-center text-xs font-bold font-sans group-hover:bg-amber-200 transition-colors">
              {toArabicDigits(juz.number)}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-sans group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {juz.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                يبدأ من: سورة {juz.startSurahName} (آية {toArabicDigits(juz.startAyahNumber)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full font-sans">
              ص {toArabicDigits(juz.startPage)}
            </span>
            <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:-translate-x-1" />
          </div>
        </button>
      ))}
    </div>
  );
};
