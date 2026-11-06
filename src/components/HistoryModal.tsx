import React, { useState, useEffect } from 'react';
import { X, History, Search, Download, Filter, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { IssueRecord, Language, IssueStatus } from '../types';
import { translations } from '../i18n/translations';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [records, setRecords] = useState<IssueRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | IssueStatus>('all');
  const t = translations[lang];

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setRecords(data.issues || []);
    } catch (e) {
      console.error('Failed to fetch history:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredRecords = records.filter((rec) => {
    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    const q = search.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchesSearch =
      (rec.book_title && rec.book_title.toLowerCase().includes(q)) ||
      (rec.group_name && rec.group_name.toLowerCase().includes(q)) ||
      (rec.head_name && rec.head_name.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const exportToCSV = () => {
    if (records.length === 0) return;
    const headers = [
      'ID',
      'Книга / Кітап',
      'Топ / Группа',
      'Курс',
      'Берілді / Выдано',
      'Қайтарылды / Возвращено',
      'Қалған / Осталось',
      'Староста',
      'Берілген күн / Дата выдачи',
      'Мәртебе / Статус',
    ];

    const rows = records.map((r) => [
      r.id,
      `"${r.book_title || ''}"`,
      r.group_name,
      r.course,
      r.quantity,
      r.returned_quantity,
      r.quantity - r.returned_quantity,
      `"${r.head_name || ''}"`,
      r.issue_date,
      r.status,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `smart_library_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t.statusReturned}</span>
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>{t.statusPartial}</span>
          </span>
        );
      case 'active':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/30">
            <AlertCircle className="w-3 h-3" />
            <span>{t.statusActive}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03060e]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-gradient-to-b from-[#0e172a] via-[#091122] to-[#050b16] border border-blue-500/40 shadow-[0_0_60px_rgba(59,130,246,0.2)] p-6 overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182846] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-500/50 flex items-center justify-center text-blue-400 shadow-md">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif-title text-xl font-bold text-white tracking-wide">
                {t.historyTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {t.historySubtitle}
              </p>
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={exportToCSV}
            disabled={records.length === 0}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#112240] hover:bg-[#18325e] border border-blue-500/30 text-blue-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportCsv}</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchHistoryPlaceholder}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#08101e] border border-[#1d2b45] text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter Tabs (Button segment) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#08101e] border border-[#1d2b45] overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-[#182946] text-[#f3c68f]' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.filterAllStatus}
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'active' ? 'bg-[#182946] text-rose-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.statusActive}
            </button>
            <button
              onClick={() => setStatusFilter('partial')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'partial' ? 'bg-[#182946] text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.statusPartial}
            </button>
            <button
              onClick={() => setStatusFilter('returned')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'returned' ? 'bg-[#182946] text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.statusReturned}
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="rounded-xl border border-[#1b2a47] bg-[#070e1c] overflow-hidden">
          <div className="overflow-x-auto max-h-[460px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#0b162b] sticky top-0 z-10 border-b border-[#1b2a47]">
                <tr className="text-slate-400 font-semibold">
                  <th className="py-3 px-3 w-12">{t.thId}</th>
                  <th className="py-3 px-3">{t.thBook}</th>
                  <th className="py-3 px-3">{t.thGroup}</th>
                  <th className="py-3 px-3 text-center">{t.thIssuedQty}</th>
                  <th className="py-3 px-3 text-center">{t.thReturnedQty}</th>
                  <th className="py-3 px-3 text-center">{t.thRemainingQty}</th>
                  <th className="py-3 px-3">{t.thHead}</th>
                  <th className="py-3 px-3">{t.thDate}</th>
                  <th className="py-3 px-3 text-right">{t.thStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#142137]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 font-mono">
                      {lang === 'kk' ? 'Тарих жүктелуде...' : 'Загрузка истории...'}
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      {t.noHistoryRecords}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => {
                    const remaining = r.quantity - r.returned_quantity;
                    return (
                      <tr key={r.id} className="hover:bg-[#0c1830] transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-500">#{r.id}</td>
                        <td className="py-3 px-3 font-medium text-white max-w-[220px]">
                          <div className="truncate font-serif">{r.book_title}</div>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-[#f3c68f]">
                          {r.group_name} <span className="text-[10px] text-slate-500">({r.course} к.)</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-center text-slate-300">{r.quantity}</td>
                        <td className="py-3 px-3 font-mono text-center text-emerald-400">{r.returned_quantity}</td>
                        <td className="py-3 px-3 font-mono text-center">
                          <span className={remaining > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                            {remaining}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 max-w-[140px] truncate">
                          {r.head_name || <span className="text-slate-600">—</span>}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                          {r.issue_date.split('T')[0]}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {renderStatusBadge(r.status)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
