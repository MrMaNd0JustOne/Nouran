import React, { useEffect, useState, useRef } from 'react';
import { getPage } from '../../services/quranApi';
import { Ayah, PageData, SurahMeta } from '../../types/quran';
import { toArabicDigits, formatAyahSymbol, BISMILLAH_TEXT, stripPrefixBasmalah } from '../../utils/arabicUtils';
import { ChevronRight, ChevronLeft, ArrowRight, BookOpen, Search, AlertCircle, Compass } from 'lucide-react';
import { LastRead } from '../../types/quran';

interface PageReaderProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  onAyahClick: (ayah: Ayah, surah: SurahMeta) => void;
  playingAyahNumber?: number;
  fontSize: number;
  lastRead?: LastRead | null;
  onReturnToLastRead?: () => void;
}

export const PageReader: React.FC<PageReaderProps> = ({
  currentPage,
  onPageChange,
  onAyahClick,
  playingAyahNumber,
  fontSize,
  lastRead,
  onReturnToLastRead,
}) => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [showJumpModal, setShowJumpModal] = useState(false);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getPage(currentPage)
      .then(data => {
        if (!isMounted) return;
        setPageData(data);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Failed to load page', err);
        setError('تعذر تحميل الصفحة، يرجى المحاولة مرة أخرى');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  // Swipe handlers (RTL: swipe right -> previous page, swipe left -> next page)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped left -> in RTL, advance to next page
      if (currentPage < 604) {
        onPageChange(currentPage + 1);
      }
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> in RTL, go to previous page
      if (currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpPageInput.trim(), 10);
    if (!isNaN(num) && num >= 1 && num <= 604) {
      onPageChange(num);
      setShowJumpModal(false);
      setJumpPageInput('');
    }
  };

  // Group ayahs by surah
  const surahsOnPage: SurahMeta[] = pageData ? Object.values(pageData.surahs) : [];
  const currentJuz = pageData?.ayahs[0]?.juz || 1;

  return (
    <div className="space-y-4">
      {/* Page Navigation Top Toolbar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-white dark:bg-[#121c17] p-2 sm:p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs gap-2">
          {/* Next page button (in RTL next is lower numerical or advancing) */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= 604}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="الصفحة التالية"
          >
            <ChevronRight className="w-4 h-4" />
            <span className="hidden sm:inline">التالية</span>
          </button>

          {/* Page selector center info & Jump trigger */}
          <button
            onClick={() => setShowJumpModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-200 dark:border-emerald-800/40"
            title="انقر لإدخال رقم الصفحة مباشرة"
          >
            <span>صفحة {toArabicDigits(currentPage)} من {toArabicDigits(604)}</span>
            <Search className="w-3.5 h-3.5 text-emerald-600" />
          </button>

          {/* Prev page button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="الصفحة السابقة"
          >
            <span className="hidden sm:inline">السابقة</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Return to last read bar if reading a different page */}
        {lastRead && lastRead.page !== currentPage && onReturnToLastRead && (
          <div className="flex items-center justify-between p-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs">
            <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span>آخر موضع قراءة: سورة {lastRead.surahName} (صفحة {toArabicDigits(lastRead.page)})</span>
            </div>
            <button
              onClick={onReturnToLastRead}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors active:scale-95 shadow-2xs"
            >
              العودة لآخر قراءة
            </button>
          </div>
        )}
      </div>

      {/* Jump to page modal */}
      {showJumpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-[#101b16] rounded-3xl p-5 shadow-2xl border border-emerald-900/10 space-y-4" dir="rtl">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600" />
              <span>الانتقال السريع إلى صفحة</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              أدخل رقم الصفحة مباشرة (بين 1 و 604):
            </p>
            <form onSubmit={handleJumpSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={604}
                  value={jumpPageInput}
                  onChange={e => setJumpPageInput(e.target.value)}
                  placeholder={`الصفحة الحالية: ${currentPage}`}
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3 text-center text-lg font-bold font-sans focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Quick page shortcuts */}
              <div className="flex flex-wrap gap-1 pt-1 justify-center">
                {[
                  { p: 1, label: 'الفاتحة (1)' },
                  { p: 50, label: 'البقرة (50)' },
                  { p: 293, label: 'الكهف (293)' },
                  { p: 440, label: 'يس (440)' },
                  { p: 582, label: 'جزء عم (582)' },
                  { p: 604, label: 'الناس (604)' },
                ].map(item => (
                  <button
                    key={item.p}
                    type="button"
                    onClick={() => {
                      onPageChange(item.p);
                      setShowJumpModal(false);
                    }}
                    className="text-[10px] px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-sans"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {lastRead && onReturnToLastRead && (
                <button
                  type="button"
                  onClick={() => {
                    onReturnToLastRead();
                    setShowJumpModal(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800/60 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-600" />
                  <span>العودة لآخر قراءة (سورة {lastRead.surahName} - ص {toArabicDigits(lastRead.page)})</span>
                </button>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                >
                  انتقال
                </button>
                <button
                  type="button"
                  onClick={() => setShowJumpModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page Content View with Swipe and Quran Frame */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative min-h-[560px] bg-[#fffefb] dark:bg-[#0f1713] rounded-3xl border-2 border-emerald-900/15 dark:border-emerald-500/20 shadow-md p-4 sm:p-7 select-none transition-colors"
      >
        {/* Decorative inner golden border */}
        <div className="absolute inset-2 sm:inset-3 border border-amber-600/20 dark:border-amber-400/15 rounded-2xl pointer-events-none" />

        {/* Page Header (Surahs names and Juz number) */}
        <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300 border-b border-amber-600/20 dark:border-amber-500/15 pb-2.5 mb-4">
          <div className="flex items-center gap-1">
            <span className="font-sans">الجزء {toArabicDigits(currentJuz)}</span>
          </div>

          <div className="flex items-center gap-2">
            {surahsOnPage.map((s, idx) => (
              <span key={s.number} className="font-sans">
                سورة {s.name}
                {idx < surahsOnPage.length - 1 && ' • '}
              </span>
            ))}
          </div>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-sans">جاري تحميل صفحة المصحف...</p>
          </div>
        )}

        {error && (
          <div className="py-16 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
            <button
              onClick={() => onPageChange(currentPage)}
              className="px-4 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold"
            >
              إعادة التحميل
            </button>
          </div>
        )}

        {/* Ayahs Display */}
        {!loading && !error && pageData && (
          <div
            className="font-quran leading-[2.5] text-justify text-slate-900 dark:text-slate-100 py-2 select-text"
            style={{ fontSize: `${fontSize}px` }}
            dir="rtl"
          >
            {pageData.ayahs.map((ayah) => {
              const surah = pageData.surahs[ayah.surah?.number || 1] || ayah.surah || {
                number: 1,
                name: 'الفاتحة',
                englishName: '',
                englishNameTranslation: '',
                numberOfAyahs: 7,
                revelationType: 'Meccan',
              };

              const isFirstAyahInSurah = ayah.numberInSurah === 1;
              const isPlaying = playingAyahNumber === ayah.number;
              const cleanedText = stripPrefixBasmalah(ayah.text, surah.number, ayah.numberInSurah);

              return (
                <React.Fragment key={ayah.number}>
                  {/* Surah Header Banner if first ayah of surah */}
                  {isFirstAyahInSurah && (
                    <div className="my-4 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-100 via-amber-50 to-emerald-100 dark:from-emerald-950/60 dark:via-[#1a2118] dark:to-emerald-950/60 border border-amber-600/30 text-center select-none block">
                      <h3 className="font-bold text-base text-emerald-950 dark:text-emerald-100 font-sans">
                        سورة {surah.name}
                      </h3>
                      <div className="text-[11px] text-emerald-800/80 dark:text-emerald-300 font-sans mt-0.5">
                        {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {toArabicDigits(surah.numberOfAyahs)} آية
                      </div>
                      {/* Basmalah banner if not Surah At-Tawbah (9) */}
                      {surah.number !== 9 && (
                        <p className="font-quran text-lg text-emerald-900 dark:text-amber-200 mt-2 font-bold select-none">
                          {BISMILLAH_TEXT}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Clickable Ayah Span */}
                  <span
                    onClick={() => onAyahClick(ayah, surah)}
                    className={`cursor-pointer transition-colors px-1 py-0.5 rounded-lg inline ${
                      isPlaying
                        ? 'bg-amber-300/80 dark:bg-amber-500/30 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400'
                        : 'hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40'
                    }`}
                    title="انقر لعرض التفسير والاستماع والخيارات"
                  >
                    {cleanedText}
                    <span className="text-emerald-700 dark:text-emerald-400 inline-block font-sans text-sm select-none mx-1.5 align-middle">
                      {formatAyahSymbol(ayah.numberInSurah)}
                    </span>
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Page Footer (Page number) */}
        <div className="mt-6 pt-3 border-t border-amber-600/20 dark:border-amber-500/15 flex items-center justify-center text-xs font-bold text-emerald-900 dark:text-emerald-300">
          <span className="font-sans px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            {toArabicDigits(currentPage)}
          </span>
        </div>
      </div>
    </div>
  );
};
