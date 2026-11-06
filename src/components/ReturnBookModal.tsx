import React, { useState, useEffect } from 'react';
import { X, BookDown, Check, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { IssueRecord, Language } from '../types';
import { translations } from '../i18n/translations';

interface ReturnBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onReturnSuccess: () => void;
}

export const ReturnBookModal: React.FC<ReturnBookModalProps> = ({
  isOpen,
  onClose,
  lang,
  onReturnSuccess,
}) => {
  const [activeIssues, setActiveIssues] = useState<IssueRecord[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [returnQuantity, setReturnQuantity] = useState<number>(1);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = translations[lang];

  useEffect(() => {
    if (isOpen) {
      fetchActiveIssues();
    }
  }, [isOpen]);

  const fetchActiveIssues = async () => {
    setLoadingList(true);
    setError(null);
    try {
      const res = await fetch('/api/history?activeOnly=true');
      const data = await res.json();
      setActiveIssues(data.issues || []);
      if (data.issues && data.issues.length > 0) {
        setSelectedIssueId(data.issues[0].id);
        const remaining = data.issues[0].quantity - data.issues[0].returned_quantity;
        setReturnQuantity(remaining);
      } else {
        setSelectedIssueId(null);
      }
    } catch {
      setError(lang === 'kk' ? 'Берілімдерді жүктеу қатесі' : 'Ошибка загрузки выдач');
    } finally {
      setLoadingList(false);
    }
  };

  if (!isOpen) return null;

  const selectedIssue = activeIssues.find((i) => i.id === selectedIssueId);
  const remaining = selectedIssue ? selectedIssue.quantity - selectedIssue.returned_quantity : 0;
  const isPartial = returnQuantity < remaining;

  const handleSelectIssue = (issue: IssueRecord) => {
    setSelectedIssueId(issue.id);
    const rem = issue.quantity - issue.returned_quantity;
    setReturnQuantity(rem);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;
    setError(null);

    if (returnQuantity <= 0) {
      setError(lang === 'kk' ? 'Қайтарылатын санды көрсетіңіз' : 'Укажите количество для возврата');
      return;
    }
    if (returnQuantity > remaining) {
      setError(t.cannotReturnMore);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('smart_lib_token') || 'librarian_authorized';
      const res = await fetch('/api/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          issue_id: selectedIssue.id,
          return_quantity: Number(returnQuantity),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Return failed');
      }

      onReturnSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || t.cannotReturnMore);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03060e]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-gradient-to-b from-[#19150d] via-[#10101a] to-[#070912] border border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)] p-6 overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182846] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-md">
            <BookDown className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif-title text-lg font-bold text-white tracking-wide">
              {t.returnTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {t.returnSubtitle}
            </p>
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center gap-2.5 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loadingList ? (
          <div className="py-12 text-center text-slate-400 text-xs font-mono">
            {lang === 'kk' ? 'Берілімдер жүктелуде...' : 'Загрузка списка выдач...'}
          </div>
        ) : activeIssues.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#0b0f1a] border border-dashed border-[#1e273a] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
            <p className="text-sm text-slate-300 font-medium">{t.noActiveIssues}</p>
            <p className="text-xs text-slate-500">
              {lang === 'kk' ? 'Барлық берілген кітаптар толық қайтарылған.' : 'Все выданные книги полностью возвращены в фонд.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Active issues list selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                {t.selectActiveIssue}
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeIssues.map((issue) => {
                  const rem = issue.quantity - issue.returned_quantity;
                  const isSelected = issue.id === selectedIssueId;
                  return (
                    <div
                      key={issue.id}
                      onClick={() => handleSelectIssue(issue)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#291e0a] border-amber-500 shadow-md text-white'
                          : 'bg-[#090f1e] border-[#1c273e] hover:border-slate-500 text-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-serif text-xs font-bold text-white flex items-center gap-2">
                          <span>{issue.book_title}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#131f36] text-[#f3c68f] border border-[#273e68]">
                            {issue.group_name} ({issue.course} к.)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {issue.head_name ? `Староста: ${issue.head_name} · ` : ''}
                          <span>Берілген күні: {issue.issue_date.split('T')[0]}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-xs font-bold text-amber-400">
                          {rem} {t.copies} {lang === 'kk' ? 'қалды' : 'осталось'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ({issue.returned_quantity}/{issue.quantity} қайтарылған)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected issue summary card */}
            {selectedIssue && (
              <div className="p-3.5 rounded-xl bg-[#141208] border border-amber-500/30 space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-[#0b0c14] border border-[#232014]">
                    <div className="text-slate-400 text-[10px]">{t.totalIssued}</div>
                    <div className="font-mono text-sm font-bold text-white">{selectedIssue.quantity}</div>
                  </div>
                  <div className="p-2 rounded bg-[#0b0c14] border border-[#232014]">
                    <div className="text-slate-400 text-[10px]">{t.alreadyReturned}</div>
                    <div className="font-mono text-sm font-bold text-emerald-400">{selectedIssue.returned_quantity}</div>
                  </div>
                  <div className="p-2 rounded bg-[#0b0c14] border border-[#232014]">
                    <div className="text-slate-400 text-[10px]">{t.pendingReturn}</div>
                    <div className="font-mono text-sm font-bold text-amber-400">{remaining}</div>
                  </div>
                </div>

                {/* Return Quantity Input */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-200">
                      {t.returnedQuantity}
                    </label>
                    <span className="text-[11px] font-mono text-amber-300">
                      max: {remaining} {t.copies}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={remaining}
                      value={returnQuantity}
                      onChange={(e) =>
                        setReturnQuantity(
                          Math.max(1, Math.min(remaining, parseInt(e.target.value) || 1))
                        )
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-[#091122] border border-[#223555] focus:border-amber-500 text-sm font-mono text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setReturnQuantity(remaining)}
                      className="px-3 py-2.5 text-xs font-semibold rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-600/50 text-amber-200 transition-colors cursor-pointer shrink-0"
                    >
                      {lang === 'kk' ? 'Барлығын қайтару' : 'Вернуть всё'}
                    </button>
                  </div>
                </div>

                {/* Partial return info notification */}
                <div className="p-2 rounded-lg bg-[#1c160b] border border-amber-500/20 flex items-start gap-2 text-[11px] text-amber-200/90">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    {isPartial ? (
                      <span>
                        <strong>{lang === 'kk' ? 'Жартылай қайтару:' : 'Частичный возврат:'}</strong>{' '}
                        {returnQuantity} {t.copies} қабылданады, ал {remaining - returnQuantity} {t.copies}{' '}
                        {lang === 'kk' ? 'топтың қарызында қалады.' : 'останется в долгу у группы.'}
                      </span>
                    ) : (
                      <span>
                        <strong>{lang === 'kk' ? 'Толық қайтару:' : 'Полный возврат:'}</strong>{' '}
                        {lang === 'kk' ? 'Бұл берілім толығымен жабылады.' : 'Выдача будет полностью закрыта.'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Form actions */}
            <div className="pt-3 border-t border-[#232018] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {t.close}
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedIssue || returnQuantity <= 0}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  submitting || !selectedIssue || returnQuantity <= 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:brightness-110 shadow-lg'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{submitting ? '...' : t.submitReturn}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
