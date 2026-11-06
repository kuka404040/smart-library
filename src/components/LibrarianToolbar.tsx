import React from 'react';
import { PlusCircle, BookUp, BookDown, History, ShieldCheck, Sparkles } from 'lucide-react';
import { Language, LibraryStats } from '../types';
import { translations } from '../i18n/translations';

interface LibrarianToolbarProps {
  lang: Language;
  onOpenAddBook: () => void;
  onOpenIssueBook: () => void;
  onOpenReturnBook: () => void;
  onOpenHistory: () => void;
  stats: LibraryStats;
}

export const LibrarianToolbar: React.FC<LibrarianToolbarProps> = ({
  lang,
  onOpenAddBook,
  onOpenIssueBook,
  onOpenReturnBook,
  onOpenHistory,
  stats,
}) => {
  const t = translations[lang];

  return (
    <div className="bg-gradient-to-r from-[#0d1f35] via-[#091526] to-[#0d1f35] border-y border-[#d4af37]/40 shadow-lg py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Librarian badge & quick summary */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{t.librarianWorkspace}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-slate-400">
              {stats.activeIssues} {lang === 'kk' ? 'белсенді берілім тіркелген' : 'активных выдач на руках'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 justify-center">
          <button
            onClick={onOpenAddBook}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#172d4d] to-[#1e3962] hover:from-[#1e3962] hover:to-[#26487b] border border-[#d4af37]/40 text-slate-100 hover:text-[#f3c68f] text-xs font-semibold transition-all shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#d4af37]" />
            <span>{t.addBookBtn}</span>
          </button>

          <button
            onClick={onOpenIssueBook}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0e2c20] hover:bg-[#133d2c] border border-emerald-500/40 text-emerald-100 text-xs font-semibold transition-all shadow-md cursor-pointer"
          >
            <BookUp className="w-4 h-4 text-emerald-400" />
            <span>{t.issueBookBtn}</span>
          </button>

          <button
            onClick={onOpenReturnBook}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2e1c10] hover:bg-[#3f2615] border border-amber-500/40 text-amber-100 text-xs font-semibold transition-all shadow-md cursor-pointer"
          >
            <BookDown className="w-4 h-4 text-amber-400" />
            <span>{t.returnBookBtn}</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141b2c] hover:bg-[#1d2740] border border-blue-500/30 text-blue-200 text-xs font-semibold transition-all shadow-md cursor-pointer"
          >
            <History className="w-4 h-4 text-blue-400" />
            <span>{t.historyBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
