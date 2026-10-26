import React from 'react';
import { Bookmark } from '../../types/quran';
import { toArabicDigits } from '../../utils/arabicUtils';
import { Bookmark as BookmarkIcon, Trash2, ArrowLeft, Calendar } from 'lucide-react';

interface BookmarksListProps {
  bookmarks: Bookmark[];
  onSelectBookmark: (bm: Bookmark) => void;
  onRemoveBookmark: (id: string) => void;
  onClearAll: () => void;
}

export const BookmarksList: React.FC<BookmarksListProps> = ({
  bookmarks,
  onSelectBookmark,
  onRemoveBookmark,
  onClearAll,
}) => {
  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-[#121c17] border border-slate-100 dark:border-slate-800 space-y-3">
        <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <BookmarkIcon className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
          لا توجد علامات مرجعية حتى الآن
        </h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          يمكنك حفظ أي آية للرجوع إليها لاحقاً بالضغط على الآية واختيار "علامة مرجعية".
        </p>
      </div>
    );
  }

  const formatDate = (ts: number) => {
    try {
      return new Date(ts).toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 px-1">
        <span className="font-bold">
          العلامات المحفوظة ({toArabicDigits(bookmarks.length)}):
        </span>
        <button
          onClick={onClearAll}
          className="text-rose-500 hover:text-rose-600 text-xs font-semibold flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>مسح الكل</span>
        </button>
      </div>

      <div className="space-y-2">
        {bookmarks.map((bm) => (
          <div
            key={bm.id}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#121c17] border border-slate-100 dark:border-slate-800 hover:border-emerald-500/40 transition-all group"
          >
            <button
              onClick={() => onSelectBookmark(bm)}
              className="flex-1 text-right flex items-center gap-3 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center justify-center text-xs font-bold font-sans">
                {toArabicDigits(bm.ayahNumber)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-sans group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  سورة {bm.surahName}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span>الآية {toArabicDigits(bm.ayahNumber)}</span>
                  <span>•</span>
                  <span>ص {toArabicDigits(bm.page)}</span>
                  <span>•</span>
                  <span>الجزء {toArabicDigits(bm.juz)}</span>
                </div>
              </div>
            </button>

            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 hidden sm:inline ml-2">
                {formatDate(bm.timestamp)}
              </span>
              <button
                onClick={() => onRemoveBookmark(bm.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="حذف العلامة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
