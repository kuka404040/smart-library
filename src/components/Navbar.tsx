import React from 'react';
import { BookOpen, Shield, ShieldCheck, LogIn, LogOut, Terminal, Globe, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface NavbarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  isLibrarian: boolean;
  onLogout: () => void;
  onOpenWindowsGuide: () => void;
  onReplayLoader: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageChange,
  isLibrarian,
  onLogout,
  onOpenWindowsGuide,
  onReplayLoader,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#060913]/85 border-b border-[#1c2942]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & College Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={onReplayLoader}
              title={lang === 'kk' ? 'Анимацияны қайта көру' : 'Посмотреть заставку'}
              className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#121f36] to-[#0a1120] border border-[#d4af37]/40 shadow-lg hover:border-[#d4af37] transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#d4af37]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <BookOpen className="w-6 h-6 text-[#f3c68f] group-hover:scale-110 transition-transform" />
              <span className="absolute -bottom-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]"></span>
              </span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-title text-xl sm:text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#f3c68f] via-[#ffffff] to-[#d4af37]">
                  SMART LIBRARY
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#162544] text-[#d4af37] border border-[#d4af37]/30">
                  {t.appBadge}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-light truncate max-w-[220px] sm:max-w-xs">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Right Navigation & Tools */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Language Switcher */}
            <div className="flex items-center p-1 rounded-lg bg-[#0a1120] border border-[#1b2841]">
              <button
                onClick={() => onLanguageChange('kk')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  lang === 'kk'
                    ? 'bg-[#182a4d] text-[#f3c68f] shadow-sm border border-[#d4af37]/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ҚАЗ
              </button>
              <button
                onClick={() => onLanguageChange('ru')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  lang === 'ru'
                    ? 'bg-[#182a4d] text-[#f3c68f] shadow-sm border border-[#d4af37]/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                РУС
              </button>
            </div>

            {/* Role indicator & Logout Button (Only visible after /admin login) */}
            {isLibrarian && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d2a1f] border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t.librarianMode}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-200 text-xs font-medium transition-colors cursor-pointer"
                  title={t.librarianLogout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.librarianLogout}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
