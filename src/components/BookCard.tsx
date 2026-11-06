import React from 'react';
import { Book, Language } from '../types';
import { translations } from '../i18n/translations';
import { BookOpen, Sparkles, Edit3, Trash2, ArrowUpRight } from 'lucide-react';

interface BookCardProps {
  book: Book;
  lang: Language;
  isLibrarian: boolean;
  onSelect: (book: Book) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  onQuickIssue?: (book: Book) => void;
}

const COLOR_THEMES: Record<
  string,
  {
    bg: string;
    border: string;
    spine: string;
    accent: string;
    text: string;
  }
> = {
  navy: {
    bg: 'from-[#0f1d38] via-[#0b162b] to-[#070e1c]',
    border: 'border-[#29426f] hover:border-[#d4af37]',
    spine: 'from-[#d4af37] via-[#996515] to-[#5a3b09]',
    accent: 'text-[#f3c68f]',
    text: 'text-blue-100',
  },
  emerald: {
    bg: 'from-[#0d2a1f] via-[#091f16] to-[#05130e]',
    border: 'border-[#1b4d3a] hover:border-[#34d399]',
    spine: 'from-[#34d399] via-[#059669] to-[#064e3b]',
    accent: 'text-emerald-300',
    text: 'text-emerald-100',
  },
  crimson: {
    bg: 'from-[#2e0f18] via-[#210910] to-[#140509]',
    border: 'border-[#582030] hover:border-[#f43f5e]',
    spine: 'from-[#f43f5e] via-[#be123c] to-[#881337]',
    accent: 'text-rose-300',
    text: 'text-rose-100',
  },
  indigo: {
    bg: 'from-[#191a3e] via-[#11122e] to-[#090a1c]',
    border: 'border-[#333575] hover:border-[#818cf8]',
    spine: 'from-[#818cf8] via-[#4f46e5] to-[#312e81]',
    accent: 'text-indigo-300',
    text: 'text-indigo-100',
  },
  amber: {
    bg: 'from-[#2e210b] via-[#211707] to-[#140e03]',
    border: 'border-[#5b4317] hover:border-[#fbbf24]',
    spine: 'from-[#fbbf24] via-[#d97706] to-[#92400e]',
    accent: 'text-amber-300',
    text: 'text-amber-100',
  },
  gold: {
    bg: 'from-[#261f10] via-[#1b1509] to-[#0f0b04]',
    border: 'border-[#614e20] hover:border-[#d4af37]',
    spine: 'from-[#d4af37] via-[#b8860b] to-[#785408]',
    accent: 'text-[#f3c68f]',
    text: 'text-amber-50',
  },
};

export const BookCard: React.FC<BookCardProps> = ({
  book,
  lang,
  isLibrarian,
  onSelect,
  onEdit,
  onDelete,
  onQuickIssue,
}) => {
  const t = translations[lang];
  const theme = COLOR_THEMES[book.cover_color] || COLOR_THEMES.navy;
  const isAvailable = book.available_copies > 0;

  return (
    <div
      onClick={() => onSelect(book)}
      className="group relative flex flex-col justify-between rounded-2xl bg-[#091122]/90 border border-[#1b2b48] hover:border-[#d4af37]/60 hover:shadow-[0_15px_35px_-5px_rgba(212,175,55,0.18)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Top Cover Visual (Digital Book Header) */}
      <div className={`relative h-48 bg-gradient-to-br ${theme.bg} p-4 flex flex-col justify-between overflow-hidden border-b border-[#1b2b48]/80`}>
        {/* Book Spine Accent Line */}
        <div className={`absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b ${theme.spine} shadow-md`} />

        {/* Ambient Cover Watermark or Custom URL */}
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute right-3 -bottom-4 opacity-10 pointer-events-none">
            <BookOpen className="w-32 h-32 text-white" />
          </div>
        )}

        {/* Top Badges (Unboxed & Clean Metadata) */}
        <div className="relative pl-3 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="font-semibold text-white">
              {book.course > 0 ? `${book.course} ${t.courseLabel}` : (lang === 'kk' ? 'Жалпы' : 'Все курсы')}
            </span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-400">
              {book.book_type === 'special' ? (lang === 'kk' ? 'Арнайы' : 'Спец.') : (lang === 'kk' ? 'Жалпы' : 'Общ.')}
            </span>
          </div>

          {/* Availability Status */}
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                isAvailable ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'
              }`}
            />
            <span className={isAvailable ? 'text-emerald-300 font-semibold' : 'text-rose-400 font-semibold'}>
              {book.available_copies} / {book.total_copies}
            </span>
          </div>
        </div>

        {/* Cover Title & Author Typography */}
        <div className="relative pl-3 my-auto">
          <div className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-[#f3c68f] transition-colors line-clamp-2 leading-tight">
            {book.title}
          </div>
          <div className="text-xs text-slate-300 mt-1 font-light truncate">
            {book.author}
          </div>
        </div>

        {/* Cover Bottom Meta */}
        <div className="relative pl-3 flex items-center justify-between text-[10px] text-slate-400">
          <span className="truncate max-w-[170px] text-[#f3c68f]/80 font-medium">
            {book.subject}
          </span>
          <span className="font-mono text-slate-500">#{book.id}</span>
        </div>
      </div>

      {/* Card Body: Description snippet & Interactive controls */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#080e1b]">
        <p className="text-xs text-slate-400 line-clamp-2 font-light leading-relaxed">
          {book.description || (lang === 'kk' ? 'Колледж кітапханасының ресми қоры.' : 'Официальный фонд библиотеки колледжа.')}
        </p>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-[#16233b] flex items-center justify-between gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(book);
            }}
            className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-[#f3c68f] font-medium transition-colors cursor-pointer"
          >
            <span>{t.viewDetails}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* Librarian Quick Action Buttons */}
          {isLibrarian && (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onQuickIssue?.(book)}
                disabled={!isAvailable}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  isAvailable
                    ? 'bg-[#182d4f] hover:bg-[#203c6a] text-[#f3c68f] border border-[#d4af37]/40'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
                title={t.quickIssue}
              >
                {t.quickIssue}
              </button>

              <button
                onClick={() => onEdit?.(book)}
                className="p-1.5 rounded-md bg-[#131f36] hover:bg-[#1a2d50] text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={t.editBookTitle}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDelete?.(book)}
                className="p-1.5 rounded-md bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-colors cursor-pointer"
                title={t.deleteBook}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
