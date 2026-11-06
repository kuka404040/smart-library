import React from 'react';
import { Search, Sparkles, X, BookOpen, Layers, CheckCircle2, BookmarkCheck } from 'lucide-react';
import { Language, LibraryStats } from '../types';
import { translations } from '../i18n/translations';

interface HeroSectionProps {
  lang: Language;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onOpenAISearch: () => void;
  stats: LibraryStats;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  lang,
  searchQuery,
  onSearchChange,
  onOpenAISearch,
  stats,
}) => {
  const t = translations[lang];

  return (
    <div className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 border-b border-[#142340]/80">
      {/* Background Ambience & Golden Light Ribbons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-[#d4af37]/10 via-[#13274f]/20 to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-[#0d2a58]/20 rounded-full blur-3xl animate-float-particles" />
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-[#d4af37]/8 rounded-full blur-3xl animate-pulse" />
        {/* Subtle grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1f3056_1px,transparent_1px)] [background-size:32px_32px] opacity-25" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading, Subtitle, Search bar, AI Button */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            {/* College Digital Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d1b33] border border-[#d4af37]/30 text-xs text-[#f3c68f] shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="font-medium tracking-wide">
                {lang === 'kk' ? 'Колледждің цифрлық білім ортасы' : 'Цифровая образовательная среда колледжа'}
              </span>
            </div>

            {/* Main Title */}
            <div>
              <h1 className="font-serif-title text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-none">
                SMART{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f3c68f] via-[#ffffff] to-[#d4af37]">
                  LIBRARY
                </span>
              </h1>
              <p className="mt-3 text-lg sm:text-xl font-medium text-[#e2e8f0]">
                {t.appSubtitle}
              </p>
              <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto lg:mx-0 font-light">
                {t.appTagline}
              </p>
            </div>

            {/* Search Bar & AI Search Button */}
            <div className="pt-2 max-w-2xl mx-auto lg:mx-0 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                {/* Standard Search Bar */}
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#d4af37] transition-colors">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-[#0b1424]/90 border border-[#223555] hover:border-[#355285] focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 text-sm text-white placeholder-slate-400 outline-none transition-all shadow-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange('')}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Prominent AI SMART SEARCH Button */}
                <button
                  onClick={onOpenAISearch}
                  className="relative group flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3c68f] to-[#d4af37] hover:brightness-110 text-[#09101d] font-bold text-sm tracking-wide transition-all shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_35px_rgba(212,175,55,0.55)] cursor-pointer overflow-hidden shrink-0"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Sparkles className="w-4 h-4 text-[#09101d] animate-spin" style={{ animationDuration: '6s' }} />
                  <span>{t.aiSmartSearchBtn}</span>
                </button>
              </div>

              {/* Quick Prompt Hint */}
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 flex-wrap justify-center lg:justify-start">
                <span className="text-[#d4af37] font-medium">AI кеңесі:</span>
                <button
                  onClick={onOpenAISearch}
                  className="hover:text-[#f3c68f] underline underline-offset-2 transition-colors cursor-pointer"
                >
                  «Бағдарламалау бойынша кітап»
                </button>
                <span>·</span>
                <button
                  onClick={onOpenAISearch}
                  className="hover:text-[#f3c68f] underline underline-offset-2 transition-colors cursor-pointer"
                >
                  «Қазақстан тарихы»
                </button>
                <span>·</span>
                <button
                  onClick={onOpenAISearch}
                  className="hover:text-[#f3c68f] underline underline-offset-2 transition-colors cursor-pointer"
                >
                  «Компьютер құрылғысы»
                </button>
              </div>
            </div>

            {/* Live Stats Row */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto lg:mx-0">
              <div className="p-3 rounded-xl bg-[#091322]/80 border border-[#1a2d4b] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#142340] border border-[#d4af37]/30 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div>
                  <div className="text-base font-bold text-white font-mono">{stats.totalBooks}</div>
                  <div className="text-[11px] text-slate-400 leading-tight">{t.statTotalTitles}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#091322]/80 border border-[#1a2d4b] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#142340] border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-base font-bold text-white font-mono">{stats.totalCopies}</div>
                  <div className="text-[11px] text-slate-400 leading-tight">{t.statTotalCopies}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#091322]/80 border border-[#1a2d4b] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0e271e] border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-base font-bold text-emerald-300 font-mono">{stats.availableCopies}</div>
                  <div className="text-[11px] text-slate-400 leading-tight">{t.statAvailableCopies}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#091322]/80 border border-[#1a2d4b] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#271914] border border-amber-500/30 flex items-center justify-center shrink-0">
                  <BookmarkCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-base font-bold text-amber-300 font-mono">{stats.totalIssuedCopies}</div>
                  <div className="text-[11px] text-slate-400 leading-tight">{t.statIssuedCopies}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Composition of Layered Digital Books */}
          <div className="lg:col-span-5 flex justify-center items-center py-4">
            <div className="relative w-72 h-80 sm:w-84 sm:h-96 perspective-1000">
              {/* Golden Ambient Halo */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/20 via-[#1c3562]/30 to-transparent rounded-full blur-2xl animate-pulse" />

              {/* Floating Decorative Book 1 (Left tilt) */}
              <div
                className="absolute top-6 left-2 w-44 h-60 bg-gradient-to-br from-[#101c33] to-[#0a1222] rounded-lg border border-[#d4af37]/40 shadow-2xl p-4 transform-style-3d [transform:rotate(-12deg)_translateZ(-30px)] transition-transform duration-500 hover:[transform:rotate(-8deg)_translateZ(0px)]"
              >
                <div className="h-full border border-dashed border-[#d4af37]/20 rounded p-2.5 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-mono text-[#d4af37]">IT & DEV</span>
                    <Sparkles className="w-3 h-3 text-[#f3c68f]" />
                  </div>
                  <div>
                    <div className="font-serif text-xs font-bold text-white leading-tight">Python тілінде бағдарламалау</div>
                    <div className="text-[10px] text-slate-400 mt-1">Серікбаев А.</div>
                  </div>
                  <div className="flex justify-between text-[9px] text-[#f3c68f] font-mono">
                    <span>1 курс</span>
                    <span>38 дана</span>
                  </div>
                </div>
              </div>

              {/* Floating Decorative Book 2 (Right tilt) */}
              <div
                className="absolute top-12 right-2 w-44 h-60 bg-gradient-to-br from-[#191e36] to-[#0a0d1e] rounded-lg border border-[#38bdf8]/40 shadow-2xl p-4 transform-style-3d [transform:rotate(14deg)_translateZ(-15px)] transition-transform duration-500 hover:[transform:rotate(8deg)_translateZ(10px)]"
              >
                <div className="h-full border border-dashed border-[#38bdf8]/20 rounded p-2.5 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-mono text-[#38bdf8]">HARDWARE</span>
                    <Layers className="w-3 h-3 text-[#38bdf8]" />
                  </div>
                  <div>
                    <div className="font-serif text-xs font-bold text-white leading-tight">Компьютерлік архитектура</div>
                    <div className="text-[10px] text-slate-400 mt-1">Хеннесси Дж.</div>
                  </div>
                  <div className="flex justify-between text-[9px] text-[#38bdf8] font-mono">
                    <span>2 курс</span>
                    <span>28 дана</span>
                  </div>
                </div>
              </div>

              {/* Central Main Featured Tome (Front & Center) */}
              <div
                className="absolute top-16 left-12 w-48 h-64 bg-gradient-to-br from-[#1a2c4e] via-[#101d36] to-[#091122] rounded-xl border-2 border-[#d4af37] shadow-[0_25px_50px_rgba(0,0,0,0.7)] p-4 transform-style-3d [transform:rotate(2deg)_translateZ(20px)] transition-transform duration-500 hover:[transform:rotate(0deg)_translateZ(40px)] flex flex-col justify-between group"
              >
                {/* Gold Spine Stripe */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-[#d4af37] to-[#996515] rounded-l-xl opacity-80" />

                <div className="pl-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#f3c68f] font-semibold">
                      COLLEGE
                    </span>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  </div>
                  <div className="mt-6 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-[#d4af37]/30 to-transparent border border-[#d4af37] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6 text-[#f3c68f]" />
                    </div>
                    <div className="font-serif-title text-sm font-bold text-white tracking-wide">
                      ҚАЗАҚСТАН ТАРИХЫ
                    </div>
                    <div className="text-[10px] text-slate-300 mt-1">
                      Қаражанов Қ. С.
                    </div>
                  </div>
                </div>

                <div className="pl-2 pt-4 border-t border-[#d4af37]/20 flex items-center justify-between text-[10px] text-slate-300">
                  <span className="text-[#f3c68f] font-medium">Жалпы білім</span>
                  <span className="font-mono bg-[#0c182c] px-2 py-0.5 rounded text-white border border-[#23385c]">
                    45 дана
                  </span>
                </div>
              </div>

              {/* Subtle Decorative Floating Page Elements */}
              <div className="absolute -bottom-2 left-8 w-24 h-12 bg-white/5 border border-white/10 rounded backdrop-blur-sm -rotate-12 pointer-events-none" />
              <div className="absolute top-2 right-10 w-16 h-10 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded rotate-12 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
