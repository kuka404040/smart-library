import React, { useState, useEffect } from 'react';
import { X, BookPlus, Edit3, Trash2, Check, AlertTriangle } from 'lucide-react';
import { Book, Language, BookType } from '../types';
import { translations } from '../i18n/translations';
import { SUBJECT_OPTIONS, CATEGORY_OPTIONS } from '../data/collegeData';

interface AddEditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  bookToEdit?: Book | null;
  onSaveSuccess: () => void;
  onDeleteSuccess?: () => void;
}

export const AddEditBookModal: React.FC<AddEditBookModalProps> = ({
  isOpen,
  onClose,
  lang,
  bookToEdit,
  onSaveSuccess,
  onDeleteSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0]);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [course, setCourse] = useState<number>(1);
  const [bookType, setBookType] = useState<BookType>('special');
  const [totalCopies, setTotalCopies] = useState<number>(30);
  const [coverColor, setCoverColor] = useState('navy');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isbn, setIsbn] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = translations[lang];

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      setSubject(bookToEdit.subject);
      setCategory(bookToEdit.category);
      setCourse(bookToEdit.course);
      setBookType(bookToEdit.book_type);
      setTotalCopies(bookToEdit.total_copies);
      setCoverColor(bookToEdit.cover_color || 'navy');
      setCoverUrl(bookToEdit.cover_url || '');
      setDescription(bookToEdit.description || '');
      setIsbn(bookToEdit.isbn || '');
    } else {
      setTitle('');
      setAuthor('');
      setSubject(SUBJECT_OPTIONS[0]);
      setCategory(CATEGORY_OPTIONS[0]);
      setCourse(1);
      setBookType('special');
      setTotalCopies(30);
      setCoverColor('navy');
      setCoverUrl('');
      setDescription('');
      setIsbn('');
    }
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setError(lang === 'kk' ? 'Атауы мен авторын толтырыңыз' : 'Укажите название и автора');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('smart_lib_token') || 'librarian_authorized';
      const url = bookToEdit ? `/api/books/${bookToEdit.id}` : '/api/books';
      const method = bookToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          subject,
          category,
          course: Number(course),
          book_type: bookType,
          total_copies: Number(totalCopies),
          cover_color: coverColor,
          cover_url: coverUrl.trim() || null,
          description: description.trim(),
          isbn: isbn.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save book');
      }

      onSaveSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!bookToEdit) return;
    if (!window.confirm(t.deleteConfirm)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('smart_lib_token') || 'librarian_authorized';
      const res = await fetch(`/api/books/${bookToEdit.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      onDeleteSuccess?.();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03060e]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-b from-[#0f1e38] via-[#091325] to-[#060c18] border border-[#d4af37]/50 shadow-[0_0_60px_rgba(212,175,55,0.22)] p-6 overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182846] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#142340] border border-[#d4af37]/60 flex items-center justify-center text-[#f3c68f] shadow-md">
            {bookToEdit ? <Edit3 className="w-6 h-6" /> : <BookPlus className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-serif-title text-xl font-bold text-white tracking-wide">
              {bookToEdit ? t.editBookTitle : t.addNewBookTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'kk'
                ? 'Колледж қорына оқулық туралы толық мәліметтерді енгізіңіз'
                : 'Внесите полные сведения об учебном издании в фонд библиотеки'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center gap-2.5 text-xs text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.bookTitleField} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={lang === 'kk' ? 'Мысалы: Бағдарламалау негіздері' : 'Например: Основы программирования'}
                className="w-full px-3 py-2 rounded-xl bg-[#091122] border border-[#223555] focus:border-[#d4af37] text-white outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.authorField} *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder={lang === 'kk' ? 'Мысалы: Серікбаев А. Е.' : 'Например: Серикбаев А. Е.'}
                className="w-full px-3 py-2 rounded-xl bg-[#091122] border border-[#223555] focus:border-[#d4af37] text-white outline-none"
              />
            </div>
          </div>

          {/* Row 2: Subject & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.subjectField}
              </label>
              <input
                list="subjects-list"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#091122] border border-[#223555] focus:border-[#d4af37] text-white outline-none"
              />
              <datalist id="subjects-list">
                {SUBJECT_OPTIONS.map((s, idx) => (
                  <option key={idx} value={s} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.categoryField}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#091122] border border-[#223555] focus:border-[#d4af37] text-white outline-none cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((c, idx) => (
                  <option key={idx} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Course, Type, Copies */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.courseField}
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#091122] border border-[#223555] focus:border-[#d4af37] text-white outline-none cursor-pointer"
              >
                <option value={0}>{lang === 'kk' ? 'Барлық курстар' : 'Все курсы'}</option>
                <option value={1}>1 курс</option>
                <option value={2}>2 курс</option>
                <option value={3}>3 курс</option>
                <option value={4}>4 курс</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.typeField}
              </label>
              <select
                value={bookType}
                onChange={(e) => setBookType(e.target.value as BookType)}
                className="w-full px-3 py-2 rounded-xl bg-[#091122] border border-[#223555] focus:border-[#d4af37] text-white outline-none cursor-pointer"
              >
                <option value="special">{t.typeSpecial}</option>
                <option value="general">{t.typeGeneral}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {t.totalCopiesField}
              </label>
              <input
                type="number"
                min="1"
                value={totalCopies}
                onChange={(e) => setTotalCopies(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-[#091122] border border-[#223555] focus:border-[#d4af37] text-white font-mono outline-none"
              />
            </div>
          </div>

          {/* Row 4: Cover Style Theme */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              {t.coverThemeField}
            </label>
            <div className="grid grid-cols-6 gap-2">
              {[
                { id: 'navy', label: 'Navy' },
                { id: 'emerald', label: 'Jade' },
                { id: 'crimson', label: 'Ruby' },
                { id: 'indigo', label: 'Indigo' },
                { id: 'amber', label: 'Amber' },
                { id: 'gold', label: 'Gold' },
              ].map((clr) => (
                <button
                  type="button"
                  key={clr.id}
                  onClick={() => setCoverColor(clr.id)}
                  className={`py-1.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                    coverColor === clr.id
                      ? 'border-[#d4af37] bg-[#1a2d4e] text-[#f3c68f] shadow-md'
                      : 'border-[#1b2b48] bg-[#091122] text-slate-400 hover:text-white'
                  }`}
                >
                  {clr.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 5: Description */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              {t.descriptionField}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={lang === 'kk' ? 'Оқулықтың қысқаша аңдатпасы...' : 'Краткая аннотация издания...'}
              className="w-full px-3 py-2 rounded-xl bg-[#091122] border border-[#223555] focus:border-[#d4af37] text-white outline-none resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-[#182946] flex items-center justify-between">
            {bookToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 border border-rose-800/40 text-rose-300 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.deleteBook}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {t.close}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f3c68f] text-[#09101d] hover:brightness-110 shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? '...' : t.saveBook}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
