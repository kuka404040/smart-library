import React, { useState, useEffect } from 'react';
import { X, BookUp, Check, AlertTriangle, Users, BookOpen } from 'lucide-react';
import { Book, Language } from '../types';
import { translations } from '../i18n/translations';
import { COLLEGE_GROUPS_BY_COURSE } from '../data/collegeData';

interface IssueBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  books: Book[];
  initialBook?: Book | null;
  onIssueSuccess: () => void;
}

export const IssueBookModal: React.FC<IssueBookModalProps> = ({
  isOpen,
  onClose,
  lang,
  books,
  initialBook,
  onIssueSuccess,
}) => {
  const [course, setCourse] = useState<number>(1);
  const [groupName, setGroupName] = useState<string>('');
  const [selectedBookId, setSelectedBookId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(25);
  const [headName, setHeadName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = translations[lang];

  useEffect(() => {
    if (initialBook) {
      setSelectedBookId(initialBook.id);
      if (initialBook.course >= 1 && initialBook.course <= 4) {
        setCourse(initialBook.course);
      }
    } else if (books.length > 0 && !selectedBookId) {
      setSelectedBookId(books[0].id);
    }
  }, [initialBook, books]);

  // Update default group whenever course changes
  useEffect(() => {
    const groups = COLLEGE_GROUPS_BY_COURSE[course] || [];
    if (groups.length > 0) {
      setGroupName(groups[0]);
    }
  }, [course]);

  if (!isOpen) return null;

  const currentGroups = COLLEGE_GROUPS_BY_COURSE[course] || [];
  const selectedBook = books.find((b) => b.id === Number(selectedBookId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedBook) {
      setError(lang === 'kk' ? 'Кітапты таңдаңыз' : 'Выберите книгу');
      return;
    }
    if (!groupName) {
      setError(lang === 'kk' ? 'Топты таңдаңыз' : 'Выберите группу');
      return;
    }
    if (quantity <= 0) {
      setError(lang === 'kk' ? 'Дана санын дұрыс көрсетіңіз' : 'Укажите корректное количество');
      return;
    }
    if (quantity > selectedBook.available_copies) {
      setError(t.notEnoughCopies);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('smart_lib_token') || 'librarian_authorized';
      const res = await fetch('/api/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          book_id: selectedBook.id,
          course,
          group_name: groupName,
          head_name: headName.trim(),
          quantity: Number(quantity),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Issue failed');
      }

      onIssueSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || t.notEnoughCopies);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03060e]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#0f1d35] to-[#070e1c] border border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)] p-6 overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182846] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-md">
            <BookUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif-title text-lg font-bold text-white tracking-wide">
              {t.issueTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {t.issueSubtitle}
            </p>
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center gap-2.5 text-xs text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Course Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.selectCourse}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCourse(c)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    course === c
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                      : 'bg-[#0a1220] border-[#1d2f4d] text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                >
                  {c} {t.courseLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Group Selection (filtered strictly by selected course) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.selectGroup}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-[#08101e] border border-[#1b2b47]">
              {currentGroups.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGroupName(g)}
                  className={`px-2 py-1.5 text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${
                    groupName === g
                      ? 'bg-[#18392d] text-emerald-300 border border-emerald-500 shadow-sm'
                      : 'bg-[#0e1728] text-slate-300 border border-[#1e2f4e] hover:border-slate-500'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'kk' ? 'Таңдалған топ:' : 'Выбранная группа:'}</span>
              <strong className="text-emerald-300 font-mono">{groupName || '—'}</strong>
            </div>
          </div>

          {/* Step 3: Book Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.selectBook}
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-[#091122] border border-[#223555] hover:border-[#375891] focus:border-emerald-500 text-sm text-white outline-none cursor-pointer"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} — {b.author} ({b.available_copies} / {b.total_copies} {t.copies})
                </option>
              ))}
            </select>

            {selectedBook && (
              <div className="mt-2 p-2.5 rounded-lg bg-[#0b162a] border border-[#1a2d4f] flex items-center justify-between text-xs">
                <span className="text-slate-300 truncate max-w-[240px]">{selectedBook.subject}</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {t.available}: {selectedBook.available_copies} {t.copies}
                </span>
              </div>
            )}
          </div>

          {/* Step 4: Quantity */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {t.enterQuantity}
              </label>
              {selectedBook && (
                <span className="text-[11px] text-slate-400 font-mono">
                  max: {selectedBook.available_copies}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={selectedBook?.available_copies || 100}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#091122] border border-[#223555] focus:border-emerald-500 text-sm font-mono text-white outline-none"
              />
              {/* Quick count chips */}
              {[15, 20, 25, 30].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setQuantity(num)}
                  disabled={selectedBook ? num > selectedBook.available_copies : false}
                  className="px-2.5 py-2 text-xs font-mono font-medium rounded-lg bg-[#0e172a] hover:bg-[#182946] border border-[#1e2f4f] text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Step 5: Head of Group (Староста) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.headName}
            </label>
            <input
              type="text"
              value={headName}
              onChange={(e) => setHeadName(e.target.value)}
              placeholder={t.headNamePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#091122] border border-[#223555] focus:border-emerald-500 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.issueNotes}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.issueNotesPlaceholder}
              className="w-full px-3.5 py-2 rounded-xl bg-[#091122] border border-[#223555] focus:border-emerald-500 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-[#172744] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {t.close}
            </button>
            <button
              type="submit"
              disabled={loading || !selectedBook || selectedBook.available_copies <= 0}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                loading || !selectedBook || selectedBook.available_copies <= 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-lg'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{loading ? '...' : t.submitIssue}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
