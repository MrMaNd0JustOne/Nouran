import React from 'react';
import { Sun, Moon, Bed, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { toArabicDigits } from '../../utils/arabicUtils';

interface SmartDhikrBannerProps {
  currentPrayerId?: string | null;
  onOpenCategory: (categoryId: string) => void;
  isMorningDone: boolean;
  isEveningDone: boolean;
  isSleepDone: boolean;
}

export const SmartDhikrBanner: React.FC<SmartDhikrBannerProps> = ({
  currentPrayerId,
  onOpenCategory,
  isMorningDone,
  isEveningDone,
  isSleepDone,
}) => {
  // Determine recommendation based on current prayer
  let categoryId = 'morning';
  let title = 'أذكار الصباح';
  let subtitle = 'ابدأ يومك بحفظ الله وذكره';
  let isDone = isMorningDone;
  let Icon = Sun;
  let gradient = 'from-amber-500/20 via-amber-500/10 to-emerald-500/10 border-amber-400/40 text-amber-950 dark:text-amber-100';

  if (currentPrayerId === 'Fajr' || currentPrayerId === 'Sunrise') {
    categoryId = 'morning';
    title = 'حان وقت أذكار الصباح';
    subtitle = 'حصن المسلم من الفجر حتى الظهيرة';
    isDone = isMorningDone;
    Icon = Sun;
    gradient = 'from-amber-500/20 via-amber-500/10 to-emerald-500/10 border-amber-400/40 text-amber-950 dark:text-amber-100';
  } else if (currentPrayerId === 'Asr' || currentPrayerId === 'Maghrib') {
    categoryId = 'evening';
    title = 'حان وقت أذكار المساء';
    subtitle = 'حصن نفسك مع إقبال الليل والغروب';
    isDone = isEveningDone;
    Icon = Moon;
    gradient = 'from-emerald-700/20 via-emerald-800/15 to-slate-800/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-100';
  } else if (currentPrayerId === 'Isha') {
    categoryId = 'sleep';
    title = 'أذكار النوم وسنن الفراش';
    subtitle = 'اختم يومك بآية الكرسي والمعوذات والذكر';
    isDone = isSleepDone;
    Icon = Bed;
    gradient = 'from-indigo-700/20 via-emerald-900/15 to-slate-800/10 border-indigo-500/40 text-indigo-950 dark:text-indigo-100';
  } else {
    // Dhuhr
    categoryId = 'morning';
    title = 'أذكار الصباح واليوم';
    subtitle = 'من قالها كُتبت له مائة حسنة ومُحيت عنه مائة سيئة';
    isDone = isMorningDone;
    Icon = Sun;
  }

  return (
    <div
      onClick={() => onOpenCategory(categoryId)}
      className={`rounded-3xl p-4 border bg-gradient-to-r ${gradient} flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] shadow-2xs group select-none`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-black/30 backdrop-blur-xs flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs group-hover:scale-105 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-xs sm:text-sm font-sans flex items-center gap-1.5">
              <span>{title}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
            </h4>
            {isDone && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.2 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>أتممتها اليوم</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
        <span>قراءة</span>
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
