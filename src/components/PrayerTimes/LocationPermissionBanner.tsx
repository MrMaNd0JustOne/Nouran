import React from 'react';
import { Navigation, MapPin, ShieldCheck, X } from 'lucide-react';

interface LocationPermissionBannerProps {
  onAllow: () => void;
  onChooseManually: () => void;
  onDismiss: () => void;
  isLocating: boolean;
}

export const LocationPermissionBanner: React.FC<LocationPermissionBannerProps> = ({
  onAllow,
  onChooseManually,
  onDismiss,
  isLocating,
}) => {
  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 dark:from-[#13231c] dark:via-[#0e1a14] dark:to-[#171b12] border-2 border-emerald-500/30 p-4 sm:p-5 shadow-sm text-right">
      <button
        onClick={onDismiss}
        className="absolute left-3 top-3 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        title="إغلاق التنبيه"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pl-6">
        <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Navigation className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 font-sans">
            تحديد مواقيت الصلاة بدقة لمدينتك
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            يحتاج تطبيق نوران لمعرفة موقعك الجغرافي لحساب مواقيت الأذان والشروق والقبلة بدقة متناهية لخط العرض والطول الخاص بك. خصوصيتك مصونة ولا نشارك موقعك مطلقاً.
          </p>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
        <button
          onClick={onAllow}
          disabled={isLocating}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          {isLocating ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          <span>{isLocating ? 'جاري التحديد...' : 'السماح بتحديد موقعي (GPS)'}</span>
        </button>

        <button
          onClick={onChooseManually}
          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>اختيار المدينة يدوياً</span>
        </button>
      </div>
    </div>
  );
};
