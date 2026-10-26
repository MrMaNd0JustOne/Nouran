export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number; // Global ayah index (1-6236)
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | object;
  surah?: SurahMeta;
  audio?: string;
}

export interface SurahDetail extends SurahMeta {
  ayahs: Ayah[];
}

export interface PageData {
  pageNumber: number;
  ayahs: Ayah[];
  surahs: Record<number, SurahMeta>;
}

export interface JuzData {
  juzNumber: number;
  ayahs: Ayah[];
}

export interface SearchMatchAyah {
  number: number;
  text: string;
  edition: {
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    format: string;
    type: string;
  };
  surah: SurahMeta;
  numberInSurah: number;
  juz?: number;
  page?: number;
  similarity?: number;
  uthmaniText?: string;
  tafsir?: string;
}

export interface QuranEdition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: 'text' | 'audio';
  type: string;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  page: number;
  juz: number;
  timestamp: number;
  textPreview?: string;
  note?: string;
}

export interface LastRead {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  page: number;
  timestamp: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  matchCount: number;
}

export interface AyahTafsir {
  surahNumber: number;
  ayahNumber: number;
  tafsirText: string;
  tafsirName: string;
}

export interface Reciter {
  id: string;
  name: string;
  subtext: string;
  identifier: string;
}

export interface TafsirSource {
  id: string;
  name: string;
  author: string;
  identifier: string;
}

export type ActiveTab = 'search' | 'mushaf' | 'athkar' | 'wird' | 'prayer_times';
export type MushafMode = 'surah' | 'page';
