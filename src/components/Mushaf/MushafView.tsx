import React, { useState } from 'react';
import { SurahMeta, Ayah, Bookmark, LastRead } from '../../types/quran';
import { SurahList } from './SurahList';
import { JuzList } from './JuzList';
import { PageReader } from './PageReader';
import { SurahReader } from './SurahReader';
import { BookmarksList } from './BookmarksList';
import { JuzInfo } from '../../data/juzData';
import { toArabicDigits } from '../../utils/arabicUtils';
import { BookOpen, Layers, Bookmark as BookmarkIcon, Compass, Play, BookMarked, Search, ArrowRight, Sparkles } from 'lucide-react';

interface MushafViewProps {
  surahs: SurahMeta[];
  activeSurahNumber: number | null;
  activeAyahNumber: number | null;
  activePageNumber: number | null;
  onSelectSurah: (surahNum: number, ayahNum?: number) => void;
  onSelectPage: (page: number) => void;
  onClearActiveReading: () => void;
  lastRead: LastRead | null;
  onSetLastRead: (lr: LastRead) => void;
  bookmarks: Bookmark[];
  onToggleBookmark: (bm: Omit<Bookmark, 'id' | 'timestamp'>) => void;
  onRemoveBookmark: (id: string) => void;
  onClearBookmarks: () => void;
  onOpenAyahMenu: (ayah: Ayah, surah: SurahMeta) => void;
  onPlaySurahAudio: (ayahs: Ayah[], surahNum: number, surahName: string, startFromAyahNum?: number) => void;
  isPlaying?: boolean;
  playingAyahNumber?: number;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
}

type MushafTab = 'surahs' | 'juzs' | 'bookmarks';

export const MushafView: React.FC<MushafViewProps> = ({
  surahs,
  activeSurahNumber,
  activeAyahNumber,
  activePageNumber,
  onSelectSurah,
  onSelectPage,
  onClearActiveReading,
  lastRead,
  onSetLastRead,
  bookmarks,
  onToggleBookmark,
  onRemoveBookmark,
  onClearBookmarks,
  onOpenAyahMenu,
  onPlaySurahAudio,
  isPlaying,
  playingAyahNumber,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
}) => {
  const [activeTab, setActiveTab] = useState<MushafTab>('surahs');
  const [quickPageInput, setQuickPageInput] = useState('');
  const [quickPageError, setQuickPageError] = useState<string | null>(null);

  const handleQuickPageJump = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseInt(quickPageInput.trim(), 10);
    if (isNaN(val) || val < 1 || val > 604) {
      setQuickPageError('يرجى إدخال رقم صفحة صحيح بين 1 و 604');
      return;
    }
    setQuickPageError(null);
    setQuickPageInput('');
    onSelectPage(val);
  };

  const handleReturnToLastRead = () => {
    if (!lastRead) {
      onSelectPage(1);
      return;
    }
    if (lastRead.page && lastRead.page >= 1 && lastRead.page <= 604) {
      onSelectPage(lastRead.page);
    } else {
      onSelectSurah(lastRead.surahNumber, lastRead.ayahNumber);
    }
  };

  // If currently reading a specific Surah
  if (activeSurahNumber !== null) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-2 pb-28 space-y-3">
        {/* Navigation & Return to last read bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button
            onClick={onClearActiveReading}
            className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:underline flex items-center gap-1"
          >
            ← العودة لفهرس المصحف
          </button>

          {lastRead && (lastRead.surahNumber !== activeSurahNumber || lastRead.ayahNumber !== activeAyahNumber) && (
            <button
              onClick={handleReturnToLastRead}
              className="text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100/90 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
              title={`العودة لآخر قراءة: سورة ${lastRead.surahName} (صفحة ${lastRead.page})`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>العودة لآخر قراءة</span>
              <span className="text-[10px] bg-amber-200/80 dark:bg-amber-900/90 px-1.5 py-0.5 rounded-md font-sans">
                سورة {lastRead.surahName}
              </span>
            </button>
          )}
        </div>

        <SurahReader
          surahNumber={activeSurahNumber}
          initialAyahNumber={activeAyahNumber || undefined}
          onBack={onClearActiveReading}
          onSelectSurah={(num) => onSelectSurah(num)}
          onAyahClick={onOpenAyahMenu}
          onPlaySurah={onPlaySurahAudio}
          isPlaying={isPlaying}
          playingAyahNumber={playingAyahNumber}
          fontSize={fontSize}
          onIncreaseFontSize={onIncreaseFontSize}
          onDecreaseFontSize={onDecreaseFontSize}
        />
      </div>
    );
  }

  // If currently reading by page
  if (activePageNumber !== null) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-2 pb-28 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button
            onClick={onClearActiveReading}
            className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:underline flex items-center gap-1"
          >
            ← العودة لفهرس المصحف
          </button>

          <div className="flex items-center gap-2">
            {lastRead && lastRead.page !== activePageNumber && (
              <button
                onClick={handleReturnToLastRead}
                className="text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100/90 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                title={`العودة لآخر قراءة: صفحة ${lastRead.page}`}
              >
                <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>العودة لآخر قراءة (ص {toArabicDigits(lastRead.page)})</span>
              </button>
            )}
          </div>
        </div>

        <PageReader
          currentPage={activePageNumber}
          onPageChange={onSelectPage}
          onAyahClick={onOpenAyahMenu}
          playingAyahNumber={playingAyahNumber}
          fontSize={fontSize}
          lastRead={lastRead}
          onReturnToLastRead={handleReturnToLastRead}
        />
      </div>
    );
  }

  const handleSelectJuz = (juz: JuzInfo) => {
    // Navigate directly to that page
    onSelectPage(juz.startPage);
  };

  const handleSelectBookmark = (bm: Bookmark) => {
    onSelectSurah(bm.surahNumber, bm.ayahNumber);
  };

  return (
    <div className="space-y-4 pb-28 max-w-2xl mx-auto px-4 pt-2">
      {/* Quick Page Jump & Return to Last Read Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#121c17] border border-emerald-900/10 dark:border-emerald-500/15 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                التنقل السريع بين صفحات المصحف
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                أدخل رقم الصفحة مباشرة أو عد لآخر موضع توقفت عنده
              </p>
            </div>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold border border-emerald-200 dark:border-emerald-800">
            604 صفحة
          </span>
        </div>

        {/* Direct page number input form */}
        <form onSubmit={handleQuickPageJump} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min={1}
                max={604}
                value={quickPageInput}
                onChange={(e) => {
                  setQuickPageInput(e.target.value);
                  if (quickPageError) setQuickPageError(null);
                }}
                placeholder="أدخل رقم الصفحة (1 - 604)..."
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl py-2 px-3 text-xs font-sans text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
              />
              <span className="absolute left-3 top-2 text-[10px] text-slate-400 pointer-events-none font-sans">
                ص 1 - 604
              </span>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <span>انتقال</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          {quickPageError && (
            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold px-1">
              {quickPageError}
            </p>
          )}
        </form>

        {/* Prominent "العودة لآخر قراءة" Button */}
        <button
          onClick={handleReturnToLastRead}
          className={`w-full p-2.5 px-3.5 rounded-2xl border transition-all flex items-center justify-between text-xs font-bold ${
            lastRead
              ? 'bg-gradient-to-r from-amber-50/90 via-emerald-50/50 to-amber-50/90 dark:from-amber-950/40 dark:via-emerald-950/30 dark:to-amber-950/40 border-amber-300/80 dark:border-amber-800/70 text-amber-950 dark:text-amber-200 hover:border-amber-400 active:scale-98 shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Compass className={`w-4 h-4 ${lastRead ? 'text-amber-600 dark:text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span>العودة لآخر قراءة</span>
          </div>

          {lastRead ? (
            <div className="flex items-center gap-1.5 text-[11px] font-sans">
              <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                سورة {lastRead.surahName}
              </span>
              <span className="text-slate-400">•</span>
              <span className="bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-lg border border-amber-300/40 font-mono">
                ص {toArabicDigits(lastRead.page)}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 font-normal">
              اضغط للبدء من أول المصحف (صفحة 1)
            </span>
          )}
        </button>

        {/* Quick Page Presets */}
        <div className="pt-1 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-slate-400 font-semibold ml-1">
            صفحات شائعة:
          </span>
          {[
            { p: 1, label: 'الفاتحة (1)' },
            { p: 50, label: 'البقرة (50)' },
            { p: 293, label: 'الكهف (293)' },
            { p: 440, label: 'يس (440)' },
            { p: 562, label: 'الملك (562)' },
            { p: 582, label: 'عم (582)' },
            { p: 604, label: 'الناس (604)' },
          ].map((item) => (
            <button
              key={item.p}
              type="button"
              onClick={() => onSelectPage(item.p)}
              className="text-[10px] px-2 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-200 border border-slate-200 dark:border-slate-700 transition-colors font-sans"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Navigation within Mushaf */}
      <div className="flex items-center bg-slate-100 dark:bg-[#121c17] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-xs font-bold text-slate-600 dark:text-slate-300">
        <button
          onClick={() => setActiveTab('surahs')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'surahs'
              ? 'bg-white dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 shadow-xs'
              : 'hover:text-emerald-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>السور ({toArabicDigits(114)})</span>
        </button>

        <button
          onClick={() => setActiveTab('juzs')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'juzs'
              ? 'bg-white dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 shadow-xs'
              : 'hover:text-emerald-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>الأجزاء ({toArabicDigits(30)})</span>
        </button>

        <button
          onClick={() => onSelectPage(lastRead?.page || 1)}
          className="flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 hover:text-emerald-700"
          title="تصفح المصحف بالصفحات (1-604)"
        >
          <BookMarked className="w-4 h-4" />
          <span>المصحف (صفحات)</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'bookmarks'
              ? 'bg-white dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 shadow-xs'
              : 'hover:text-emerald-700'
          }`}
        >
          <BookmarkIcon className="w-4 h-4" />
          <span>العلامات ({toArabicDigits(bookmarks.length)})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'surahs' && (
        <SurahList
          surahs={surahs}
          onSelectSurah={(num) => onSelectSurah(num)}
          lastReadSurahNumber={lastRead?.surahNumber}
        />
      )}

      {activeTab === 'juzs' && (
        <JuzList onSelectJuz={handleSelectJuz} />
      )}

      {activeTab === 'bookmarks' && (
        <BookmarksList
          bookmarks={bookmarks}
          onSelectBookmark={handleSelectBookmark}
          onRemoveBookmark={onRemoveBookmark}
          onClearAll={onClearBookmarks}
        />
      )}
    </div>
  );
};
