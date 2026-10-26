import React, { useState } from 'react';
import { DayWirdRecord } from '../../types/wird';
import { toArabicDigits } from '../../utils/arabicUtils';
import { ChevronRight, ChevronLeft, Check, Calendar as CalendarIcon } from 'lucide-react';

interface WirdCalendarProps {
  history: Record<string, DayWirdRecord>;
}

export const WirdCalendar: React.FC<WirdCalendarProps> = ({ history }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const daysArray: Array<{ dayNum: number; dateStr: string; isCompleted: boolean; isToday: boolean } | null> = [];

  // Padding days for start of week (in RTL Sunday-Thursday-Friday-Saturday)
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isCompleted = Boolean(history[dStr]?.isCompleted);
    const isToday = dStr === todayStr;
    daysArray.push({ dayNum: d, dateStr: dStr, isCompleted, isToday });
  }

  const completedDaysCount = Object.keys(history).filter((k) => {
    return k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`) && history[k].isCompleted;
  }).length;

  return (
    <div className="bg-white dark:bg-[#121c17] rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-4">
      {/* Month Navigator Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-600" />
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-sans">
            {arabicMonths[month]} {toArabicDigits(year)}
          </h4>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full ml-1">
            أنجزت {toArabicDigits(completedDaysCount)} يوماً
          </span>

          <button
            onClick={prevMonth}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="الشهر السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="الشهر التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays row */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 font-sans">
        <span>أحد</span>
        <span>اثنين</span>
        <span>ثلاثاء</span>
        <span>أربعاء</span>
        <span>خميس</span>
        <span>جمعة</span>
        <span>سبت</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysArray.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="h-9" />;
          }

          return (
            <div
              key={cell.dateStr}
              className={`h-9 rounded-xl flex flex-col items-center justify-center font-sans text-xs transition-colors relative ${
                cell.isCompleted
                  ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                  : cell.isToday
                  ? 'border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{toArabicDigits(cell.dayNum)}</span>
              {cell.isCompleted && (
                <Check className="w-2.5 h-2.5 text-white/90 -mt-0.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
