import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ArrowRight,
  CheckCircle2,
  BrainCircuit,
  BookOpen,
  MessageCircle,
  Send,
  User,
  Bot,
} from 'lucide-react';

import { Book, Language, AISearchResult } from '../types';
import { translations } from '../i18n/translations';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AISmartSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectBook: (book: Book) => void;
  onSearch: (query: string) => Promise<AISearchResult[]>;
  onChat: (messages: ChatMessage[]) => Promise<string>;
}

export const AISmartSearchModal: React.FC<AISmartSearchModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectBook,
  onSearch,
  onChat,
}) => {
  const [mode, setMode] = useState<'search' | 'chat'>('search');

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AISearchResult[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const t = translations[lang];
  const isKK = lang === 'kk';

  if (!isOpen) return null;

  const handleRunSearch = async (targetQuery?: string) => {
    const q = targetQuery !== undefined ? targetQuery : query;

    if (!q.trim() || loading) return;

    setLoading(true);
    setHasSearched(true);
    setSearchError('');
    setResults(null);

    try {
      const res = await onSearch(q);
      setResults(res);
    } catch (error) {
      console.error('AI Search error:', error);
      setSearchError(
        error instanceof Error
          ? error.message
          : isKK
            ? 'AI іздеу кезінде қате пайда болды.'
            : 'Ошибка при поиске с помощью AI.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    const text = chatInput.trim();

    if (!text || chatLoading) return;

    const updatedMessages: ChatMessage[] = [
      ...chatMessages,
      { role: 'user', content: text },
    ];

    setChatMessages(updatedMessages);
    setChatInput('');
    setChatLoading(true);
    setChatError('');

    try {
      const reply = await onChat(updatedMessages);

      setChatMessages([
        ...updatedMessages,
        { role: 'assistant', content: reply },
      ]);
    } catch (error) {
      console.error('AI Chat error:', error);

      setChatError(
        error instanceof Error
          ? error.message
          : isKK
            ? 'AI-мен байланысу мүмкін болмады.'
            : 'Не удалось связаться с AI.'
      );
    } finally {
      setChatLoading(false);
    }
  };

  const presets = [
    { label: t.aiPreset1, text: 'Хочу изучить историю Казахстана' },
    { label: t.aiPreset2, text: 'Мне нужна книга по программированию' },
    { label: t.aiPreset3, text: 'Есть учебники по математике?' },
    { label: t.aiPreset4, text: 'Хочу узнать об устройстве компьютера' },
    { label: t.aiPreset5, text: 'Сетевая безопасность и криптография' },
  ];

  const closeModal = () => {
    if (loading || chatLoading) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03060e]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-gradient-to-b from-[#0e192e] to-[#070e1c] border border-[#d4af37]/50 shadow-[0_0_60px_rgba(212,175,55,0.22)] overflow-hidden my-8">

        {/* HEADER */}
        <div className="relative px-6 py-5 border-b border-[#1b2b48] bg-[#0b1424]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#142340] border border-[#d4af37]/60 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-[#f3c68f] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif-title text-base sm:text-lg font-bold text-white tracking-wide">
                  {t.aiModalTitle}
                </h3>

                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1f3154] text-[#d4af37] border border-[#d4af37]/30">
                  Google Gemini AI
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-0.5">
                {isKK
                  ? 'Кітап іздеу және интеллектуалды көмекші'
                  : 'Поиск книг и интеллектуальный помощник'}
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182846] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODE TABS */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#080f1e] border border-[#1b2b48]">

            <button
              onClick={() => setMode('search')}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                mode === 'search'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#f3c68f] text-[#09101d] shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-[#142340]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              {isKK ? 'Кітап іздеу' : 'Поиск книг'}
            </button>

            <button
              onClick={() => setMode('chat')}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                mode === 'chat'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#f3c68f] text-[#09101d] shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-[#142340]'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              AI-чат
            </button>

          </div>
        </div>

        {/* BODY */}
        <div className="p-6">

          {/* ================= BOOK SEARCH ================= */}
          {mode === 'search' && (
            <div className="space-y-6">

              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRunSearch();
                    }}
                    placeholder={t.aiInputPlaceholder}
                    className="w-full pl-4 pr-32 py-3.5 rounded-xl bg-[#091122] border-2 border-[#203457] hover:border-[#375891] focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15 text-sm text-white placeholder-slate-400 outline-none transition-all"
                  />

                  <button
                    onClick={() => handleRunSearch()}
                    disabled={loading || !query.trim()}
                    className={`absolute right-2 top-2 bottom-2 px-4 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 ${
                      loading || !query.trim()
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#d4af37] to-[#f3c68f] text-[#09101d] hover:brightness-110 shadow-md cursor-pointer'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.aiRunSearch}</span>
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {t.aiPresetTitle}
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {presets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(preset.text);
                          handleRunSearch(preset.text);
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg bg-[#0e172a] hover:bg-[#172644] border border-[#1e2f4f] hover:border-[#d4af37]/40 text-slate-300 hover:text-[#f3c68f] transition-all cursor-pointer text-left"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SEARCH LOADING */}
              {loading && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="relative w-20 h-16 mb-4">
                    <div className="absolute inset-0 rounded-lg border border-[#d4af37]/50 bg-[#101e38] flex items-center justify-center">
                      <BookOpen className="w-9 h-9 text-[#d4af37] animate-pulse" />
                    </div>
                  </div>

                  <div className="font-serif text-sm font-semibold text-[#f3c68f] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#d4af37] animate-spin" />
                    {t.aiSearching}
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    {isKK
                      ? 'Gemini кітапхана қорын талдап жатыр'
                      : 'Gemini анализирует библиотечный фонд'}
                  </p>
                </div>
              )}

              {/* SEARCH ERROR */}
              {!loading && searchError && (
                <div className="p-5 rounded-xl bg-red-950/30 border border-red-500/30">
                  <p className="text-sm font-semibold text-red-300 mb-1">
                    {isKK ? 'AI қызметінде қате' : 'Ошибка AI-сервиса'}
                  </p>
                  <p className="text-sm text-red-200/80">
                    {searchError}
                  </p>
                  <button
                    onClick={() => handleRunSearch()}
                    className="mt-3 text-xs text-[#f3c68f] hover:underline"
                  >
                    {isKK ? 'Қайта көру' : 'Попробовать снова'}
                  </button>
                </div>
              )}

              {/* SEARCH RESULTS */}
              {!loading && !searchError && hasSearched && results && (
                <div className="space-y-3 pt-2 border-t border-[#1a2b47]">

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-white">
                      {t.aiResultsTitle}
                    </span>
                    <span className="font-mono text-[#d4af37]">
                      {results.length} {t.booksCount}
                    </span>
                  </div>

                  {results.length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-[#08101e] border border-dashed border-[#1c2c49]">
                      <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">
                        {t.aiNoResults}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                      {results.map(({ book, score, explanation }) => (
                        <div
                          key={book.id}
                          onClick={() => {
                            onSelectBook(book);
                            onClose();
                          }}
                          className="p-3.5 rounded-xl bg-[#091223] hover:bg-[#101e38] border border-[#1c2e4f] hover:border-[#d4af37]/60 transition-all flex items-center justify-between gap-4 cursor-pointer group"
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif text-sm font-bold text-white group-hover:text-[#f3c68f]">
                                {book.title}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#172744] text-[#d4af37] font-mono">
                                {Math.round(score * 100)}%
                              </span>
                            </div>

                            <div className="text-xs text-slate-300">
                              {book.author} · {book.subject}
                            </div>

                            <div className="text-[11px] text-[#f3c68f]/90 bg-[#0d1b32] px-2 py-1 rounded border border-[#1e345b] inline-block mt-1">
                              ✨ {explanation[lang]}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-mono text-xs font-semibold text-emerald-400">
                              {book.available_copies} / {book.total_copies} {t.copies}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-end gap-1">
                              <span>{t.viewDetails}</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#081120] border border-[#162744] flex items-center gap-2.5 text-xs text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.aiOnlyRealNotice}</span>
              </div>

            </div>
          )}

          {/* ================= AI CHAT ================= */}
          {mode === 'chat' && (
            <div className="space-y-4">

              <div className="p-3 rounded-xl bg-[#081120] border border-[#162744]">
                <div className="flex items-center gap-2 text-sm text-[#f3c68f] font-semibold">
                  <Bot className="w-5 h-5" />
                  Smart Library AI
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isKK
                    ? 'Маған кез келген сұрақ қойыңыз. Мен қазақша және орысша жауап бере аламын.'
                    : 'Задайте мне любой вопрос. Я отвечаю на русском и казахском языках.'}
                </p>
              </div>

              {/* CHAT MESSAGES */}
              <div className="h-[350px] overflow-y-auto space-y-4 pr-1">

                {chatMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-5">
                    <div className="w-16 h-16 rounded-2xl bg-[#142340] border border-[#d4af37]/40 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-[#d4af37]" />
                    </div>

                    <h4 className="text-white font-semibold text-sm">
                      {isKK ? 'Сәлем! Мен Smart Library AI көмекшісімін.' : 'Привет! Я Smart Library AI.'}
                    </h4>

                    <p className="text-xs text-slate-400 mt-2 max-w-sm">
                      {isKK
                        ? 'Бағдарламалау, IT, оқу немесе басқа тақырыптар бойынша сұрақ қойыңыз.'
                        : 'Спрашивайте о программировании, IT, учебе или любых других темах.'}
                    </p>

                    <div className="flex flex-wrap justify-center gap-2 mt-5">
                      {[
                        isKK ? 'Сен кімсің?' : 'Кто ты?',
                        isKK ? 'Python деген не?' : 'Что такое Python?',
                        isKK ? 'HTML түсіндір' : 'Объясни HTML',
                      ].map((example) => (
                        <button
                          key={example}
                          onClick={() => setChatInput(example)}
                          className="px-3 py-2 text-xs rounded-lg bg-[#0e172a] border border-[#1e2f4f] text-slate-300 hover:text-[#f3c68f] hover:border-[#d4af37]/40 transition-all"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${
                      message.role === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 shrink-0 rounded-lg bg-[#142340] border border-[#d4af37]/40 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-[#f3c68f]" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap break-words ${
                        message.role === 'user'
                          ? 'bg-[#1d355b] text-white border border-[#375891]'
                          : 'bg-[#0b1424] text-slate-200 border border-[#1b2b48]'
                      }`}
                    >
                      {message.content}
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 shrink-0 rounded-lg bg-[#1d355b] flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-lg bg-[#142340] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-[#f3c68f]" />
                    </div>
                    <div className="rounded-xl px-4 py-3 bg-[#0b1424] border border-[#1b2b48] text-xs text-[#f3c68f]">
                      {isKK ? 'AI жауап дайындап жатыр...' : 'AI готовит ответ...'}
                    </div>
                  </div>
                )}

              </div>

              {/* CHAT ERROR */}
              {chatError && (
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30 text-xs text-red-200">
                  {chatError}
                </div>
              )}

              {/* CHAT INPUT */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  disabled={chatLoading}
                  placeholder={
                    isKK ? 'Сұрағыңызды жазыңыз...' : 'Напишите ваш вопрос...'
                  }
                  className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-[#091122] border border-[#203457] focus:border-[#d4af37] text-sm text-white placeholder-slate-400 outline-none"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f3c68f] text-[#09101d] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
                  title={isKK ? 'Жіберу' : 'Отправить'}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-500">
                  {isKK
                    ? 'AI жауабында қателер болуы мүмкін. Маңызды ақпаратты тексеріңіз.'
                    : 'AI может ошибаться. Проверяйте важную информацию.'}
                </p>

                {chatMessages.length > 0 && (
                  <button
                    onClick={() => {
                      setChatMessages([]);
                      setChatError('');
                    }}
                    disabled={chatLoading}
                    className="text-[11px] text-slate-400 hover:text-[#f3c68f] disabled:opacity-40"
                  >
                    {isKK ? 'Чатты тазалау' : 'Очистить чат'}
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};