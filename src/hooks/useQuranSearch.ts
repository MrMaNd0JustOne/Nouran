import { useState, useCallback } from 'react';
import { SearchMatchAyah, SearchHistoryItem } from '../types/quran';
import { searchQuranSimple, getAyahWithTafsir } from '../services/quranApi';
import { normalizeArabic, calculateSimilarity } from '../utils/arabicUtils';

export function useQuranSearch(
  history: SearchHistoryItem[],
  setHistory: (val: SearchHistoryItem[] | ((prev: SearchHistoryItem[]) => SearchHistoryItem[])) => void,
  selectedTafsir = 'ar.muyassar'
) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchMatchAyah[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [topMatch, setTopMatch] = useState<SearchMatchAyah | null>(null);

  const executeSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setError(null);
    setHasSearched(true);
    setVisibleCount(10);
    setTopMatch(null);

    const normQuery = normalizeArabic(trimmed);

    try {
      // 1. Direct simple search
      let rawMatches = await searchQuranSimple(normQuery);

      // 2. Fallback strategy if 0 results
      if ((!rawMatches || rawMatches.length === 0) && normQuery.includes(' ')) {
        const words = normQuery.split(' ').filter(w => w.length > 2);
        
        // Strategy A: Longest word
        if (words.length > 0) {
          const sortedByLen = [...words].sort((a, b) => b.length - a.length);
          const longestWord = sortedByLen[0];
          const longestMatches = await searchQuranSimple(longestWord);
          rawMatches = longestMatches;
        }

        // Strategy B: First two words if still empty
        if ((!rawMatches || rawMatches.length === 0) && words.length >= 2) {
          const firstTwoWords = `${words[0]} ${words[1]}`;
          const twoWordMatches = await searchQuranSimple(firstTwoWords);
          rawMatches = twoWordMatches;
        }
      }

      if (!rawMatches || rawMatches.length === 0) {
        setResults([]);
        setTopMatch(null);
        setIsSearching(false);
        return;
      }

      // 3. Deduplicate by global ayah number
      const uniqueMap = new Map<number, SearchMatchAyah>();
      for (const item of rawMatches) {
        if (!uniqueMap.has(item.number)) {
          uniqueMap.set(item.number, item);
        }
      }

      // 4. Calculate similarity & sort
      const scoredList = Array.from(uniqueMap.values()).map(item => {
        const sim = calculateSimilarity(normQuery, item.text);
        return {
          ...item,
          similarity: sim,
        };
      });

      // Sort descending by similarity
      scoredList.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

      // 5. For the top matches (first 10), fetch the Uthmani script and Tafsir preview asynchronously
      const topBatch = scoredList.slice(0, 10);
      const enhancedTopBatch = await Promise.all(
        topBatch.map(async item => {
          try {
            const data = await getAyahWithTafsir(item.surah.number, item.numberInSurah, selectedTafsir);
            return {
              ...item,
              uthmaniText: data.uthmani.text,
              tafsir: data.tafsirText,
              page: data.uthmani.page,
              juz: data.uthmani.juz,
            };
          } catch {
            return item;
          }
        })
      );

      const finalResults = [
        ...enhancedTopBatch,
        ...scoredList.slice(10),
      ];

      setResults(finalResults);

      // Check for strong match
      const first = finalResults[0];
      const isStrong = first && (
        (first.similarity && first.similarity >= 0.78) ||
        normalizeArabic(first.text).includes(normQuery) ||
        normQuery.includes(normalizeArabic(first.text))
      );

      if (isStrong) {
        setTopMatch(first);
      } else {
        setTopMatch(null);
      }

      // Add to search history (max 10, no duplicates)
      setHistory(prev => {
        const filtered = prev.filter(h => h.query.trim().toLowerCase() !== trimmed.toLowerCase());
        const newItem: SearchHistoryItem = {
          id: Date.now().toString(),
          query: trimmed,
          timestamp: Date.now(),
          matchCount: finalResults.length,
        };
        return [newItem, ...filtered].slice(0, 10);
      });

    } catch (err: any) {
      console.error('Search error:', err);
      setError('حدث خطأ أثناء البحث، يرجى التأكد من اتصال الإنترنت والمحاولة مرة أخرى.');
    } finally {
      setIsSearching(false);
    }
  }, [selectedTafsir, setHistory]);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + 10);
  }, []);

  const clearResults = useCallback(() => {
    setQuery('');
    setResults([]);
    setTopMatch(null);
    setHasSearched(false);
    setError(null);
  }, []);

  return {
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
  };
}
