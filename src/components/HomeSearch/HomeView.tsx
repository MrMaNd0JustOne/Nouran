import React, { useRef } from 'react';
import { Search, Sparkles, X, History, Trash2, ArrowLeft, Radio, AlertCircle, Compass } from 'lucide-react';
import { SearchHistoryItem, SearchMatchAyah, Ayah } from '../../types/quran';
import { AyahCard } from './AyahCard';
import { DailyAyahCard } from './DailyAyahCard';
import { SmartDhikrBanner } from './SmartDhikrBanner';

interface HomeViewProps {
  query: string;
  setQuery: (q: string) => void;
  isSearching: boolean;
  error: string | null;
  results: SearchMatchAyah[];
  topMatch: SearchMatchAyah | null;
  hasSearched: boolean;
  visibleCount: number;
  executeSearch: (q: string) => void;
  loadMore: () => void;
  clearResults: () => void;
  history: SearchHistoryItem[];
  onClearHistory: () => void;
  onOpenTafsir: (match: SearchMatchAyah) => void;
  onPlayAudio: (match: SearchMatchAyah) => void;
  onPlayDailyAudio: (ayah: Ayah, surahNum: number, surahName: string) => void;
  playingAyahNumber?: number;
  onOpenInMushaf: (surahNumber: number, ayahNumber: number, page?: number) => void;
  onToggleBookmark: (match: SearchMatchAyah) => void;
  bookmarkedAyahIds: Set<string>;
  // Smart Dhikr Suggestion
  currentPrayerId?: string | null;
  onOpenAthkarCategory?: (categoryId: string) => void;
  isMorningDone?: boolean;
  isEveningDone?: boolean;
  isSleepDone?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  query,
  setQuery,
  isSearching,
  error,
  results,
  topMatch,
  hasSearched,
  visibleCount,
  executeSearch,
  loadMore,
  clearResults,
  history,
  onClearHistory,
  onOpenTafsir,
  onPlayAudio,
  onPlayDailyAudio,
  playingAyahNumber,
  onOpenInMushaf,
  onToggleBookmark,
  bookmarkedAyahIds,
  currentPrayerId,
  onOpenAthkarCategory,
  isMorningDone = false,
  isEveningDone = false,
  isSleepDone = false,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      executeSearch(query);
    }
  };

  const sampleQueries = [
    'الحمد لله رب العالمين',
    'الله لا إله إلا هو',
    'إن مع العسر يسرا',
    'ألا بذكر الله',
    'اهدنا الصراط المستقيم',
    'والضحى والليل إذا سجى',
  ];

  const handleChipClick = (q: string) => {
    setQuery(q);
    executeSearch(q);
  };

  const displayedResults = results.slice(0, visibleCount);
  const remainingCount = Math.max(0, results.length - visibleCount);

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto px-4 pt-2">
      {/* Welcome Banner */}
      {!hasSearched && (
        <div className="text-center pt-2 pb-1 space-y-1">
          <h2 className="text-2xl font-extrabold text-emerald-950 dark:text-emerald-100 font-sans tracking-tight">
            باحث آيات القرآن الكريم
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            نور العلم و نور الإيمان — ابحث عن أي آية بكتابة كلماتها أو جزء منها، لتتعرف فوراً على السورة ورقم الآية وتفسيرها الميسر والاستماع لتلاوتها.
          </p>
        </div>
      )}

      {/* Shazam-style Radar Circle Hero Button */}
      {!hasSearched && (
        <div className="flex flex-col items-center justify-center py-3">
          <div className="relative flex items-center justify-center">
            {/* Pulsing radiating rings */}
            <span className="absolute w-36 h-36 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 animate-ping pointer-events-none" />
            <span className="absolute w-28 h-28 rounded-full bg-emerald-500/20 dark:bg-emerald-400/15 animate-pulse pointer-events-none" />
            
            <button
              onClick={() => inputRef.current?.focus()}
              className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-amber-500 text-white flex flex-col items-center justify-center shadow-xl shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-emerald-500/20 group focus:outline-none"
              title="اضغط للبدء في البحث"
            >
              <Radio className="w-8 h-8 text-amber-200 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold tracking-tight text-white/95">
                ابحث الآن
              </span>
            </button>
          </div>
          <span className="text-[11px] text-emerald-800/80 dark:text-emerald-400 font-medium mt-3">
            اكتب أي جزء من آية للتعرف عليها
          </span>
        </div>
      )}

      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب جزءاً من آية... مثال: الحمد لله رب العالمين"
            dir="rtl"
            className="w-full bg-white dark:bg-[#121c17] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm sm:text-base rounded-2xl py-3.5 pr-11 pl-24 border-2 border-emerald-600/30 dark:border-emerald-500/30 focus:border-emerald-600 dark:focus:border-emerald-400 focus:outline-none shadow-lg shadow-emerald-950/5 transition-all"
          />

          {/* Search Icon */}
          <div className="absolute right-3.5 text-emerald-700 dark:text-emerald-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </div>

          {/* Action buttons inside input */}
          <div className="absolute left-2.5 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  clearResults();
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="مسح النص"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-sm flex items-center gap-1"
            >
              <span>{isSearching ? 'جاري...' : 'بحث'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Suggested Quick Chips */}
      {!hasSearched && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            أمثلة سريعة للبحث:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sampleQueries.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(item)}
                className="text-xs bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl transition-all select-none active:scale-95"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Search History (Last 10) */}
      {!hasSearched && history.length > 0 && (
        <div className="bg-white dark:bg-[#121c17] rounded-3xl p-4 border border-emerald-900/10 dark:border-emerald-500/10 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <History className="w-4 h-4 text-emerald-600" />
              <span>عمليات البحث الأخيرة</span>
            </div>
            <button
              onClick={onClearHistory}
              className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1"
              title="مسح السجل"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {history.map((h) => (
              <button
                key={h.id}
                onClick={() => handleChipClick(h.query)}
                className="text-xs bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 px-3 py-1.5 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 group"
              >
                <span>{h.query}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-500 font-mono">
                  ({h.matchCount})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Smart Athkar Suggestion based on prayer time */}
      {!hasSearched && onOpenAthkarCategory && (
        <SmartDhikrBanner
          currentPrayerId={currentPrayerId}
          onOpenCategory={onOpenAthkarCategory}
          isMorningDone={isMorningDone}
          isEveningDone={isEveningDone}
          isSleepDone={isSleepDone}
        />
      )}

      {/* Ayah of the Day */}
      {!hasSearched && (
        <DailyAyahCard
          onOpenTafsir={onOpenTafsir}
          onPlayAudio={onPlayDailyAudio}
          isPlaying={Boolean(playingAyahNumber && playingAyahNumber > 0)}
          onOpenInMushaf={onOpenInMushaf}
        />
      )}

      {/* Search State & Results */}
      {isSearching && (
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
            <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span>جاري استرجاع الآيات والتفسير المطابق...</span>
          </div>

          {/* Skeletons */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-3xl bg-white dark:bg-[#121c17] border border-slate-100 dark:border-slate-800 animate-pulse space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6" />
              </div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="flex gap-2 pt-2">
                <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => executeSearch(query)}
            className="px-3 py-1 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors whitespace-nowrap"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {hasSearched && !isSearching && results.length === 0 && !error && (
        <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-[#121c17] border border-slate-100 dark:border-slate-800 space-y-3">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
            لم يتم العثور على آيات تطابق "{query}"
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            جرّب كتابة كلمات أخرى من الآية، أو تأكد من صحة الكلمات، أو جرّب البحث بكلمة واحدة مميزة.
          </p>
          <button
            onClick={() => {
              clearResults();
              inputRef.current?.focus();
            }}
            className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 underline"
          >
            مسح والبحث من جديد
          </button>
        </div>
      )}

      {hasSearched && !isSearching && results.length > 0 && (
        <div className="space-y-4">
          {/* Results Summary Header */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 px-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-800 dark:text-emerald-400">
                نتائج البحث:
              </span>
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                {results.length} آية
              </span>
            </div>
            <button
              onClick={clearResults}
              className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 underline font-medium"
            >
              بحث جديد
            </button>
          </div>

          {/* Top Hero Match (if strong) */}
          {topMatch && (
            <AyahCard
              match={topMatch}
              query={query}
              isHero={true}
              onOpenTafsir={onOpenTafsir}
              onPlayAudio={onPlayAudio}
              isPlaying={playingAyahNumber === topMatch.number}
              onOpenInMushaf={onOpenInMushaf}
              onToggleBookmark={onToggleBookmark}
              isBookmarked={bookmarkedAyahIds.has(`${topMatch.surah.number}:${topMatch.numberInSurah}`)}
            />
          )}

          {/* Other Results list */}
          <div className="space-y-3.5">
            {displayedResults
              .filter((r) => !topMatch || r.number !== topMatch.number)
              .map((match) => (
                <AyahCard
                  key={match.number}
                  match={match}
                  query={query}
                  isHero={false}
                  onOpenTafsir={onOpenTafsir}
                  onPlayAudio={onPlayAudio}
                  isPlaying={playingAyahNumber === match.number}
                  onOpenInMushaf={onOpenInMushaf}
                  onToggleBookmark={onToggleBookmark}
                  isBookmarked={bookmarkedAyahIds.has(`${match.surah.number}:${match.numberInSurah}`)}
                />
              ))}
          </div>

          {/* Load More Button */}
          {remainingCount > 0 && (
            <div className="pt-2 text-center">
              <button
                onClick={loadMore}
                className="px-6 py-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold transition-all shadow-xs"
              >
                تحميل المزيد من النتائج (متبقي {remainingCount})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
