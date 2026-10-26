import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleTheme,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0c1411]/90 backdrop-blur-md border-b border-emerald-900/10 dark:border-emerald-500/10 px-4 py-3 transition-colors">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* App Branding */}
        <Link to="/" className="flex items-center gap-2.5 focus:outline-none group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-900/20 ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform">
            <span className="font-quran text-2xl font-bold leading-none select-none">ن</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold tracking-tight text-emerald-950 dark:text-emerald-100 font-sans">
                نُـوران
              </h1>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/50">
                تطبيق إسلامي شامل
              </span>
            </div>
            <p className="text-[11px] text-emerald-800/70 dark:text-emerald-400/80 font-medium -mt-0.5">
              باحث آيات القرآن الكريم ـ نور العلم و نور الإيمان
            </p>
          </div>
        </Link>

        {/* Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={darkMode ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
            aria-pressed={darkMode}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/70 border border-emerald-900/15 dark:border-emerald-500/25 text-emerald-900 dark:text-amber-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 active:scale-95 transition-all cursor-pointer focus:outline-none shadow-2xs"
            title={darkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
                <span className="hidden sm:inline text-[11px] font-bold text-amber-200">فاتح</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-emerald-800 transition-transform duration-300 hover:-rotate-12" />
                <span className="hidden sm:inline text-[11px] font-bold text-emerald-900">داكن</span>
              </>
            )}
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="الإعدادات"
            className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 active:scale-95 transition-all cursor-pointer focus:outline-none"
            title="الإعدادات"
          >
            <Settings className="w-5 h-5 text-emerald-900 dark:text-emerald-200 transition-transform hover:rotate-90" />
          </button>
        </div>
      </div>
    </header>
  );
};
