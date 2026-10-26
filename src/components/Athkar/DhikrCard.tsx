import React, { useState } from 'react';
import { DhikrItem } from '../../types/adhkar';
import { toArabicDigits } from '../../utils/arabicUtils';
import { Check, Copy, Share2, Sparkles, BookOpen, RotateCcw } from 'lucide-react';

interface DhikrCardProps {
  item: DhikrItem;
  remainingCount: number;
  isCompleted: boolean;
  onTap: () => void;
  onReset?: () => void;
}

export const DhikrCard: React.FC<DhikrCardProps> = ({
  item,
  remainingCount,
  isCompleted,
  onTap,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const textToCopy = `«${item.arabicText}»\n\n[المصدر: ${item.source}]${item.virtue ? `\n[الفضل: ${item.virtue}]` : ''}\n- عبر تطبيق نوران`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToShare = `«${item.arabicText}»\n\n[المصدر: ${item.source}] - عبر تطبيق نوران`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ذكر من تطبيق نوران',
          text: textToShare,
        });
        return;
      } catch {
        // dismissed
      }
    }
    handleCopy(e);
  };

  return (
    <div
      onClick={onTap}
      className={`relative rounded-3xl p-5 border transition-all duration-300 cursor-pointer select-none text-right overflow-hidden group ${
        isCompleted
          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/50 shadow-xs opacity-90'
          : 'bg-white dark:bg-[#121c17] border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm active:scale-[0.99]'
      }`}
    >
      {/* Decorative completion ribbon/badge */}
      {isCompleted && (
        <div className="absolute top-0 left-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-br-2xl flex items-center gap-1 shadow-xs">
          <Check className="w-3.5 h-3.5" />
          <span>تم بحمد الله</span>
        </div>
      )}

      {/* Top Header: Repeat badge and actions */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          {/* Remaining counter circle button */}
          <div
            className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-sans font-extrabold transition-all duration-200 ${
              isCompleted
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gradient-to-tr from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-900/20 group-hover:scale-105'
            }`}
          >
            {isCompleted ? (
              <Check className="w-6 h-6 animate-fade-in" />
            ) : (
              <>
                <span className="text-base leading-none">{toArabicDigits(remainingCount)}</span>
                <span className="text-[9px] opacity-80 leading-none mt-0.5">متبقي</span>
              </>
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
              التكرار المطلوب: {toArabicDigits(item.repeatCount)} {item.repeatCount === 1 ? 'مرة واحدة' : 'مرات'}
            </span>
            <span className="text-[10px] text-slate-400">
              اضغط على البطاقة لإنقاص العداد
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="نسخ الذكر"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleShare}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="مشاركة الذكر"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Arabic Text */}
      <div className="py-2 px-1">
        <p
          className={`font-quran text-lg sm:text-xl leading-[2.3] text-slate-900 dark:text-slate-100 select-text ${
            isCompleted ? 'text-slate-600 dark:text-slate-400 line-through-none' : ''
          }`}
          dir="rtl"
        >
          {item.arabicText}
        </p>
      </div>

      {/* Virtue Box if available */}
      {item.virtue && (
        <div className="mt-3 p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <span>{item.virtue}</span>
        </div>
      )}

      {/* Source Reference Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-emerald-600" />
          <span>المصدر:</span>
          <span className="font-sans font-medium text-slate-600 dark:text-slate-300">
            {item.source}
          </span>
        </div>

        {!isCompleted && (
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
            انقر للتسبيح ⟵
          </span>
        )}
      </div>
    </div>
  );
};
