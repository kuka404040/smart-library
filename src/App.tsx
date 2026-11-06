import React, { useState, useEffect, useMemo } from 'react';
import { Book, Language, LibraryStats, BookType, AISearchResult } from './types';
import { translations } from './i18n/translations';
import { INITIAL_BOOKS, CATEGORY_OPTIONS } from './data/collegeData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BookCard } from './components/BookCard';
import { BookLoader } from './components/BookLoader';
import { AISmartSearchModal } from './components/AISmartSearchModal';
import { LibrarianToolbar } from './components/LibrarianToolbar';
import { LibrarianLoginModal } from './components/LibrarianLoginModal';
import { IssueBookModal } from './components/IssueBookModal';
import { ReturnBookModal } from './components/ReturnBookModal';
import { HistoryModal } from './components/HistoryModal';
import { AddEditBookModal } from './components/AddEditBookModal';
import { BookDetailModal } from './components/BookDetailModal';
import {
  Sparkles,
  BookOpen,
  Filter,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Layers,
  ArrowRight,
  Shield,
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('kk');
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<LibraryStats>({
    totalBooks: 10,
    totalCopies: 380,
    availableCopies: 341,
    activeIssues: 3,
    totalIssuedCopies: 39,
  });

  // Loading States
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchingBooks, setFetchingBooks] = useState(false);

  // Librarian Auth
  const [isLibrarian, setIsLibrarian] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<number>(-1); // -1 = all
  const [selectedType, setSelectedType] = useState<string>('all'); // all, general, special
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAISearchModal, setShowAISearchModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Book | null>(null);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [preselectedBookForIssue, setPreselectedBookForIssue] = useState<Book | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const t = translations[lang];

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Check URL strictly for /admin
  useEffect(() => {
    const checkAdminAccess = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      const isAdminUrl =
        path.includes('/admin') ||
        hash.includes('admin') ||
        search.includes('admin');

      const savedToken = localStorage.getItem('smart_lib_token');
      if (savedToken) {
        setIsLibrarian(true);
      } else if (isAdminUrl) {
        setShowLoginModal(true);
      }
    };

    checkAdminAccess();
    window.addEventListener('popstate', checkAdminAccess);
    window.addEventListener('hashchange', checkAdminAccess);

    return () => {
      window.removeEventListener('popstate', checkAdminAccess);
      window.removeEventListener('hashchange', checkAdminAccess);
    };
  }, []);

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    // If user opened via /admin and cancelled, reset URL to clean path without reloading
    if (window.location.pathname.includes('/admin') || window.location.hash.includes('admin')) {
      window.history.replaceState({}, '', '/');
    }
  };

  // Fetch Books & Stats from API
  const refreshData = async () => {
    try {
      setFetchingBooks(true);
      const res = await fetch('/api/books');
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }

      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.warn('API error, using initial books:', err);
      // Fallback in case backend is initializing
      setBooks(INITIAL_BOOKS.map((b, idx) => ({ ...b, id: idx + 1 })));
    } finally {
      setFetchingBooks(false);
    }
  };

  useEffect(() => {
    refreshData().finally(() => {
      // Allow the 3D book loader to show gracefully
      setTimeout(() => setInitialLoading(false), 1400);
    });
  }, []);

  // Server-side Password Login Verification
  const handleLogin = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('smart_lib_token', data.token);
        setIsLibrarian(true);
        showToast(
          lang === 'kk' ? 'Кітапханашы режимі сәтті қосылды!' : 'Режим библиотекаря активирован!',
          'success'
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('smart_lib_token');
    setIsLibrarian(false);
    showToast(
      lang === 'kk' ? 'Кітапханашы сессиясы аяқталды.' : 'Сессия библиотекаря завершена.',
      'success'
    );
  };

  // AI Smart Search Handler
  const handleAISearch = async (query: string): Promise<AISearchResult[]> => {
    const res = await fetch('/api/ai-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('AI Search failed');
    const data = await res.json();
    return data.results || [];
  };
   // AI Chat Handler
const handleAIChat = async (
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> => {
  try {
    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'AI Chat қатесі орын алды');
    }

    if (!data.reply) {
      throw new Error('AI жауап қайтармады');
    }

    return data.reply;
  } catch (error) {
    console.error('AI Chat Error:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('AI-чатпен байланысу мүмкін болмады');
  }
};
  // Filtered books logic
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Course filter
      if (selectedCourse !== -1) {
        if (selectedCourse === 0) {
          if (book.course !== 0) return false;
        } else if (book.course !== selectedCourse && book.course !== 0) {
          return false;
        }
      }

      // Type filter
      if (selectedType !== 'all' && book.book_type !== selectedType) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && book.category !== selectedCategory) {
        return false;
      }

      // Availability filter
      if (onlyAvailable && book.available_copies <= 0) {
        return false;
      }

      // Search query (title, author, subject)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesAuthor = book.author.toLowerCase().includes(q);
        const matchesSubject = book.subject.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor && !matchesSubject) {
          return false;
        }
      }

      return true;
    });
  }, [books, selectedCourse, selectedType, selectedCategory, onlyAvailable, searchQuery]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCourse(-1);
    setSelectedType('all');
    setSelectedCategory('all');
    setOnlyAvailable(false);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-[#e2e8f0] flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-[#f3c68f]">
      {/* 3D Initial Book Loader */}
      <BookLoader
        isLoading={initialLoading}
        lang={lang}
        onFinish={() => setInitialLoading(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0e1c33] border border-[#d4af37]/60 text-white text-xs shadow-2xl animate-fade-in">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        lang={lang}
        onLanguageChange={setLang}
        isLibrarian={isLibrarian}
        onLogout={handleLogout}
        onReplayLoader={() => setInitialLoading(true)}
      />

      {/* Librarian Workspace Ribbon (When authorized) */}
      {isLibrarian && (
        <LibrarianToolbar
          lang={lang}
          onOpenAddBook={() => {
            setBookToEdit(null);
            setShowAddBookModal(true);
          }}
          onOpenIssueBook={() => {
            setPreselectedBookForIssue(null);
            setShowIssueModal(true);
          }}
          onOpenReturnBook={() => setShowReturnModal(true)}
          onOpenHistory={() => setShowHistoryModal(true)}
          stats={stats}
        />
      )}

      {/* Hero Section with Search & AI Smart Search Button */}
      <HeroSection
        lang={lang}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAISearch={() => setShowAISearchModal(true)}
        stats={stats}
      />

      {/* Main Content Area: Catalog & Filters */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
        {/* Interactive Filter Bar */}
        <div className="bg-[#091122]/90 border border-[#1a2d4c] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Course Segmented Control Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="hidden sm:inline">{lang === 'kk' ? 'Курс:' : 'Курс:'}</span>
              </span>

              <button
                onClick={() => setSelectedCourse(-1)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCourse === -1
                    ? 'bg-[#182b4a] text-[#f3c68f] border border-[#d4af37]/40 shadow-sm'
                    : 'text-slate-400 hover:text-white bg-[#0a1220] border border-transparent'
                }`}
              >
                {t.allCourses}
              </button>

              {[1, 2, 3, 4].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCourse(c)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    selectedCourse === c
                      ? 'bg-[#182b4a] text-[#f3c68f] border border-[#d4af37]/40 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-[#0a1220] border border-transparent'
                  }`}
                >
                  {c} {t.courseLabel}
                </button>
              ))}
            </div>

            {/* Type Filter (General vs Special discipline) */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">{lang === 'kk' ? 'Пән:' : 'Дисциплина:'}</span>
              </span>

              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedType === 'all'
                    ? 'bg-[#14233e] text-blue-200 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white bg-[#0a1220] border border-transparent'
                }`}
              >
                {t.allTypes}
              </button>

              <button
                onClick={() => setSelectedType('special')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedType === 'special'
                    ? 'bg-[#14233e] text-blue-200 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white bg-[#0a1220] border border-transparent'
                }`}
              >
                {t.typeSpecial}
              </button>

              <button
                onClick={() => setSelectedType('general')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedType === 'general'
                    ? 'bg-[#14233e] text-blue-200 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white bg-[#0a1220] border border-transparent'
                }`}
              >
                {t.typeGeneral}
              </button>
            </div>
          </div>

          {/* Secondary Filter Row: Category dropdown & Availability toggle */}
          <div className="pt-3 border-t border-[#16243d] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">{t.category}:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#0a1220] border border-[#1e2f4f] text-slate-200 focus:border-[#d4af37] outline-none cursor-pointer"
                >
                  <option value="all">{t.allCategories}</option>
                  {CATEGORY_OPTIONS.map((c, idx) => (
                    <option key={idx} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Only in stock checkbox toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded border-[#1e2f4f] bg-[#0a1220] text-[#d4af37] focus:ring-0 cursor-pointer"
                />
                <span>{t.onlyAvailable}</span>
              </label>
            </div>

            {/* Found Count & Reset */}
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-mono">
                {filteredBooks.length} {t.booksCount}
              </span>

              {(selectedCourse !== -1 ||
                selectedType !== 'all' ||
                selectedCategory !== 'all' ||
                onlyAvailable ||
                searchQuery.trim()) && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[#f3c68f] hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.resetFilters}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Books Catalog Grid */}
        {filteredBooks.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-[#091224]/50 border border-dashed border-[#1a2e50] space-y-4">
            <BookOpen className="w-12 h-12 text-slate-500 mx-auto opacity-50" />
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-white">
                {lang === 'kk' ? 'Кітаптар табылмады' : 'Книги не найдены'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {lang === 'kk'
                  ? 'Сұранысыңыз немесе таңдалған сүзгілер бойынша оқулықтар табылған жоқ.'
                  : 'По вашему запросу или выбранным критериям учебники не найдены.'}
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-[#142340] hover:bg-[#1a2f54] text-[#f3c68f] text-xs font-semibold cursor-pointer border border-[#d4af37]/30"
            >
              {t.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                lang={lang}
                isLibrarian={isLibrarian}
                onSelect={(b) => setSelectedBookForDetail(b)}
                onEdit={(b) => {
                  setBookToEdit(b);
                  setShowAddBookModal(true);
                }}
                onDelete={async (b) => {
                  if (!window.confirm(t.deleteConfirm)) return;
                  try {
                    const token = localStorage.getItem('smart_lib_token') || 'librarian_authorized';
                    const res = await fetch(`/api/books/${b.id}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                      showToast(t.bookDeletedSuccess, 'success');
                      refreshData();
                    }
                  } catch (e) {
                    console.error('Delete error', e);
                  }
                }}
                onQuickIssue={(b) => {
                  setPreselectedBookForIssue(b);
                  setShowIssueModal(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#142340] bg-[#050811] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif-title text-sm font-bold text-slate-300">
              SMART LIBRARY
            </span>
            <span>·</span>
            <span>{t.appSubtitle}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
          </div>
        </div>
      </footer>

      {/* Modals Container */}
      <LibrarianLoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        lang={lang}
        onLogin={handleLogin}
      />

      <AISmartSearchModal
        isOpen={showAISearchModal}
        onClose={() => setShowAISearchModal(false)}
        lang={lang}
        onSelectBook={(b) => setSelectedBookForDetail(b)}
        onSearch={handleAISearch}
        onChat={handleAIChat}
        
      />

      <IssueBookModal
        isOpen={showIssueModal}
        onClose={() => {
          setShowIssueModal(false);
          setPreselectedBookForIssue(null);
        }}
        lang={lang}
        books={books}
        initialBook={preselectedBookForIssue}
        onIssueSuccess={() => {
          showToast(t.issueSuccess, 'success');
          refreshData();
        }}
      />

      <ReturnBookModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        lang={lang}
        onReturnSuccess={() => {
          showToast(t.returnSuccess, 'success');
          refreshData();
        }}
      />

      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        lang={lang}
      />

      <AddEditBookModal
        isOpen={showAddBookModal}
        onClose={() => {
          setShowAddBookModal(false);
          setBookToEdit(null);
        }}
        lang={lang}
        bookToEdit={bookToEdit}
        onSaveSuccess={() => {
          showToast(t.bookSavedSuccess, 'success');
          refreshData();
        }}
        onDeleteSuccess={() => {
          showToast(t.bookDeletedSuccess, 'success');
          refreshData();
        }}
      />

      <BookDetailModal
        book={selectedBookForDetail}
        isOpen={!!selectedBookForDetail}
        onClose={() => setSelectedBookForDetail(null)}
        lang={lang}
        isLibrarian={isLibrarian}
        onQuickIssue={(b) => {
          setPreselectedBookForIssue(b);
          setShowIssueModal(true);
        }}
        onEditBook={(b) => {
          setBookToEdit(b);
          setShowAddBookModal(true);
        }}
      />

    </div>
  );
}
