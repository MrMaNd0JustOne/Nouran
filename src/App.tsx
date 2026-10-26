import React, { useState, useEffect, useLayoutEffect } from 'react';
import { ActiveTab, Ayah, Bookmark, LastRead, SearchMatchAyah, SurahMeta } from './types/quran';
import { CityOption } from './types/prayer';
import { getSurahs } from './services/quranApi';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useQuranSearch } from './hooks/useQuranSearch';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useGeolocation } from './hooks/useGeolocation';
import { usePrayerTimes } from './hooks/usePrayerTimes';
import { useAdhkarProgress } from './hooks/useAdhkarProgress';
import { useWirdPlan } from './hooks/useWirdPlan';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeSearch/HomeView';
import { MushafView } from './components/Mushaf/MushafView';
import { PrayerTimesView } from './components/PrayerTimes/PrayerTimesView';
import { AthkarView } from './components/Athkar/AthkarView';
import { WirdView } from './components/Wird/WirdView';
import { TafsirBottomSheet } from './components/TafsirBottomSheet';
import { AyahActionMenu } from './components/Mushaf/AyahActionMenu';
import { AudioPlayerBar } from './components/Mushaf/AudioPlayerBar';
import { SettingsModal } from './components/Settings/SettingsModal';
import { LocationModal } from './components/PrayerTimes/LocationModal';

export default function App() {
  // Theme state
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('nouran_theme', 'light');
  const isDarkMode = theme === 'dark';

  // Apply dark mode class and color-scheme synchronously to html & body
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDarkMode ? '#0c1411' : '#064e3b');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSetTheme = (mode: 'light' | 'dark') => {
    setTheme(mode);
  };

  // User Settings state
  const [fontSize, setFontSize] = useLocalStorage<number>('nouran_font_size', 25);
  const [selectedTafsir, setSelectedTafsir] = useLocalStorage<string>('nouran_tafsir', 'ar.muyassar');
  const [selectedReciter, setSelectedReciter] = useLocalStorage<string>('nouran_reciter', 'ar.alafasy');
  const [searchHistory, setSearchHistory] = useLocalStorage<any[]>('nouran_search_history', []);
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>('nouran_bookmarks', []);
  const [lastRead, setLastRead] = useLocalStorage<LastRead | null>('nouran_last_read', null);

  // Prayer Settings state
  const [prayerMethodId, setPrayerMethodId] = useLocalStorage<number>('nouran_prayer_method', 5);
  const [prayerSchool, setPrayerSchool] = useLocalStorage<number>('nouran_prayer_school', 0);
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage<boolean>('nouran_adhan_notifications', false);
  const [prayerReminderOffset, setPrayerReminderOffset] = useLocalStorage<number>('nouran_prayer_reminder_offset', 0);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Geolocation Hook
  const {
    location,
    isLoading: isLocating,
    permissionStatus,
    requestLocation,
    setManualLocation,
  } = useGeolocation();

  // Prayer Times Hook (shared so Home and PrayerTimes can both access)
  const { currentPrayer } = usePrayerTimes({
    location,
    methodId: prayerMethodId,
    school: prayerSchool,
    notificationsEnabled,
    reminderOffsetMinutes: prayerReminderOffset,
  });

  // Athkar Progress Hook
  const {
    getRemaining,
    isDhikrCompleted,
    decrementCount,
    resetCategory,
    resetAll: resetAllAthkar,
    isMorningDone,
    isEveningDone,
    isSleepDone,
  } = useAdhkarProgress();

  // Wird Plan Hook (synced with Athkar checklist status)
  const {
    plan,
    progress: wirdProgress,
    checklist,
    todayWirdCalc,
    configurePlan,
    markTodayAsCompleted,
    recordPageRead,
    redistributeRemaining,
    startNewKhatmah,
    toggleChecklistItem,
    resetWirdData,
  } = useWirdPlan({
    isMorningDone,
    isEveningDone,
    isSleepDone,
  });

  // App Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('search');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeAthkarCategory, setActiveAthkarCategory] = useState<string | null>(null);

  // Mushaf Reading Mode state
  const [activeSurahNumber, setActiveSurahNumber] = useState<number | null>(null);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number | null>(null);
  const [activePageNumber, setActivePageNumber] = useState<number | null>(null);

  // Quran Surahs meta cache
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);

  useEffect(() => {
    getSurahs()
      .then(data => setSurahs(data))
      .catch(err => console.warn('Surahs load error', err));
  }, []);

  // Audio Hook
  const {
    playingState,
    isPlaying,
    isLoading: isAudioLoading,
    progress: audioProgress,
    playAyah,
    playNext,
    playPrev,
    togglePlayPause,
    stopAudio,
  } = useAudioPlayer(selectedReciter);

  // Search Hook
  const {
    query,
    setQuery,
    isSearching,
    error: searchError,
    results: searchResults,
    topMatch,
    hasSearched,
    visibleCount,
    executeSearch,
    loadMore,
    clearResults,
  } = useQuranSearch(searchHistory, setSearchHistory, selectedTafsir);

  // Tafsir Bottom Sheet state
  const [tafsirSheetState, setTafsirSheetState] = useState<{
    isOpen: boolean;
    surahNumber: number;
    ayahNumber: number;
    surahName: string;
  }>({
    isOpen: false,
    surahNumber: 1,
    ayahNumber: 1,
    surahName: 'الفاتحة',
  });

  // Ayah Action Context Menu state (for Mushaf)
  const [ayahActionState, setAyahActionState] = useState<{
    isOpen: boolean;
    ayah: Ayah | null;
    surah: SurahMeta | null;
  }>({
    isOpen: false,
    ayah: null,
    surah: null,
  });

  // Open Tafsir Modal
  const handleOpenTafsirFromMatch = (match: SearchMatchAyah) => {
    setTafsirSheetState({
      isOpen: true,
      surahNumber: match.surah.number,
      ayahNumber: match.numberInSurah,
      surahName: match.surah.name,
    });
  };

  const handleOpenTafsirDirect = (surahNum: number, ayahNum: number, surahName: string) => {
    setTafsirSheetState({
      isOpen: true,
      surahNumber: surahNum,
      ayahNumber: ayahNum,
      surahName,
    });
  };

  // Play audio for search match
  const handlePlayAudioFromMatch = (match: SearchMatchAyah) => {
    const ayahObj: Ayah = {
      number: match.number,
      text: match.uthmaniText || match.text,
      numberInSurah: match.numberInSurah,
      juz: match.juz || 1,
      manzil: 1,
      page: match.page || 1,
      ruku: 1,
      hizbQuarter: 1,
      sajda: false,
    };
    playAyah(ayahObj, match.surah.number, match.surah.name);
  };

  const handlePlayDailyAudio = (ayah: Ayah, surahNum: number, surahName: string) => {
    playAyah(ayah, surahNum, surahName);
  };

  // Open in Mushaf from Search or Daily Ayah
  const handleOpenInMushaf = (surahNumber: number, ayahNumber: number, page?: number) => {
    setActiveTab('mushaf');
    setActivePageNumber(page || null);
    setActiveSurahNumber(surahNumber);
    setActiveAyahNumber(ayahNumber);
  };

  // Start reading from Daily Wird
  const handleStartReadingWird = (pageNumber: number) => {
    setActiveTab('mushaf');
    setActiveSurahNumber(null);
    setActiveAyahNumber(null);
    setActivePageNumber(pageNumber);
  };

  // Navigate to Athkar category from Home recommendation
  const handleOpenAthkarCategoryFromHome = (categoryId: string) => {
    setActiveAthkarCategory(categoryId);
    setActiveTab('athkar');
  };

  // Bookmarking helpers
  const bookmarkedAyahIds = new Set(bookmarks.map(b => `${b.surahNumber}:${b.ayahNumber}`));

  const handleToggleBookmarkFromMatch = (match: SearchMatchAyah) => {
    const key = `${match.surah.number}:${match.numberInSurah}`;
    if (bookmarkedAyahIds.has(key)) {
      setBookmarks(prev => prev.filter(b => `${b.surahNumber}:${b.ayahNumber}` !== key));
    } else {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        surahNumber: match.surah.number,
        surahName: match.surah.name,
        ayahNumber: match.numberInSurah,
        page: match.page || 1,
        juz: match.juz || 1,
        timestamp: Date.now(),
        textPreview: match.uthmaniText || match.text,
      };
      setBookmarks(prev => [newBookmark, ...prev]);
    }
  };

  const handleToggleBookmarkFromMushaf = () => {
    if (!ayahActionState.ayah || !ayahActionState.surah) return;
    const { ayah, surah } = ayahActionState;
    const key = `${surah.number}:${ayah.numberInSurah}`;

    if (bookmarkedAyahIds.has(key)) {
      setBookmarks(prev => prev.filter(b => `${b.surahNumber}:${b.ayahNumber}` !== key));
    } else {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        surahNumber: surah.number,
        surahName: surah.name,
        ayahNumber: ayah.numberInSurah,
        page: ayah.page,
        juz: ayah.juz,
        timestamp: Date.now(),
        textPreview: ayah.text,
      };
      setBookmarks(prev => [newBookmark, ...prev]);
    }
  };

  const handleSaveLastRead = () => {
    if (!ayahActionState.ayah || !ayahActionState.surah) return;
    const { ayah, surah } = ayahActionState;
    setLastRead({
      surahNumber: surah.number,
      surahName: surah.name,
      ayahNumber: ayah.numberInSurah,
      page: ayah.page,
      timestamp: Date.now(),
    });
  };

  // Play whole surah audio sequentially
  const handlePlaySurahAudio = (
    ayahs: Ayah[],
    surahNumber: number,
    surahName: string,
    startFromAyahNum = 1
  ) => {
    const startAyah = ayahs.find(a => a.numberInSurah === startFromAyahNum) || ayahs[0];
    if (startAyah) {
      playAyah(startAyah, surahNumber, surahName, ayahs);
    }
  };

  const handleAyahMenuOpen = (ayah: Ayah, surah: SurahMeta) => {
    setAyahActionState({
      isOpen: true,
      ayah,
      surah,
    });
  };

  // Backup & Restore handlers
  const handleExportBackup = () => {
    try {
      const backupData: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nouran_')) {
          backupData[key] = JSON.parse(localStorage.getItem(key) || '""');
        }
      }
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nouran-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('حدث خطأ أثناء تصدير النسخة الاحتياطية');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        Object.keys(parsed).forEach(k => {
          if (k.startsWith('nouran_')) {
            localStorage.setItem(k, JSON.stringify(parsed[k]));
          }
        });
        alert('تمت استعادة البيانات بنجاح! سيتم تحديث الصفحة.');
        window.location.reload();
      } catch {
        alert('الملف غير صالح أو تالف.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] dark:bg-[#0c1411] text-[#1e293b] dark:text-[#e2e8f0] font-sans antialiased selection:bg-emerald-600 selection:text-white transition-colors">
      {/* Top Header */}
      <Header
        darkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Router */}
      <main className="container mx-auto">
        {activeTab === 'search' && (
          <HomeView
            query={query}
            setQuery={setQuery}
            isSearching={isSearching}
            error={searchError}
            results={searchResults}
            topMatch={topMatch}
            hasSearched={hasSearched}
            visibleCount={visibleCount}
            executeSearch={executeSearch}
            loadMore={loadMore}
            clearResults={clearResults}
            history={searchHistory}
            onClearHistory={() => setSearchHistory([])}
            onOpenTafsir={handleOpenTafsirFromMatch}
            onPlayAudio={handlePlayAudioFromMatch}
            onPlayDailyAudio={handlePlayDailyAudio}
            playingAyahNumber={playingState?.ayah.number}
            onOpenInMushaf={handleOpenInMushaf}
            onToggleBookmark={handleToggleBookmarkFromMatch}
            bookmarkedAyahIds={bookmarkedAyahIds}
            currentPrayerId={currentPrayer?.id}
            onOpenAthkarCategory={handleOpenAthkarCategoryFromHome}
            isMorningDone={isMorningDone}
            isEveningDone={isEveningDone}
            isSleepDone={isSleepDone}
          />
        )}

        {activeTab === 'mushaf' && (
          <MushafView
            surahs={surahs}
            activeSurahNumber={activeSurahNumber}
            activeAyahNumber={activeAyahNumber}
            activePageNumber={activePageNumber}
            onSelectSurah={(surahNum, ayahNum) => {
              setActiveSurahNumber(surahNum);
              setActiveAyahNumber(ayahNum || null);
              setActivePageNumber(null);
            }}
            onSelectPage={(page) => {
              setActivePageNumber(page);
              setActiveSurahNumber(null);
              setActiveAyahNumber(null);
              // Track wird completion if reading through target
              recordPageRead(page);
            }}
            onClearActiveReading={() => {
              setActiveSurahNumber(null);
              setActiveAyahNumber(null);
              setActivePageNumber(null);
            }}
            lastRead={lastRead}
            onSetLastRead={setLastRead}
            bookmarks={bookmarks}
            onToggleBookmark={(b) => {
              const newBm: Bookmark = {
                ...b,
                id: Date.now().toString(),
                timestamp: Date.now(),
              };
              setBookmarks(prev => [newBm, ...prev]);
            }}
            onRemoveBookmark={(id) => setBookmarks(prev => prev.filter(b => b.id !== id))}
            onClearBookmarks={() => setBookmarks([])}
            onOpenAyahMenu={handleAyahMenuOpen}
            onPlaySurahAudio={handlePlaySurahAudio}
            isPlaying={isPlaying}
            playingAyahNumber={playingState?.ayah.number}
            fontSize={fontSize}
            onIncreaseFontSize={() => setFontSize(prev => Math.min(38, prev + 2))}
            onDecreaseFontSize={() => setFontSize(prev => Math.max(18, prev - 2))}
          />
        )}

        {activeTab === 'athkar' && (
          <AthkarView
            getRemaining={getRemaining}
            isDhikrCompleted={isDhikrCompleted}
            onTapDhikr={decrementCount}
            onResetCategory={resetCategory}
            initialCategoryId={activeAthkarCategory}
          />
        )}

        {activeTab === 'wird' && (
          <WirdView
            plan={plan}
            progress={wirdProgress}
            checklist={checklist}
            todayWirdCalc={todayWirdCalc}
            onConfigurePlan={configurePlan}
            onMarkCompleted={markTodayAsCompleted}
            onRedistribute={redistributeRemaining}
            onStartNewKhatmah={startNewKhatmah}
            onToggleChecklist={toggleChecklistItem}
            onStartReading={handleStartReadingWird}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
          />
        )}

        {activeTab === 'prayer_times' && (
          <PrayerTimesView
            location={location}
            onSetLocation={setManualLocation}
            onRequestGeolocation={requestLocation}
            isLocating={isLocating}
            permissionStatus={permissionStatus}
            methodId={prayerMethodId}
            school={prayerSchool}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={() => setNotificationsEnabled(prev => !prev)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            reminderOffsetMinutes={prayerReminderOffset}
            onSelectReminderOffset={setPrayerReminderOffset}
          />
        )}
      </main>

      {/* Floating Audio Player Bar */}
      {playingState && (
        <AudioPlayerBar
          playingState={playingState}
          isPlaying={isPlaying}
          isLoading={isAudioLoading}
          progress={audioProgress}
          onTogglePlayPause={togglePlayPause}
          onPlayNext={playNext}
          onPlayPrev={playPrev}
          onStop={stopAudio}
          reciterId={selectedReciter}
        />
      )}

      {/* Ayah Action Bottom Sheet Menu */}
      {ayahActionState.isOpen && ayahActionState.ayah && ayahActionState.surah && (
        <AyahActionMenu
          isOpen={ayahActionState.isOpen}
          onClose={() => setAyahActionState(prev => ({ ...prev, isOpen: false }))}
          ayah={ayahActionState.ayah}
          surah={ayahActionState.surah}
          onOpenTafsir={() =>
            handleOpenTafsirDirect(
              ayahActionState.surah!.number,
              ayahActionState.ayah!.numberInSurah,
              ayahActionState.surah!.name
            )
          }
          onPlayAudio={() =>
            playAyah(
              ayahActionState.ayah!,
              ayahActionState.surah!.number,
              ayahActionState.surah!.name
            )
          }
          isPlaying={playingState?.ayah.number === ayahActionState.ayah.number && isPlaying}
          isBookmarked={bookmarkedAyahIds.has(
            `${ayahActionState.surah.number}:${ayahActionState.ayah.numberInSurah}`
          )}
          onToggleBookmark={handleToggleBookmarkFromMushaf}
          onSaveAsLastRead={handleSaveLastRead}
          isLastRead={
            lastRead?.surahNumber === ayahActionState.surah.number &&
            lastRead?.ayahNumber === ayahActionState.ayah.numberInSurah
          }
        />
      )}

      {/* Tafsir Bottom Sheet Modal */}
      <TafsirBottomSheet
        isOpen={tafsirSheetState.isOpen}
        onClose={() => setTafsirSheetState(prev => ({ ...prev, isOpen: false }))}
        surahNumber={tafsirSheetState.surahNumber}
        ayahNumber={tafsirSheetState.ayahNumber}
        surahName={tafsirSheetState.surahName}
        defaultTafsirId={selectedTafsir}
        onPlayAudio={(globalAyah) => {
          if (playingState?.ayah.number === globalAyah && isPlaying) {
            togglePlayPause();
          } else {
            const ayahStub: Ayah = {
              number: globalAyah,
              text: '',
              numberInSurah: tafsirSheetState.ayahNumber,
              juz: 1,
              manzil: 1,
              page: 1,
              ruku: 1,
              hizbQuarter: 1,
              sajda: false,
            };
            playAyah(ayahStub, tafsirSheetState.surahNumber, tafsirSheetState.surahName);
          }
        }}
        isPlaying={playingState?.ayah.numberInSurah === tafsirSheetState.ayahNumber && isPlaying}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        darkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onSetTheme={handleSetTheme}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        selectedTafsir={selectedTafsir}
        onSelectTafsir={setSelectedTafsir}
        selectedReciter={selectedReciter}
        onSelectReciter={setSelectedReciter}
        onClearHistory={() => setSearchHistory([])}
        onClearBookmarks={() => setBookmarks([])}
        prayerMethodId={prayerMethodId}
        onSelectPrayerMethod={setPrayerMethodId}
        prayerSchool={prayerSchool}
        onSelectPrayerSchool={setPrayerSchool}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={() => setNotificationsEnabled(prev => !prev)}
        currentCityName={location.cityName}
        onOpenLocationPicker={() => setIsLocationModalOpen(true)}
        reminderOffsetMinutes={prayerReminderOffset}
        onSelectReminderOffset={setPrayerReminderOffset}
        wirdReminderEnabled={plan.reminderEnabled}
        onToggleWirdReminder={() => configurePlan({ reminderEnabled: !plan.reminderEnabled })}
        wirdReminderTime={plan.reminderTime}
        onSelectWirdReminderTime={(time) => configurePlan({ reminderTime: time })}
        onResetAthkar={resetAllAthkar}
        onResetWird={resetWirdData}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      {/* City & Geolocation Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectCity={setManualLocation}
        onRequestGeolocation={requestLocation}
        isLocating={isLocating}
        currentCityName={location.cityName}
      />

      {/* Bottom Navigation (5 tabs) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'athkar') {
            setActiveAthkarCategory(null);
          }
        }}
      />
    </div>
  );
}
